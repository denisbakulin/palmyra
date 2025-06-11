import Cookies from 'js-cookie'
import api from './api';


export const setAuthTokens = (accessToken, refreshToken) => {
  Cookies.set('access_token', accessToken, { expires: 100})
  Cookies.set('refresh_token', refreshToken, { expires: 300, secure: true})
}

export const logout = () => {
  Cookies.remove('access_token')
  Cookies.remove('refresh_token')
}


export const getAccessToken = () => String(Cookies.get('access_token'))
export const getRefreshToken = () => String(Cookies.get('refresh_token'))


export const login = async (username, password) => {
    try {
      const request = await api.post("auth/login", {username:username, password:password})
      const data = request.data
      if (data.ok) {
        setAuthTokens(data.access_token, data.refresh_token)
        return false
      } 
    } catch (error) {
      if (error.response && error.response.data.error) 
        return error.response.data.error
      return "Ошибка запроса"
      
    } 
}


export const registration = async (username, password) => {
  try {
    const request = await api.post("auth/registration", {username:username, password:password})
    const data = request.data
    if (data.ok) {
      setAuthTokens(data.access_token, data.refresh_token)
      return false
    } 
  } catch (error) {
    if (error.response && error.response.data.error) 
      return error.response.data.error
    return "Ошибка запроса" 
  } 
}

