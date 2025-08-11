import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Alerts from './pages/Alerts';
import NavigatePage from './pages/Navigate';
import Community from './pages/Community';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/navigate" element={<NavigatePage />} />
        <Route path="/community" element={<Community />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
