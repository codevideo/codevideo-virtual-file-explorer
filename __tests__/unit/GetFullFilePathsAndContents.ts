import { advancedCommandValueSeparator } from "@fullstackcraftllc/codevideo-types";
import { VirtualFileExplorer } from "../../src/VirtualFileExplorer";

describe("VirtualFileExplorer", () => {
    describe("getFullFilePathsAndContents", () => {
        it("should copy files", () => {
            // arrange
            const virtualFileExplorer = new VirtualFileExplorer();
            virtualFileExplorer.applyAction({"name": "file-explorer-create-file", "value": "a.txt"});
            virtualFileExplorer.applyAction({"name": "file-explorer-set-file-contents", "value": `a.txt${advancedCommandValueSeparator}hello`});
            virtualFileExplorer.applyAction({"name": "file-explorer-create-file", "value": "b.txt"});
            virtualFileExplorer.applyAction({"name": "file-explorer-set-file-contents", "value": `b.txt${advancedCommandValueSeparator}world`});
            virtualFileExplorer.applyAction({"name": "file-explorer-create-folder", "value": "c"});
            virtualFileExplorer.applyAction({"name": "file-explorer-create-file", "value": "c/d.txt"});
            virtualFileExplorer.applyAction({"name": "file-explorer-set-file-contents", "value": `c/d.txt${advancedCommandValueSeparator}!!!`});


            // act
            const fullFilePathsAndContents = virtualFileExplorer.getFullFilePathsAndContents();

            // assert
            expect(fullFilePathsAndContents).toEqual([
                {path: "/a.txt", content: "hello"},
                {path: "/b.txt", content: "world"},
                {path: "/c/d.txt", content: "!!!"}
            ]);
        });
    });
});
