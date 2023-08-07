import * as vscode from 'vscode';
import { join } from 'path';
import * as ObjectToDeclare from '@cc-heart/object-to-declare';
const generateTypeDeclaration = ObjectToDeclare as unknown as typeof ObjectToDeclare.default;
export default class InputProvider implements vscode.WebviewViewProvider {
  private webView?: vscode.WebviewView;
  constructor(private readonly context: vscode.ExtensionContext) {
  }
  resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
    if (!this.webView) {
      this.webView = webviewView;
      this.webView.webview.options = {
        enableScripts: true,
      };
      this.webView.webview.onDidReceiveMessage((e) => {
        try {
          const code = new Function(`return ${e.text.trim()}`)();
          this.webView?.webview.postMessage({
            data: generateTypeDeclaration(code),
          });
        } catch (e) {
          console.error(e);
        }
      });
    }
    webviewView.webview.html = this.getHtml();
  }
  private getHtml(code?: string) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Document</title>
      <style>
        * {
          margin: 0;
          padding: 0;
        }
        textarea {
            position: fixed;
            bottom: 0;
            width: 100%;
            left:0;
            height: 150px;
            margin: 0;
            border: 1px solid #CCC;
            border-radius: 10px;
            font-size: 13px;
            font-family: monospace;
        }
      </style>
    </head>
    <body>
      <pre id="code">
      <!-- highlight code -->
       ${code || ""}
      </pre>
      <textarea id="input" cols="20" rows="10"></textarea>
      <button id="explore">解析</button>
    </body>
    <script>
        let vscode = acquireVsCodeApi();
        let code = document.querySelector('#code');
        let inputRef = document.querySelector('#input');
        function transformObjectToDeclare() {
          try {
            vscode.postMessage({
              text: inputRef?.value,
            })
          } catch (error) {
            console.error(error);
          }
        }
        document.querySelector('#explore').addEventListener('click', transformObjectToDeclare);
        function onMessage(message) {
          code.innerHTML = message.data.data;
        }
        window.addEventListener('message', onMessage)
    </script>
    </html>
    `;
  }

}