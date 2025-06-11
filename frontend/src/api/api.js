import axios from 'axios'
import { getAccessToken, getRefreshToken, setAuthTokens } from './auth'


const api = axios.create({
  baseURL:  'http://localhost:5000/' ,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true,
  timeout: 2000,
})



api.interceptors.request.use(config => {
  const token = getAccessToken()
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})


export const refreshToken = async () => {
  try {
    const refresh_token = getRefreshToken();
    const response = await api.post('auth/refresh', {}, {
      headers: {
        'Authorization': `Bearer ${refresh_token}`
      }
    });
    
    if (response.data.access_token) {
      setAuthTokens(response.data.access_token, refresh_token)
    }
    return response.data
  } catch (error) {
    throw error
  }
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 ||  error.response?.status === 422 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        await refreshToken();
        const newToken = getAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error);
  }
)

export default api