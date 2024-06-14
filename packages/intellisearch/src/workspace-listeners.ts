import * as vscode from "vscode";
import * as path from "path";

import { removeSubFolders } from "./utils/utils";
import { HierarchyTreeProvider, HierarchyTreeItem } from "./view-provider/hierarchy-treeview.provider";
import { callbackRefreshTelecom } from "./telecom-factory";

export function registerWorkspaceListeners(hierarchyTreeProvider: HierarchyTreeProvider) {
  const disposableUpdateWorkspaceFolders = vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
      if (event.added.length || event.removed.length) {
        const uris = vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
        // get hierarchy tree provider instance
        if (hierarchyTreeProvider) {
          const uniqueFolders = Array.from(
            new Set(uris.map((folder) => folder.fsPath))
          ).map((fsPath) => vscode.Uri.file(fsPath));
          const filteredFolders = removeSubFolders(uniqueFolders);
          hierarchyTreeProvider.folders = filteredFolders;
          await hierarchyTreeProvider.refresh([], callbackRefreshTelecom);
        }
      }
    }
  );

  const deOverlap = (
    nodes: HierarchyTreeItem[],
    hierachyTreeProvider: HierarchyTreeProvider
  ) => {
    const jet = new Set<HierarchyTreeItem>(nodes);
    for (const node of nodes) {
      let parent = hierachyTreeProvider.getNodeMap(node.uri.fsPath)?.parent;
      while (parent) {
        if (jet.has(parent)) {
          jet.delete(node);
          break;
        }
        parent = hierachyTreeProvider.getNodeMap(parent.uri.fsPath)?.parent;
      }
    }
    return Array.from(jet);
  };
  
  const disposableCreateWorkspaceFiles = vscode.workspace.onDidCreateFiles(
    async (event) => {
      if (hierarchyTreeProvider) {
        let elements: HierarchyTreeItem[] = [];
        if (event.files.length === 1) {
          const parentPath = path.dirname(event.files[0].fsPath);
          let element = hierarchyTreeProvider.getNodeMap(parentPath)?.item;
          if (element) {
            elements.push(element);
          }
        }
        await hierarchyTreeProvider.refresh(elements, callbackRefreshTelecom);
      }
    }
  );
  
  const disposableDeleteWorkspaceFiles = vscode.workspace.onDidDeleteFiles(
    async (event) => {
      if (hierarchyTreeProvider) {
        let parents: HierarchyTreeItem[] = [];
        for (const file of event.files) {
          const parent = hierarchyTreeProvider.getNodeMap(file.fsPath)?.parent;
          if (!parent) {
            await hierarchyTreeProvider.refresh([], callbackRefreshTelecom);
            return;
          }
          parents.push(parent);
        }
        if (parents.length > 0) {
          parents = deOverlap(parents, hierarchyTreeProvider);
        }
        await hierarchyTreeProvider.refresh(parents, callbackRefreshTelecom);
      }
    }
  );
  
  const disposableRenameWorkspaceFiles = vscode.workspace.onDidRenameFiles(
    async (event) => {
      if (hierarchyTreeProvider) {
        let oldParents: HierarchyTreeItem[] = [];
        let newParents: HierarchyTreeItem[] = [];
        for (const file of event.files) {
          const oldParent = hierarchyTreeProvider.getNodeMap(file.oldUri.fsPath)?.parent;
          if (!oldParent) {
            await hierarchyTreeProvider.refresh([], callbackRefreshTelecom);
            break;
          }
          oldParents.push(oldParent);
        }
        if (oldParents.length > 0) {
          oldParents = deOverlap(oldParents, hierarchyTreeProvider);
        }
        await hierarchyTreeProvider.refresh(oldParents, callbackRefreshTelecom);
        
        let newPaths: string[] = [];
        let hasRootParent: boolean = false;
        for (const file of event.files) {
          newPaths.push(file.newUri.fsPath);
          const newParent = hierarchyTreeProvider.getNodeMap(file.newUri.fsPath)?.parent;
          if (!newParent) {
            hasRootParent = true;
            continue;
          }
          newParents.push(newParent);
        }
        if (!hasRootParent) {
          newParents = deOverlap(newParents, hierarchyTreeProvider);
        } else {
          newParents = [];
        }
        await hierarchyTreeProvider.refresh(newParents, callbackRefreshTelecom);
        newPaths = newPaths.filter((path) => hierarchyTreeProvider.filesSnapshot.includes(path));
        await hierarchyTreeProvider.injectMethodInFile(newPaths);
      }
    }
  );
  
  const disposableChangeWorkspaceFiles = vscode.workspace.onDidSaveTextDocument(
    async (event) => {
      const filePath = event.uri.fsPath;
      if (hierarchyTreeProvider) {
        const parent = hierarchyTreeProvider.getNodeMap(filePath)?.parent;
        if (hierarchyTreeProvider.filesSnapshot.includes(filePath)) {
          await hierarchyTreeProvider.injectMethodInFile([filePath]);
        }
        if (parent) {
          await hierarchyTreeProvider.refresh([parent], callbackRefreshTelecom);
        } else {
          await hierarchyTreeProvider.refresh([], callbackRefreshTelecom);
        }
      }
    }
  );

  return [
    disposableUpdateWorkspaceFolders,
    disposableCreateWorkspaceFiles,
    disposableDeleteWorkspaceFiles,
    disposableRenameWorkspaceFiles,
    disposableChangeWorkspaceFiles,
  ];
}