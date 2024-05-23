import * as vscode from "vscode";

import { removeSubFolders } from "./utils/utils";
import { HierachyTreeProvider } from "./view-provider/hierarchy-treeview.provider";

export function registerWorkspaceListeners(hierarchyTreeProvider: HierachyTreeProvider) {
  const disposableUpdateWorkspaceFolders =
    vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
      if (event.added.length || event.removed.length) {
        const uris =
          vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
        // get hierarchy tree provider instance
        if (hierarchyTreeProvider) {
          // let currentFolders = [...hierarchyTreeProvider.folders];
          // currentFolders.push(...uris);
          const uniqueFolders = Array.from(
            new Set(uris.map((folder) => folder.fsPath))
          ).map((fsPath) => vscode.Uri.file(fsPath));
          const filteredFolders = removeSubFolders(uniqueFolders);
          hierarchyTreeProvider.folders = filteredFolders;
          hierarchyTreeProvider.refresh();
        }
      }
    });
  
  const disposableCreateWorkspaceFiles = vscode.workspace.onDidCreateFiles(
    async () => {
      if (hierarchyTreeProvider) {
        hierarchyTreeProvider.refresh();
      }
    }
  );
  
  const disposableDeleteWorkspaceFiles = vscode.workspace.onDidDeleteFiles(
    async () => {
      if (hierarchyTreeProvider) {
        hierarchyTreeProvider.refresh();
      }
    }
  );
  
  const disposableRenameWorkspaceFiles = vscode.workspace.onDidRenameFiles(
    async () => {
      if (hierarchyTreeProvider) {
        hierarchyTreeProvider.refresh();
      }
    }
  );
  
  const disposableChangeWorkspaceFiles = vscode.workspace.onDidSaveTextDocument(
    async (event) => {
      const fileUri = event.uri;
      if (hierarchyTreeProvider) {
        const doesFileHaveMethods = hierarchyTreeProvider.methodsSnapshot.has(
          fileUri.fsPath
        );
        if (doesFileHaveMethods) {
          hierarchyTreeProvider.injectMethodInFile([fileUri.fsPath]);
        }
        hierarchyTreeProvider.refresh();
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