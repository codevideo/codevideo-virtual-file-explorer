import { VirtualFileExplorer } from "../../src/VirtualFileExplorer";

describe("VirtualFileExplorer", () => {
    describe("basic functionality", () => {
        it("should move files", () => {
            // arrange
            const virtualFileExplorer = new VirtualFileExplorer();
            virtualFileExplorer.applyAction({"name": "file-explorer-create-file", "value": "test.md"});

            // act
            virtualFileExplorer.applyAction({"name": "file-explorer-move-file", "value": "from:test.md;to:test2.md"});

            // assert that only test2.md exists
            expect(virtualFileExplorer.getFiles()).toEqual(["/test2.md"]);
            expect(virtualFileExplorer.getLsString()).toEqual("test2.md");
        })
        
    });
});
