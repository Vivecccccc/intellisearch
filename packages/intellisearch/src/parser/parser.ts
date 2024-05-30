import * as vscode from "vscode";
import * as fs from "fs";
import Parser from "web-tree-sitter";

export async function getParser(
  pickedLang: string,
  context: vscode.ExtensionContext
): Promise<Parser> {
  const wasmPath = vscode.Uri.joinPath(
    context.extensionUri,
    "./resources/grammars/tree-sitter.wasm"
  ).fsPath;
  await Parser.init({
    locateFile: () => wasmPath.toString(),
  });

  let parserLang: Parser.Language;

  switch (pickedLang) {
    case "c":
      const cGrammarPath = vscode.Uri.joinPath(
        context.extensionUri,
        "./resources/grammars/tree-sitter-c.wasm"
      ).fsPath;
      parserLang = await Parser.Language.load(cGrammarPath);
      break;
    case "cpp":
      const cppGrammarPath = vscode.Uri.joinPath(
        context.extensionUri,
        "./resources/grammars/tree-sitter-cpp.wasm"
      ).fsPath;
      parserLang = await Parser.Language.load(cppGrammarPath);
      break;
    case "csharp":
      const csharpGrammarPath = vscode.Uri.joinPath(
        context.extensionUri,
        "./resources/grammars/tree-sitter-c_sharp.wasm"
      ).fsPath;
      parserLang = await Parser.Language.load(csharpGrammarPath);
      break;
    case "go":
      const goGrammarPath = vscode.Uri.joinPath(
        context.extensionUri,
        "./resources/grammars/tree-sitter-go.wasm"
      ).fsPath;
      parserLang = await Parser.Language.load(goGrammarPath);
      break;
    case "java":
      const javaGrammarPath = vscode.Uri.joinPath(
        context.extensionUri,
        "./resources/grammars/tree-sitter-java.wasm"
      ).fsPath;
      parserLang = await Parser.Language.load(javaGrammarPath);
      break;
    case "javascript":
      const jsGrammarPath = vscode.Uri.joinPath(
        context.extensionUri,
        "./resources/grammars/tree-sitter-javascript.wasm"
      ).fsPath;
      parserLang = await Parser.Language.load(jsGrammarPath);
      break;
    case "python":
      const pyGrammarPath = vscode.Uri.joinPath(
        context.extensionUri,
        "./resources/grammars/tree-sitter-python.wasm"
      ).fsPath;
      parserLang = await Parser.Language.load(pyGrammarPath);
      break;
    case "rust":
      const rustGrammarPath = vscode.Uri.joinPath(
        context.extensionUri,
        "./resources/grammars/tree-sitter-rust.wasm"
      ).fsPath;
      parserLang = await Parser.Language.load(rustGrammarPath);
      break;
    case "typescript":
      const tsGrammarPath = vscode.Uri.joinPath(
        context.extensionUri,
        "./resources/grammars/tree-sitter-typescript.wasm"
      ).fsPath;
      parserLang = await Parser.Language.load(tsGrammarPath);
      break;
    default:
      throw new Error("Language not supported");
  }
  const parser = new Parser();
  parser.setLanguage(parserLang);

  return parser;
}

export class Symbol {
  name: string;
  position: number[][];
  readonly range: vscode.Range;

  constructor(name: string, position: number[][]) {
    this.name = name;
    this.position = position;
    this.range = this.getSymbolRange();
  }
  
  private getSymbolRange(): vscode.Range {
    return new vscode.Range(
      this.position[0][0],
      this.position[0][1],
      this.position[1][0],
      this.position[1][1]
    );
  }
};

export class Method {
  symbol: Symbol;
  // body: string;
  full: string;
  position: number[][];
  signature: string;

  constructor(symbol: Symbol, full: string, position: number[][]) {
    this.symbol = symbol;
    // this.body = body;
    this.full = full;
    this.position = position;
    this.signature = this.getSignature();
  }

  // implement a hash function for the class for comparison
  getSignature(): string {
    const signature = `${this.position}@${this.full}`;
    return signature;
  }
}

export abstract class Lumberjack {
  parser: Parser;
  methodDefinitionTokens: string[];
  methodNameFieldToken: string;
  methodBodyFieldToken: string;

  constructor(parser: Parser) {
    this.parser = parser;
    this.methodDefinitionTokens = this.getMethodDefinitionTokens();
    this.methodNameFieldToken = this.getMethodNameFieldToken();
    this.methodBodyFieldToken = this.getMethodBodyFieldToken();
  }

  abstract getMethodDefinitionTokens(): string[];
  abstract getMethodNameFieldToken(): string;
  abstract getMethodBodyFieldToken(): string;

  parseFile(fileContent: string): Method[] {
    const tree = this.parser.parse(fileContent).rootNode;
    return this.extractAllMethods(tree);
  }

  extractAllMethods(node: Parser.SyntaxNode): Method[] {
    const methods: Method[] = [];

    if (this.methodDefinitionTokens.includes(node.type)) {
      const name = this.extractMethodName(node);
      // const body = this.extractMethodBody(node);
      const position = [
        [node.startPosition.row, node.startPosition.column],
        [node.endPosition.row, node.endPosition.column],
      ];

      if (name) {
        const method = new Method(name, this.reIndentMethod(node), position);
        methods.push(method);
      }
    } else {
      for (let i = 0; i < node.childCount; i++) {
        let childNode = node.child(i);
        if (childNode) {
          methods.push(...this.extractAllMethods(childNode));
        }
      }
    }

    return methods;
  }

  protected extractMethodName(node: Parser.SyntaxNode): Symbol | null {
    const possibleMethodNameNode = node.childForFieldName(
      this.methodNameFieldToken
    );
    if (possibleMethodNameNode) {
      return new Symbol(
        possibleMethodNameNode.text, 
        [
          [possibleMethodNameNode.startPosition.row, possibleMethodNameNode.startPosition.column],
          [possibleMethodNameNode.endPosition.row, possibleMethodNameNode.endPosition.column],
        ]
      );
    }
    return null;
  }

  protected extractMethodBody(node: Parser.SyntaxNode): string | null {
    const possibleBodyNode = node.childForFieldName(this.methodBodyFieldToken);
    if (possibleBodyNode) {
      return possibleBodyNode.text;
    }
    return null;
  }

  protected reIndentMethod(node: Parser.SyntaxNode): string {
    let offset = 0;
    const methodStartPosition = node.startPosition;
    const possibleBodyNode = node.childForFieldName(this.methodBodyFieldToken);
    if (possibleBodyNode) {
      // get the first child of the body node 
      // which is not at the same row as the method node
      for (let i = 0; i < possibleBodyNode.childCount; i++) {
        const childNode = possibleBodyNode.child(i);
        if (childNode && childNode.startPosition.row !== methodStartPosition.row) {
          offset = childNode.startPosition.column - methodStartPosition.column;
          break;
        }
      }
    }
    return node.text
      .split("\n")
      .map((line) => line.slice(0))
      .join("\n");
  }
}
