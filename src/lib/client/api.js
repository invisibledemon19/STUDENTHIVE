import { getToken } from './session';

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    requireAuth = false,
    headers: customHeaders = {},
  } = options;

  const headers = { ...customHeaders };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();

  if (requireAuth) {
    if (!token) {
      throw new Error('Please login first');
    }

    headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await response
    .json()
    .catch(() => ({ success: false, error: 'Unable to parse server response' }));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload;
}
