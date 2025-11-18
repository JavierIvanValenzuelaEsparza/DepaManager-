import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GoogleAuthProvider } from './contexts/AuthContext'; // ✅ Importar desde el mismo archivo
import AppRouter from './router/AppRouter';

function App() {
  return (
    <GoogleAuthProvider>
      <AuthProvider>
        <Router>
          <AppRouter />
        </Router>
      </AuthProvider>
    </GoogleAuthProvider>
  );
}

export default App;