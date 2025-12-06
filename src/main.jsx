import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { IdeasProvider } from './context/IdeasContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <IdeasProvider>
    <App />
  </IdeasProvider>
  </StrictMode>,
)
