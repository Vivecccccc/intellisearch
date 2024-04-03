import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { minimatch } from "minimatch";

import { decideLanguageFromUri } from "../utils/utils";
import { Method } from "../parser/parser";
import { SearchViewProvider } from "./search-webview-sidebar.provider";

export class HierachyTreeItem extends vscode.TreeItem {
  constructor(
    public readonly uri: vscode.Uri,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly prefix: string,
    public readonly isRoot: boolean
  ) {
    let trimmedPath = uri.fsPath.replace(prefix, "");
    if (trimmedPath.startsWith(path.sep)) {
      trimmedPath = trimmedPath.substring(1);
    }
    super(trimmedPath, collapsibleState);
    this.resourceUri = uri;
    let isDirectory = fs.statSync(uri.fsPath).isDirectory();
    this.iconPath = isDirectory
      ? vscode.ThemeIcon.Folder
      : vscode.ThemeIcon.File;
    this.contextValue = isRoot ? "rootDir" : "children";
  }

  shouldEmphasised(uri: vscode.Uri, pickedLang: string): boolean {
    const stat = fs.statSync(uri.fsPath);
    if (stat.isFile()) {
      const srcLang = decideLanguageFromUri(uri);
      return srcLang === pickedLang;
    } else if (stat.isDirectory() && !isIgnoredFolder(uri)) {
      const children = fs.readdirSync(uri.fsPath);
      for (let i = 0; i < children.length; i++) {
        let childUri = vscode.Uri.file(path.join(uri.fsPath, children[i]));
        if (this.shouldEmphasised(childUri, pickedLang)) {
          return true;
        }
      }
    }
    return false;
  }
}

export class MethodTreeItem extends HierachyTreeItem {
  constructor(
    public readonly uri: vscode.Uri,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly prefix: string,
    public readonly isRoot: boolean,
    public readonly method: Method
  ) {
    super(uri, collapsibleState, prefix, isRoot);
    this.iconPath = new vscode.ThemeIcon("symbol-function");
    this.method = method;
    this.label = method.name;
    this.contextValue = "method";
  }

  shouldEmphasised(uri: vscode.Uri, pickedLang: string): boolean {
    return false;
  }
}

