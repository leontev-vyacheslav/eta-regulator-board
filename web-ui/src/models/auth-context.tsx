export type SignInAsyncFunc = (email: string, password: string) => Promise<void>;
export type SignOutAsyncFunc = () => Promise<void>;
export type GetUserAuthDataFromStorageFunc = () => AuthUserModel | null;

export type AuthUserModel = {
  userId: number
  email: string,
  organizationId: number | null,
  sessionUid: string,
  token: string
}

export type AuthContextModel = {
  user: AuthUserModel | null,
  signIn: SignInAsyncFunc,
  signOut: SignOutAsyncFunc,
  getUserAuthDataFromStorage: GetUserAuthDataFromStorageFunc
};
