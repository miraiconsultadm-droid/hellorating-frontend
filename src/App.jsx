import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Páginas
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Clients from './pages/Clients';
import Survey from './pages/Survey';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulação de autenticação (localStorage)
    const storedUser = localStorage.getItem('hellorating_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      // Usuário padrão para demonstração
      const defaultUser = {
        id: 1,
        email: 'demo@hellorating.com',
        name: 'Demo User',
        credits: 5000
      };
      localStorage.setItem('hellorating_user', JSON.stringify(defaultUser));
      setUser(defaultUser);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rota pública para pesquisa */}
        <Route path="/survey/:surveyId" element={<Survey />} />
        
        {/* Rotas protegidas */}
        {isAuthenticated ? (
          <Route path="/" element={<Layout user={user} />}>
            <Route index element={<Navigate to="/resumo" replace />} />
            <Route path="resumo" element={<Dashboard />} />
            <Route path="campanhas" element={<Campaigns />} />
            <Route path="campanhas/:campaignId" element={<CampaignDetail />} />
            <Route path="clientes" element={<Clients />} />
          </Route>
        ) : (
          <Route path="*" element={<div>Carregando...</div>} />
        )}
      </Routes>
    </Router>
  );
}

export default App;

