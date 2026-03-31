export enum AuthMessages {
  PASSWORDS_DO_NOT_MATCH = 'auth.passwordsDoNotMatch',
  USER_ALREADY_EXISTS = 'auth.userAlreadyExists',
  INVALID_CREDENTIALS = 'auth.invalidCredentials',
  OTP_INVALID = 'auth.otpInvalid',
  OTP_EXPIRED = 'auth.otpExpired',
  USER_NOT_FOUND = 'auth.userNotFound',
  ACCOUNT_NOT_VERIFIED = 'auth.accountNotVerified',
  REGISTER_SUCCESS = 'auth.registerSuccess',
  VERIFY_SUCCESS = 'auth.verifySuccess',
  LOGIN_SUCCESS = 'auth.loginSuccess',
  FORGOT_PASSWORD_SUCCESS = 'auth.forgotPasswordSuccess',
}