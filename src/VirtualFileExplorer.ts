import {
  isRepeatableAction,
  FileExplorerAction,
  IFileStructure,
  FileLeaf,
  DirectoryNode,
  FileItem,
  advancedCommandValueSeparator,
  IFileEntry
} from "@fullstackcraftllc/codevideo-types";

/**
 * Represents a virtual file explorer that can be used to simulate file system operations in the CodeVideo ecosystem.
 */
export class VirtualFileExplorer {
  private presentWorkingDirectory = '';
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

  /**
   * Applies a list of actions to the virtual file explorer
   * @param actions List of actions to apply
   */
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
      // cross domain actions (from terminal mainly)
      case "file-explorer-set-present-working-directory": {
        this.setPresentWorkingDirectory(action.value);
        break;
      }

      case "file-explorer-set-file-contents": {
        const parts = action.value.split(advancedCommandValueSeparator);

        // poor input; no op! 
        // but at least log if verbose
        if (parts.length !== 2) {
          if (this.verbose) console.warn(`Invalid value for file-explorer-set-file-contents: ${action.value}`);
          break;
        }
        const fileName = parts[0];
        const content = parts[1];

        if (this.verbose) console.log(`Setting content of file ${fileName} to: ${content}`);

        // Resolve the path properly
        const fullPath = this.resolvePath(fileName);

        if (this.verbose) console.log(`Resolved path for content: ${fullPath}`);

        const { parent, name } = this.getParentDirectory(fullPath);
        if (this.verbose) console.log(`Parent: ${parent}, name: ${name}`);

        // Check if the file exists
        if (!parent[name]) {
          if (this.verbose) console.log(`File ${name} not found in parent. Cannot set content. Available keys: ${Object.keys(parent)}`);
          break;
          // Could optionally create the file here if desired - for now user has to ensure it exists
          // parent[name] = this.createFileItem(name);
        }

        parent[name].content = content;
        break;
      }

      case "file-explorer-create-file": {
        // Resolve the path appropriately
        const fullPath = this.resolvePath(action.value);

        if (this.verbose) {
          console.log(`Creating file: ${action.value}`);
          console.log(`Resolved path: ${fullPath}`);
        }

        const { parent, name } = this.getParentDirectory(fullPath);
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
        const parts = action.value.split(advancedCommandValueSeparator);

        // poor input; no op!
        // but at least log if verbose
        if (parts.length !== 2) {
          if (this.verbose) console.warn(`Invalid value for file-explorer-rename-file: ${action.value}`);
          break;
        }
        const fromPath = parts[0];
        const toPath = parts[1];

        // Resolve both paths properly
        const fullFromPath = this.resolvePath(fromPath);
        const fullToPath = this.resolvePath(toPath);

        if (this.verbose) {
          console.log(`Renaming file from ${fromPath} to ${toPath}`);
          console.log(`Resolved paths: from ${fullFromPath} to ${fullToPath}`);
        }

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fullFromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(fullToPath);

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
        const parts = action.value.split(advancedCommandValueSeparator);

        // poor input; no op!
        // but at least log if verbose
        if (parts.length !== 2) {
          if (this.verbose) console.warn(`Invalid value for file-explorer-move-file: ${action.value}`);
          break;
        }

        const fromPath = parts[0];
        const toPath = parts[1];

        // Resolve both paths properly
        const fullFromPath = this.resolvePath(fromPath);
        const fullToPath = this.resolvePath(toPath);

        if (this.verbose) {
          console.log(`Moving file from ${fromPath} to ${toPath}`);
          console.log(`Resolved paths: from ${fullFromPath} to ${fullToPath}`);
        }

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fullFromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(fullToPath);

        if (fromParent[fromName]) {
          toParent[toName] = fromParent[fromName];
          delete fromParent[fromName];
        }
        break;
      }

