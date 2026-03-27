export enum AuthMessages {
  PASSWORDS_DO_NOT_MATCH = 'Passwords do not match',
  USER_ALREADY_EXISTS = 'User already exists',
  INVALID_CREDENTIALS = 'Invalid credentials',
  OTP_INVALID = 'Invalid OTP',
  OTP_EXPIRED = 'OTP has expired',
  USER_NOT_FOUND = 'User not found',
  ACCOUNT_NOT_VERIFIED = 'Account not verified. Please check your email for the OTP.',
  REGISTER_SUCCESS = 'Registration successful. Please verify your email with the OTP sent.',
  VERIFY_SUCCESS = 'Account verified successfully',
  LOGIN_SUCCESS = 'Login successful',
}