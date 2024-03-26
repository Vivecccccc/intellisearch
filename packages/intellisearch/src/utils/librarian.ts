import { Method } from "../parser/parser";
import { LocalIndex } from "vectra";
import * as vscode from "vscode";

export async function getIndex(
  pickedLang: string,
  context: vscode.ExtensionContext
): Promise<LocalIndex> {

  let indexPath: string;

  switch (pickedLang) {
    case "c":
      indexPath = vscode.Uri.joinPath(
        context.globalStorageUri,
        "_c_index"
      ).fsPath;
      break;
    case "cpp":
      indexPath = vscode.Uri.joinPath(
        context.globalStorageUri,
        "_cpp_index"
      ).fsPath;
      break;
    case "csharp":
      indexPath = vscode.Uri.joinPath(
        context.globalStorageUri,
        "_csharp_index"
      ).fsPath;
      break;
    case "go":
      indexPath = vscode.Uri.joinPath(
        context.globalStorageUri,
        "_go_index"
      ).fsPath;
      break;
    case "java":
      indexPath = vscode.Uri.joinPath(
        context.globalStorageUri,
        "_java_index"
      ).fsPath;
      break;
    case "javascript":
      indexPath = vscode.Uri.joinPath(
        context.globalStorageUri,
        "_javascript_index"
      ).fsPath;
      break;
    case "python":
      indexPath = vscode.Uri.joinPath(
        context.globalStorageUri,
        "_python_index"
      ).fsPath;
      break;
    case "rust":
      indexPath = vscode.Uri.joinPath(
        context.globalStorageUri,
        "_rust_index"
      ).fsPath;
      break;
    case "typescript":
      indexPath = vscode.Uri.joinPath(
        context.globalStorageUri,
        "_typescript_index"
      ).fsPath;
      break;
    default:
      throw new Error("Language not supported");
  }
  
  const index = new LocalIndex(indexPath);
  return index.isIndexCreated().then((isCreated: boolean) => {
    if (!isCreated) {
      return index.createIndex().then(() => index);
    }
    return index;
  });
}

export class MethodWithEmbedding extends Method {
  embedding: number[];

  constructor(method: Method, embedding: number[]) {
    super(method.name, method.full, method.position);
    this.embedding = embedding;
  }
}

export class Librarian {
  index: LocalIndex;

  constructor(index: LocalIndex) {
    this.index = index;
  }

  async addMethod(method: MethodWithEmbedding): Promise<boolean> {
    return this.index.insertItem({ 
      vector: method.embedding, 
      metadata: method.name,  
    })
    .then(() => true)
    .catch((err) => {
      console.error('Failed to add method due to', err);
      return false;
    });
  }
}