      case "file-explorer-copy-file": {
        const parts = action.value.split(advancedCommandValueSeparator);

        // poor input; no op!
        // but at least log if verbose
        if (parts.length !== 2) {
          if (this.verbose) console.warn(`Invalid value for file-explorer-copy-file: ${action.value}`);
          break;
        }

        const fromPath = parts[0];
        const toPath = parts[1];

        // Resolve both paths properly
        const fullFromPath = this.resolvePath(fromPath);
        const fullToPath = this.resolvePath(toPath);

        if (this.verbose) {
          console.log(`Copying file from ${fromPath} to ${toPath}`);
          console.log(`Resolved paths: from ${fullFromPath} to ${fullToPath}`);
        }

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fullFromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(fullToPath);

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
        // Resolve the path appropriately
        const fullPath = this.resolvePath(action.value);

        if (this.verbose) {
          console.log(`Creating folder: ${action.value}`);
          console.log(`Resolved path: ${fullPath}`);
        }

        const { parent, name } = this.getParentDirectory(fullPath);
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
        const parts = action.value.split(advancedCommandValueSeparator);

        // poor input; no op!
        // but at least log if verbose
        if (parts.length !== 2) {
          if (this.verbose) console.warn(`Invalid value for file-explorer-rename-folder: ${action.value}`);
          break;
        }

        const fromPath = parts[0];
        const toPath = parts[1];

        // Resolve both paths properly
        const fullFromPath = this.resolvePath(fromPath);
        const fullToPath = this.resolvePath(toPath);

        if (this.verbose) {
          console.log(`Renaming folder from ${fromPath} to ${toPath}`);
          console.log(`Resolved paths: from ${fullFromPath} to ${fullToPath}`);
        }

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fullFromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(fullToPath);

        if (fromParent[fromName]) {
          toParent[toName] = fromParent[fromName];
          delete fromParent[fromName];
        }
        break;
      }

      case "file-explorer-move-folder": {
        const parts = action.value.split(advancedCommandValueSeparator);

        // poor input; no op!
        // but at least log if verbose
        if (parts.length !== 2) {
          if (this.verbose) console.warn(`Invalid value for file-explorer-move-folder: ${action.value}`);
          break;
        }

        const fromPath = parts[0];
        const toPath = parts[1];

        // Resolve both paths properly
        const fullFromPath = this.resolvePath(fromPath);
        const fullToPath = this.resolvePath(toPath);

        if (this.verbose) {
          console.log(`Moving folder from ${fromPath} to ${toPath}`);
          console.log(`Resolved paths: from ${fullFromPath} to ${fullToPath}`);
        }

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fullFromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(fullToPath);

        if (fromParent[fromName] && fromParent[fromName].type === 'directory') {
          toParent[toName] = fromParent[fromName];
          delete fromParent[fromName];
        }
        break;
      }

