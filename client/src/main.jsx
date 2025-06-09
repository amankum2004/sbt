import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {NextUIProvider }from '@nextui-org/react'
import {ToastContainer} from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { LoadingProvider } from './components/Loading.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <NextUIProvider>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      <ToastContainer 
      position='top-right'
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme='colored'
      bodyClassName="toastBody"/>
      </NextUIProvider>
    </React.StrictMode>,
)
