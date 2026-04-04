import React from 'react';
import ReactDOM from 'react-dom/client';
import { initApp } from './init/init.ts';
import './index.css';
import App from './App.tsx';

initApp().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});