import * as vscode from 'vscode';
import { normalize } from 'upath';

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
  hash: string,
  filePath: string,
  method: Method
  shown: boolean,
  lang: string | undefined
};

export class SearchViewProvider extends AbstractViewProvider implements WebviewViewProvider {
  
  private _view: WebviewView | undefined;

  private methodPool: Map<string, MethodToShow> = new Map();
  
  constructor(context: ExtensionContext) {
    super(context);
  }

  public getView() {
    return this._view ? this._view : null;
  }

  async resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [this.context.extensionUri]
    };
    webviewView.webview.html = await this.getWebviewHtml(webviewView.webview);
    this.registerLoginListener();
    this.registerLogoutListener();
    this.registerLoadMoreListener();
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
          this.context.globalState.update('token', credential.token);
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

  registerLogoutListener() {
    this._view?.webview.onDidReceiveMessage(async (data) => {
      if (data.command === "logout") {
        this.context.globalState.update('token', null);
      }
    });
  }

  registerLoadMoreListener() {
    this._view?.webview.onDidReceiveMessage(async (data) => {
      if (data.command === "loadMore") {
        const numOfMethods = data.numOfMethods;
        this.loadMoreMethodsFromPool(numOfMethods);
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
          const methodToBeHidden = this.methodPool.get(parsedMethodHash)!;
          methodToBeHidden.shown = false;
          methodsToBeHidden.push(methodToBeHidden);
        }
        if (addOp) {
          this.methodPool.set(parsedMethodHash, {
            hash: parsedMethodHash,
            filePath: normalize(filePath),
            method: method,
            shown: false,
            lang: this.context.globalState.get('pickedLang'),
          });
        } else {
          this.methodPool.delete(parsedMethodHash);
        }
      }
    }
  }

  public loadMoreMethodsFromPool(numOfMethods: number) {
    const methodsToBeShown: MethodToShow[] = [];
    let count = 0;
    if (this.methodPool.size === 0) {
      return;
    }
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

  private postMethodsToWebview(kinds: MethodKind[], methods: MethodToShow[], addOp: boolean): Promise<boolean> {
    if (!this._view) {
      return Promise.reject(new Error("WebView is not available"));
    }
  
    const message = {
      command: "updateMethods",
      kinds: kinds,
      methods: methods,
      addOp: addOp
    };
  
    return Promise.resolve(this._view.webview.postMessage(message));
  }
  // TODO implement logic to send notification if there is any new method
}