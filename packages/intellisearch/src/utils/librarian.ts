import { Method } from "../parser/parser";
import { LocalIndex } from "vectra";
import * as vscode from "vscode";
import { getEmbeddings } from "../services/infer-service";

export async function getIndex(
  context: vscode.ExtensionContext
): Promise<LocalIndex> {

  let indexPath: string;
  const pickedLang = context.workspaceState.get("pickedLang") as string | undefined;
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

export type MethodMeta = {
  method: Method,
  hash: string
};

export class Librarian {
  index: LocalIndex;

  constructor(index: LocalIndex) {
    this.index = index;
  }
  
  private checkMethodExists = async (methodHash: string): Promise<boolean> => {
    return this.index.getItem(methodHash).then((item) => item ? true : false);
  };
  
  public async addMethods(methodMetas: MethodMeta[], context: vscode.ExtensionContext): Promise<Map<string, string[]>> {
    
    let methodHashes = methodMetas.map((methodMeta) => methodMeta.hash.split('-')[1]);
    const hashesWithinScope: Map<string, string[]> = new Map(methodHashes.map(hash => [hash, []]));

    const existedIndices: Set<number> = new Set();

    for (let index = 0; index < methodHashes.length; index++) {
      const methodHash = methodHashes[index];
      if (await this.checkMethodExists(methodHash)) {
        hashesWithinScope.get(methodHash)!.push(methodMetas[index].hash);
        existedIndices.add(index);
      }
    }

    methodHashes = methodHashes.filter((_, index) => !existedIndices.has(index));
    methodMetas = methodMetas.filter((_, index) => !existedIndices.has(index));

    for (let index = 0; index < methodMetas.length; index++) {
      const methodMeta = methodMetas[index];
      const embedding = await getEmbeddings([methodMeta.method.full], 0, context);
      this.index.insertItem({
        id: methodHashes[index],
        vector: embedding[0],
      });
      hashesWithinScope.get(methodHashes[index])!.push(methodMeta.hash);
    }
    return hashesWithinScope;
  }

}