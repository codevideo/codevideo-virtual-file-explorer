import { VirtualFileExplorer } from "../../src/VirtualFileExplorer";
import { describe, expect, it } from "@jest/globals";
import { FileExplorerAction, DirectoryNode, advancedCommandValueSeparator } from "@fullstackcraftllc/codevideo-types";

describe("VirtualFileExplorer", () => {
  describe("full example", () => {
    it("should initialize with empty state", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      expect(virtualFileExplorer.getCurrentFileTree()).toEqual("");
      expect(virtualFileExplorer.getActionsApplied()).toEqual([]);
      expect(virtualFileExplorer.getCurrentFileStructure()).toEqual({});
    });

    it("should create files in root directory", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "file-explorer-create-file", value: "file1.ts" },
        { name: "file-explorer-create-file", value: "file2.ts" },
      ];

      virtualFileExplorer.applyActions(actions);
      expect(virtualFileExplorer.getCurrentFileTree()).toEqual("file1.ts\nfile2.ts\n");

      expect(virtualFileExplorer.getCurrentFileStructure()).toEqual({
        "file1.ts": {
          caretPosition: {
            row: 0,
            col: 0,
          },
          content: "",
          language: "ts",
          type: "file",
        },
        "file2.ts": {
          caretPosition: {
            row: 0,
            col: 0,
          },
          content: "",
          language: "ts",
          type: "file",
        }
      })
    });
  });

  describe("folder operations", () => {
    it("should handle nested folder creation and toggle states", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-folder", value: "src/components" },
        { name: "file-explorer-create-folder", value: "src/utils" },
        { name: "file-explorer-toggle-folder", value: "src/components" }
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
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-file", value: "src/index.ts" },
        { name: "file-explorer-create-folder", value: "src/components" },
        { name: "file-explorer-create-file", value: "src/components/Button.tsx" },
        { name: "file-explorer-delete-folder", value: "src/components" }
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
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-folder", value: "dist" },
        { name: "file-explorer-create-file", value: "src/index.ts" },
        { name: "file-explorer-copy-file", value: `src/index.ts${advancedCommandValueSeparator}dist/index.ts` },
        { name: "file-explorer-create-folder", value: "backup" },
        { name: "file-explorer-move-file", value: `src/index.ts${advancedCommandValueSeparator}backup/index.ts` }
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
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-file", value: "src/index.ts" },
        { name: "file-explorer-create-folder", value: "src/components" },
        { name: "file-explorer-create-file", value: "src/components/Button.tsx" },
        { name: "file-explorer-copy-folder", value: `src${advancedCommandValueSeparator}src-backup` },
        { name: "file-explorer-move-folder", value: `src/components${advancedCommandValueSeparator}shared/components` }
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
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-file", value: "src/zebra.ts" },
        { name: "file-explorer-create-file", value: "src/alpha.ts" },
        { name: "file-explorer-create-folder", value: "src/beta" },
        { name: "file-explorer-create-folder", value: "src/gamma" }
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
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-file", value: "src/oldName.ts" },
        { name: "file-explorer-rename-file", value: `src/oldName.ts${advancedCommandValueSeparator}src/newName.ts` },
        { name: "file-explorer-create-folder", value: "src/subfolder" },
        { name: "file-explorer-rename-folder", value: `src/subfolder${advancedCommandValueSeparator}src/betterName` }
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
        { name: "file-explorer-create-folder", value: "root" },
        { name: "file-explorer-create-folder", value: "root/level1" },
        { name: "file-explorer-create-folder", value: "root/level1/level2" },
        { name: "file-explorer-create-file", value: "root/level1/level2/deep.ts" },
        { name: "file-explorer-create-file", value: "root/level1/medium.ts" },
        { name: "file-explorer-create-file", value: "root/shallow.ts" }
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
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-file", value: "src/index.ts" },
        { name: "file-explorer-create-file", value: "src/app.ts" }
      ];

      virtualFileExplorer.applyActions(actions);
      expect(virtualFileExplorer.getFileContents("src/index.ts")).toBe("");
    });

    it("should not throw error for non-existent file", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      expect(() => {
        virtualFileExplorer.getFileContents("nonexistent.ts");
      }).not.toThrow();
    });

    it("should not throw error when path points to directory", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "file-explorer-create-folder", value: "src" }
      ];

      virtualFileExplorer.applyActions(actions);
      expect(() => {
        virtualFileExplorer.getFileContents("src");
      }).not.toThrow();
    });

    it("should handle deeply nested files", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-folder", value: "src/components" },
        { name: "file-explorer-create-folder", value: "src/components/ui" },
        { name: "file-explorer-create-file", value: "src/components/ui/Button.tsx" }
      ];

      virtualFileExplorer.applyActions(actions);
      expect(virtualFileExplorer.getFileContents("src/components/ui/Button.tsx")).toBe("");
    });

    it("should return only saved file contents", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      virtualFileExplorer.applyAction({
        name: "file-explorer-create-file",
        value: "~/index.ts"
      });

      // this is actually only called from above in virtual-ide, but use it as a shim here for testing
      virtualFileExplorer.applyAction({
        name: "file-explorer-set-file-contents",
        value: `~/index.ts${advancedCommandValueSeparator}console.log('Hello, world!');`
      });

      expect(virtualFileExplorer.getFileContents("~/index.ts")).toBe(
        "console.log('Hello, world!');"
      );
    });
  });

  describe("file open/close operations", () => {
    it("should track opened files", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-file", value: "src/index.ts" },
        { name: "file-explorer-create-file", value: "src/app.ts" },
        { name: "file-explorer-create-file", value: "src/utils.ts" }
      ];

      virtualFileExplorer.applyActions(actions);

      // Open some files
      virtualFileExplorer.applyAction({
        name: "file-explorer-open-file",
        value: "src/index.ts"
      });
      virtualFileExplorer.applyAction({
        name: "file-explorer-open-file",
        value: "src/app.ts"
      });

      // Check open files
      expect(virtualFileExplorer.getOpenFiles()).toEqual([
        "src/app.ts",
        "src/index.ts"
      ]);
    });

    it("should handle closing files", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-file", value: "src/index.ts" },
        { name: "file-explorer-open-file", value: "src/index.ts" }
      ];

      virtualFileExplorer.applyActions(actions);

      // expect the index.ts file to be open
      expect(virtualFileExplorer.getOpenFiles()).toEqual(["src/index.ts"]);

      // after closing it, expect no open files
      virtualFileExplorer.applyAction({ name: "file-explorer-close-file", value: "src/index.ts" });
      expect(virtualFileExplorer.getOpenFiles()).toEqual([]);
    });

    it("should handle closing non-opened files", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-file", value: "src/index.ts" }
      ];

      virtualFileExplorer.applyActions(actions);

      virtualFileExplorer.applyAction({ name: "file-explorer-close-file", value: "src/index.ts" });
      expect(virtualFileExplorer.getOpenFiles()).toEqual([]);
    });

    it("should not throw when opening non-existent files", () => {
      const virtualFileExplorer = new VirtualFileExplorer();

      expect(() => {
        virtualFileExplorer.applyAction({ name: "file-explorer-open-file", value: "nonexistent.ts" });
      }).not.toThrow();
    });

    it("should not throw when opening directories", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "file-explorer-create-folder", value: "src" }
      ];

      virtualFileExplorer.applyActions(actions);

      expect(() => {
        virtualFileExplorer.applyAction({ name: "file-explorer-open-file", value: "src" });
      }).not.toThrow();
    });

    it("should maintain open files through file operations", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-file", value: "src/index.ts" },
        { name: "file-explorer-create-file", value: "src/app.ts" }
      ];

      virtualFileExplorer.applyActions(actions);

      virtualFileExplorer.applyAction({
        name: "file-explorer-open-file",
        value: "src/index.ts"
      });
      virtualFileExplorer.applyAction({
        name: "file-explorer-open-file",
        value: "src/app.ts"
      });

      // Rename an open file
      virtualFileExplorer.applyAction({
        name: "file-explorer-rename-file",
        value: `src/index.ts${advancedCommandValueSeparator}src/main.ts`
      });

      expect(virtualFileExplorer.getOpenFiles()).toEqual([
        "src/app.ts",
        "src/main.ts"
      ]);
    });
  });

  describe("folder expand/collapse operations", () => {
    it("should handle expanding and collapsing folders", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "file-explorer-create-folder", value: "src" },
        { name: "file-explorer-create-folder", value: "src/components" },
        { name: "file-explorer-create-folder", value: "src/utils" }
      ];

      virtualFileExplorer.applyActions(actions);

      // Collapse src folder via toggle (open by default)
      virtualFileExplorer.applyAction({ name: "file-explorer-toggle-folder", value: "src" });
      expect(virtualFileExplorer.getFileObjects().filter(file => file.type === "directory")[0].collapsed).toBe(true);

      // Expand src folder via toggle
      virtualFileExplorer.applyAction({ name: "file-explorer-toggle-folder", value: "src" });
      expect(virtualFileExplorer.getFileObjects().filter(file => file.type === "directory")[0].collapsed).toBe(false);

      // explicitly call file-explorer-collapse-folder
      virtualFileExplorer.applyAction({ name: "file-explorer-collapse-folder", value: "src" });
      expect(virtualFileExplorer.getFileObjects().filter(file => file.type === "directory")[0].collapsed).toBe(true);

      // explicitly call file-explorer-expand-folder
      virtualFileExplorer.applyAction({ name: "file-explorer-expand-folder", value: "src" });
      expect(virtualFileExplorer.getFileObjects().filter(file => file.type === "directory")[0].collapsed).toBe(false);
    });

    // TODO: this one may be bugged
    // it("should show only expanded folders if the getCurrentFileTree method with parameter false is called", () => {
    //   const virtualFileExplorer = new VirtualFileExplorer();
    //   const actions: FileExplorerAction[] = [
    //     { name: "file-explorer-create-folder", value: "root" },
    //     { name: "file-explorer-create-folder", value: "root/level1" },
    //     { name: "file-explorer-create-folder", value: "root/level1/level2" },
    //     { name: "file-explorer-create-file", value: "root/level1/level2/deep.ts" },
    //     { name: "file-explorer-create-file", value: "root/level1/medium.ts" },
    //     { name: "file-explorer-create-file", value: "root/shallow.ts" }
    //   ];

    //   virtualFileExplorer.applyActions(actions);

    //   // Expand root folder
    //   virtualFileExplorer.applyAction({ name: "file-explorer-expand-folder", value: "root" });

    //   // see only expanded folders
    //   expect(virtualFileExplorer.getCurrentFileTree(false)).toEqual(
    //     "root\n  level1\n    level2\n"
    //   );

    //   // default is to show the tree even if folders are collapsed
    //   expect(virtualFileExplorer.getCurrentFileTree()).toEqual(
    //     "root\n  level1\n    level2\n      deep.ts\n    medium.ts\n  shallow.ts\n"
    //   );
    // });
  });


  describe("creating, opening, and closing files", () => {
    it("should reflect the open files sorted in alphabetical order, once they are opened, and also once one is closed", () => {
      const virtualFileExplorer = new VirtualFileExplorer();
      const actions: FileExplorerAction[] = [
        { name: "file-explorer-create-file", value: "src/index.ts" },
        { name: "file-explorer-open-file", value: "src/index.ts" },
        { name: "file-explorer-create-file", value: "src/app.ts" },
        { name: "file-explorer-open-file", value: "src/app.ts" },
        { name: "file-explorer-create-file", value: "src/utils.ts" },
        { name: "file-explorer-open-file", value: "src/utils.ts" }
      ];

      virtualFileExplorer.applyActions(actions);
      expect(virtualFileExplorer.getOpenFiles()).toEqual([
        "src/app.ts",
        "src/index.ts",
        "src/utils.ts"
      ]);

      // close one of the files
      virtualFileExplorer.applyAction({ name: "file-explorer-close-file", value: "src/app.ts" });
      expect(virtualFileExplorer.getOpenFiles()).toEqual([
        "src/index.ts",
        "src/utils.ts"
      ]);
    });
  });
});