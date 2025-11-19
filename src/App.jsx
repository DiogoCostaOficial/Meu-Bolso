import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Receitas from './pages/Receitas';
import Despesas from './pages/Despesas';
import DRE from './pages/DRE';
import Backup from './pages/Backup';
import Relatorios from './pages/Relatorios';
import Orcamento from './pages/Orcamento';


function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case 'dashboard':
        return <Dashboard />;
      case 'receitas':
        return <Receitas />;
      case 'despesas':
        return <Despesas />;
      case 'dre':
        return <DRE />;
      case 'backup':
        return <Backup />;
      case 'relatorios':
        return <Relatorios />;
      case 'orcamento':
        return <Orcamento />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva}>
      {renderizarConteudo()}
    </Layout>
  );
}

export default App;
