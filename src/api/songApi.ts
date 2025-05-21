import { ApiResponse } from "../types/api";

const BASE_URL = 'http://localhost:8082';

// Helper function to get CSRF token from cookies
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Helper function to get access token from localStorage
function getAccessToken() {
  return localStorage.getItem('access_token');
}

// Helper function to make API calls
async function makeRequest(url: string, method = 'GET', body: unknown = null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAccessToken()}`
  };

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include'
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Error:', error);
    return { status: 500, data: { error: (error as Error).message } };
  }
}

export const deleteSong = async (songId: string): Promise<ApiResponse<null>> => {
  const response = await makeRequest(`${BASE_URL}/song/delete`, 'POST', { id: songId });
  return response.data;
}; 