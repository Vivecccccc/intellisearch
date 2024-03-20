// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import Parser from "web-tree-sitter";

import { ViewProviderSidebar } from "./view-provider/search-webview-sidebar.provider";
import { HierachyTreeItem, HierachyTreeProvider } from "./view-provider/hierarchy-treeview.provider";
import { pickLang, removeSubFolders } from "./utils/utils";
import { ParsedMethod, getParser } from "./parser/parser";
import { langRouter } from "./parser/lang-adapter";
import { FileKeeper } from "./utils/file-keeper";

let fileKeeper: FileKeeper = new FileKeeper();
let fileKeeperStorage: string;

export function activate(context: vscode.ExtensionContext) {
  let pickedLang: string;
  let hierarchyTreeProvider: HierachyTreeProvider;
  let parser: Parser;
  
  // see if the global storage dir exists
  if (!fs.existsSync(context.globalStorageUri.fsPath)) {
    fs.mkdirSync(context.globalStorageUri.fsPath);
  }
  fileKeeperStorage = context.globalStorageUri.fsPath + "/fileKeeper.json";
  if (fs.existsSync(fileKeeperStorage)) {
    fileKeeper.deserialize(fileKeeperStorage);
  }

  const viewProviderSidebar: vscode.WebviewViewProvider = new ViewProviderSidebar(context);
  const sidebarViewDisposable = vscode.window.registerWebviewViewProvider(
    "intellisearch.searchView",
    viewProviderSidebar,
    { webviewOptions: { retainContextWhenHidden: true } }
  );
  
  const disposableSelectLanguage = vscode.commands.registerCommand(
    "intellisearch.selectLang",
    async () => {
      pickedLang = await pickLang();
      if (hierarchyTreeProvider) {
        hierarchyTreeProvider.pickedLang = pickedLang;
        hierarchyTreeProvider.refresh();
      }
    }
  );

  const disposableAddFolders = vscode.commands.registerCommand(
    "intellisearch.addFolders",
    async () => {
      const uris = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: true,
        openLabel: "Add Folders",
      });
      if (uris && !pickedLang) {
        pickedLang = await pickLang();
      }

      if (uris && uris.length) {
        if (hierarchyTreeProvider) {
          hierarchyTreeProvider.folders.push(...uris);
          hierarchyTreeProvider.pickedLang = pickedLang;
          // remove duplicates
          const uniqueFolders = Array.from(
            new Set(hierarchyTreeProvider.folders.map((folder) => folder.fsPath))
          ).map((fsPath) => vscode.Uri.file(fsPath));
          // const filteredFolders = uniqueFolders.filter(folder1 => !uniqueFolders.some(folder2 => folder1.fsPath.startsWith(folder2.fsPath + path.sep)));
          const filteredFolders = removeSubFolders(uniqueFolders);
          hierarchyTreeProvider.folders = filteredFolders;
          hierarchyTreeProvider.refresh();
        } else {
          hierarchyTreeProvider = new HierachyTreeProvider(uris, pickedLang);
        }
      }
      vscode.commands.executeCommand('setContext', 'intellisearch.timeToSearch', true);
    }
  );

  const disposableClearFolders = vscode.commands.registerCommand(
    "intellisearch.clearFolders",
    () => {
      if (hierarchyTreeProvider) {
        hierarchyTreeProvider.folders = [];
        hierarchyTreeProvider.refresh();
      }
    }
  );

  const disposableRemoveFolder = vscode.commands.registerCommand(
    "intellisearch.removeFolder",
    (hierarchyItem: HierachyTreeItem) => {
      if (hierarchyTreeProvider) {
        hierarchyTreeProvider.folders = hierarchyTreeProvider.folders.filter(
          (f) => f.fsPath !== hierarchyItem.uri.fsPath
        );
        hierarchyTreeProvider.refresh();
      }
    }
  );

  const disposableParseFile = vscode.commands.registerCommand(
    "intellisearch.parseFile",
    async (files: vscode.Uri[] | undefined) => {
      if (!pickedLang) {
        pickedLang = await pickLang();
      }
      parser = await getParser(pickedLang, context);

      const concernedFiles = files ? files : [];

      const lumberjack = langRouter(pickedLang, parser);
      // initialize a dictionary to store the parsed methods and their file paths
      const parsedMethods: Map<string, { flag: boolean, methods: ParsedMethod[] }> = new Map();
      for (let i = 0; i < concernedFiles.length; i++) {
        const file = concernedFiles[i];
        const fileUpdates = fileKeeper.checkFileUpdate(file.fsPath);
        let methods: ParsedMethod[];
        if (!fileUpdates.flag) {
          methods = fileUpdates.fileElem.methods!;
        } else {
          methods = lumberjack.parseFile(fileUpdates.fileContent);
          fileKeeper.addFile(file.fsPath, { fileHash: fileUpdates.fileElem.fileHash, methods: methods });
        }
        if (methods && methods.length > 0) {
          parsedMethods.set(file.fsPath, { flag: fileUpdates.flag, methods: methods });
        }
      }
      return parsedMethods;
    }
  );

  context.subscriptions.push(
    ...[
      sidebarViewDisposable,
      disposableAddFolders,
      disposableClearFolders,
      disposableRemoveFolder,
      disposableSelectLanguage,
      disposableParseFile,
    ]
  );
}

// this method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
  if (fileKeeperStorage) {
    fileKeeper.serialize(fileKeeperStorage);
  }
}
