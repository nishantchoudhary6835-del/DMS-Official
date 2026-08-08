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
