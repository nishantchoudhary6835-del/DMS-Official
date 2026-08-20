import { EMAIL_TIMEOUT_MS } from '@config/env';
import { axiosInstance } from '@services/axiosInstance';
import { normalizeEmail } from '@utils/format';

export async function sendEmailOtp(email) {
  const { data } = await axiosInstance.post(
    '/auth/send-email-otp',
    { email: normalizeEmail(email) },
    { timeout: EMAIL_TIMEOUT_MS }
  );
  return data;
}

export async function verifyEmailOtp(email, otp) {
  const { data } = await axiosInstance.post('/auth/verify-email-otp', {
    email: normalizeEmail(email),
    otp,
  });
  return data;
}

export async function register({ email, password, confirmPassword }) {
  const { data } = await axiosInstance.post('/auth/register', {
    email: normalizeEmail(email),
    password,
    confirmPassword,
  });
  return data;
}

export async function login(email, password) {
  const { data } = await axiosInstance.post('/auth/login', {
    email: normalizeEmail(email),
    password,
  });
  return data;
}

export async function logout() {
  const { data } = await axiosInstance.post('/auth/logout', {});
  return data;
}

export async function forgotPassword(email) {
  const { data } = await axiosInstance.post(
    '/auth/forgot-password',
    { email: normalizeEmail(email) },
    { timeout: EMAIL_TIMEOUT_MS }
  );
  return data;
}

// Unlike registration's send/verify split, this single call both verifies the
// OTP and sets the new password — the endpoint takes them together.
export async function verifyForgotPasswordOtp(email, otp, newPassword) {
  const { data } = await axiosInstance.post('/auth/verify-forgot-password-otp', {
    email: normalizeEmail(email),
    otp,
    newPassword,
  });
  return data;
}

export async function changePassword(oldPassword, newPassword) {
  const { data } = await axiosInstance.post('/auth/change-password', {
    oldPassword,
    newPassword,
  });
  return data;
}
