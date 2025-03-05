import { advancedCommandValueSeparator } from "@fullstackcraftllc/codevideo-types";
import { VirtualFileExplorer } from "../../src/VirtualFileExplorer";

describe("VirtualFileExplorer", () => {
    describe("basic functionality", () => {
        it("should copy files", () => {
            // arrange
            const virtualFileExplorer = new VirtualFileExplorer();
            virtualFileExplorer.applyAction({"name": "file-explorer-create-file", "value": "test.md"});

            // act
            virtualFileExplorer.applyAction({"name": "file-explorer-copy-file", "value": `test.md${advancedCommandValueSeparator}test2.md`});

            // assert
            expect(virtualFileExplorer.getFiles()).toEqual(["/test.md", "/test2.md"]);
            expect(virtualFileExplorer.getLsString()).toEqual("test.md\ntest2.md");
        });

        it("should copy files with absolute paths", () => {
            // arrange
            const virtualFileExplorer = new VirtualFileExplorer();
            virtualFileExplorer.applyAction({"name": "file-explorer-create-file", "value": "~/test.md"});

            // act
            virtualFileExplorer.applyAction({"name": "file-explorer-copy-file", "value": `~/test.md${advancedCommandValueSeparator}~/test2.md`});

            // assert
            expect(virtualFileExplorer.getFiles()).toEqual(["/test.md", "/test2.md"]);
            expect(virtualFileExplorer.getLsString()).toEqual("test.md\ntest2.md");
        });
    });
});
