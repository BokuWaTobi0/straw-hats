import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { UserAuthProvider } from './contexts/user-auth-context.context.jsx'
import { GlobalDataProvider } from './contexts/global-data.context.jsx'
import { GlobalDbProvider } from './contexts/global-db.context.jsx'

createRoot(document.getElementById('root')).render(
  <UserAuthProvider>
  <GlobalDbProvider>
  <GlobalDataProvider>
  <BrowserRouter>
  <StrictMode>
    <App />
  </StrictMode>
  </BrowserRouter>
  </GlobalDataProvider>
  </GlobalDbProvider>
  </UserAuthProvider>,
)
