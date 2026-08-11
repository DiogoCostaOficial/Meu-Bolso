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
import { useTheme } from '../components/theme-provider';
import { useLayoutVariant } from '../contexts/LayoutVariantContext';

// Import images
import heroImage from '../assets/financial_planning_hero.png';
import controlImage from '../assets/financial_control_closeup.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const { layoutVariant } = useLayoutVariant();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className={`min-h-screen bg-custom-primary text-custom-main font-sans transition-colors duration-300 layout-${layoutVariant}`}>
      {/* Header/Navbar */}
      <header className="fixed top-0 w-full bg-custom-card/90 border-b border-custom-color backdrop-blur-md shadow-custom z-50 transition-colors">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-8 h-8 text-custom-gold" />
            <span className="text-2xl font-bold text-custom-gold">
              Meu Bolso
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#importancia" className="text-custom-main opacity-85 hover:text-custom-gold hover:opacity-100 transition font-medium">
              Por que controlar?
            </a>
            <a href="#funcionalidades" className="text-custom-main opacity-85 hover:text-custom-gold hover:opacity-100 transition font-medium">
              Funcionalidades
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <ModeToggle />
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-custom-main opacity-85 hover:opacity-100 font-medium transition"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/cadastro')}
              className="px-6 py-2 bg-custom-gold text-black font-bold rounded-full hover:opacity-95 transform hover:scale-105 transition shadow-custom"
            >
              Criar Conta
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-custom-primary/50 transition-colors">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-custom-gold/15 text-custom-gold rounded-full text-sm font-bold tracking-wide uppercase">
                🚀 Transforme sua vida hoje
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-custom-main leading-tight">
                Assuma o Controle do Seu
                <span className="block text-custom-gold">
                  Destino Financeiro
                </span>
              </h1>

              <p className="text-xl text-custom-main opacity-85 leading-relaxed max-w-lg">
                A liberdade que você sonha começa com a organização que você faz hoje.
                Não deixe seu dinheiro controlar você. Assuma o comando e construa o futuro que você merece.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/cadastro')}
                  className="flex items-center justify-center px-8 py-4 bg-custom-gold text-black rounded-full font-bold text-lg hover:opacity-90 hover:shadow-custom transform hover:scale-105 transition"
                >
                  Começar Minha Jornada
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-custom-main opacity-70 italic">
                "O primeiro passo para a riqueza é o controle."
              </p>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-custom-gold/10 rounded-2xl blur-2xl"></div>
              <img
                src={heroImage}
                alt="Homem analisando finanças"
                className="relative rounded-2xl shadow-custom w-full object-cover h-[500px] transform hover:scale-[1.01] transition duration-500"
              />

              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 bg-custom-card/90 backdrop-blur p-4 rounded-xl shadow-custom border border-custom-color">
                <div className="flex items-center gap-3">
                  <div className="bg-custom-gold/20 p-2 rounded-full">
                    <TrendingUp className="w-6 h-6 text-custom-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-custom-main opacity-70 font-semibold uppercase">Resultado</p>
                    <p className="text-lg font-bold text-custom-main">Liberdade Financeira</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Importance Section */}
      <section id="importancia" className="py-24 bg-custom-primary transition-colors">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="relative order-2 md:order-1">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-custom-gold/10 rounded-full opacity-50 blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-custom-gold/10 rounded-full opacity-50 blur-3xl"></div>
              <img
                src={controlImage}
                alt="Planejamento financeiro detalhado"
                className="relative rounded-2xl shadow-custom w-full object-cover h-[600px] grayscale-[0.2] hover:grayscale-0 transition duration-500"
              />
            </div>

            {/* Content Side */}
            <div className="order-1 md:order-2 space-y-8">
              <h2 className="text-4xl font-bold text-custom-main leading-tight">
                Por que o controle financeiro é <span className="text-custom-gold">libertador</span>?
              </h2>

              <p className="text-lg text-custom-main opacity-85">
                Muitas pessoas acham que controlar gastos é sobre restrição. Na verdade, é sobre <strong>escolha</strong>.
                Quando você sabe para onde seu dinheiro vai, você decide para onde ele <em>deve</em> ir.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: <Shield className="w-6 h-6" />,
                    title: "Paz de Espírito",
                    desc: "Durma tranquilo sabendo que suas contas estão em dia e você está preparado para imprevistos.",
                    bg: "bg-custom-gold/10",
                    text: "text-custom-gold"
                  },
                  {
                    icon: <Target className="w-6 h-6" />,
                    title: "Realização de Sonhos",
                    desc: "Transforme metas distantes em planos concretos. A viagem, a casa própria, a aposentadoria tranquila.",
                    bg: "bg-custom-gold/10",
                    text: "text-custom-gold"
                  },
                  {
                    icon: <Lightbulb className="w-6 h-6" />,
                    title: "Vida com Propósito",
                    desc: "Gaste com o que realmente importa para você. Corte o supérfluo que não traz felicidade.",
                    bg: "bg-custom-gold/10",
                    text: "text-custom-gold"
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className={`flex-shrink-0 w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.text} group-hover:scale-110 transition duration-300 border border-custom-color`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-custom-main mb-2">{item.title}</h3>
                      <p className="text-custom-main opacity-80">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-custom-card text-custom-main border-t border-b border-custom-color relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-custom-gold/5 to-transparent z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <Quote className="w-16 h-16 text-custom-gold mx-auto opacity-50" />
            <blockquote className="text-3xl md:text-4xl font-serif italic leading-relaxed text-custom-main">
              "Não é sobre quanto dinheiro você ganha, mas sobre quanto dinheiro você mantém,
              quão arduamente ele trabalha para você e para quantas gerações você o mantém."
            </blockquote>
            <div className="flex flex-col items-center">
              <cite className="text-xl font-bold text-custom-gold not-italic">— Robert Kiyosaki</cite>
              <span className="text-custom-main opacity-70 text-sm mt-1">Autor de "Pai Rico, Pai Pobre"</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-24 bg-custom-primary transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-custom-main mb-4">
              Ferramentas para o seu Sucesso
            </h2>
            <p className="text-xl text-custom-main opacity-85 max-w-2xl mx-auto">
              Simplificamos a gestão financeira para que você possa focar no que realmente importa: viver.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <DollarSign className="w-8 h-8 text-black" />,
                title: "Controle de Fluxo",
                desc: "Visualize claramente suas entradas e saídas. Saiba exatamente quanto sobra no final do mês.",
                color: "bg-custom-gold"
              },
              {
                icon: <PieChart className="w-8 h-8 text-black" />,
                title: "Gráficos Inteligentes",
                desc: "Entenda seus hábitos de consumo com gráficos visuais e intuitivos. A informação é poder.",
                color: "bg-custom-gold"
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-black" />,
                title: "Metas Financeiras",
                desc: "Defina objetivos e acompanhe seu progresso. A motivação que você precisa para continuar.",
                color: "bg-custom-gold"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-custom-card p-8 rounded-custom shadow-custom hover:shadow-2xl transition duration-300 border border-custom-color group text-custom-main">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-custom group-hover:rotate-6 transition duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-custom-main mb-3">
                  {feature.title}
                </h3>
                <p className="text-custom-main opacity-80 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-custom-card border-t border-b border-custom-color text-custom-main overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-custom-gold/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-custom-gold/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Comece sua transformação hoje
          </h2>
          <p className="text-xl text-custom-main opacity-80 mb-10 max-w-2xl mx-auto">
            Não espere o "momento perfeito". O melhor momento para plantar uma árvore foi há 20 anos.
            O segundo melhor momento é agora.
          </p>

          <button
            onClick={() => navigate('/cadastro')}
            className="px-10 py-5 bg-custom-gold text-black rounded-full font-bold text-xl hover:opacity-90 hover:shadow-custom transform hover:scale-105 transition"
          >
            Criar Minha Conta Gratuita
          </button>

          <p className="mt-6 text-sm text-custom-main opacity-70">
            Junte-se a mais de 5.000 pessoas que já mudaram de vida.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-custom-card text-custom-main opacity-80 py-12 border-t border-custom-color">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Wallet className="w-6 h-6 text-custom-gold" />
              <span className="text-lg font-bold text-custom-main">Meu Bolso</span>
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
