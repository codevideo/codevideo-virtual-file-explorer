import {
  isRepeatableAction,
  FileExplorerAction,
  IFileStructure,
  FileItem,
  FileLeaf,
  DirectoryNode,
} from "@fullstackcraftllc/codevideo-types";

export class VirtualFileExplorer {
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
      cursorPosition: { x: 0, y: 0 }
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

    switch (action.name) {
      case "create-file": {
        const { parent, name } = this.getParentDirectory(action.value);
        parent[name] = this.createFileItem(name);
        break;
      }

      case "rename-file": {
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

      case "move-file": {
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

      case "copy-file": {
        const [fromPath, toPath] = action.value.split(';')
          .map(part => part.replace(/^(from:|to:)/, ''));
        
        const { parent: fromParent, name: fromName } = this.getParentDirectory(fromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(toPath);
        
        if (fromParent[fromName]) {
          toParent[toName] = { ...fromParent[fromName] };
        }
        break;
      }

      case "delete-file": {
        const { parent, name } = this.getParentDirectory(action.value);
        delete parent[name];
        break;
      }

      case "create-folder": {
        const { parent, name } = this.getParentDirectory(action.value);
        parent[name] = this.createDirectoryItem();
        break;
      }

      case "rename-folder": {
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

      case "move-folder": {
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

      case "copy-folder": {
        const [fromPath, toPath] = action.value.split(';')
          .map(part => part.replace(/^(from:|to:)/, ''));
        
        const { parent: fromParent, name: fromName } = this.getParentDirectory(fromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(toPath);
        
        if (fromParent[fromName] && fromParent[fromName].type === 'directory') {
          toParent[toName] = this.copyDirectory(fromParent[fromName] as DirectoryNode);
        }
        break;
      }

      case "delete-folder": {
        const { parent, name } = this.getParentDirectory(action.value);
        delete parent[name];
        break;
      }

      case "toggle-folder": {
        const { parent, name } = this.getParentDirectory(action.value);
        if (parent[name] && parent[name].type === 'directory') {
          const dir = parent[name] as DirectoryNode;
          dir.collapsed = !dir.collapsed;
        }
        break;
      }

      case "open-file": {
        // This is a no-op in the file structure, as it's handled by the UI
        break;
      }
    }

    this.actionsApplied.push(action);

    if (this.verbose) {
      console.log(`Action: ${action.name}`);
    }
  }

  private buildTreeString(structure: IFileStructure, indent: string = ""): string {
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
        if (!item.collapsed && item.children) {
          result += this.buildTreeString(item.children, indent + "  ");
        }
      } else {
        result += `${indent}${name}\n`;
      }
    }

    return result;
  }

  getCurrentFileTree(): string {
    return this.buildTreeString(this.currentFileStructure);
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
  getFileContents(fileName: string): string {
    const { parent, name } = this.getParentDirectory(fileName);
    const file = parent[name];

    if (!file) {
      throw new Error(`File not found: ${fileName}`);
    }

    if (file.type === 'directory') {
      throw new Error(`Path points to a directory, not a file: ${fileName}`);
    }

    return file.content;
  }

  /**
   * Opens a file in the file system
   * @param fileName Full path to the file
   * @throws Error if file doesn't exist or if path points to a directory
   */
  openFile(fileName: string): void {
    const { parent, name } = this.getParentDirectory(fileName);
    const file = parent[name];

    if (!file) {
      throw new Error(`File not found: ${fileName}`);
    }

    if (file.type === 'directory') {
      throw new Error(`Cannot open a directory: ${fileName}`);
    }

    this.openFiles.add(fileName);
  }

  /**
   * Closes a file in the file system
   * @param fileName Full path to the file
   */
  closeFile(fileName: string): void {
    this.openFiles.delete(fileName);
  }

  /**
   * Gets the list of currently open files
   * @returns Array of file paths that are currently open
   */
  getOpenFiles(): string[] {
    return Array.from(this.openFiles).sort();
  }
}