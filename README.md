# @fullstackcraft/codevideo-virtual-file-explorer

![NPM Version](https://img.shields.io/npm/v/:fullstackcraftllc/codevideo-virtual-file-explorer)

`codevideo-virtual-file-explorer` is a TypeScript class that simulates an IDE file explorer with the ability to create, delete, and modify folder and file structures. This lightweight and versatile library is ideal for building educational tools, code playgrounds, and interactive coding environments within web applications.

This library heavily relies on the types from [codevideo-types](https://github.com/codevideo/codevideo-types)

## Example Usage

```typescript
import { VirtualFileExplorer } from '@fullstackcraftllc/codevideo-virtual-file-explorer';

// Initialize a VirtualFileExplorer instance
const virtualFileExplorer = new VirtualFileExplorer();

// Apply file explorer actions
virtualFileExplorer.applyActions([
  // create a test.js file
  { name: 'create-file', value: 'test.js' },
  
  // creates a src folder
  { name: 'create-folder', value: 'src' },
  
  // create an index.js file in the src folder
  { name: 'create-file', value: 'src/index.js' },
  
  // rename test.js to main.js
  { name: 'rename-file', value: 'from:test.js;to:main.js' },
  
  // copy index.js
  { name: 'copy-file', value: 'from:src/index.js;to:src/index.backup.js' },
  
  // move main.js into src
  { name: 'move-file', value: 'from:main.js;to:src/main.js' },
  
  // create components folder
  { name: 'create-folder', value: 'src/components' },
  
  // copy components folder
  { name: 'copy-folder', value: 'from:src/components;to:src/shared' },
  
  // move shared folder to root
  { name: 'move-folder', value: 'from:src/shared;to:shared' },
  
  // toggle src folder collapsed state
  { name: 'toggle-folder', value: 'src' },
  
  // delete backup file
  { name: 'delete-file', value: 'src/index.backup.js' },
  
  // delete shared folder
  { name: 'delete-folder', value: 'shared' },
]);

// Get the current state of the file explorer
const fileStructure = virtualFileExplorer.getCurrentFileStructure();
const fileTree = virtualFileExplorer.getCurrentFileTree();
const actionsApplied = virtualFileExplorer.getActionsApplied();

console.log('Current file tree:');
console.log(fileTree);
console.log('Actions applied:');
console.log(actionsApplied);
```

## Available Actions

- `create-file`: Create a new file
- `open-file`: Open a file (UI handler)
- `rename-file`: Rename a file using format "from:oldpath;to:newpath"
- `delete-file`: Delete a file
- `move-file`: Move a file using format "from:oldpath;to:newpath"
- `copy-file`: Copy a file using format "from:sourcepath;to:destpath"
- `create-folder`: Create a new folder
- `rename-folder`: Rename a folder using format "from:oldpath;to:newpath"
- `delete-folder`: Delete a folder
- `toggle-folder`: Toggle folder's collapsed state
- `move-folder`: Move a folder using format "from:oldpath;to:newpath"
- `copy-folder`: Copy a folder using format "from:sourcepath;to:destpath"

## Available Methods

### `applyAction(action: FileExplorerAction): void`

Apply a single action to the file structure.

### `applyActions(actions: FileExplorerAction[]): void`

Apply a series of actions to the file structure.

### `getCurrentFileStructure(): IFileStructure`

Get the current file structure as an object.

### `getCurrentFileTree(): string`

Get a string representation of the current file tree.

### `getActionsApplied(): FileExplorerAction[]`

Get the list of actions that were applied.

## Why?

This library is part of the CodeVideo ecosystem, working alongside other tools to create a declarative way to build, edit, and generate step-by-step educational video software courses.

The `VirtualFileExplorer` provides a programmatic way to simulate file explorer interactions, making it perfect for:
- Recording and replaying file operations
- Creating educational content
- Testing file-system related UI components
- Simulating IDE-like environments in the browser

See more at [codevideo.io](https://codevideo.io)
