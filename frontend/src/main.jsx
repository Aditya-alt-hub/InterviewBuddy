import { createRoot } from 'react-dom/client'
// import { StrictMode } from 'react'
import React from 'react'   //it is the library to use to create components
import ReactDOM from 'react-dom/client' // reactdom render the component on webpage
import {Provider} from 'react-redux' //it provide the data from redux store to all components
import {GoogleOAuthProvider} from '@react-oauth/google'

import './index.css'
import App from './App.jsx'
import axios from 'axios'
import store from './app/store.js'
import { BrowserRouter as Router } from 'react-router-dom'

const GOOGLE_CLIENT_ID=import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log("GOOGLE_CLIENT_ID =", GOOGLE_CLIENT_ID);



//manlo user ka login token expire hota h toh server response dega user is unauthorised or it returns to the login page 
// axios.interceptors.request.use(
//   (Response)=>Response,
//   (error)=>
//   {
//     if(error.response&&error.response.status===401)
//     {
//       if(!error.config.url.includes('login'))
//       {
//          localStorage.removeItem('user');
//          window.location.href='/login';
//       }
//       // localStorage.removeItem('user');
//       // window.location.reload.href='/login';
//     }
//     return Promise.reject(error);
//   }
// )

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!error.config.url.includes("login")) {
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </GoogleOAuthProvider>
)
