import * as vscode from 'vscode';

import { ExtensionContext, WebviewView, WebviewViewProvider } from "vscode";
import { AbstractViewProvider } from "./search-webview-abstract.provider";
import { Method } from "../parser/parser";
import { sha256Hash } from "../utils/utils";
import { getCredential } from '../services/login-service';


// Enum for "fromSearch" and "fromOthers"
enum MethodKind {
  fromOthers,
  fromSearch,
}

type MethodToShow = {
  filePath: string,
  method: Method
  shown: boolean
};

export class SearchViewProvider extends AbstractViewProvider implements WebviewViewProvider {
  
  private _view: WebviewView | undefined;

  private methodPool: Map<string, MethodToShow> = new Map();
  
  constructor(context: ExtensionContext) {
    super(context);
  }

  async resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [this.context.extensionUri]
    };
    webviewView.webview.html = await this.getWebviewHtml(webviewView.webview);
    this.registerLoginListener();
  }

  registerLoginListener() {
    this._view?.webview.onDidReceiveMessage(async (data) => {
      if (data.command === "login") {
        // show input box to allow user to enter password and otp
        const password = await vscode.window.showInputBox({ password: true, placeHolder: "Enter password" });
        if (!password) {
          vscode.window.showErrorMessage("Password is required");
          return;
        }
        const otp = await vscode.window.showInputBox({ placeHolder: "Enter OTP" });
        if (!otp) {
          vscode.window.showErrorMessage("OTP is required");
          return;
        }
        const credential = await getCredential(password, otp);
        if (credential) {
          this._view?.webview.postMessage({ 
            command: "loginSuccess", 
            credential: { userId: credential.userId, expiry: credential.expiry }
          });
        } else {
          return;
        }
      }
    });
  }

  public updateMethodPool(parsedMethods: Map<string, Method[]>, addOp: boolean) {
    let methodsToBeHidden: MethodToShow[] = [];
    for (const [filePath, methods] of parsedMethods.entries()) {
      for (const method of methods) {
        const parsedMethodHash = `${sha256Hash(filePath)}-${sha256Hash(method.signature)}`;
        // if the method is already in the pool and is shown, it will be hidden
        if (this.methodPool.has(parsedMethodHash) && this.methodPool.get(parsedMethodHash)!.shown) {
          methodsToBeHidden.push(this.methodPool.get(parsedMethodHash)!);
        }
        if (addOp) {
          this.methodPool.set(parsedMethodHash, {
            filePath: filePath,
            method: method,
            shown: false
          });
        } else {
          this.methodPool.delete(parsedMethodHash);
        }
      }
    }
    this.postMethodsToWebview([MethodKind.fromOthers, MethodKind.fromSearch], methodsToBeHidden, false);
  }

  public loadMoreMethodsFromPool(numOfMethods: number) {
    const methodsToBeShown: MethodToShow[] = [];
    let count = 0;
    for (const [_, method] of this.methodPool) {
      if (!method.shown) {
        methodsToBeShown.push(method);
        method.shown = true;
        count++;
      }
      if (count >= numOfMethods) {
        break;
      }
    }
    this.postMethodsToWebview([MethodKind.fromOthers], methodsToBeShown, true);
  }

  public postMethodsToWebview(kinds: MethodKind[], methods: MethodToShow[], addOp: boolean) {
    const message = {
      command: "update",
      kinds: kinds,
      methods: methods,
      addOp: addOp
    };
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }
}