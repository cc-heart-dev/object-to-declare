import * as vscode from 'vscode'
import TransformProvider from './transformProvider'

export function activate(context: vscode.ExtensionContext) {
  // 在插件加载完成后创建webview 为 textarea
  const view = vscode.window.registerWebviewViewProvider(
    'object-to-declare.objectToDeclare',
    new TransformProvider(context),
    {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    }
  )

  context.subscriptions.push(view)
}

// This method is called when your extension is deactivated
export function deactivate() {}
