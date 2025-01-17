import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { minimatch } from "minimatch";

import { decideLanguageFromUri } from "../utils/utils";
import { Method } from "../parser/parser";
import { SearchViewProvider } from "./search-webview-sidebar.provider";
import { DocumentLspOperator } from "../parser/lsp-ops";

export class HierarchyTreeItem extends vscode.TreeItem {
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

export class MethodTreeItem extends HierarchyTreeItem {
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
    this.label = method.symbol.name;
    this.contextValue = "method";
  }

  shouldEmphasised(uri: vscode.Uri, pickedLang: string): boolean {
    return false;
  }

  findWrapper(op: DocumentLspOperator): string | boolean {
    const symbol = this.method.symbol;
    const wrapper = op.getWrapper(
      symbol,
      [
        vscode.SymbolKind.Class,
        vscode.SymbolKind.Interface,
        vscode.SymbolKind.Struct,
      ]
    );
    if (wrapper) {
      return wrapper.name;
    }
    return false;
  }
}

export type MethodRecord = { method: Method, element: MethodTreeItem | null };

export class HierarchyTreeProvider
  implements vscode.TreeDataProvider<HierarchyTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    HierarchyTreeItem | undefined
  > = new vscode.EventEmitter<HierarchyTreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<HierarchyTreeItem | undefined> = this._onDidChangeTreeData.event;
  private _nodeMap = new Map<string, { parent: HierarchyTreeItem | undefined, item: HierarchyTreeItem }>();

  filesSnapshot: string[] = [];
  methodsSnapshot: Map<string, MethodRecord[]> = new Map();
  hierarchyTreeView: vscode.TreeView<HierarchyTreeItem> | undefined = undefined;
  searchWebviewProvider: SearchViewProvider;
  yellowPages: Map<string, DocumentLspOperator> = new Map();

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

  async refresh(elements: HierarchyTreeItem[], callback?: (items?: HierarchyTreeItem[]) => Promise<void>): Promise<void> {
    this.filesSnapshot = this.getConcernedFiles();
    this.cleanMethodsSnapshot();
    if (elements.length === 0) {
      await this.intelliDoc();
    } else {
      await this.intelliDoc(elements);
    }
    if (this.hierarchyTreeView) {
      this.hierarchyTreeView.badge = {
        value: this.filesSnapshot.length,
        tooltip: `${this.filesSnapshot.length} valid files`,
      };
    }
    if (elements.length === 0) {
      this._onDidChangeTreeData.fire(undefined);
      if (callback) { await callback(); }
    } else {
      for (let element of elements) {
        this._onDidChangeTreeData.fire(element);
      }
      if (callback) { await callback(elements); }
    }
  }

  getTreeItem(
    element: HierarchyTreeItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return this.decorateItem(element);
  }

  getChildren(
    element?: HierarchyTreeItem | undefined
  ) {
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
            const doesFileHaveMethods = this.methodsSnapshot.has(uri.fsPath) && this.methodsSnapshot.get(uri.fsPath)!.length > 0;
            let childItem = new HierarchyTreeItem(
              uri,
              isChildDir || doesFileHaveMethods
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None,
              prefix,
              false
            );
            this.setNodeMap(childItem, element);
            return childItem;
          });
        return Promise.resolve(children);
      } else {
        const records = this.methodsSnapshot.get(element.uri.fsPath);
        if (records) {
          const newRecords: { method: Method, element: MethodTreeItem }[] = [];
          const methodItems = records.map(
            (record) => {
              let methodItem = new MethodTreeItem(
                element.uri,
                vscode.TreeItemCollapsibleState.None,
                "",
                false,
                record.method
              );
              methodItem = this.decorateItem(methodItem) as MethodTreeItem;
              newRecords.push({ method: record.method, element: methodItem });
              return methodItem;
            }
          );
          this.methodsSnapshot.set(element.uri.fsPath, newRecords);
          return Promise.resolve(methodItems);
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
          (folder) => {
            let childItem = new HierarchyTreeItem(
              folder,
              vscode.TreeItemCollapsibleState.Collapsed,
              prefix,
              true
            );
            this.setNodeMap(childItem, undefined);
            return childItem;
          }
        );
      return Promise.resolve(rootItems);
    }
  }

  getParent(element: HierarchyTreeItem): vscode.ProviderResult<HierarchyTreeItem> {
    if (element instanceof MethodTreeItem) {
      return this.getNodeMap(element.uri.fsPath)?.item || null;
    }
    const parent = this.getNodeMap(element.uri.fsPath)?.parent;
    return parent ? parent : null;
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
    this.folders.forEach((folder) => {
      getFiles(folder.fsPath);
    });
    return files;
  }

  private decorateItem(element: HierarchyTreeItem) {
    if (element.shouldEmphasised(element.uri, this.pickedLang)) {
      let rawLabel = element.label as string;
      element.label = { highlights: [[0, rawLabel.length]], label: rawLabel };
    }
    if (element instanceof MethodTreeItem) {
      let item = element as MethodTreeItem;
      if (!item.description) {
        let op = this.yellowPages.get(item.uri.fsPath);
        if (op) {
          element.description = item.findWrapper(op);
        }
      }
    }
    return element;
  }

  async intelliDoc(updatedParents?: HierarchyTreeItem[]): Promise<void> {
    const shouldUpdate = (fp: string) => {
      let flag = !updatedParents;
      flag ||= !this.yellowPages.has(fp);
      flag ||= updatedParents!.some((parent) => fp.startsWith(parent.uri.fsPath));
      return flag;
    };
    const promises = [];
    for (const fp of this.filesSnapshot) {
      if (shouldUpdate(fp)) {
        const doc = new DocumentLspOperator(vscode.Uri.file(fp));
        promises.push(doc.init());
        this.yellowPages.set(fp, doc);
      }
    }
    await Promise.all(promises);
  }

  async injectMethodInFile(paths: string[]) {
    const parsedMethodsWithFlag = await vscode.commands.executeCommand("intellisearch.parseFile", paths);
    const fileMethodMap = parsedMethodsWithFlag as Map<string, { flag: boolean, methods: Method[] }>;
    this.setParsedMethods(fileMethodMap);
  }

  private lazyInjectMethodInFile(items: HierarchyTreeItem[]) {
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
        const records: MethodRecord[] = fileUpdates.methods.map((method) => {
          return { method: method, element: null };
        });
        this.methodsSnapshot.set(filePath, records);
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
        } else if (item instanceof HierarchyTreeItem) {
          if (!fs.statSync(item.uri.fsPath).isDirectory()) {
            vscode.window.showTextDocument(item.uri);
            if (this.filesSnapshot.includes(item.uri.fsPath)) { await this.injectMethodInFile([item.uri.fsPath]); }
          } else {
            let children = await this.getChildren(item);
            if (!children) {
              return;
            }
            children = children.filter((child) => this.filesSnapshot.includes(child.uri.fsPath));
            await this.injectMethodInFile(children.map((child) => child.uri.fsPath));
          }
        }
      }
    });
  }

  private cleanMethodsSnapshot() {
    // clean the previous methods if its file is not in the current filesSnapshot
    const removedParsedMethods = new Map<string, Method[]>();
    this.methodsSnapshot.forEach((records, uri) => {
      if (!this.filesSnapshot.includes(uri)) {
        const flag = this.methodsSnapshot.delete(uri);
        if (flag) {
          removedParsedMethods.set(uri, records.map((record) => record.method));
        }
      }
    });
    if (removedParsedMethods.size) {
      this.searchWebviewProvider.updateMethodPool(removedParsedMethods, false);
    }
  }

  setNodeMap(element: HierarchyTreeItem, parent: HierarchyTreeItem | undefined) {
    const nodePath = element.uri.fsPath;
    this._nodeMap.set(
      nodePath,
      { parent: parent, item: element }
    );
  }

  getNodeMap(nodePath: string) {
    return this._nodeMap.get(nodePath);
  }

  async inspectAllElements(): Promise<number> {
    await this.injectMethodInFile(this.filesSnapshot);
    await this.intelliDoc();
    
    const recursiveGetChildren = async (element: HierarchyTreeItem | undefined): Promise<number> => {
      const children = await this.getChildren(element);
      let count = children.length;
      for (const child of children) {
        if (child instanceof HierarchyTreeItem && 
            child.collapsibleState !== vscode.TreeItemCollapsibleState.None) {
          count += await recursiveGetChildren(child);
        }
      }
      return count;
    };
    const totalChildren = await recursiveGetChildren(undefined);
    return totalChildren;
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