export class HierachyTreeProvider
  implements vscode.TreeDataProvider<HierachyTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    HierachyTreeItem | undefined
  > = new vscode.EventEmitter<HierachyTreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<HierachyTreeItem | undefined> =
    this._onDidChangeTreeData.event;

  filesSnapshot: string[] = [];
  methodsSnapshot: Map<string, Method[]> = new Map();
  hierarchyTreeView: vscode.TreeView<HierachyTreeItem> | undefined = undefined;
  searchWebviewProvider: SearchViewProvider;

  constructor(
    public folders: vscode.Uri[],
    public pickedLang: string,
    searchWebviewProvider: SearchViewProvider
  ) {
    
    this.filesSnapshot = this.getConcernedFiles();
    this.cleanMethodsSnapshot();
    this.hierarchyTreeView = vscode.window.createTreeView(
      "intellisearch.hierarchy",
      { treeDataProvider: this }
    );
    this.hierarchyTreeView.badge = {
      value: this.filesSnapshot.length,
      tooltip: `${this.filesSnapshot.length} valid files`,
    };
    this.searchWebviewProvider = searchWebviewProvider;
    this.registerChangeSelectionListener();
  }

  refresh(): void {
    this.filesSnapshot = this.getConcernedFiles();
    this.cleanMethodsSnapshot();
    if (this.hierarchyTreeView) {
      this.hierarchyTreeView.badge = {
        value: this.filesSnapshot.length,
        tooltip: `${this.filesSnapshot.length} valid files`,
      };
    }
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(
    element: HierachyTreeItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    if (element.shouldEmphasised(element.uri, this.pickedLang)) {
      let rawLabel = element.label as string;
      element.label = { highlights: [[0, rawLabel.length]], label: rawLabel };
    }
    return element;
  }

  getChildren(
    element?: HierachyTreeItem | undefined
  ): vscode.ProviderResult<HierachyTreeItem[]> {
    if (!this.folders.length) {
      return Promise.resolve([]);
    }
    if (element) {
      const stat = fs.statSync(element.uri.fsPath);
      if (stat.isDirectory()) {
        let children = fs
          .readdirSync(element.uri.fsPath)
          .filter((child) => {
            return !isIgnoredFolder(
              vscode.Uri.file(path.join(element.uri.fsPath, child))
            );
          })
          .map((child) => {
            const uri = vscode.Uri.file(path.join(element.uri.fsPath, child));
            // get the path execpt for the basename of the file
            const prefix = element.uri.fsPath + path.sep;
            const isChildDir = fs.statSync(uri.fsPath).isDirectory();
            const doesFileHaveMethods = this.methodsSnapshot.has(uri.fsPath);
            return new HierachyTreeItem(
              uri,
              isChildDir || doesFileHaveMethods
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None,
              prefix,
              false
            );
          });
        return Promise.resolve(children);
      } else {
        const methods = this.methodsSnapshot.get(element.uri.fsPath);
        if (methods) {
          return methods.map(
            (method) =>
              new MethodTreeItem(
                element.uri,
                vscode.TreeItemCollapsibleState.None,
                "",
                false,
                method
              )
          );
        } else {
          return Promise.resolve([]);
        }
      }
    } else {
      // get the common prefix of the root items
      const prefix = this.getCommonPath();
      const rootItems = this.folders
        .filter((folder) => !isIgnoredFolder(folder))
        .map(
          (folder) =>
            new HierachyTreeItem(
              folder,
              vscode.TreeItemCollapsibleState.Collapsed,
              prefix,
              true
            )
        );
      return Promise.resolve(rootItems);
    }
  }

  private getCommonPath(): string {
    if (!this.folders.length) {
      return "";
    }

    if (this.folders.length === 1) {
      // common path should be the folder itself except for the basename
      const folderPath = this.folders[0].fsPath;
      const folderName = path.basename(folderPath);
      return folderPath.substring(0, folderPath.length - folderName.length);
    }

    const folderPaths = this.folders.map((folder) =>
      folder.fsPath.split(path.sep)
    );
    const commonPath = [];

    for (let i = 0; i < folderPaths[0].length; i++) {
      const segment = folderPaths[0][i];

      if (folderPaths.every((folderPath) => folderPath[i] === segment)) {
        commonPath.push(segment);
      } else {
        break;
      }
    }

    return commonPath.join(path.sep);
  }

  private getConcernedFiles(): string[] {
    const files: string[] = [];
    this.folders = this.folders.filter(
      (folder) => !isIgnoredFolder(folder)
    );
    this.folders.forEach((folder) => {
      const getFiles = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (isIgnoredFolder(vscode.Uri.file(fullPath))) {
              continue;
            }
            getFiles(fullPath);
          } else if (
            decideLanguageFromUri(vscode.Uri.file(fullPath)) === this.pickedLang
          ) {
            files.push(fullPath);
          }
        }
      };
      getFiles(folder.fsPath);
    });
    return files;
  }

  injectMethodInFile(paths: string[]) {
    vscode.commands
      .executeCommand("intellisearch.parseFile", paths)
      .then((parsedMethodsWithFlag) => {
        const fileMethodMap = parsedMethodsWithFlag as Map<string, { flag: boolean, methods: Method[] }>;
        this.setParsedMethods(fileMethodMap);
      });
  }

  private lazyInjectMethodInFile(items: HierachyTreeItem[]) {
    let filePaths = items.map((item) => item.uri.fsPath);
    vscode.commands.executeCommand("intellisearch.parseFile", filePaths)
      .then((parsedMethodsWithFlag) => {
        const fileMethodMap = parsedMethodsWithFlag as Map<string, { flag: boolean, methods: Method[] }>;
        this.setParsedMethods(fileMethodMap);
      });
  }

  private setParsedMethods(parsedMethodsWithFlag: Map<string, { flag: boolean, methods: Method[] }>) {
    const newlyParsedMethods = new Map<string, Method[]>();
    for (let [filePath, fileUpdates] of parsedMethodsWithFlag.entries()) {
      if (fileUpdates.flag || !this.methodsSnapshot.has(filePath)) { 
        this.methodsSnapshot.set(filePath, fileUpdates.methods);
        newlyParsedMethods.set(filePath, fileUpdates.methods);
      }
    }
    this._onDidChangeTreeData.fire(undefined); 
    if (newlyParsedMethods.size) {
      this.searchWebviewProvider.updateMethodPool(newlyParsedMethods, true);
    }
  }

  private registerChangeSelectionListener() {
    if (!this.hierarchyTreeView) {
      return;
    }
    this.hierarchyTreeView.onDidChangeSelection(async (e) => {
      if (e.selection && e.selection.length > 0) {
        let item = e.selection[0];
        if (item instanceof MethodTreeItem) {
          let itemMethod = item as MethodTreeItem;
          vscode.window.showTextDocument(item.uri).then((editor) => {
            let startPosition = new vscode.Position(
              itemMethod.method.position[0][0],
              itemMethod.method.position[0][1]
            );
            let endPosition = new vscode.Position(
              itemMethod.method.position[1][0],
              itemMethod.method.position[1][1]
            );
            editor.selection = new vscode.Selection(startPosition, endPosition);
            editor.revealRange(
              new vscode.Range(startPosition, endPosition),
              vscode.TextEditorRevealType.InCenter
            );
          });
        } else if (item instanceof HierachyTreeItem) {
          if (!fs.statSync(item.uri.fsPath).isDirectory()) {
            vscode.window.showTextDocument(item.uri);
            if (this.filesSnapshot.includes(item.uri.fsPath)) { this.injectMethodInFile([item.uri.fsPath]); }
          } else {
            let children = await this.getChildren(item);
            if (!children) {
              return;
            }
            children = children.filter((child) => this.filesSnapshot.includes(child.uri.fsPath));
            this.injectMethodInFile(children.map((child) => child.uri.fsPath));
          }
        }
      }
    });
  }

  private cleanMethodsSnapshot() {
    // clean the previous methods if its file is not in the current filesSnapshot
    const removedParsedMethods = new Map<string, Method[]>();
    this.methodsSnapshot.forEach((methods, uri) => {
      if (!this.filesSnapshot.includes(uri)) {
        const flag = this.methodsSnapshot.delete(uri);
        if (flag) {
          removedParsedMethods.set(uri, methods);
        }
      }
    });
    if (removedParsedMethods.size) {
      this.searchWebviewProvider.updateMethodPool(removedParsedMethods, false);
    }
  }
}

function isIgnoredFolder(folder: vscode.Uri): boolean {
  let ignoreFolders =
    vscode.workspace
      .getConfiguration("intellisearch")
      .get<string[]>("ignoreFolders") || [];
  let baseName = path.basename(folder.fsPath);
  return ignoreFolders.some((ignorePattern) =>
    minimatch(baseName, ignorePattern)
  );
}