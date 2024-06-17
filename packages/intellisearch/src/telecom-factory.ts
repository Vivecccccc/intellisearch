import * as vscode from 'vscode';

import { MethodRecord, HierarchyTreeItem, HierarchyTreeProvider } from './view-provider/hierarchy-treeview.provider';
import { SymbolExt, Telecom } from './parser/lsp-ops';

export function registerTelecomFactory(hierarchyTreeProvider: HierarchyTreeProvider, telecom: Telecom) {
  
  const _buildCallMapFromMethodsSnapshot = async (filePath: string, methodRecords: MethodRecord[]) => {
    const fileUri = vscode.Uri.file(filePath);
    let countOfCallers = 0;
    for (const record of methodRecords) {
      const method = record.method;
      const loc = new vscode.Location(fileUri, method.symbol.range);
      const callHierarchies = await Telecom.prepareCallHierarchies(loc);
      for (const item of callHierarchies) {
        countOfCallers += await telecom.buildCallMap(item);
      }
    }
    return countOfCallers;
  };
  
  const disposableInitTelecom = vscode.commands.registerCommand(
    'intellisearch.initTelecom',
    async () => {
      if (!telecom.hasInit) {
        return 0;
      }
      let countOfCallers = 0;
      for (const [filePath, methodRecords] of hierarchyTreeProvider.methodsSnapshot) {
        countOfCallers += await _buildCallMapFromMethodsSnapshot(filePath, methodRecords);
      }
      telecom.serialize_contacts();
      return countOfCallers;
    }
  );

  const disposableRefreshTelecom = vscode.commands.registerCommand(
    'intellisearch.refreshTelecom',
    async (changedItems?: HierarchyTreeItem[]) => {
      if (!telecom.hasInit) {
        return 0;
      }
      if (!changedItems) {
        return await vscode.commands.executeCommand('intellisearch.initTelecom');
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
      let countOfCallers = 0;
      for (const item of changedItems) {
        const itemPath = item.uri.fsPath;
        for (const [filePath, calleeIds] of filePathsMap) {
          if (isFilePathInItem(filePath, itemPath)) {
            telecom.removeCalleesByIds(calleeIds);
          }
        }
        for (const [filePath, methodRecords] of hierarchyTreeProvider.methodsSnapshot) {
          if (isFilePathInItem(filePath, itemPath)) {
            countOfCallers += await _buildCallMapFromMethodsSnapshot(filePath, methodRecords);
          }
        }
      }
      telecom.serialize_contacts();
      return countOfCallers;
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
