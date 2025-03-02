import { VirtualFileExplorer } from "../../src/VirtualFileExplorer";

describe("VirtualFileExplorer", () => {
    describe("basic functionality", () => {
        it("should not break when trying to add a file with spaces in it and no extension", () => {
            const virtualFileExplorer = new VirtualFileExplorer();
            virtualFileExplorer.applyAction({"name": "file-explorer-create-file", "value": "some space name"});
            expect(virtualFileExplorer.getFiles()).toEqual(["/some space name"]);
        })
        it("should not break when trying to add a file with spaces in it with extension", () => {
            const virtualFileExplorer = new VirtualFileExplorer();
            virtualFileExplorer.applyAction({"name": "file-explorer-create-file", "value": "some space name.txt"});
            expect(virtualFileExplorer.getFiles()).toEqual(["/some space name.txt"]);
        })
    });
});
