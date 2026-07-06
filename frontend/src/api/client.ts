import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
});

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const apiMessage = err.response?.data?.error?.message;
    if (typeof apiMessage === 'string') return apiMessage;
    if (err.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the backend running on port 3001?';
    return err.message;
  }
  return 'Something went wrong';
}
