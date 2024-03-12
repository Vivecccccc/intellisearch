// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ViewProviderSidebar } from "./view-provider/view-provider-sidebar";

import {
  HierachyTreeItem,
  HierachyTreeProvider,
} from "./view-provider/hierachyProvider";
import Parser from "web-tree-sitter";
import { removeSubFolders } from "./utils/utils";
import { ParsedMethod, getParser } from "./parser/parser";
import { langRouter } from "./parser/langAdapter";

export function activate(context: vscode.ExtensionContext) {
  let pickedLang: string;
  let hierachyTreeProvider: HierachyTreeProvider;
  let parser: Parser;
  let searchResults: { method: ParsedMethod; file: string }[];

  const viewProviderSidebar: vscode.WebviewViewProvider =
    new ViewProviderSidebar(context);
  const sidebarViewDisposable = vscode.window.registerWebviewViewProvider(
    "intellisearch.searchView",
    viewProviderSidebar,
    { webviewOptions: { retainContextWhenHidden: true } }
  );

  const disposableSelectLanguage = vscode.commands.registerCommand(
    "intellisearch.selectLang",
    async () => {
      pickedLang = await pickLang();
      if (hierachyTreeProvider) {
        hierachyTreeProvider.pickedLang = pickedLang;
        hierachyTreeProvider.refresh();
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
        if (hierachyTreeProvider) {
          hierachyTreeProvider.folders.push(...uris);
          hierachyTreeProvider.pickedLang = pickedLang;
          // remove duplicates
          const uniqueFolders = Array.from(
            new Set(hierachyTreeProvider.folders.map((folder) => folder.fsPath))
          ).map((fsPath) => vscode.Uri.file(fsPath));
          // const filteredFolders = uniqueFolders.filter(folder1 => !uniqueFolders.some(folder2 => folder1.fsPath.startsWith(folder2.fsPath + path.sep)));
          const filteredFolders = removeSubFolders(uniqueFolders);
          hierachyTreeProvider.folders = filteredFolders;
          hierachyTreeProvider.refresh();
        } else {
          hierachyTreeProvider = new HierachyTreeProvider(uris, pickedLang);
        }
      }
    }
  );

  const disposableClearFolders = vscode.commands.registerCommand(
    "intellisearch.clearFolders",
    () => {
      if (hierachyTreeProvider) {
        hierachyTreeProvider.folders = [];
        hierachyTreeProvider.refresh();
      }
    }
  );

  const disposableRemoveFolder = vscode.commands.registerCommand(
    "intellisearch.removeFolder",
    (hierachyItem: HierachyTreeItem) => {
      if (hierachyTreeProvider) {
        hierachyTreeProvider.folders = hierachyTreeProvider.folders.filter(
          (f) => f.fsPath !== hierachyItem.uri.fsPath
        );
        hierachyTreeProvider.refresh();
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
      const parsedMethods: Map<string, ParsedMethod[]> = new Map();
      for (let i = 0; i < concernedFiles.length; i++) {
        const file = concernedFiles[i];
        const methods = lumberjack.parseFile(file);
        if (methods && methods.length > 0) {
          parsedMethods.set(file.fsPath, methods);
        }
      }
      return parsedMethods;
    }
  );

  const disposableLoadMethodsDemo = vscode.commands.registerCommand(
    "intellisearch.loadMethods",
    async () => {
      if (hierachyTreeProvider) {
        // randomly take 5 methods and their files from methodsSnapshot
        const methods: { method: ParsedMethod; file: string }[] = [];
        hierachyTreeProvider.methodsSnapshot.forEach((value, key) => {
          for (let i = 0; i < 5; i++) {
            if (value.length > 0) {
              const randomIndex = Math.floor(Math.random() * value.length);
              methods.push({ method: value[randomIndex], file: key });
            }
          }
        });
        searchResults.push(...methods);
        return searchResults;
      }
    }
  );

  async function pickLang(): Promise<string> {
    const languages = [
      "C",
      "C++",
      "C#",
      "Go",
      "Java",
      "JavaScript",
      "Python",
      "Rust",
      "TypeScript",
    ];
    const languagesMap = new Map<string, string>([
      ["C", "c"],
      ["C++", "cpp"],
      ["C#", "csharp"],
      ["Go", "go"],
      ["Java", "java"],
      ["JavaScript", "javascript"],
      ["Python", "python"],
      ["Rust", "rust"],
      ["TypeScript", "typescript"],
    ]);
    let targetLang = await vscode.window.showQuickPick(languages, {
      canPickMany: false,
      placeHolder: "Please specify a language",
    });
    if (!targetLang || !languagesMap.has(targetLang)) {
      // tell user that language is required
      let config = vscode.workspace.getConfiguration("intellisearch");
      let defaultLang = config.get("parserDefaultLanguage") as string;
      vscode.window.showWarningMessage(
        "No language selected. Falling back to default language [" +
          defaultLang +
          "]."
      );
      return defaultLang;
    }
    targetLang = languagesMap.get(targetLang) as string;
    return targetLang;
  }

  context.subscriptions.push(
    ...[
      sidebarViewDisposable,
      disposableAddFolders,
      disposableClearFolders,
      disposableRemoveFolder,
      disposableSelectLanguage,
      disposableParseFile,
      disposableLoadMethodsDemo,
    ]
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
