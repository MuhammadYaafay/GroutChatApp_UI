
import { getAuthToken } from './authUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  authenticated?: boolean;
}

export const apiRequest = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  const {
    method = 'GET',
    body,
    headers = {},
    authenticated = true
  } = options;

  // Build request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  // Add auth token if authenticated request
  if (authenticated) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['x-auth-token'] = token;
    }
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders
  };

  // Add body if provided
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.msg || errorData.message || `API Error: ${response.status}`);
  }

  // Return data
  return await response.json();
};

// File upload utility
export const uploadFile = async (
  endpoint: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<any> => {
  const token = getAuthToken();
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Handle progress events if callback provided
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });
    }
    
    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          resolve(xhr.responseText);
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.msg || errorData.message || `Upload failed: ${xhr.status}`));
        } catch (error) {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      }
    });
    
    // Handle network errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });
    
    // Handle timeouts
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out'));
    });
    
    // Open and send the request
    xhr.open('PUT', `${API_URL}${endpoint}`);
    if (token) {
      xhr.setRequestHeader('x-auth-token', token);
    }
    xhr.send(formData);
  });
};
