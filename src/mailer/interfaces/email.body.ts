export interface IEmailRegister {
  verification: string;
  email: string;
}
export interface IPasswordRestore {
  email: string;
  newPassword: string;
}
