import {
  isRepeatableAction,
  FileExplorerAction,
  IFileStructure,
  FileLeaf,
  DirectoryNode,
  FileItem,
} from "@fullstackcraftllc/codevideo-types";

export class VirtualFileExplorer {
  private presentWorkingDirectory = '~';
  private currentFileStructure: IFileStructure = {};
  private actionsApplied: FileExplorerAction[] = [];
  private openFiles: Set<string> = new Set();
  private verbose = false;

  constructor(actions?: FileExplorerAction[], verbose?: boolean) {
    this.verbose = verbose || false;
    if (actions) {
      this.applyActions(actions);
    }
  }

  applyActions(actions: FileExplorerAction[]) {
    actions.forEach((action) => {
      this.applyAction(action);
    });
  }

  applyAction(action: FileExplorerAction) {
    let numTimes = 1;
    if (isRepeatableAction(action)) {
      numTimes = parseInt(action.value);
    }

    // in this switch, let the FileExplorerActions in codevideo-types guide you
    switch (action.name) {
      case "file-explorer-create-file": {
        const { parent, name } = this.getParentDirectory(action.value);
        parent[name] = this.createFileItem(name);
        break;
      }

      case "file-explorer-open-file": {
        this.openFile(action.value);
        break;
      }

      case "file-explorer-close-file": {
        this.closeFile(action.value);
        break;
      }

      case "file-explorer-rename-file": {
        const [fromPath, toPath] = action.value.split(';')
          .map(part => part.replace(/^(from:|to:)/, ''));

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(toPath);

        if (fromParent[fromName]) {
          toParent[toName] = fromParent[fromName];
          delete fromParent[fromName];

          // Update open files if the renamed file was open
          if (this.openFiles.has(fromPath)) {
            this.openFiles.delete(fromPath);
            this.openFiles.add(toPath);
          }
        }
        break;
      }

      case "file-explorer-move-file": {
        const [fromPath, toPath] = action.value.split(';')
          .map(part => part.replace(/^(from:|to:)/, ''));

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(toPath);

        if (fromParent[fromName]) {
          toParent[toName] = fromParent[fromName];
          delete fromParent[fromName];
        }
        break;
      }

      case "file-explorer-copy-file": {
        const [fromPath, toPath] = action.value.split(';')
          .map(part => part.replace(/^(from:|to:)/, ''));

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(toPath);

        if (fromParent[fromName]) {
          toParent[toName] = { ...fromParent[fromName] };
        }
        break;
      }

      case "file-explorer-delete-file": {
        const { parent, name } = this.getParentDirectory(action.value);
        delete parent[name];
        break;
      }

      case "file-explorer-create-folder": {
        const { parent, name } = this.getParentDirectory(action.value);
        parent[name] = this.createDirectoryItem();
        break;
      }

      case "file-explorer-expand-folder": {
        const { parent, name } = this.getParentDirectory(action.value);
        if (parent[name] && parent[name].type === 'directory') {
          (parent[name] as DirectoryNode).collapsed = false;
        }
        break;
      }

      case "file-explorer-collapse-folder": {
        const { parent, name } = this.getParentDirectory(action.value);
        if (parent[name] && parent[name].type === 'directory') {
          (parent[name] as DirectoryNode).collapsed = true;
        }
        break;
      }

      case "file-explorer-rename-folder": {
        const [fromPath, toPath] = action.value.split(';')
          .map(part => part.replace(/^(from:|to:)/, ''));

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(toPath);

        if (fromParent[fromName]) {
          toParent[toName] = fromParent[fromName];
          delete fromParent[fromName];
        }
        break;
      }

      case "file-explorer-move-folder": {
        const [fromPath, toPath] = action.value.split(';')
          .map(part => part.replace(/^(from:|to:)/, ''));

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(toPath);

        if (fromParent[fromName] && fromParent[fromName].type === 'directory') {
          toParent[toName] = fromParent[fromName];
          delete fromParent[fromName];
        }
        break;
      }

      case "file-explorer-copy-folder": {
        const [fromPath, toPath] = action.value.split(';')
          .map(part => part.replace(/^(from:|to:)/, ''));

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(toPath);

        if (fromParent[fromName] && fromParent[fromName].type === 'directory') {
          toParent[toName] = this.copyDirectory(fromParent[fromName] as DirectoryNode);
        }
        break;
      }

      case "file-explorer-delete-folder": {
        const { parent, name } = this.getParentDirectory(action.value);
        delete parent[name];
        break;
      }

      case "file-explorer-toggle-folder": {
        const { parent, name } = this.getParentDirectory(action.value);
        if (parent[name] && parent[name].type === 'directory') {
          const dir = parent[name] as DirectoryNode;
          dir.collapsed = !dir.collapsed;
        }
        break;
      }
    }

    this.actionsApplied.push(action);

    if (this.verbose) {
      console.log(`Action: ${action.name}`);
    }
  }

  setPresentWorkingDirectory(path: string): void {
    this.presentWorkingDirectory = path;
  }

  getPresentWorkingDirectory(): string {
    return this.presentWorkingDirectory;
  }

  getCurrentFileTree(showEvenIfCollapsed: boolean = true): string {
    return this.buildTreeString(this.currentFileStructure, '', showEvenIfCollapsed);
  }

