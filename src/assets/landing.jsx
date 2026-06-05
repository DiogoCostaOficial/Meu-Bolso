// src/pages/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Shield,
  PieChart,
  Users,
  Target,
  CheckCircle,
  ArrowRight,
  DollarSign,
  CreditCard,
  BarChart3,
  Wallet,
  Star
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header/Navbar */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meu Bolso
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#funcionalidades" className="text-gray-700 hover:text-blue-600 transition">
              Funcionalidades
            </a>
            <a href="#beneficios" className="text-gray-700 hover:text-blue-600 transition">
              Benefícios
            </a>
            <a href="#depoimentos" className="text-gray-700 hover:text-blue-600 transition">
              Depoimentos
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/cadastro')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition"
            >
              Criar Conta
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                ✨ Controle Financeiro Inteligente
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Organize suas
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  finanças pessoais
                </span>
                e familiares
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Tenha controle total sobre receitas, despesas e orçamento.
                Tome decisões financeiras mais inteligentes com relatórios detalhados.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/cadastro')}
                  className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition"
                >
                  Já tenho conta
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-blue-600">100%</div>
                  <div className="text-sm text-gray-600">Gratuito</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">Seguro</div>
                  <div className="text-sm text-gray-600">Seus dados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">Fácil</div>
                  <div className="text-sm text-gray-600">De usar</div>
                </div>
              </div>
            </div>

            {/* Right Content - Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  {/* Mock Dashboard */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">Resumo Mensal</h3>
                    <span className="text-green-600 font-semibold">+15%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                      <div className="text-sm text-gray-600">Receitas</div>
                      <div className="text-xl font-bold text-gray-800">R$ 5.240</div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-xl">
                      <CreditCard className="w-6 h-6 text-red-600 mb-2" />
                      <div className="text-sm text-gray-600">Despesas</div>
                      <div className="text-xl font-bold text-gray-800">R$ 3.180</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Economia</span>
                      <span className="text-sm font-semibold text-blue-600">39%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: '39%' }}></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <BarChart3 className="w-full h-24 text-gray-300" />
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold">Meta atingida!</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold">100% Seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Poderosas
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para ter controle total das suas finanças
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Controle de Receitas
              </h3>
              <p className="text-gray-600">
                Registre todas as suas fontes de renda e acompanhe seu crescimento financeiro mês a mês.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Gestão de Despesas
              </h3>
              <p className="text-gray-600">
                Categorize e monitore todos os seus gastos para identificar onde pode economizar.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <PieChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Relatórios Visuais
              </h3>
              <p className="text-gray-600">
                Gráficos e dashboards interativos para visualizar sua saúde financeira de forma clara.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Metas e Orçamento
              </h3>
              <p className="text-gray-600">
                Defina objetivos financeiros e crie orçamentos para alcançar suas metas mais rápido.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-pink-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Controle Familiar
              </h3>
              <p className="text-gray-600">
                Gerencie as finanças de toda a família em um só lugar, com segurança e privacidade.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Segurança Total
              </h3>
              <p className="text-gray-600">
                Seus dados são criptografados e protegidos com as melhores práticas de segurança.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Image/Illustration */}
            <div className="order-2 md:order-1">
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Por que escolher o Meu Bolso?
                </h3>

                <div className="space-y-4">
                  {[
                    'Interface intuitiva e fácil de usar',
                    'Acesso de qualquer dispositivo',
                    'Relatórios detalhados e personalizáveis',
                    'Backup automático dos seus dados',
                    'Suporte dedicado sempre disponível',
                    'Atualizações constantes e gratuitas'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                  <div className="text-3xl font-bold mb-2">100% Gratuito</div>
                  <p className="text-blue-100">
                    Todas as funcionalidades sem custo algum. Para sempre.
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="order-1 md:order-2 space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Transforme sua vida financeira
                </h2>
                <p className="text-xl text-gray-600">
                  Milhares de pessoas já estão no controle das suas finanças.
                  Junte-se a elas e alcance seus objetivos financeiros!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
                  <div className="text-gray-600">Satisfação dos usuários</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-4xl font-bold text-purple-600 mb-2">5K+</div>
                  <div className="text-gray-600">Usuários ativos</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">R$ 2M+</div>
                  <div className="text-gray-600">Economizados</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-gray-600">Suporte disponível</div>
                </div>
              </div>

              <button
                onClick={() => navigate('/cadastro')}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition"
              >
                Começar Agora Gratuitamente
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos usuários dizem
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de pessoas que transformaram suas finanças
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "Finalmente consegui organizar minhas finanças! O Meu Bolso me ajudou a economizar 30% do meu salário em apenas 3 meses."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  MC
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">Maria Clara</div>
                  <div className="text-sm text-gray-600">Professora</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "Interface super intuitiva! Minha esposa e eu conseguimos gerenciar as contas da família sem complicação."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  RS
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">Roberto Silva</div>
                  <div className="text-sm text-gray-600">Engenheiro</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "Os relatórios são incríveis! Agora sei exatamente para onde vai cada centavo e consigo planejar melhor meu futuro."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  AS
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">Ana Santos</div>
                  <div className="text-sm text-gray-600">Empresária</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para transformar suas finanças?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já estão no controle total do seu dinheiro.
            É gratuito e leva menos de 2 minutos!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/cadastro')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition"
            >
              Criar Conta Gratuita
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Já tenho conta
            </button>
          </div>

          <p className="text-blue-100 mt-6">
            ✨ Sem cartão de crédito necessário • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Wallet className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold">Meu Bolso</span>
              </div>
              <p className="text-gray-400">
                Controle financeiro inteligente para você e sua família.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#funcionalidades" className="hover:text-white transition">Funcionalidades</a></li>
                <li><a href="#beneficios" className="hover:text-white transition">Benefícios</a></li>
                <li><a href="#depoimentos" className="hover:text-white transition">Depoimentos</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition">Contato</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition">Segurança</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Meu Bolso. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
