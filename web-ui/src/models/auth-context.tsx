import { SignInModel } from './signin-model';

export type SignInAsyncFunc = (singIn: SignInModel) => Promise<void>;
export type SignOutAsyncFunc = () => Promise<void>;
export type GetUserAuthDataFromStorageFunc = () => AuthUserModel | null;

export type AuthUserModel = {
  role: number;

  login: string;

  token: string;
}

export type AuthContextModel = {
  user: AuthUserModel | null;

  signIn: SignInAsyncFunc;

  signOut: SignOutAsyncFunc;

  getUserAuthDataFromStorage: GetUserAuthDataFromStorageFunc;
};
