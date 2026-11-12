import React from 'react';
import ReactDOM from 'react-dom/client';
// HashRouter: werkt op GitHub Pages en Netlify, ook bij direct openen van een zone.
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <App />
  </HashRouter>
);
