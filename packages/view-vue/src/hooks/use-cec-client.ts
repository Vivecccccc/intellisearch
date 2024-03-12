import { CecClient, type MsgObserver, type MsgReceiver, type MsgSender } from 'cec-client-server'

// acquireVsCodeApi 是 extension 的 webview 在 iframe 中注入的一个方法，用于像 webview 发送信息等
const vscodeApi = (window as any).acquireVsCodeApi()

// 实例化 CecClient
const msgSender: MsgSender = vscodeApi.postMessage.bind(vscodeApi)
const msgReceiver: MsgReceiver = (msgHandler) => {
  window.addEventListener('message', (evt) => msgHandler(evt.data))
}
const cecClient = new CecClient(msgSender, msgReceiver)

//  暴露 CecClient 实例的 call 方法
export const useCall = <ReplyVal>(name: string, ...args: any[]) => {
  return cecClient.call<ReplyVal>(name, ...args)
}

//  暴露 CecClient 实例的 subscrible 方法
export const useSubscrible = (name: string, observer: MsgObserver, ...args: any[]) => {
  return cecClient.subscrible(name, observer, ...args)
}