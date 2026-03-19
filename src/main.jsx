import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import App from './App.jsx'

// Capture referral code from URL (?ref=CODE) and store for use at registration
const refCode = new URLSearchParams(window.location.search).get('ref')
if (refCode) localStorage.setItem('zc_ref', refCode.toUpperCase())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
