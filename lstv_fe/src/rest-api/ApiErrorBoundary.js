import { useEffect } from 'react';
import axios from 'axios'
import { userLogout } from '../store/actions'
import reduxStore from '../store/store'

/**
 * Will work once all axios calls operate on global instance.
 */
const ApiErrorBoundary = () => {
  useEffect(() => {
    axios.interceptors.response.use(
      response => response,
      responseErrorInterceptor
    )
  }, [])
  return null
}

/**
 * Use this for individual axios instances
 */
export const responseErrorInterceptor = error => {
  if(error?.response?.status === 401 || error?.response?.status === 403) {
    // need to wipe out the logged-in redux state before redirecting.    
    reduxStore.dispatch(userLogout())    
    window.location.pathname = '/sign-in'
    return
  }
  return Promise.reject(error)
}

export default ApiErrorBoundary