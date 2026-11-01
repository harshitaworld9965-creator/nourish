import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted variable fonts so the app looks right offline
import '@fontsource-variable/fraunces';
import '@fontsource-variable/instrument-sans';

import './styles/global.css';
import App from './app/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
