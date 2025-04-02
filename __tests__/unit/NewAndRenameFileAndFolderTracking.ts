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
      expect(snapshot.newFileInputValue).toBe("");
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

      // On enter, the input should be cleared and hidden
      explorer.applyAction({ name: "file-explorer-enter-new-folder-input", value: "" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.isNewFolderInputVisible).toBe(false);
      expect(snapshot.newFolderInputValue).toBe("");
    });
  });

  describe("rename input tracking", () => {
    it("should track rename file draft and input value independently", () => {
      const explorer = new VirtualFileExplorer();
      // Set the rename file draft state
      explorer.applyAction({ name: "file-explorer-rename-file-draft-state", value: "oldFile.ts" });
      let snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.originalFileBeingRenamed).toBe("oldFile.ts");

      // Type into the rename file input
      explorer.applyAction({ name: "file-explorer-type-rename-file-input", value: "new" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.renameFileInputValue).toBe("new");

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

      // Type into the rename folder input
      explorer.applyAction({ name: "file-explorer-type-rename-folder-input", value: "new" });
      snapshot = explorer.getCurrentFileExplorerSnapshot();
      expect(snapshot.renameFolderInputValue).toBe("new");

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
      expect(snapshot.renameFileInputValue).toBe("new");
    });
  });
});
