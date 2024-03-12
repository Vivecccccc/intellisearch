import { ExtensionContext, WebviewView, WebviewViewProvider } from "vscode";
import { AbstractViewProvider } from "./view-provider-abstract";

export class ViewProviderSidebar extends AbstractViewProvider implements WebviewViewProvider {
  constructor(context: ExtensionContext) {
    super(context);
  }

  async resolveWebviewView(webviewView: WebviewView) {
    const { webview } = webviewView;
    webview.options = {
        enableScripts: true,
        localResourceRoots: [this.context.extensionUri]
    };
    webview.html = await this.getWebviewHtml(webview);
  }
}