
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/i18n' // Import i18n configuration

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
