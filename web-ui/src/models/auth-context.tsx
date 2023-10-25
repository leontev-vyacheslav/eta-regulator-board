export type SignInAsyncFunc = (password: string) => Promise<void>;
export type SignOutAsyncFunc = () => Promise<void>;
export type GetUserAuthDataFromStorageFunc = () => AuthUserModel | null;

export type AuthUserModel = {
  token: string;

  exp: number;
}

export type AuthContextModel = {
  user: AuthUserModel | null;

  signIn: SignInAsyncFunc;

  signOut: SignOutAsyncFunc;

  getUserAuthDataFromStorage: GetUserAuthDataFromStorageFunc;
};
