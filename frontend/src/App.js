import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Alerts from './pages/Alerts';
import NavigatePage from './pages/Navigate';
import Community from './pages/Community';
import Settings from './pages/Settings';
import ModeSelection from './components/ModeSelection';
import AIAssistant from './components/AIAssistant';

// Wrapper component to conditionally show AI Assistant
function AppContent() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('ac_user');
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mode-selection" element={<ModeSelection />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/navigate" element={<NavigatePage />} />
        <Route path="/community" element={<Community />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {/* AI Assistant - only shows when logged in */}
      {isLoggedIn && <AIAssistant />}
    </>
  );
}

function App() {
  return (
    <PreferencesProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AppContent />
      </Router>
    </PreferencesProvider>
  );
}

export default App;
