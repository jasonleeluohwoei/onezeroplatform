import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { I18nProvider } from './i18n';
import { DataProvider } from './data/store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </I18nProvider>
  </React.StrictMode>
);
