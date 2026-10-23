// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { LayoutVariantProvider } from './contexts/LayoutVariantContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AppNovo from './AppNovo';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId="505242660728-umlemlt3e590grpjjc82uarg7l76spte.apps.googleusercontent.com">
        <BrowserRouter>
          <LanguageProvider>
            <AuthProvider>
              <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <CurrencyProvider>
                  <LayoutVariantProvider>
                    <AppNovo />
                    <Toaster />
                  </LayoutVariantProvider>
                </CurrencyProvider>
              </ThemeProvider>
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

