import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  Shield,
  PieChart,
  Target,
  ArrowRight,
  DollarSign,
  Wallet,
  Quote,
  Lightbulb
} from 'lucide-react';
import { ModeToggle } from '../components/mode-toggle';

// Import images
import heroImage from '../assets/financial_planning_hero.png';
import controlImage from '../assets/financial_control_closeup.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Header/Navbar */}
      <header className="fixed top-0 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm z-50 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">
              Meu Bolso
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#importancia" className="text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
              Por que controlar?
            </a>
            <a href="#funcionalidades" className="text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
              Funcionalidades
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <ModeToggle />
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/cadastro')}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transform hover:scale-105 transition shadow-md"
            >
              Criar Conta
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-blue-50 dark:bg-slate-900/50 transition-colors">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold tracking-wide uppercase">
                🚀 Transforme sua vida hoje
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Assuma o Controle do Seu
                <span className="block text-blue-600 dark:text-blue-500">
                  Destino Financeiro
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-slate-400 leading-relaxed max-w-lg">
                A liberdade que você sonha começa com a organização que você faz hoje.
                Não deixe seu dinheiro controlar você. Assuma o comando e construa o futuro que você merece.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/cadastro')}
                  className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 hover:shadow-xl transform hover:scale-105 transition"
                >
                  Começar Minha Jornada
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-slate-500 italic">
                "O primeiro passo para a riqueza é o controle."
              </p>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-600 rounded-2xl opacity-20 blur-2xl"></div>
              <img
                src={heroImage}
                alt="Homem analisando finanças"
                className="relative rounded-2xl shadow-2xl w-full object-cover h-[500px] transform hover:scale-[1.01] transition duration-500"
              />

              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 font-semibold uppercase">Resultado</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Liberdade Financeira</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Importance Section */}
      <section id="importancia" className="py-24 bg-white dark:bg-slate-950 transition-colors">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="relative order-2 md:order-1">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-100 dark:bg-yellow-900/20 rounded-full opacity-50 blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-50 blur-3xl"></div>
              <img
                src={controlImage}
                alt="Planejamento financeiro detalhado"
                className="relative rounded-2xl shadow-xl w-full object-cover h-[600px] grayscale-[0.2] hover:grayscale-0 transition duration-500"
              />
            </div>

            {/* Content Side */}
            <div className="order-1 md:order-2 space-y-8">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Por que o controle financeiro é <span className="text-blue-600 dark:text-blue-500">libertador</span>?
              </h2>

              <p className="text-lg text-gray-600 dark:text-slate-400">
                Muitas pessoas acham que controlar gastos é sobre restrição. Na verdade, é sobre <strong>escolha</strong>.
                Quando você sabe para onde seu dinheiro vai, você decide para onde ele <em>deve</em> ir.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: <Shield className="w-6 h-6" />,
                    title: "Paz de Espírito",
                    desc: "Durma tranquilo sabendo que suas contas estão em dia e você está preparado para imprevistos.",
                    bg: "bg-blue-100 dark:bg-blue-900/30",
                    text: "text-blue-600 dark:text-blue-400"
                  },
                  {
                    icon: <Target className="w-6 h-6" />,
                    title: "Realização de Sonhos",
                    desc: "Transforme metas distantes em planos concretos. A viagem, a casa própria, a aposentadoria tranquila.",
                    bg: "bg-purple-100 dark:bg-purple-900/30",
                    text: "text-purple-600 dark:text-purple-400"
                  },
                  {
                    icon: <Lightbulb className="w-6 h-6" />,
                    title: "Vida com Propósito",
                    desc: "Gaste com o que realmente importa para você. Corte o supérfluo que não traz felicidade.",
                    bg: "bg-green-100 dark:bg-green-900/30",
                    text: "text-green-600 dark:text-green-400"
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className={`flex-shrink-0 w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.text} group-hover:scale-110 transition duration-300`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-gray-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-slate-900 dark:bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <Quote className="w-16 h-16 text-blue-500 mx-auto opacity-50" />
            <blockquote className="text-3xl md:text-4xl font-serif italic leading-relaxed">
              "Não é sobre quanto dinheiro você ganha, mas sobre quanto dinheiro você mantém,
              quão arduamente ele trabalha para você e para quantas gerações você o mantém."
            </blockquote>
            <div className="flex flex-col items-center">
              <cite className="text-xl font-bold text-blue-400 not-italic">— Robert Kiyosaki</cite>
              <span className="text-slate-400 text-sm mt-1">Autor de "Pai Rico, Pai Pobre"</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-24 bg-gray-50 dark:bg-slate-900/30 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ferramentas para o seu Sucesso
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Simplificamos a gestão financeira para que você possa focar no que realmente importa: viver.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <DollarSign className="w-8 h-8 text-white" />,
                title: "Controle de Fluxo",
                desc: "Visualize claramente suas entradas e saídas. Saiba exatamente quanto sobra no final do mês.",
                color: "bg-blue-600"
              },
              {
                icon: <PieChart className="w-8 h-8 text-white" />,
                title: "Gráficos Inteligentes",
                desc: "Entenda seus hábitos de consumo com gráficos visuais e intuitivos. A informação é poder.",
                color: "bg-purple-600"
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-white" />,
                title: "Metas Financeiras",
                desc: "Defina objetivos e acompanhe seu progresso. A motivação que você precisa para continuar.",
                color: "bg-green-600"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100 dark:border-slate-800 group">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:rotate-6 transition duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 dark:bg-blue-700 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Comece sua transformação hoje
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Não espere o "momento perfeito". O melhor momento para plantar uma árvore foi há 20 anos.
            O segundo melhor momento é agora.
          </p>

          <button
            onClick={() => navigate('/cadastro')}
            className="px-10 py-5 bg-white text-blue-700 rounded-full font-bold text-xl hover:bg-gray-100 hover:shadow-2xl transform hover:scale-105 transition"
          >
            Criar Minha Conta Gratuita
          </button>

          <p className="mt-6 text-sm text-blue-200 opacity-80">
            Junte-se a mais de 5.000 pessoas que já mudaram de vida.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Wallet className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-bold text-white">Meu Bolso</span>
            </div>

            <div className="text-sm">
              © {new Date().getFullYear()} Meu Bolso. Feito com 💙 para sua liberdade.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
