import * as vscode from "vscode";
import * as fs from "fs";
import Parser from "web-tree-sitter";

import { SearchViewProvider } from "./view-provider/search-webview-sidebar.provider";
import { HierachyTreeProvider } from "./view-provider/hierarchy-treeview.provider";
import { pickLang } from "./utils/utils";
import { Method, getParser } from "./parser/parser";
import { langRouter } from "./parser/lang-adapter";
import { FileKeeper } from "./utils/file-keeper";

import { registerWorkspaceListeners } from "./workspace-listeners";

let fileKeeper: FileKeeper = new FileKeeper();
let fileKeeperStorage: string;
let hierarchyTreeProvider: HierachyTreeProvider;

export async function activate(context: vscode.ExtensionContext) {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }
  let pickedLang: string;
  let parser: Parser;

  // see if the global storage dir exists
  if (!fs.existsSync(context.globalStorageUri.fsPath)) {
    fs.mkdirSync(context.globalStorageUri.fsPath);
  }
  fileKeeperStorage = context.globalStorageUri.fsPath + "/fileKeeper.json";
  if (fs.existsSync(fileKeeperStorage)) {
    fileKeeper.deserialize(fileKeeperStorage);
  }

  const searchViewProvider: SearchViewProvider = new SearchViewProvider(context);
  const searchViewDisposable = vscode.window.registerWebviewViewProvider(
    "intellisearch.searchView",
    searchViewProvider,
    { webviewOptions: { retainContextWhenHidden: true } }
  );

  const disposableSelectLanguage = vscode.commands.registerCommand(
    "intellisearch.selectLang",
    async () => {
      let newPickedLang = await pickLang(context);
      if (hierarchyTreeProvider) {
        hierarchyTreeProvider.pickedLang = newPickedLang;
        hierarchyTreeProvider.refresh([]);
      }
      return newPickedLang;
    }
  );

  const disposableInitFromWorkspace = vscode.commands.registerCommand(
    "intellisearch.initFromWorkspace",
    async () => {
      const uris =
        vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
      if (!uris) {
        vscode.window.showErrorMessage("Please open a folder to workspace first");
        return;
      }
      if (!pickedLang) {
        pickedLang = await vscode.commands.executeCommand("intellisearch.selectLang");
      }
      hierarchyTreeProvider = new HierachyTreeProvider(uris, pickedLang, searchViewProvider);
      let workspaceListeners = registerWorkspaceListeners(hierarchyTreeProvider);
      context.subscriptions.push(...workspaceListeners);
    }
  );

	const disposableParseFile = vscode.commands.registerCommand(
    "intellisearch.parseFile",
    async (files: string[] | undefined) => {
      parser = await getParser(pickedLang!, context);

      const concernedFiles = files ? files : [];

      const lumberjack = langRouter(pickedLang!, parser);
      // initialize a dictionary to store the parsed methods and their file paths
      const parsedMethods: Map<string, { flag: boolean, methods: Method[] }> = new Map();
      for (let i = 0; i < concernedFiles.length; i++) {
        const filePath = concernedFiles[i];
        const fileUpdates = fileKeeper.checkFileUpdate(filePath);
        let methods: Method[];
        if (!fileUpdates.flag) {
          methods = fileUpdates.fileElem.methods!;
        } else {
          methods = lumberjack.parseFile(fileUpdates.fileContent);
          fileKeeper.addFile(filePath, { fileHash: fileUpdates.fileElem.fileHash, methods: methods });
        }
        parsedMethods.set(filePath, { flag: fileUpdates.flag, methods: methods });
        if (methods && methods.length > 0) {
        }
      }
      return parsedMethods;
    }
  );

	const disposableParseAll = vscode.commands.registerCommand(
    "intellisearch.parseAll",
    async () => {
			if (hierarchyTreeProvider) {
				vscode.commands.executeCommand('setContext', 'intellisearch.timeToSearch', true);
				hierarchyTreeProvider.injectMethodInFile(hierarchyTreeProvider.filesSnapshot);
			} else {
				vscode.window.showErrorMessage("Please initialize the workspace first");
    }
    }
  );

  const disposableRefreshTreeView = vscode.commands.registerCommand(
    "intellisearch.refreshTreeView",
    async () => {
      if (hierarchyTreeProvider) {
        hierarchyTreeProvider.refresh([]);
      }
    }
  );
  // deprecated
  const disposableNotifyWebview = vscode.commands.registerCommand(
    "intellisearch.notifyWebview",
    (methods: Map<string, Method[]>, addOp: boolean) => {
      searchViewProvider.updateMethodPool(methods, addOp);
    }
  );

  if (context.workspaceState.get("pickedLang")) {
    pickedLang = context.workspaceState.get("pickedLang") as string;
    await vscode.commands.executeCommand('setContext', 'intellisearch.workspaceYetPickedLang', false);
    await vscode.commands.executeCommand('intellisearch.initFromWorkspace');
  } else {
    await vscode.commands.executeCommand('setContext', 'intellisearch.workspaceYetPickedLang', true);
  }

	context.subscriptions.push(
		...[
			searchViewDisposable,
      disposableSelectLanguage,
      disposableInitFromWorkspace,
			disposableParseFile,
			disposableParseAll,
      disposableRefreshTreeView,
		]
	);
  if (hierarchyTreeProvider! && hierarchyTreeProvider.hierarchyTreeView) {
    context.subscriptions.push(hierarchyTreeProvider.hierarchyTreeView);
  }

}

export async function deactivate() {
  let rootPath = fileKeeperStorage?.split('/').slice(0, -1).join('/');
  fs.writeFileSync(rootPath + '/start.txt', '');
  if (fileKeeperStorage) {
    fileKeeper.serialize(fileKeeperStorage);
  }
  if (hierarchyTreeProvider && hierarchyTreeProvider.hierarchyTreeView) {
    hierarchyTreeProvider.hierarchyTreeView.badge = undefined;
  }
  fs.writeFileSync(rootPath + '/end.txt', '');
}