  getFiles(): string[] {
    const files: string[] = [];
    const traverse = (structure: IFileStructure, path: string) => {
      for (const [name, item] of Object.entries(structure)) {
        if (item.type === 'directory') {
          traverse((item as DirectoryNode).children!, `${path}/${name}`);
        } else {
          files.push(`${path}/${name}`);
        }
      }
    };

    traverse(this.currentFileStructure, '');

    return files.sort();
  }

  getFileObjects(): Array<FileItem> {
    const fileObjects: Array<FileItem> = [];
    const traverse = (structure: IFileStructure, path: string) => {
      for (const [name, item] of Object.entries(structure)) {
        fileObjects.push(item);
        if (item.type === 'directory') {
          traverse((item as DirectoryNode).children!, `${path}/${name}`);
        }
      }
    };

    traverse(this.currentFileStructure, '');

    return fileObjects;
  }
    

  getCurrentFileStructure(): IFileStructure {
    return this.currentFileStructure;
  }

  getActionsApplied(): FileExplorerAction[] {
    return this.actionsApplied;
  }

  /**
   * Gets the contents of a specific file
   * @param fileName Full path to the file
   * @returns The content of the file if it exists
   * @throws Error if file doesn't exist or if path points to a directory
   */
  // TODO this is handled by the virtual editor... maybe its good to have it here too? or... we have files point to @fullstackcraftllc/codevideo-virtual-editor(s) here
  getFileContents(fileName: string): string {
    const { parent, name } = this.getParentDirectory(fileName);
    const file = parent[name];

    if (!file) {
      if (this.verbose) console.warn(`File not found: ${fileName}`);
      return "" // no-op: return empty string
    }

    if (file.type === 'directory') {
      if (this.verbose) console.warn(`Path points to a directory, not a file: ${fileName}`);
      return "" // no-op: return empty string
    }

    return file.content;
  }

  /**
 * Gets the list of currently open files
 * @returns Array of file paths that are currently open
 */
  getOpenFiles(): string[] {
    return Array.from(this.openFiles).sort();
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()! : '';
  }

  private createFileItem(path: string): FileLeaf {
    return {
      type: 'file',
      content: '',
      language: this.getFileExtension(path),
      caretPosition: { row: 0, col: 0 },
    };
  }

  private createDirectoryItem(): DirectoryNode {
    return {
      type: 'directory',
      content: '',
      collapsed: false,
      children: {}
    };
  }

  private getPathComponents(path: string): string[] {
    return path.split('/').filter(component => component.length > 0);
  }

  private ensureDirectoryExists(path: string): void {
    const components = this.getPathComponents(path);
    let current = this.currentFileStructure;

    for (const component of components) {
      if (!current[component]) {
        current[component] = this.createDirectoryItem();
      }
      current = (current[component] as DirectoryNode).children!;
    }
  }

  private getParentDirectory(path: string): { parent: IFileStructure; name: string } {
    const components = this.getPathComponents(path);
    const fileName = components.pop()!;
    let current = this.currentFileStructure;

    for (const component of components) {
      if (!current[component]) {
        current[component] = this.createDirectoryItem();
      }
      current = (current[component] as DirectoryNode).children!;
    }

    return { parent: current, name: fileName };
  }

  private copyDirectory(source: DirectoryNode): DirectoryNode {
    const newDir: DirectoryNode = {
      type: 'directory',
      content: source.content,
      collapsed: source.collapsed,
      children: {}
    };

    if (source.children) {
      for (const [name, item] of Object.entries(source.children)) {
        if (item.type === 'directory') {
          newDir.children![name] = this.copyDirectory(item as DirectoryNode);
        } else {
          newDir.children![name] = { ...item };
        }
      }
    }

    return newDir;
  }

  private buildTreeString(structure: IFileStructure, indent: string = "", showEvenIfCollapsed: boolean = true): string {
    let result = "";

    // Sort entries: directories first, then files, both alphabetically
    const sortedEntries = Object.entries(structure).sort(([aKey, aValue], [bKey, bValue]) => {
      const aIsDir = aValue.type === 'directory';
      const bIsDir = bValue.type === 'directory';
      if (aIsDir !== bIsDir) return bIsDir ? 1 : -1;
      return aKey.localeCompare(bKey);
    });

    for (const [name, item] of sortedEntries) {
      if (item.type === 'directory') {
        result += `${indent}${name}\n`;
        if ((showEvenIfCollapsed || !item.collapsed) && item.children) {
          result += this.buildTreeString(item.children, indent + "  ", showEvenIfCollapsed);
        }
      } else {
        result += `${indent}${name}\n`;
      }
    }

    return result;
  }

  private openFile(fileName: string): void {
    const { parent, name } = this.getParentDirectory(fileName);
    const file = parent[name];

    if (!file) {
      if (this.verbose) console.warn(`File not found: ${fileName}`);
      return;
    }

    if (file.type === 'directory') {
      if (this.verbose) console.warn(`Cannot open a directory: ${fileName}`);
      return;
    }

    this.openFiles.add(fileName);
  }

  private closeFile(fileName: string): void {
    this.openFiles.delete(fileName);
  }
}