/** 统一处理 Cookie */
import Cookies from "js-cookie"

export const TOKEN_KEY = 'token'

export const setToken = (token:string) => {
    Cookies.set(TOKEN_KEY, token)
}

export const getToken = () => {
    const token = Cookies.get(TOKEN_KEY)
    if (token) return token
    else return false
}

export const delToken = () => {
    Cookies.remove(TOKEN_KEY)
}
