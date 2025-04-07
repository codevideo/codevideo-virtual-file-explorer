import { VirtualFileExplorer } from "../../src/VirtualFileExplorer";
import { describe, expect, it } from "@jest/globals";

describe("VirtualFileExplorer file and folder creation", () => {
  describe("context menu operations", () => {
    it("should open and close the file explorer context menu", () => {
      const explorer = new VirtualFileExplorer();
      explorer.applyAction({ name: "file-explorer-show-context-menu", value: "" });
      let snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isFileExplorerContextMenuOpen).toBe(true);

      explorer.applyAction({ name: "file-explorer-hide-context-menu", value: "" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isFileExplorerContextMenuOpen).toBe(false);
    });

    it("should open and close the file context menu", () => {
      const explorer = new VirtualFileExplorer();
      explorer.applyAction({ name: "file-explorer-show-file-context-menu", value: "" });
      let snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isFileContextMenuOpen).toBe(true);

      explorer.applyAction({ name: "file-explorer-hide-file-context-menu", value: "" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isFileContextMenuOpen).toBe(false);
    });

    it("should open and close the folder context menu", () => {
      const explorer = new VirtualFileExplorer();
      explorer.applyAction({ name: "file-explorer-show-folder-context-menu", value: "" });
      let snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isFolderContextMenuOpen).toBe(true);

      explorer.applyAction({ name: "file-explorer-hide-folder-context-menu", value: "" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isFolderContextMenuOpen).toBe(false);
    });
  });

  describe("new file and folder input tracking", () => {
    it("should show and track new file input then clear on enter", () => {
      const explorer = new VirtualFileExplorer();
      // Show the new file input
      explorer.applyAction({ name: "file-explorer-show-new-file-input", value: "" });
      let snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isNewFileInputVisible).toBe(true);

      // Append some text to the new file input value
      explorer.applyAction({ name: "file-explorer-type-new-file-input", value: "TestFile" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.newFileInputValue).toBe("TestFile");

      // On enter, the input should be cleared and hidden
      explorer.applyAction({ name: "file-explorer-enter-new-file-input", value: "" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isNewFileInputVisible).toBe(false);
    });

    it("should show and track new folder input then clear on enter", () => {
      const explorer = new VirtualFileExplorer();
      // Show the new folder input
      explorer.applyAction({ name: "file-explorer-show-new-folder-input", value: "" });
      let snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isNewFolderInputVisible).toBe(true);

      // Append some text to the new folder input value
      explorer.applyAction({ name: "file-explorer-type-new-folder-input", value: "MyFolder" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.newFolderInputValue).toBe("MyFolder");

      // On enter, the input should be hidden
      explorer.applyAction({ name: "file-explorer-enter-new-folder-input", value: "" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isNewFolderInputVisible).toBe(false);
    });
  });

  describe("rename input tracking", () => {
    it("should track rename file draft and input value independently", () => {
      const explorer = new VirtualFileExplorer();
      // Set the rename file draft state
      explorer.applyAction({ name: "file-explorer-rename-file-draft-state", value: "oldFile.ts" });
      let snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.originalFileBeingRenamed).toBe("oldFile.ts");
      expect(snapshot.renameFileInputValue).toBe("oldFile");
      expect(snapshot.isRenameFileInputVisible).toBe(true);

      // Type into the rename file input (since in a standard ide, the entire name is selected by default)
      explorer.applyAction({ name: "file-explorer-type-rename-file-input", value: "new" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.renameFileInputValue).toBe("new.ts");

      // press enter to submit the rename
      explorer.applyAction({ name: "file-explorer-enter-rename-file-input", value: "1" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isRenameFileInputVisible).toBe(false);
      expect(snapshot.isRenameFolderInputVisible).toBe(false);

      // Ensure rename folder properties remain unchanged
      expect(snapshot.originalFolderBeingRenamed).toBe("");
      expect(snapshot.renameFolderInputValue).toBe("");
    });

    it("should track rename folder draft and input value independently", () => {
      const explorer = new VirtualFileExplorer();
      // Set the rename folder draft state
      explorer.applyAction({ name: "file-explorer-rename-folder-draft-state", value: "oldFolder" });
      let snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.originalFolderBeingRenamed).toBe("oldFolder");
      expect(snapshot.renameFolderInputValue).toBe("oldFolder");
      expect(snapshot.isRenameFolderInputVisible).toBe(true);

      // Type into the rename folder input (since in a standard ide, the entire name is selected by default)
      explorer.applyAction({ name: "file-explorer-type-rename-folder-input", value: "new" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.renameFolderInputValue).toBe("new");

      // press enter to submit the rename
      explorer.applyAction({ name: "file-explorer-enter-rename-folder-input", value: "1" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isRenameFolderInputVisible).toBe(false);
      expect(snapshot.isRenameFileInputVisible).toBe(false);
      expect(snapshot.originalFolderBeingRenamed).toBe("");


      // Ensure rename file properties remain unchanged
      expect(snapshot.originalFileBeingRenamed).toBe("");
      expect(snapshot.renameFileInputValue).toBe("");
    });
  });

  describe("snapshot retrieval", () => {
    it("should return the correct snapshot after multiple operations", () => {
      const explorer = new VirtualFileExplorer();
      explorer.applyAction({ name: "file-explorer-show-context-menu", value: "" });
      explorer.applyAction({ name: "file-explorer-show-new-file-input", value: "" });
      explorer.applyAction({ name: "file-explorer-type-new-file-input", value: "temp" });
      explorer.applyAction({ name: "file-explorer-rename-file-draft-state", value: "oldName.ts" });
      explorer.applyAction({ name: "file-explorer-type-rename-file-input", value: "new" });
      
      const snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isFileExplorerContextMenuOpen).toBe(true);
      expect(snapshot.isNewFileInputVisible).toBe(true);
      expect(snapshot.newFileInputValue).toBe("temp");
      expect(snapshot.originalFileBeingRenamed).toBe("oldName.ts");
      expect(snapshot.renameFileInputValue).toBe("new.ts");
    });
  });

  describe("clearing inputs", () => {
    it("should clear new file input when the file-explorer-clear-new-file-input action is fired", () => {
      const explorer = new VirtualFileExplorer();
      explorer.applyAction({ name: "file-explorer-type-new-file-input", value: "myfile.js" });
      let snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.newFileInputValue).toBe("myfile.js");

      explorer.applyAction({ name: "file-explorer-clear-new-file-input", value: "" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.newFileInputValue).toBe("");
    });

    it("should clear new folder input when the file-explorer-clear-new-folder-input action is fired", () => {
      const explorer = new VirtualFileExplorer();
      explorer.applyAction({ name: "file-explorer-type-new-folder-input", value: "MyDir" });
      let snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.newFolderInputValue).toBe("MyDir");

      explorer.applyAction({ name: "file-explorer-clear-new-folder-input", value: "" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.newFolderInputValue).toBe("");
    });
  });
});
