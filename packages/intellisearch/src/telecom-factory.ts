import * as vscode from 'vscode';

import { MethodRecord, HierarchyTreeItem, HierarchyTreeProvider } from './view-provider/hierarchy-treeview.provider';
import { SymbolExt, Telecom } from './parser/lsp-ops';

export function registerTelecomFactory(hierarchyTreeProvider: HierarchyTreeProvider, telecom: Telecom) {
  
  const _buildCallMapFromMethodsSnapshot = async (filePath: string, methodRecords: MethodRecord[]) => {
    const fileUri = vscode.Uri.file(filePath);
    for (const record of methodRecords) {
      const method = record.method;
      const loc = new vscode.Location(fileUri, method.symbol.range);
      const callHierarchies = await Telecom.prepareCallHierarchies(loc);
      for (const item of callHierarchies) {
        await telecom.buildCallMap(item);
      }
    }
  };
  
  const disposableInitTelecom = vscode.commands.registerCommand(
    'intellisearch.initTelecom',
    async () => {
      if (!telecom.hasInit) {
        return;
      }
      for (const [filePath, methodRecords] of hierarchyTreeProvider.methodsSnapshot) {
        await _buildCallMapFromMethodsSnapshot(filePath, methodRecords);
      }
    }
  );

  const disposableRefreshTelecom = vscode.commands.registerCommand(
    'intellisearch.refreshTelecom',
    async (changedItems?: HierarchyTreeItem[]) => {
      if (!telecom.hasInit) {
        return;
      }
      if (!changedItems) {
        await vscode.commands.executeCommand('intellisearch.initTelecom');
        return;
      } 
      const contacts = telecom.getContacts();
      // map calleeId to filePath
      const filePathsMap = new Map<string, Set<string>>();
      for (const calleeId of contacts.keys()) {
        const filePath = calleeId.split('::')[0];
        if (!filePathsMap.has(filePath)) {
          filePathsMap.set(filePath, new Set());
        }
        filePathsMap.get(filePath)?.add(calleeId);
      }
      const isFilePathInItem = (fp: string, ip: string) => fp.startsWith(ip);
      for (const item of changedItems) {
        const itemPath = item.uri.fsPath;
        for (const [filePath, calleeIds] of filePathsMap) {
          if (isFilePathInItem(filePath, itemPath)) {
            telecom.removeCalleesByIds(calleeIds);
          }
        }
        for (const [filePath, methodRecords] of hierarchyTreeProvider.methodsSnapshot) {
          if (isFilePathInItem(filePath, itemPath)) {
            await _buildCallMapFromMethodsSnapshot(filePath, methodRecords);
          }
        }
      }
    }
  );

  return [
    disposableInitTelecom,
    disposableRefreshTelecom,
  ];
}

export const callbackRefreshTelecom = async (items?: HierarchyTreeItem[]) => {
  await vscode.commands.executeCommand('intellisearch.refreshTelecom', items);
};
