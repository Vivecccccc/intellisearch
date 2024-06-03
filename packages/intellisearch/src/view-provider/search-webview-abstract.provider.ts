import { ExtensionContext, Uri, Webview, WebviewPanel, WebviewView } from "vscode";
import { readFileSync } from "fs";
import { join } from "path";
import { modifyHtml } from "html-modifier";

export abstract class AbstractViewProvider {
  static WEBVIEW_INJECT_IN_MARK = "__webview_public_path__";

  constructor(protected context: ExtensionContext) {}

  abstract resolveWebviewView(webviewView: WebviewView | WebviewPanel): void;

  protected async getWebviewHtml(webview: Webview) {
    const { distDir, indexPath } = {
      distDir: "out/view-vue",
      indexPath: "out/view-vue/index.html",
    };
    const webviewUri: Uri = webview.asWebviewUri(
      Uri.file(join(this.context.extensionPath, distDir))
    );
    const injectInContent = `<script> window.${AbstractViewProvider.WEBVIEW_INJECT_IN_MARK} = "${webviewUri}"</script>`;
    const htmlPath = join(this.context.extensionPath, indexPath);
    const htmlText: string = readFileSync(htmlPath, "utf-8");
    
    return await modifyHtml(htmlText, {
      onopentag(name, attribs) {
        if (name === 'script') {attribs.src = join(webviewUri.toString(), attribs.src);}
        if (name === 'link') {attribs.href = join(webviewUri.toString(), attribs.href);}
        return { name, attribs };
      },
      oncomment(data) {
        const hasMark = data.toString().toLowerCase().includes(AbstractViewProvider.WEBVIEW_INJECT_IN_MARK);
        return hasMark ? { data: injectInContent, clearComment: true } : { data };
      }
    });
  }
}
