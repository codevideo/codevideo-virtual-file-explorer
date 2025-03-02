import { VirtualFileExplorer } from "../../src/VirtualFileExplorer";

describe("VirtualFileExplorer getLsString", () => {
  it("should return an empty string for an empty directory", () => {
    const vfe = new VirtualFileExplorer();
    // The default working directory is '~' (root) which is empty at start.
    expect(vfe.getLsString()).toBe("");
  });

  it("should list top-level files and folders in the current directory", () => {
    const vfe = new VirtualFileExplorer();
    // Create a file and a folder in the root.
    vfe.applyAction({ name: "file-explorer-create-file", value: "file1.txt" });
    vfe.applyAction({ name: "file-explorer-create-folder", value: "folder1" });
    // Create a file inside folder1; it should not be listed at the root level.
    vfe.applyAction({ name: "file-explorer-create-file", value: "folder1/file2.txt" });
    
    const output = vfe.getLsString();
    // Expect the output to contain the file and folder created at the top level.
    expect(output).toContain("file1.txt");
    expect(output).toContain("folder1");
    // Ensure that files from subdirectories are not included.
    expect(output).not.toContain("file2.txt");
  });

  it("should list files in a subdirectory when working directory is changed", () => {
    const vfe = new VirtualFileExplorer();
    // Create a folder and a file inside it.
    vfe.applyAction({ name: "file-explorer-create-folder", value: "folderA" });
    vfe.applyAction({ name: "file-explorer-create-file", value: "folderA/fileB.txt" });
    // Set working directory to the subfolder.
    vfe.applyAction({ name: "file-explorer-set-present-working-directory", value: "~/folderA" });
    
    const output = vfe.getLsString();
    // In folderA, we expect only fileB.txt to be listed.
    expect(output.trim()).toBe("fileB.txt");
  });

  it("should return an empty string if the presentWorkingDirectory does not exist", () => {
    const vfe = new VirtualFileExplorer();
    // Set the working directory to a non-existent directory.
    vfe.applyAction({ name: "file-explorer-set-present-working-directory", value: "~/nonexistent" });
    expect(vfe.getLsString()).toBe("");
  });

  it("should list entries in alphabetical order", () => {
    const vfe = new VirtualFileExplorer();
    vfe.applyAction({ name: "file-explorer-create-file", value: "b.txt" });
    vfe.applyAction({ name: "file-explorer-create-file", value: "a.txt" });
    vfe.applyAction({ name: "file-explorer-create-folder", value: "cFolder" });
    
    // Split the result into an array and check if it's sorted.
    const outputLines = vfe.getLsString().trim().split("\n");
    const sortedLines = [...outputLines].sort();
    expect(outputLines).toEqual(sortedLines);
  });

  it("should list only current directory items for nested structure", () => {
    // Arrange
    const vfe = new VirtualFileExplorer();
    // At the root, create a folder 'level1' and a file 'level1.txt'
    vfe.applyAction({ name: "file-explorer-create-folder", value: "level1" });
    vfe.applyAction({ name: "file-explorer-create-file", value: "level1.txt" });
    // Inside 'level1', create a folder 'level2' and a file 'level2.txt'
    vfe.applyAction({ name: "file-explorer-create-folder", value: "level1/level2" });
    vfe.applyAction({ name: "file-explorer-create-file", value: "level1/level2.txt" });
    // Inside 'level1/level2', create a folder 'level3'
    vfe.applyAction({ name: "file-explorer-create-folder", value: "level1/level2/level3" });

    // Act & Assert for root level
    vfe.applyAction({ name: "file-explorer-set-present-working-directory", value: "~" });
    const rootOutput = vfe.getLsString().trim().split("\n").sort();
    // At root, only 'level1' and 'level1.txt' should be visible
    expect(rootOutput).toEqual(["level1", "level1.txt"].sort());

    // Act & Assert for level1
    vfe.applyAction({ name: "file-explorer-set-present-working-directory", value: "~/level1" });
    const level1Output = vfe.getLsString().trim().split("\n").sort();
    // Inside level1, only 'level2' and 'level2.txt' should be visible
    expect(level1Output).toEqual(["level2", "level2.txt"].sort());

    // Act & Assert for level1/level2
    vfe.applyAction({ name: "file-explorer-set-present-working-directory", value: "~/level1/level2" });
    const level2Output = vfe.getLsString().trim().split("\n").sort();
    // Inside level1/level2, only 'level3' should be visible
    expect(level2Output).toEqual(["level3"].sort());
  });

  it("should return a single string with no new line if there is only a single file", () => {
    const vfe = new VirtualFileExplorer();
    vfe.applyAction({ name: "file-explorer-create-file", value: "file1.txt" });
    const output = vfe.getLsString();
    expect(output).toBe("file1.txt");
  })

  // with full paths
  it("should work with change of working directory", () => {
    // make a test folder
    // move into the folder
    // create a file1.txt
    // check if ls returns file1.txt only

    // arrange
    const vfe = new VirtualFileExplorer();
    vfe.applyAction({ name: "file-explorer-create-folder", value: "~/test" });
    vfe.applyAction({ name: "file-explorer-set-present-working-directory", value: "~/test" });
    vfe.applyAction({ name: "file-explorer-create-file", value: "~/test/file1.txt" });

    // act
    const output = vfe.getLsString();

    // assert
    expect(output).toBe("file1.txt");

    // move back to root
    vfe.applyAction({ name: "file-explorer-set-present-working-directory", value: "~" });

    // act
    const outputRoot = vfe.getLsString();

    // assert
    expect(outputRoot).toBe("test");
  });

  // with relative paths
  it("should work with change of working directory with relative paths", () => {
    // make a test folder
    // move into the folder
    // create a file1.txt
    // check if ls returns file1.txt only

    // arrange
    const vfe = new VirtualFileExplorer();
    vfe.applyAction({ name: "file-explorer-create-folder", value: "test" });
    vfe.applyAction({ name: "file-explorer-set-present-working-directory", value: "test" });
    vfe.applyAction({ name: "file-explorer-create-file", value: "file1.txt" });

    // act
    const output = vfe.getLsString();

    // assert
    expect(output).toBe("file1.txt");

    // move back to root
    vfe.applyAction({ name: "file-explorer-set-present-working-directory", value: "~" });

    // act
    const outputRoot = vfe.getLsString();

    // assert
    expect(outputRoot).toBe("test");
  });
});
