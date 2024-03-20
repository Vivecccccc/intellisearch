import { ExtensionContext, WebviewView, WebviewViewProvider } from "vscode";
import { AbstractViewProvider } from "./search-webview-abstract.provider";

export class ViewProviderSidebar extends AbstractViewProvider implements WebviewViewProvider {
  
  private _view?: WebviewView;
  
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
    webviewView.webview.onDidReceiveMessage((data) => {
      console.log(data);
    });
  }
}