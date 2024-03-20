import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function decideLanguageFromUri(uri: vscode.Uri): string {
  const ext = path.extname(uri.fsPath).slice(1);
  let lang: string;
  switch (ext) {
    case "c":
      lang = "c";
      break;
    case "cpp":
      lang = "cpp";
      break;
    case "cs":
      lang = "csharp";
      break;
    case "go":
      lang = "go";
      break;
    case "java":
      lang = "java";
      break;
    case "js":
      lang = "javascript";
      break;
    case "py":
      lang = "python";
      break;
    case "rs":
      lang = "rust";
      break;
    case "ts":
      lang = "typescript";
      break;
    default:
      lang = "";
  }
  return lang;
}

export function removeSubFolders(folders: vscode.Uri[]): vscode.Uri[] {
  return folders.filter((folder) => {
    return !folders.some((otherFolder) => {
      return (
        folder.fsPath !== otherFolder.fsPath &&
        folder.fsPath.startsWith(otherFolder.fsPath + path.sep)
      );
    });
  });
}

export async function pickLang(): Promise<string> {
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