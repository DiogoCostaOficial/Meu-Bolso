import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Shield,
  PieChart,
  Wallet,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Lock,
  Users,
  Smartphone,
  Download,
  FileText
} from 'lucide-react';

const Homepage = () => {
  const navigate = useNavigate();

  const recursos = [
    {
      icone: PieChart,
      titulo: 'Dashboard Completo',
      descricao: 'Visualize todas as suas finanças em um único lugar com gráficos interativos e intuitivos.'
    },
    {
      icone: Wallet,
      titulo: 'Receitas e Despesas',
      descricao: 'Controle total sobre entradas e saídas com categorização automática e relatórios detalhados.'
    },
    {
      icone: BarChart3,
      titulo: 'Relatórios Personalizados',
      descricao: 'Gere relatórios completos em PDF ou Excel com análises profundas do seu orçamento.'
    },
    {
      icone: TrendingUp,
      titulo: 'Metas de Orçamento',
      descricao: 'Defina metas mensais e acompanhe seu progresso em tempo real.'
    },
    {
      icone: FileText,
      titulo: 'DRE Automatizado',
      descricao: 'Demonstrativo de Resultado completo gerado automaticamente para análise financeira.'
    },
    {
      icone: Shield,
      titulo: '100% Seguro',
      descricao: 'Seus dados protegidos com criptografia de ponta e autenticação robusta.'
    }
  ];

  const beneficios = [
    'Controle total das suas finanças pessoais',
    'Interface moderna e fácil de usar',
    'Relatórios profissionais em segundos',
    'Acesso de qualquer dispositivo',
    'Backup automático dos seus dados',
    'Suporte técnico dedicado'
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* HEADER/NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">
                  Finanças Fácil
                </h1>
                <p className="text-xs text-gray-600">Controle Financeiro Inteligente</p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate('/cadastro')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                Começar Grátis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              Controle Financeiro Profissional
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Organize suas
              <span className="block text-blue-600">
                Finanças com
              </span>
              <span className="block text-blue-600">
                Inteligência
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Sistema completo para gerenciar receitas, despesas e orçamentos.
              Visualize seus gastos, acompanhe metas e tome decisões financeiras
              inteligentes com dados em tempo real.
            </p>

            {/* Botões CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/cadastro')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Começar Agora - É Grátis
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white hover:bg-gray-50 text-indigo-600 font-bold rounded-xl border-2 border-indigo-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Fazer Login
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div>
                <p className="text-3xl font-bold text-indigo-600">100%</p>
                <p className="text-sm text-gray-600">Seguro</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-indigo-600">24/7</p>
                <p className="text-sm text-gray-600">Acesso</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-indigo-600">∞</p>
                <p className="text-sm text-gray-600">Transações</p>
              </div>
            </div>
          </div>

          {/* Imagem/Mockup */}
          <div className="relative">
            <div className="relative bg-blue-600 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              {/* Mockup do Dashboard */}
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Dashboard</p>
                      <p className="text-sm text-gray-500">Visão Geral</p>
                    </div>
                  </div>
                  <PieChart className="w-6 h-6 text-indigo-600" />
                </div>

                {/* Cards de Exemplo */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700 font-medium">Receitas</p>
                    <p className="text-2xl font-bold text-green-600">R$ 15.450</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <p className="text-sm text-red-700 font-medium">Despesas</p>
                    <p className="text-2xl font-bold text-red-600">R$ 8.230</p>
                  </div>
                </div>

                {/* Gráfico Fake */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-end justify-around h-32 gap-2">
                    <div className="w-full bg-indigo-400 rounded-t-lg h-20"></div>
                    <div className="w-full bg-purple-400 rounded-t-lg h-24"></div>
                    <div className="w-full bg-indigo-400 rounded-t-lg h-16"></div>
                    <div className="w-full bg-purple-400 rounded-t-lg h-28"></div>
                    <div className="w-full bg-indigo-400 rounded-t-lg h-20"></div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-3">Evolução Mensal</p>
                </div>
              </div>
            </div>

            {/* Elementos Decorativos */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-2xl"></div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para
              <span className="block text-blue-600">
                Controlar suas Finanças
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Recursos completos e profissionais para transformar a maneira como você gerencia seu dinheiro
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recursos.map((recurso, index) => {
              const Icone = recurso.icone;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icone className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{recurso.titulo}</h3>
                  <p className="text-gray-600 leading-relaxed">{recurso.descricao}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Por que escolher o
                <span className="block">Finanças Fácil?</span>
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Mais do que um simples controle financeiro. Uma solução completa para transformar sua relação com o dinheiro.
              </p>
              <div className="space-y-4">
                {beneficios.map((beneficio, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-white text-lg">{beneficio}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/cadastro')}
                className="mt-8 px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center gap-2"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
                <Users className="w-10 h-10 text-white mb-4" />
                <p className="text-3xl font-bold text-white mb-2">Multi-usuário</p>
                <p className="text-indigo-100">Perfis isolados e seguros</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 mt-12">
                <Smartphone className="w-10 h-10 text-white mb-4" />
                <p className="text-3xl font-bold text-white mb-2">Responsivo</p>
                <p className="text-indigo-100">Funciona em qualquer dispositivo</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
                <Download className="w-10 h-10 text-white mb-4" />
                <p className="text-3xl font-bold text-white mb-2">Exportação</p>
                <p className="text-indigo-100">PDF e Excel com um clique</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 mt-12">
                <Lock className="w-10 h-10 text-white mb-4" />
                <p className="text-3xl font-bold text-white mb-2">Seguro</p>
                <p className="text-indigo-100">Criptografia de ponta</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Pronto para transformar
            <span className="block text-blue-600">
              suas finanças?
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Comece agora e tenha controle total do seu dinheiro em minutos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/cadastro')}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 text-lg flex items-center justify-center gap-2"
            >
              Criar Conta Grátis
              <ArrowRight className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-5 bg-white hover:bg-gray-50 text-indigo-600 font-bold rounded-xl border-2 border-indigo-600 transition-all duration-300 text-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-6 h-6" />
              Já tenho conta
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Finanças Fácil</span>
              </div>
              <p className="text-gray-400">
                Sistema completo de controle financeiro pessoal. Gerencie suas finanças com inteligência e segurança.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Dashboard</li>
                <li>Receitas e Despesas</li>
                <li>Relatórios</li>
                <li>Orçamento</li>
                <li>DRE</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentação</li>
                <li>Tutoriais</li>
                <li>FAQ</li>
                <li>Contato</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Finanças Fácil. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
