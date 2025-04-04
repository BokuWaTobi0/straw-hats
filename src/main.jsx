import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { UserAuthProvider } from './contexts/user-auth-context.context.jsx'
import { GlobalDbProvider } from './contexts/global-db.context.jsx'
import { GlobalDataProvider } from './contexts/global-data.context.jsx'
import { ToastProvider } from './contexts/toast-context.context.jsx'
import { GlobalStorageProvider } from './contexts/global-storage.context.jsx'

createRoot(document.getElementById('root')).render(
  <UserAuthProvider>
  <GlobalDbProvider>
  <GlobalDataProvider>
  <GlobalStorageProvider>
  <ToastProvider>
  <BrowserRouter>
  <StrictMode>
    <App />
  </StrictMode>
  </BrowserRouter>
  </ToastProvider>
  </GlobalStorageProvider>
  </GlobalDataProvider>
  </GlobalDbProvider>
  </UserAuthProvider>,
)