      case "file-explorer-copy-folder": {
        const parts = action.value.split(advancedCommandValueSeparator);

        // poor input; no op!
        // but at least log if verbose
        if (parts.length !== 2) {
          if (this.verbose) console.warn(`Invalid value for file-explorer-copy-folder: ${action.value}`);
          break;
        }

        const fromPath = parts[0];
        const toPath = parts[1];

        // Resolve both paths properly
        const fullFromPath = this.resolvePath(fromPath);
        const fullToPath = this.resolvePath(toPath);

        if (this.verbose) {
          console.log(`Copying folder from ${fromPath} to ${toPath}`);
          console.log(`Resolved paths: from ${fullFromPath} to ${fullToPath}`);
        }

        const { parent: fromParent, name: fromName } = this.getParentDirectory(fullFromPath);
        const { parent: toParent, name: toName } = this.getParentDirectory(fullToPath);

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

  /**
   * Gets the present working directory
   * @returns The present working directory
   */
  getPresentWorkingDirectory(): string {
    return this.presentWorkingDirectory;
  }

  /**
   * Gets the current file tree in a string format
   * @param showEvenIfCollapsed Whether to show collapsed directories in the tree
   * @returns String representation of the current file tree
   */
  getCurrentFileTree(showEvenIfCollapsed: boolean = true): string {
    return this.buildTreeString(this.currentFileStructure, '', showEvenIfCollapsed);
  }

  /**
   * Gets the list of files in the current directory
   * @returns Array of file paths in the current directory
   */
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

  /**
   * Gets an 'ls' formatted list of files in the current directory
   * @returns String of folders and files in the current directory in alphabetical order
   */
  getLsString(): string {
    // Start from the root of the virtual file structure
    let target: IFileStructure = this.currentFileStructure;

    // Remove '~' if it is present
    let path = this.presentWorkingDirectory;
    if (path.startsWith('~')) {
      path = path.slice(1);
    }

    // Get path components and traverse the tree
    const components = this.getPathComponents(path);

    if (this.verbose) {
      console.log('getLsString - Current path:', this.presentWorkingDirectory);
      console.log('getLsString - Processed path:', path);
      console.log('getLsString - Path components:', components);
      console.log('getLsString - Initial structure:', JSON.stringify(this.currentFileStructure, null, 2));
    }

    // Traverse through the path components to find the target directory
    for (const component of components) {
      if (this.verbose) console.log(`getLsString - Checking component: "${component}"`);

      if (target[component] && target[component].type === 'directory') {
        if (this.verbose) console.log(`getLsString - Found directory: ${component}`);
        // Access the children property directly
        target = (target[component] as DirectoryNode).children!;

        if (this.verbose) console.log('getLsString - Children structure:', JSON.stringify(target, null, 2));
      } else {
        if (this.verbose) {
          console.log(`getLsString - Directory not found: ${component}`);
          console.log('getLsString - Available keys:', Object.keys(target));
        }
        // If the directory doesn't exist, return empty string
        return "";
      }
    }

    // Now list the contents of the current directory in alphabetical order
    const fileNames = Object.keys(target).sort();

    if (this.verbose) {
      console.log('getLsString - Final target directory contents:', fileNames);
    }

    if (fileNames.length === 0) {
      return "";
    }

    // Format the output - join with newlines but no trailing newline
    return fileNames.join('\n');
  }

  /**
   * Gets all file and directory objects in the current file structure
   * @returns Array of file and directory objects
   */
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

  /**
   * Gets the full file paths and their contents in the current file structure
   * @returns Array of file paths and their contents
   */
  getFullFilePathsAndContents(): Array<IFileEntry> {
    const fileEntries: Array<IFileEntry> = [];
    const traverse = (structure: IFileStructure, path: string) => {
      for (const [name, item] of Object.entries(structure)) {
        if (item.type === 'directory') {
          traverse((item as DirectoryNode).children!, `${path}/${name}`);
        } else {
          fileEntries.push({ path: `${path}/${name}`, content: (item as FileLeaf).content });
        }
      }
    };

    traverse(this.currentFileStructure, '');

    return fileEntries;
  }

  /**
   * Gets the current file structure
   * @returns The current file structure
   */
  getCurrentFileStructure(): IFileStructure {
    return this.currentFileStructure;
  }

  /**
   * Gets the list of actions applied to the virtual file explorer
   * @returns Array of actions applied
   */
  getActionsApplied(): FileExplorerAction[] {
    return this.actionsApplied;
  }

  /**
   * Gets the contents of a specific file. Changes in the editor are only carried over here until the file is explicitly saved in virtual-ide.
   * @param fileName Full path to the file
   * @returns The content of the file if it exists
   */
  getFileContents(fileName: string): string {
    // Resolve the path properly
    const fullPath = this.resolvePath(fileName);

    if (this.verbose) console.log(`Getting contents of file: ${fileName}`);
    if (this.verbose) console.log(`Resolved path: ${fullPath}`);

    const { parent, name } = this.getParentDirectory(fullPath);

    if (this.verbose) console.log(`Parent keys: ${Object.keys(parent)}`);

    const file = parent[name];

    if (!file) {
      if (this.verbose) console.warn(`File not found: ${fullPath}`);
      return "" // no-op: return empty string
    }

    if (file.type === 'directory') {
      if (this.verbose) console.warn(`Path points to a directory, not a file: ${fullPath}`);
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

  /**
   * Sets the verbose mode for the virtual file explorer
   * @param verbose Whether to enable verbose
   */
  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }

  private setPresentWorkingDirectory(path: string): void {
    // if we get a "~" that's just the GUI symbol for the root directory
    if (path === '~') {
      path = '';
    }
    this.presentWorkingDirectory = path;
  }

  private resolvePath(path: string): string {
    // If it already starts with '~', it's an absolute path but we remove the '~'
    if (path.startsWith('~')) {
      return path.slice(1);
    }

    // Otherwise we assume its a relative path and resolve it against the current working directory
    return `${this.presentWorkingDirectory}/${path}`;
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