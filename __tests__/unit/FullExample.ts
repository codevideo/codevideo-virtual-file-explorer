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

  describe("getFileContents", () => {
    it("should retrieve file contents", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-file", value: "src/index.ts" },
        { name: "create-file", value: "src/app.ts" }
      ];

      virtualFileExplorer.applyActions(actions);
      expect(virtualFileExplorer.getFileContents("src/index.ts")).toBe("");
    });

    it("should throw error for non-existent file", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      expect(() => {
        virtualFileExplorer.getFileContents("nonexistent.ts");
      }).toThrow("File not found: nonexistent.ts");
    });

    it("should throw error when path points to directory", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" }
      ];

      virtualFileExplorer.applyActions(actions);
      expect(() => {
        virtualFileExplorer.getFileContents("src");
      }).toThrow("Path points to a directory, not a file: src");
    });

    it("should handle deeply nested files", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-folder", value: "src/components" },
        { name: "create-folder", value: "src/components/ui" },
        { name: "create-file", value: "src/components/ui/Button.tsx" }
      ];

      virtualFileExplorer.applyActions(actions);
      expect(virtualFileExplorer.getFileContents("src/components/ui/Button.tsx")).toBe("");
    });
  });

  describe("file open/close operations", () => {
    it("should track opened files", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-file", value: "src/index.ts" },
        { name: "create-file", value: "src/app.ts" },
        { name: "create-file", value: "src/utils.ts" }
      ];

      virtualFileExplorer.applyActions(actions);
      
      // Open some files
      virtualFileExplorer.openFile("src/index.ts");
      virtualFileExplorer.openFile("src/app.ts");
      
      // Check open files
      expect(virtualFileExplorer.getOpenFiles()).toEqual([
        "src/app.ts",
        "src/index.ts"
      ]);
    });

    it("should handle closing files", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-file", value: "src/index.ts" }
      ];

      virtualFileExplorer.applyActions(actions);
      
      virtualFileExplorer.openFile("src/index.ts");
      expect(virtualFileExplorer.getOpenFiles()).toEqual(["src/index.ts"]);
      
      virtualFileExplorer.closeFile("src/index.ts");
      expect(virtualFileExplorer.getOpenFiles()).toEqual([]);
    });

    it("should handle closing non-opened files", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-file", value: "src/index.ts" }
      ];

      virtualFileExplorer.applyActions(actions);
      
      virtualFileExplorer.closeFile("src/index.ts"); // Should not throw
      expect(virtualFileExplorer.getOpenFiles()).toEqual([]);
    });

    it("should throw when opening non-existent files", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      
      expect(() => {
        virtualFileExplorer.openFile("nonexistent.ts");
      }).toThrow("File not found: nonexistent.ts");
    });

    it("should throw when opening directories", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" }
      ];

      virtualFileExplorer.applyActions(actions);
      
      expect(() => {
        virtualFileExplorer.openFile("src");
      }).toThrow("Cannot open a directory: src");
    });

    it("should maintain open files through file operations", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "create-folder", value: "src" },
        { name: "create-file", value: "src/index.ts" },
        { name: "create-file", value: "src/app.ts" }
      ];

      virtualFileExplorer.applyActions(actions);
      
      virtualFileExplorer.openFile("src/index.ts");
      virtualFileExplorer.openFile("src/app.ts");

      // Rename an open file
      virtualFileExplorer.applyAction({
        name: "rename-file",
        value: "from:src/index.ts;to:src/main.ts"
      });

      expect(virtualFileExplorer.getOpenFiles()).toEqual([
        "src/app.ts",
        "src/main.ts"
      ]);
    });
  });
});