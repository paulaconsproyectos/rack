import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import App from './App.jsx'
import { purgeStaleKeys, KEYS } from './lib/storage.js'

// Clean up any legacy keys from old versions
purgeStaleKeys()

// Capture referral code from URL (?ref=CODE) and store for use at registration
const refCode = new URLSearchParams(window.location.search).get('ref')
if (refCode) localStorage.setItem(KEYS.ref, refCode.toUpperCase())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
