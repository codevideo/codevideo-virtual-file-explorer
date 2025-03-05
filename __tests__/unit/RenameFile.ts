import { advancedCommandValueSeparator } from "@fullstackcraftllc/codevideo-types";
import { VirtualFileExplorer } from "../../src/VirtualFileExplorer";

describe("VirtualFileExplorer", () => {
    describe("basic functionality", () => {

        it("should rename files", () => {
            // arrange
            const virtualFileExplorer = new VirtualFileExplorer();
            virtualFileExplorer.applyAction({"name": "file-explorer-create-file", "value": "test.md"});

            // act
            virtualFileExplorer.applyAction({"name": "file-explorer-rename-file", "value": `test.md${advancedCommandValueSeparator}test2.md`});

            // assert
            expect(virtualFileExplorer.getFiles()).toEqual(["/test2.md"]);
            expect(virtualFileExplorer.getLsString()).toEqual("test2.md");
        });

        it("should not crash when i try to rename a file that doesn't exist", () => {
            // arrange
            const virtualFileExplorer = new VirtualFileExplorer();

            // act
            virtualFileExplorer.applyAction({"name": "file-explorer-rename-file", "value": "z"});


            // assert
            expect(virtualFileExplorer.getFiles()).toEqual([]);
        });
    });
});
