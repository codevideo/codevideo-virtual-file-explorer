import { VirtualFileExplorer } from "../../src/VirtualFileExplorer";
import { describe, expect, it } from "@jest/globals";
import { FileExplorerAction, IFileStructure, DirectoryNode } from "@fullstackcraftllc/codevideo-types";

describe("VirtualFileExplorer", () => {
  describe("basic functionality", () => {
    it("should initialize with empty state", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      expect(virtualFileExplorer.getCurrentFileTree()).toEqual("");
      expect(virtualFileExplorer.getActionsApplied()).toEqual([]);
      expect(virtualFileExplorer.getCurrentFileStructure()).toEqual({});
    });

    it("should create files in root directory", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-file", value: "file1.ts" },
        { name: "create-file", value: "file2.ts" },
      ];

      virtualFileExplorer.applyActions(actions);
      expect(virtualFileExplorer.getCurrentFileTree()).toEqual("file1.ts\nfile2.ts\n");
      
      const structure = virtualFileExplorer.getCurrentFileStructure();
      expect(structure["file1.ts"]).toBeDefined();
      expect(structure["file2.ts"]).toBeDefined();
    });
  });

  describe("folder operations", () => {
    it("should handle nested folder creation and toggle states", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-folder", value: "src/components" },
        { name: "create-folder", value: "src/utils" },
        { name: "toggle-folder", value: "src/components" }
      ];

      virtualFileExplorer.applyActions(actions);
      const structure = virtualFileExplorer.getCurrentFileStructure();
      const srcFolder = structure["src"] as DirectoryNode;
      expect(srcFolder.type).toBe("directory");
      expect((srcFolder.children?.["components"] as DirectoryNode).collapsed).toBe(true);
      expect((srcFolder.children?.["utils"] as DirectoryNode).collapsed).toBe(false);
    });

    it("should handle folder deletion with contents", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-file", value: "src/index.ts" },
        { name: "create-folder", value: "src/components" },
        { name: "create-file", value: "src/components/Button.tsx" },
        { name: "delete-folder", value: "src/components" }
      ];

      virtualFileExplorer.applyActions(actions);
      const structure = virtualFileExplorer.getCurrentFileStructure();
      const srcFolder = structure["src"] as DirectoryNode;
      expect(srcFolder.children?.["components"]).toBeUndefined();
      expect(srcFolder.children?.["index.ts"]).toBeDefined();
    });
  });

  describe("file operations", () => {
    it("should handle file copy and move operations", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-folder", value: "dist" },
        { name: "create-file", value: "src/index.ts" },
        { name: "copy-file", value: "from:src/index.ts;to:dist/index.ts" },
        { name: "create-folder", value: "backup" },
        { name: "move-file", value: "from:src/index.ts;to:backup/index.ts" }
      ];

      virtualFileExplorer.applyActions(actions);
      const structure = virtualFileExplorer.getCurrentFileStructure();
      const srcFolder = structure["src"] as DirectoryNode;
      const distFolder = structure["dist"] as DirectoryNode;
      const backupFolder = structure["backup"] as DirectoryNode;
      
      expect(srcFolder.children?.["index.ts"]).toBeUndefined();
      expect(distFolder.children?.["index.ts"]).toBeDefined();
      expect(backupFolder.children?.["index.ts"]).toBeDefined();
    });

    it("should handle folder copy and move operations", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-file", value: "src/index.ts" },
        { name: "create-folder", value: "src/components" },
        { name: "create-file", value: "src/components/Button.tsx" },
        { name: "copy-folder", value: "from:src;to:src-backup" },
        { name: "move-folder", value: "from:src/components;to:shared/components" }
      ];

      virtualFileExplorer.applyActions(actions);
      const structure = virtualFileExplorer.getCurrentFileStructure();
      const srcFolder = structure["src"] as DirectoryNode;
      const srcBackupFolder = structure["src-backup"] as DirectoryNode;
      const sharedFolder = structure["shared"] as DirectoryNode;
      
      expect(srcFolder.children?.["components"]).toBeUndefined();
      expect(srcBackupFolder.children?.["components"]).toBeDefined();
      expect(sharedFolder.children?.["components"]).toBeDefined();
    });

    it("should maintain alphabetical ordering", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-file", value: "src/zebra.ts" },
        { name: "create-file", value: "src/alpha.ts" },
        { name: "create-folder", value: "src/beta" },
        { name: "create-folder", value: "src/gamma" }
      ];

      virtualFileExplorer.applyActions(actions);
      expect(virtualFileExplorer.getCurrentFileTree()).toEqual(
        "src\n  beta\n  gamma\n  alpha.ts\n  zebra.ts\n"
      );
    });
  });

  describe("complex operations", () => {
    it("should handle complex rename operations", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-file", value: "src/oldName.ts" },
        { name: "rename-file", value: "from:src/oldName.ts;to:src/newName.ts" },
        { name: "create-folder", value: "src/subfolder" },
        { name: "rename-folder", value: "from:src/subfolder;to:src/betterName" }
      ];

      virtualFileExplorer.applyActions(actions);
      const structure = virtualFileExplorer.getCurrentFileStructure();
      const srcFolder = structure["src"] as DirectoryNode;
      expect(srcFolder.children?.["oldName.ts"]).toBeUndefined();
      expect(srcFolder.children?.["newName.ts"]).toBeDefined();
      expect(srcFolder.children?.["subfolder"]).toBeUndefined();
      expect(srcFolder.children?.["betterName"]).toBeDefined();
    });

    it("should handle deeply nested structures", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "root" },
        { name: "create-folder", value: "root/level1" },
        { name: "create-folder", value: "root/level1/level2" },
        { name: "create-file", value: "root/level1/level2/deep.ts" },
        { name: "create-file", value: "root/level1/medium.ts" },
        { name: "create-file", value: "root/shallow.ts" }
      ];

      virtualFileExplorer.applyActions(actions);
      expect(virtualFileExplorer.getCurrentFileTree()).toEqual(
        "root\n  level1\n    level2\n      deep.ts\n    medium.ts\n  shallow.ts\n"
      );
    });
  });
});