import * as vscode from 'vscode';
import axios from 'axios';

const userId = vscode.workspace.getConfiguration().get('intellisearch.userId') as string;
const loginUrl = 'https://prefix/service-login';

type Credential = {
  userId: string,
  token: string,
  expiry: number
} | null;

export function getCredential(password: string, otp: string): Credential | Promise<Credential> {
  const payload = {
    userid: userId,
    password: password,
    otp: otp,
    otp_type: 'PUSH'
  };
  return { userId: userId, token: "abcd", expiry: 100 };
  const credential = axios.post(loginUrl, payload).then((response) => {
    const token = response.data.id_token as string;
    const expiry = response.data.expires_in as number;
    return { userId, token, expiry };
  }).catch((error) => {
    vscode.window.showErrorMessage(`Login failed due to ${error}`);
    return null;
  });
}