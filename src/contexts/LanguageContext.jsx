import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const LANGUAGES = [
  {
    code: 'pt-BR',
    short: 'PT-BR',
    name: 'Português (Brasil)',
    nativeName: 'Português (BR)',
    flag: '🇧🇷',
    featured: true,
    region: 'América do Sul'
  },
  {
    code: 'en',
    short: 'EN',
    name: 'Inglês',
    nativeName: 'English',
    flag: '🇺🇸',
    featured: true,
    region: 'Global / Américas'
  },
  {
    code: 'es',
    short: 'ES',
    name: 'Espanhol',
    nativeName: 'Español',
    flag: '🇪🇸',
    featured: true,
    region: 'América do Sul'
  },
  {
    code: 'pt-PT',
    short: 'PT-PT',
    name: 'Português (Portugal)',
    nativeName: 'Português (PT)',
    flag: '🇵🇹',
    featured: false,
    region: 'Europa'
  },
  {
    code: 'it',
    short: 'IT',
    name: 'Italiano',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    featured: false,
    region: 'Europa'
  },
  {
    code: 'zh',
    short: 'ZH',
    name: 'Mandarim',
    nativeName: '中文 (普通话)',
    flag: '🇨🇳',
    featured: false,
    region: 'Ásia'
  },
  {
    code: 'fr',
    short: 'FR',
    name: 'Francês',
    nativeName: 'Français',
    flag: '🇫🇷',
    featured: false,
    region: 'Europa'
  },
  {
    code: 'de',
    short: 'DE',
    name: 'Alemão',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    featured: false,
    region: 'Europa'
  }
];

export const FEATURED_LANGUAGES = LANGUAGES.filter((l) => l.featured);
export const OTHER_LANGUAGES = LANGUAGES.filter((l) => !l.featured);

// Dicionário de frases e termos de interface mapeados a partir do Português-BR para os outros 7 idiomas
// Índices do array: [pt-PT, en, es, it, zh, fr, de]
const PHRASE_MAP = {
  // Geral & Navegação
  'Gestão Financeira Inteligente': [
    'Gestão Financeira Inteligente',
    'Smart Financial Management',
    'Gestión Financiera Inteligente',
    'Gestione Finanziaria Intelligente',
    '智能财务管理',
    'Gestion Financière Intelligente',
    'Intelligentes Finanzmanagement'
  ],
  'Painel Admin': [
    'Painel Admin',
    'Admin Panel',
    'Panel de Admin',
    'Pannello Admin',
    '管理面板',
    'Panneau Admin',
    'Admin-Bereich'
  ],
  'Dashboard': [
    'Painel Principal',
    'Dashboard',
    'Panel Principal',
    'Cruscotto',
    '仪表盘',
    'Tableau de bord',
    'Dashboard'
  ],
  'Orçamento': [
    'Orçamento',
    'Budget',
    'Presupuesto',
    'Budget',
    '预算',
    'Budget',
    'Budget'
  ],
  'Receitas': [
    'Rendimentos',
    'Income',
    'Ingresos',
    'Entrate',
    '收入',
    'Revenus',
    'Einnahmen'
  ],
  'Despesas': [
    'Despesas',
    'Expenses',
    'Gastos',
    'Spese',
    '支出',
    'Dépenses',
    'Ausgaben'
  ],
  'Cartões': [
    'Cartões',
    'Cards',
    'Tarjetas',
    'Carte',
    '银行卡',
    'Cartes',
    'Karten'
  ],
  'Viagens': [
    'Viagens',
    'Trips & Travel',
    'Viajes',
    'Viaggi',
    '旅行计划',
    'Voyages',
    'Reisen'
  ],
  'Relatórios': [
    'Relatórios',
    'Reports',
    'Informes',
    'Report',
    '报表',
    'Rapports',
    'Berichte'
  ],
  'DRE': [
    'Demonstração (DRE)',
    'P&L Statement',
    'Estado de Resultados',
    'Conto Economico',
    '损益表 (DRE)',
    'Compte de Résultat',
    'GuV-Rechnung'
  ],
  'Backup': [
    'Cópia de Segurança',
    'Backup',
    'Copia de Seguridad',
    'Backup',
    '数据备份',
    'Sauvegarde',
    'Datensicherung'
  ],
  'Restauração': [
    'Restauro',
    'Restore',
    'Restauración',
    'Ripristino',
    '系统恢复',
    'Restauration',
    'Wiederherstellung'
  ],
  'Configurações': [
    'Definições',
    'Settings',
    'Configuración',
    'Impostazioni',
    '设置',
    'Paramètres',
    'Einstellungen'
  ],
  'Ajuda FIN': [
    'Ajuda FIN',
    'FIN Help',
    'Ayuda FIN',
    'Aiuto FIN',
    'FIN 助手',
    'Aide FIN',
    'FIN Hilfe'
  ],
  'Ativar': [
    'Ativar',
    'Activate',
    'Activar',
    'Attiva',
    '启用',
    'Activer',
    'Aktivieren'
  ],
  'Branco com Dourado': [
    'Branco com Dourado',
    'Light Gold Theme',
    'Blanco con Dorado',
    'Bianco e Oro',
    '浅色金主题',
    'Blanc et Or',
    'Weiß mit Gold'
  ],
  'Preto com Dourado': [
    'Preto com Dourado',
    'Dark Gold Theme',
    'Negro con Dorado',
    'Nero e Oro',
    '深色金主题',
    'Noir et Or',
    'Schwarz mit Gold'
  ],
  'Sair': [
    'Terminar Sessão',
    'Sign Out',
    'Cerrar Sesión',
    'Esci',
    '退出登录',
    'Déconnexion',
    'Abmelden'
  ],
  'Entrar': [
    'Iniciar Sessão',
    'Sign In',
    'Iniciar Sesión',
    'Accedi',
    '登录',
    'Connexion',
    'Anmelden'
  ],
  'Criar Conta': [
    'Criar Conta',
    'Create Account',
    'Crear Cuenta',
    'Crea Account',
    '创建账户',
    'Créer un Compte',
    'Konto erstellen'
  ],
  'Novidades': [
    'Novidades',
    'What’s New',
    'Novedades',
    'Novità',
    '最新动态',
    'Nouveautés',
    'Neuigkeiten'
  ],
  'Por que controlar?': [
    'Porquê controlar?',
    'Why Track?',
    '¿Por qué controlar?',
    'Perché controllare?',
    '为什么要理财？',
    'Pourquoi gérer ?',
    'Warum kontrollieren?'
  ],
  'Funcionalidades': [
    'Funcionalidades',
    'Features',
    'Funcionalidades',
    'Funzionalità',
    '功能特点',
    'Fonctionnalités',
    'Funktionen'
  ],

  // Landing Page
  '🚀 Transforme sua vida hoje': [
    '🚀 Transforme a sua vida hoje',
    '🚀 Transform your life today',
    '🚀 Transforma tu vida hoy',
    '🚀 Trasforma la tua vita oggi',
    '🚀 今天改变你的生活',
    '🚀 Transformez votre vie aujourd’hui',
    '🚀 Verändere dein Leben heute'
  ],
  'Assuma o Controle do Seu': [
    'Assuma o Controlo do Seu',
    'Take Control of Your',
    'Toma el Control de Tu',
    'Prendi il Controllo del Tuo',
    '掌控您的',
    'Prenez le Contrôle de Votre',
    'Übernehmen Sie die Kontrolle über Ihr'
  ],
  'Destino Financeiro': [
    'Destino Financeiro',
    'Financial Destiny',
    'Destino Financiero',
    'Destino Finanziario',
    '财务未来',
    'Destin Financier',
    'Finanzielles Schicksal'
  ],
  'A liberdade que você sonha começa com a organização que você faz hoje. Não deixe seu dinheiro controlar você. Assuma o comando e construa o futuro que você merece.': [
    'A liberdade com que sonha começa com a organização que faz hoje. Não deixe o seu dinheiro controlá-lo. Assuma o comando e construa o futuro que merece.',
    'The freedom you dream of starts with the organization you build today. Don’t let money control you. Take command and build the future you deserve.',
    'La libertad que sueñas comienza con la organización que haces hoy. No dejes que el dinero te controle. Toma el mando y construye el futuro que mereces.',
    'La libertà che sogni inizia con l’organizzazione che fai oggi. Non lasciare che il denaro ti controlli. Prendi il comando e costruisci il futuro che meriti.',
    '您梦想的自由始于今天的规划。不要让金钱控制您，掌握主动权，打造您应得的未来。',
    'La liberté dont vous rêvez commence par l’organisation d’aujourd’hui. Ne laissez pas l’argent vous contrôler. Prenez les commandes de votre avenir.',
    'Die Freiheit, von der Sie träumen, beginnt mit der Organisation von heute. Lassen Sie sich nicht vom Geld kontrollieren. Bauen Sie Ihre Zukunft auf.'
  ],
  'Começar Minha Jornada': [
    'Começar a Minha Jornada',
    'Start My Journey',
    'Comenzar Mi Jornada',
    'Inizia il Mio Percorso',
    '开启我的旅程',
    'Commencer Mon Parcours',
    'Meine Reise starten'
  ],
  '"O primeiro passo para a riqueza é o controle."': [
    '"O primeiro passo para a riqueza é o controlo."',
    '"The first step to wealth is control."',
    '"El primer paso hacia la riqueza es el control."',
    '"Il primo passo verso la ricchezza è il controllo."',
    '“财富的第一步是掌控。”',
    '« Le premier pas vers la richesse est le contrôle. »',
    '„Der erste Schritt zum Wohlstand ist Kontrolle.“'
  ],
  'Novidades & Atualizações Recentes': [
    'Novidades & Atualizações Recentes',
    'Latest News & Updates',
    'Novedades y Actualizaciones Recientes',
    'Novità e Aggiornamenti Recenti',
    '最新功能与更新',
    'Nouveautés et Mises à Jour Récentes',
    'Neuigkeiten & Aktuelle Updates'
  ],
  'O Meu Bolso evoluiu! Veja o que acabou de chegar': [
    'O Meu Bolso evoluiu! Veja o que acabou de chegar',
    'Meu Bolso has evolved! See what just arrived',
    '¡Meu Bolso evolucionó! Mira lo que acaba de llegar',
    'Meu Bolso si è evoluto! Scopri le ultime novità',
    'Meu Bolso 全新升级！看看有哪些新功能',
    'Meu Bolso a évolué ! Découvrez les nouveautés',
    'Meu Bolso hat sich weiterentwickelt! Entdecken Sie das Neue'
  ],
  'Novas ferramentas inteligentes para deixar seu controle financeiro mais rápido, divertido e próximo de você.': [
    'Novas ferramentas inteligentes para tornar o seu controlo financeiro mais rápido, divertido e próximo de si.',
    'Smart new tools to make your financial tracking faster, more fun, and closer to you.',
    'Nuevas herramientas inteligentes para que tu control financiero sea más rápido, divertido y cercano.',
    'Nuovi strumenti intelligenti per rendere il controllo finanziario più rapido, divertente e vicino a te.',
    '全新智能工具，让您的财务管理更快捷、更有趣、更贴心。',
    'De nouveaux outils intelligents pour rendre votre gestion financière plus rapide, ludique et proche de vous.',
    'Neue intelligente Tools, die Ihre Finanzkontrolle schneller, unterhaltsamer und einfacher machen.'
  ],
  'FIN: Seu Melhor Amigo Financeiro': [
    'FIN: O Seu Melhor Amigo Financeiro',
    'FIN: Your Financial Best Friend',
    'FIN: Tu Mejor Amigo Financiero',
    'FIN: Il Tuo Migliore Amico Finanziario',
    'FIN：您的最佳财务好友',
    'FIN : Votre Meilleur Ami Financier',
    'FIN: Ihr bester Finanzfreund'
  ],
  'Quiz: "Posso Gastar, Amigo?"': [
    'Quiz: "Posso Gastar, Amigo?"',
    'Quiz: "Can I Spend It, Friend?"',
    'Quiz: "¿Puedo Gastar, Amigo?"',
    'Quiz: "Posso Spendere, Amico?"',
    '小测验：“我可以花这笔钱吗？”',
    'Quiz : « Puis-je dépenser, mon ami ? »',
    'Quiz: „Kann ich das ausgeben, Freund?“'
  ],
  'Acesso Rápido Google & Outlook': [
    'Acesso Rápido Google & Outlook',
    'Google & Outlook Quick Access',
    'Acceso Rápido Google y Outlook',
    'Accesso Rapido Google e Outlook',
    'Google 与 Outlook 快速登录',
    'Accès Rapide Google et Outlook',
    'Schnellzugriff mit Google & Outlook'
  ],
  'Regra de Ouro: Dê Nome ao Dinheiro': [
    'Regra de Ouro: Dê Nome ao Dinheiro',
    'Golden Rule: Give Every Dollar a Name',
    'Regla de Oro: Ponle Nombre a tu Dinero',
    'Regola d’Oro: Dai un Nome al Tuo Denaro',
    '黄金法则：为每一分钱命名',
    'Règle d’Or : Donnez un Nom à Votre Argent',
    'Goldene Regel: Geben Sie Ihrem Geld einen Namen'
  ],
  'Por que o controle financeiro muda tudo?': [
    'Porque é que o controlo financeiro muda tudo?',
    'Why does financial control change everything?',
    '¿Por qué el control financiero lo cambia todo?',
    'Perché il controllo finanziario cambia tutto?',
    '为什么财务控制能改变一切？',
    'Pourquoi le contrôle financier change-t-il tout ?',
    'Warum verändert Finanzkontrolle alles?'
  ],
  'Paz de Espírito': [
    'Paz de Espírito',
    'Peace of Mind',
    'Paz Mental',
    'Tranquillità',
    '内心平静',
    'Tranquillité d’Esprit',
    'Seelenfrieden'
  ],
  'Realização de Sonhos': [
    'Realização de Sonhos',
    'Achieving Dreams',
    'Realización de Sueños',
    'Realizzazione dei Sogni',
    '实现梦想',
    'Réalisation de Rêves',
    'Träume verwirklichen'
  ],
  'Crescimento Real': [
    'Crescimento Real',
    'Real Growth',
    'Crecimiento Real',
    'Crescita Reale',
    '真实增长',
    'Croissance Réelle',
    'Echtes Wachstum'
  ],
  'Pronto para assumir o controle?': [
    'Pronto para assumir o controlo?',
    'Ready to take control?',
    '¿Listo para tomar el control?',
    'Pronto a prendere il controllo?',
    '准备好掌控您的财务了吗？',
    'Prêt à prendre le contrôle ?',
    'Bereit, die Kontrolle zu übernehmen?'
  ],
  'Criar Minha Conta Grátis': [
    'Criar a Minha Conta Grátis',
    'Create My Free Account',
    'Crear Mi Cuenta Gratis',
    'Crea il Mio Account Gratuito',
    '免费创建我的账户',
    'Créer Mon Compte Gratuit',
    'Mein kostenloses Konto erstellen'
  ],

  // Login & Cadastro (Auth)
  'Acessar conta': [
    'Aceder à conta',
    'Sign in to account',
    'Acceder a la cuenta',
    'Accedi all’account',
    '登录账户',
    'Accéder au compte',
    'Konto-Zugang'
  ],
  'Acesso Restrito': [
    'Acesso Restrito',
    'Restricted Access',
    'Acceso Restringido',
    'Accesso Riservato',
    '受限访问',
    'Accès Restreint',
    'Eingeschränkter Zugang'
  ],
  'Meu Bolso Hub': [
    'Meu Bolso Hub',
    'Meu Bolso Hub',
    'Meu Bolso Hub',
    'Meu Bolso Hub',
    'Meu Bolso 中心',
    'Meu Bolso Hub',
    'Meu Bolso Hub'
  ],
  'Planeje cada conquista, dê nome ao seu dinheiro e acompanhe sua evolução com simplicidade.': [
    'Planeie cada conquista, dê nome ao seu dinheiro e acompanhe a sua evolução com simplicidade.',
    'Plan every milestone, give your money a purpose, and track your financial growth with ease.',
    'Planifica cada logro, ponle nombre a tu dinero y sigue tu evolución con total simplicidad.',
    'Pianifica ogni traguardo, dai un nome ai tuoi soldi e segui la tua crescita con semplicità.',
    '轻松规划每一个目标，为每一笔钱赋予使命，随时掌握您的财富增长。',
    'Planifiez chaque réussite, donnez un nom à votre argent et suivez votre évolution simplement.',
    'Planen Sie jeden Erfolg, geben Sie Ihrem Geld einen Namen und verfolgen Sie Ihr Wachstum ganz einfach.'
  ],
  'Entre com suas credenciais administrativas.': [
    'Introduza as suas credenciais administrativas.',
    'Enter your administrative credentials.',
    'Ingresa con tus credenciales administrativas.',
    'Inserisci le tue credenziali amministrative.',
    '请输入您的管理员凭据。',
    'Entrez vos identifiants administrateur.',
    'Geben Sie Ihre Administrator-Zugangsdaten ein.'
  ],
  'Login padrão': [
    'Login padrão',
    'Standard login',
    'Inicio estándar',
    'Accesso standard',
    '普通登录',
    'Connexion standard',
    'Standard-Login'
  ],
  'E-mail*': [
    'E-mail*',
    'Email*',
    'Correo electrónico*',
    'E-mail*',
    '电子邮箱*',
    'E-mail*',
    'E-Mail*'
  ],
  'Senha*': [
    'Palavra-passe*',
    'Password*',
    'Contraseña*',
    'Password*',
    '密码*',
    'Mot de passe*',
    'Passwort*'
  ],
  'Confirmar Senha*': [
    'Confirmar Palavra-passe*',
    'Confirm Password*',
    'Confirmar Contraseña*',
    'Conferma Password*',
    '确认密码*',
    'Confirmer le mot de passe*',
    'Passwort bestätigen*'
  ],
  'Nome Completo*': [
    'Nome Completo*',
    'Full Name*',
    'Nombre Completo*',
    'Nome Completo*',
    '全名*',
    'Nom Complet*',
    'Vollständiger Name*'
  ],
  'Esqueceu a senha?': [
    'Esqueceu-se da palavra-passe?',
    'Forgot password?',
    '¿Olvidaste tu contraseña?',
    'Password dimenticata?',
    '忘记密码？',
    'Mot de passe oublié ?',
    'Passwort vergessen?'
  ],
  'Continuar': [
    'Continuar',
    'Continue',
    'Continuar',
    'Continua',
    '继续',
    'Continuer',
    'Weiter'
  ],
  'Entrando...': [
    'A entrar...',
    'Signing in...',
    'Ingresando...',
    'Accesso in corso...',
    '正在登录...',
    'Connexion...',
    'Anmeldung läuft...'
  ],
  'Ou acesse rapidamente sem senha:': [
    'Ou aceda rapidamente sem palavra-passe:',
    'Or sign in quickly without a password:',
    'O accede rápidamente sin contraseña:',
    'Oppure accedi rapidamente senza password:',
    '或免密快速登录：',
    'Ou accédez rapidement sans mot de passe :',
    'Oder schnell ohne Passwort anmelden:'
  ],
  'Continuar com Outlook': [
    'Continuar com Outlook',
    'Continue with Outlook',
    'Continuar con Outlook',
    'Continua con Outlook',
    '使用 Outlook 继续',
    'Continuer avec Outlook',
    'Mit Outlook fortfahren'
  ],
  'Ainda não tem conta?': [
    'Ainda não tem conta?',
    'Don’t have an account yet?',
    '¿Aún no tienes cuenta?',
    'Non hai ancora un account?',
    '还没有账户？',
    'Vous n’avez pas de compte ?',
    'Noch kein Konto?'
  ],
  'Cadastre-se grátis': [
    'Registe-se grátis',
    'Sign up free',
    'Regístrate gratis',
    'Registrati gratis',
    '免费注册',
    'Inscrivez-vous gratuitement',
    'Kostenlos registrieren'
  ],
  '← Página inicial': [
    '← Página inicial',
    '← Home page',
    '← Página de inicio',
    '← Pagina iniziale',
    '← 返回首页',
    '← Page d’accueil',
    '← Startseite'
  ],
  'Criar conta gratuita': [
    'Criar conta gratuita',
    'Create free account',
    'Crear cuenta gratuita',
    'Crea account gratuito',
    '创建免费账户',
    'Créer un compte gratuit',
    'Kostenloses Konto erstellen'
  ],
  'Criar Conta Gratuita': [
    'Criar Conta Gratuita',
    'Create Free Account',
    'Crear Cuenta Gratuita',
    'Crea Account Gratuito',
    '创建免费账户',
    'Créer un Compte Gratuit',
    'Kostenloses Konto erstellen'
  ],
  'Comece no Meu Bolso': [
    'Comece no Meu Bolso',
    'Get Started with Meu Bolso',
    'Comienza en Meu Bolso',
    'Inizia su Meu Bolso',
    '开始使用 Meu Bolso',
    'Commencez sur Meu Bolso',
    'Starten Sie mit Meu Bolso'
  ],
  'Dê nome ao seu dinheiro, organize seus objetivos e conquiste seus sonhos com tranquilidade.': [
    'Dê nome ao seu dinheiro, organize os seus objetivos e conquiste os seus sonhos com tranquilidade.',
    'Give your money a name, organize your goals, and achieve your dreams with peace of mind.',
    'Ponle nombre a tu dinero, organiza tus objetivos y conquista tus sueños con tranquilidad.',
    'Dai un nome al tuo denaro, organizza i tuoi obiettivi e realizza i tuoi sogni con serenità.',
    '为您的每一分钱命名，规划您的目标，从容实现您的梦想。',
    'Donnez un nom à votre argent, organisez vos objectifs et réalisez vos rêves en toute sérénité.',
    'Geben Sie Ihrem Geld einen Namen, organisieren Sie Ihre Ziele und verwirklichen Sie Ihre Träume.'
  ],
  'Já tenho conta': [
    'Já tenho conta',
    'I already have an account',
    'Ya tengo cuenta',
    'Ho già un account',
    '已有账户',
    'J’ai déjà un compte',
    'Ich habe bereits ein Konto'
  ],
  'Já tem uma conta?': [
    'Já tem uma conta?',
    'Already have an account?',
    '¿Ya tienes una cuenta?',
    'Hai già un account?',
    '已经有账户了？',
    'Vous avez déjà un compte ?',
    'Haben Sie bereits ein Konto?'
  ],
  'Faça login': [
    'Inicie sessão',
    'Sign in',
    'Inicia sesión',
    'Accedi',
    '立即登录',
    'Connectez-vous',
    'Anmelden'
  ],
  'Ou crie sua conta rapidamente com:': [
    'Ou crie a sua conta rapidamente com:',
    'Or create your account quickly with:',
    'O crea tu cuenta rápidamente con:',
    'Oppure crea rapidamente il tuo account con:',
    '或通过以下方式快速创建账户：',
    'Ou créez rapidement votre compte avec :',
    'Oder erstellen Sie Ihr Konto schnell mit:'
  ],

  // Slideshow de Apresentação (Login e Cadastro)
  'Vida em Casal': [
    'Vida em Casal',
    'Couple Life',
    'Vida en Pareja',
    'Vita di Coppia',
    '二人世界',
    'Vie de Couple',
    'Paarleben'
  ],
  'Conquistas a Dois': [
    'Conquistas a Dois',
    'Achieving Together',
    'Logros en Pareja',
    'Traguardi in Due',
    '携手共筑梦想',
    'Réussir à Deux',
    'Gemeinsame Erfolge'
  ],
  'Com o Meu Bolso, vocês dão nome a cada real, deixam o estresse das contas para trás e tiram os grandes sonhos do papel em perfeita sintonia.': [
    'Com o Meu Bolso, dão nome a cada euro ou real, deixam o stress das contas para trás e tiram os grandes sonhos do papel em perfeita sintonia.',
    'With Meu Bolso, you give every dollar a purpose, leave bill stress behind, and bring your biggest dreams to life in harmony.',
    'Con Meu Bolso, le ponen nombre a cada peso, dejan atrás el estrés de las cuentas y hacen realidad sus grandes sueños en sintonía.',
    'Con Meu Bolso, date valore a ogni risparmio, lasciate indietro lo stress delle bollette e realizzate i vostri grandi sogni insieme.',
    '通过 Meu Bolso，你们可以为每一笔钱规划用途，告别账单压力，默契携手实现人生梦想。',
    'Avec Meu Bolso, donnez un sens à chaque euro, oubliez le stress des factures et concrétisez vos grands projets à deux.',
    'Mit Meu Bolso geben Sie jedem Euro einen Zweck, lassen Rechnungsstress hinter sich und verwirklichen gemeinsam Ihre großen Träume.'
  ],
  'Vida de Solteiro': [
    'Vida de Solteiro',
    'Single Life',
    'Vida de Soltero',
    'Vita da Single',
    '单身生活',
    'Vie en Solo',
    'Single-Leben'
  ],
  'Liberdade & Paz': [
    'Liberdade & Paz',
    'Freedom & Peace',
    'Libertad y Paz',
    'Libertà e Serenità',
    '自由与从容',
    'Liberté & Sérénité',
    'Freiheit & Ruhe'
  ],
  'Saiba exatamente para onde vai o seu dinheiro, elimine os sustos na fatura e veja seu patrimônio crescer mês a mês com total autonomia.': [
    'Saiba exatamente para onde vai o seu dinheiro, elimine os sustos na fatura e veja o seu património crescer mês a mês com total autonomia.',
    'Know exactly where your money goes, eliminate credit card surprises, and watch your net worth grow month after month with full autonomy.',
    'Sabe exactamente a dónde va tu dinero, elimina los sustos en la factura y mira cómo crece tu patrimonio mes a mes con total autonomía.',
    'Sappi esattamente dove vanno i tuoi soldi, elimina le sorprese sulle fatture e guarda crescere il tuo patrimonio mese dopo mese.',
    '清楚掌握每一笔资金去向，告别账单惊吓，完全自主地见证您的资产月月增长。',
    'Sachez exactement où va votre argent, éliminez les mauvaises surprises et faites fructifier votre patrimoine en toute autonomie.',
    'Wissen Sie genau, wohin Ihr Geld fließt, vermeiden Sie Rechnungsüberraschungen und lassen Sie Ihr Vermögen Monat für Monat wachsen.'
  ],
  'Vida em Família': [
    'Vida em Família',
    'Family Life',
    'Vida en Familia',
    'Vita in Famiglia',
    '家庭生活',
    'Vie de Famille',
    'Familienleben'
  ],
  'Futuro Seguro': [
    'Futuro Seguro',
    'Secure Future',
    'Futuro Seguro',
    'Futuro Sicuro',
    '稳健未来',
    'Avenir Sûr',
    'Sichere Zukunft'
  ],
  'Organize o orçamento da casa de forma simples, conte com as dicas do amigo FIN e construa a tranquilidade que sua família merece.': [
    'Organize o orçamento da casa de forma simples, conte com as dicas do amigo FIN e construa a tranquilidade que a sua família merece.',
    'Organize your household budget effortlessly, count on friendly tips from FIN, and build the peace of mind your family deserves.',
    'Organiza el presupuesto del hogar de forma sencilla, cuenta con los consejos del amigo FIN y construye la tranquilidad que tu familia merece.',
    'Organizza il budget familiare in modo semplice, segui i consigli dell’amico FIN e costruisci la serenità che la tua famiglia merita.',
    '轻松整理家庭预算，借助好友 FIN 的贴心建议，为您的家人打造安心无忧的未来。',
    'Organisez le budget de la maison simplement, profitez des conseils de votre ami FIN et offrez à votre famille la sérénité qu’elle mérite.',
    'Organisieren Sie das Haushaltsbudget ganz einfach, nutzen Sie die Tipps von Freund FIN und schaffen Sie Sicherheit für Ihre Familie.'
  ],
  'Campo Exclusivo de Viagens': [
    'Módulo Exclusivo de Viagens',
    'Exclusive Travel Planner',
    'Módulo Exclusivo de Viajes',
    'Modulo Esclusivo Viaggi',
    '专属旅行规划模块',
    'Module Exclusif de Voyages',
    'Exklusiver Reiseplaner'
  ],
  'Viagem dos Sonhos': [
    'Viagem de Sonho',
    'Dream Vacation',
    'Viaje de tus Sueños',
    'Viaggio da Sogno',
    '梦想之旅',
    'Voyage de Rêve',
    'Traumreise'
  ],
  'Planeje destinos, passagens, hospedagem e orçamento no nosso módulo exclusivo de Viagens para viver momentos inesquecíveis sem voltar com dívidas.': [
    'Planeie destinos, bilhetes, alojamento e orçamento no nosso módulo exclusivo de Viagens para viver momentos inesquecíveis sem regressar com dívidas.',
    'Plan destinations, flights, lodging, and daily budgets in our exclusive Travel module to live unforgettable moments and return debt-free.',
    'Planifica destinos, pasajes, hospedaje y presupuesto en nuestro módulo exclusivo de Viajes para vivir momentos inolvidables sin volver con deudas.',
    'Pianifica destinazioni, voli, alloggi e budget nel nostro modulo esclusivo Viaggi per vivere momenti indimenticabili senza tornare con debiti.',
    '在我们的专属旅行模块中规划目的地、机票、住宿和预算，尽享难忘旅程，零负债轻松归来。',
    'Planifiez destinations, billets, hébergement et budget dans notre module exclusif Voyages pour vivre des moments inoubliables sans dettes au retour.',
    'Planen Sie Reiseziele, Flüge, Unterkunft und Budget in unserem exklusiven Reisemodul für unvergessliche Momente ganz ohne Schulden.'
  ],

  // Termos comuns das páginas internas (Dashboard, Receitas, Despesas, Cartões, Viagens, Relatórios, Configurações)
  'Visão Geral': [
    'Visão Geral',
    'Overview',
    'Resumen General',
    'Panoramica',
    '总览',
    'Vue d’ensemble',
    'Übersicht'
  ],
  'Saldo Atual': [
    'Saldo Atual',
    'Current Balance',
    'Saldo Actual',
    'Saldo Attuale',
    '当前余额',
    'Solde Actuel',
    'Aktueller Kontostand'
  ],
  'Total de Receitas': [
    'Total de Rendimentos',
    'Total Income',
    'Total de Ingresos',
    'Totale Entrate',
    '总收入',
    'Total des Revenus',
    'Gesamteinnahmen'
  ],
  'Total de Despesas': [
    'Total de Despesas',
    'Total Expenses',
    'Total de Gastos',
    'Totale Spese',
    '总支出',
    'Total des Dépenses',
    'Gesamtausgaben'
  ],
  'Nova Receita': [
    'Novo Rendimento',
    'New Income',
    'Nuevo Ingreso',
    'Nuova Entrata',
    '新增收入',
    'Nouveau Revenu',
    'Neue Einnahme'
  ],
  'Nova Despesa': [
    'Nova Despesa',
    'New Expense',
    'Nuevo Gasto',
    'Nuova Spesa',
    '新增支出',
    'Nouvelle Dépense',
    'Neue Ausgabe'
  ],
  'Novo Cartão': [
    'Novo Cartão',
    'New Card',
    'Nueva Tarjeta',
    'Nuova Carta',
    '新增银行卡',
    'Nouvelle Carte',
    'Neue Karte'
  ],
  'Nova Viagem': [
    'Nova Viagem',
    'New Trip',
    'Nuevo Viaje',
    'Nuovo Viaggio',
    '新增旅行',
    'Nouveau Voyage',
    'Neue Reise'
  ],
  'Salvar': [
    'Guardar',
    'Save',
    'Guardar',
    'Salva',
    '保存',
    'Enregistrer',
    'Speichern'
  ],
  'Cancelar': [
    'Cancelar',
    'Cancel',
    'Cancelar',
    'Annulla',
    '取消',
    'Annuler',
    'Abbrechen'
  ],
  'Excluir': [
    'Eliminar',
    'Delete',
    'Eliminar',
    'Elimina',
    '删除',
    'Supprimer',
    'Löschen'
  ],
  'Editar': [
    'Editar',
    'Edit',
    'Editar',
    'Modifica',
    '编辑',
    'Modifier',
    'Bearbeiten'
  ],
  'Filtrar': [
    'Filtrar',
    'Filter',
    'Filtrar',
    'Filtra',
    '筛选',
    'Filtrer',
    'Filtern'
  ],
  'Categoria': [
    'Categoria',
    'Category',
    'Categoría',
    'Categoria',
    '类别',
    'Catégorie',
    'Kategorie'
  ],
  'Descrição': [
    'Descrição',
    'Description',
    'Descripción',
    'Descrizione',
    '描述',
    'Description',
    'Beschreibung'
  ],
  'Valor': [
    'Valor',
    'Amount',
    'Monto',
    'Importo',
    '金额',
    'Montant',
    'Betrag'
  ],
  'Data': [
    'Data',
    'Date',
    'Fecha',
    'Data',
    '日期',
    'Date',
    'Datum'
  ],
  'Status': [
    'Estado',
    'Status',
    'Estado',
    'Stato',
    '状态',
    'Statut',
    'Status'
  ],
  'Pago': [
    'Pago',
    'Paid',
    'Pagado',
    'Pagato',
    '已付',
    'Payé',
    'Bezahlt'
  ],
  'Pendente': [
    'Pendente',
    'Pending',
    'Pendiente',
    'In sospeso',
    '待付',
    'En attente',
    'Ausstehend'
  ],
  'Recebido': [
    'Recebido',
    'Received',
    'Recibido',
    'Ricevuto',
    '已收',
    'Reçu',
    'Erhalten'
  ],
  'Idioma': [
    'Idioma',
    'Language',
    'Idioma',
    'Lingua',
    '语言',
    'Langue',
    'Sprache'
  ],
  'Selecionar Idioma': [
    'Selecionar Idioma',
    'Select Language',
    'Seleccionar Idioma',
    'Seleziona Lingua',
    '选择语言',
    'Choisir la Langue',
    'Sprache wählen'
  ],
  'Destaques América do Sul': [
    'Destaques América do Sul',
    'South America Featured',
    'Destacados Sudamérica',
    'In evidenza Sud America',
    '南美精选语言',
    'En vedette Amérique du Sud',
    'Südamerika Empfohlen'
  ],
  'Outros Idiomas': [
    'Outros Idiomas',
    'Other Languages',
    'Otros Idiomas',
    'Altre Lingue',
    '其他语言',
    'Autres Langues',
    'Weitere Sprachen'
  ],
  'Resultado': [
    'Resultado',
    'Result',
    'Resultado',
    'Risultato',
    '成果',
    'Résultat',
    'Ergebnis'
  ],
  'Liberdade Financeira': [
    'Liberdade Financeira',
    'Financial Freedom',
    'Libertad Financiera',
    'Libertà Finanziaria',
    '财务自由',
    'Liberté Financière',
    'Finanzielle Freiheit'
  ],
  'O que há de novo no': [
    'O que há de novo no',
    'What’s new in',
    '¿Qué hay de nuevo en',
    'Cosa c’è di nuovo su',
    '全新动态：',
    'Quoi de neuf sur',
    'Was gibt es Neues bei'
  ],
  'Evoluímos a plataforma para tornar o cuidado com o seu dinheiro mais rápido, inteligente e divertido — desde o primeiro clique.': [
    'Evoluímos a plataforma para tornar o cuidado com o seu dinheiro mais rápido, inteligente e divertido — desde o primeiro clique.',
    'We evolved the platform to make caring for your money faster, smarter, and more fun — from the very first click.',
    'Evolucionamos la plataforma para que cuidar tu dinero sea más rápido, inteligente y divertido — desde el primer clic.',
    'Abbiamo evoluto la piattaforma per rendere la gestione del tuo denaro più rapida, intelligente e divertente fin dal primo clic.',
    '我们全面升级了平台，让您从第一次点击开始，就能更快速、更智能、更有趣地管理财富。',
    'Nous avons fait évoluer la plateforme pour rendre la gestion de votre argent plus rapide, intelligente et ludique dès le premier clic.',
    'Wir haben die Plattform weiterentwickelt, damit der Umgang mit Ihrem Geld vom ersten Klick an schneller, klüger und unterhaltsamer wird.'
  ],
  'Novo Mascote': [
    'Nova Mascote',
    'New Mascot',
    'Nueva Mascota',
    'Nuova Mascotte',
    '全新吉祥物',
    'Nouvelle Mascotte',
    'Neues Maskottchen'
  ],
  'FIN: Seu Melhor Amigo': [
    'FIN: O Seu Melhor Amigo',
    'FIN: Your Best Friend',
    'FIN: Tu Mejor Amigo',
    'FIN: Il Tuo Migliore Amico',
    'FIN：您的最佳好友',
    'FIN : Votre Meilleur Ami',
    'FIN: Ihr bester Freund'
  ],
  'Interativo': [
    'Interativo',
    'Interactive',
    'Interactivo',
    'Interattivo',
    '互动测验',
    'Interactif',
    'Interaktiv'
  ],
  'Quiz: "Posso Gastar?"': [
    'Quiz: "Posso Gastar?"',
    'Quiz: "Can I Spend It?"',
    'Quiz: "¿Puedo Gastar?"',
    'Quiz: "Posso Spendere?"',
    '小测验：“能花这笔钱吗？”',
    'Quiz : « Puis-je dépenser ? »',
    'Quiz: „Kann ich das ausgeben?“'
  ],
  'Acesso Rápido': [
    'Acesso Rápido',
    'Quick Access',
    'Acceso Rápido',
    'Accesso Rapido',
    '快速登录',
    'Accès Rapide',
    'Schnellzugriff'
  ],
  'Login Google & Outlook OTP': [
    'Login Google & Outlook OTP',
    'Google & Outlook OTP Login',
    'Inicio Google y Outlook OTP',
    'Accesso Google e Outlook OTP',
    'Google 与 Outlook 验证码登录',
    'Connexion Google & Outlook OTP',
    'Google & Outlook OTP-Login'
  ],
  'Controle Total': [
    'Controlo Total',
    'Total Control',
    'Control Total',
    'Controllo Totale',
    '全面掌控',
    'Contrôle Total',
    'Volle Kontrolle'
  ],
  'Multimoeda & Status Pago': [
    'Multimoeda & Estado Pago',
    'Multi-Currency & Paid Status',
    'Multimoneda y Estado Pagado',
    'Multivaluta e Stato Pagato',
    '多币种与支付状态',
    'Multidevise & Statut Payé',
    'Mehrwährungs- & Zahlungsstatus'
  ],
  'Durma tranquilo sabendo que suas contas estão em dia e você está preparado para imprevistos.': [
    'Durma tranquilo sabendo que as suas contas estão em dia e que está preparado para imprevistos.',
    'Sleep peacefully knowing your bills are up to date and you are prepared for the unexpected.',
    'Duerme tranquilo sabiendo que tus cuentas están al día y estás preparado para imprevistos.',
    'Dormi sereno sapendo che i tuoi conti sono in ordine e sei pronto agli imprevisti.',
    '账单井井有条，从容应对突发状况，让您每晚安心入眠。',
    'Dormez tranquille en sachant que vos comptes sont à jour et que vous êtes prêt pour les imprévus.',
    'Schlafen Sie ruhig in dem Wissen, dass Ihre Rechnungen bezahlt und Sie auf Unvorhergesehenes vorbereitet sind.'
  ],
  'Transforme metas distantes em planos concretos. A viagem, a casa própria, a aposentadoria tranquila.': [
    'Transforme metas distantes em planos concretos. A viagem, a casa própria, a reforma tranquila.',
    'Turn distant goals into concrete plans. The trip, your own home, a peaceful retirement.',
    'Transforma metas lejanas en planes concretos. El viaje, la casa propia, la jubilación tranquila.',
    'Trasforma obiettivi lontani in piani concreti. Il viaggio, la casa di proprietà, la pensione serena.',
    '将遥远的目标转化为具体的计划：梦想旅行、自有住房、安心退休。',
    'Transformez des objectifs lointains en plans concrets. Le voyage, la maison, la retraite paisible.',
    'Verwandeln Sie ferne Ziele in konkrete Pläne: die Reise, das Eigenheim, den entspannten Ruhestand.'
  ],
  'Vida com Propósito': [
    'Vida com Propósito',
    'Purposeful Living',
    'Vida con Propósito',
    'Vita con uno Scopo',
    '有目标的生活',
    'Une Vie avec un But',
    'Leben mit Sinn'
  ],
  'Gaste com o que realmente importa para você. Corte o supérfluo que não traz felicidade.': [
    'Gaste com o que realmente importa para si. Corte o supérfluo que não traz felicidade.',
    'Spend on what truly matters to you. Cut out the clutter that doesn’t bring happiness.',
    'Gasta en lo que realmente te importa. Elimina lo superfluo que no te trae felicidad.',
    'Spendi per ciò che conta davvero per te. Taglia il superfluo che non porta felicità.',
    '把钱花在真正重要的事情上，砍掉那些不能带来快乐的不必要开销。',
    'Dépensez pour ce qui compte vraiment pour vous. Éliminez le superflu qui n’apporte pas de bonheur.',
    'Geben Sie Geld für das aus, was Ihnen wirklich wichtig ist. Streichen Sie Überflüssiges.'
  ],
  'Ferramentas para o seu Sucesso': [
    'Ferramentas para o seu Sucesso',
    'Tools for Your Success',
    'Herramientas para tu Éxito',
    'Strumenti per il Tuo Successo',
    '助您成功的工具',
    'Des Outils pour Votre Réussite',
    'Werkzeuge für Ihren Erfolg'
  ],
  'Simplificamos a gestão financeira para que você possa focar no que realmente importa: viver.': [
    'Simplificamos a gestão financeira para que se possa focar no que realmente importa: viver.',
    'We simplify financial management so you can focus on what truly matters: living.',
    'Simplificamos la gestión financiera para que puedas enfocarte en lo que realmente importa: vivir.',
    'Semplifichiamo la gestione finanziaria affinché tu possa concentrarti su ciò che conta davvero: vivere.',
    '我们简化财务管理，让您专注于真正重要的事情：享受生活。',
    'Nous simplifions la gestion financière pour que vous puissiez vous concentrer sur l’essentiel : vivre.',
    'Wir vereinfachen das Finanzmanagement, damit Sie sich auf das Wesentliche konzentrieren können: das Leben.'
  ],
  'Controle de Fluxo': [
    'Controlo de Fluxo',
    'Cash Flow Control',
    'Control de Flujo',
    'Controllo del Flusso',
    '现金流控制',
    'Contrôle des Flux',
    'Cashflow-Kontrolle'
  ],
  'Visualize claramente suas entradas e saídas. Saiba exatamente quanto sobra no final do mês.': [
    'Visualize claramente as suas entradas e saídas. Saiba exatamente quanto sobra no final do mês.',
    'Clearly visualize your income and expenses. Know exactly how much is left at the end of the month.',
    'Visualiza claramente tus entradas y salidas. Sabe exactamente cuánto sobra al final del mes.',
    'Visualizza chiaramente entrate e uscite. Sappi esattamente quanto resta a fine mese.',
    '清晰查看您的收入与支出，准确掌握每月底的结余。',
    'Visualisez clairement vos entrées et sorties. Sachez exactement ce qu’il reste à la fin du mois.',
    'Sehen Sie Einnahmen und Ausgaben klar vor sich. Wissen Sie genau, was am Monatsende übrig bleibt.'
  ],
  'Múltiplos Cartões': [
    'Múltiplos Cartões',
    'Multiple Cards',
    'Múltiples Tarjetas',
    'Carte Multiple',
    '多张银行卡管理',
    'Cartes Multiples',
    'Mehrere Karten'
  ],
  'Gerencie todas as suas bandeiras, faturas, limites e compras parceladas em um único painel organizado.': [
    'Gira todas as suas marcas, faturas, limites e compras fracionadas num único painel organizado.',
    'Manage all your card brands, statements, credit limits, and installments in one organized dashboard.',
    'Gestiona todas tus tarjetas, facturas, límites y compras en cuotas en un único panel organizado.',
    'Gestisci tutte le tue carte, estratti conto, limiti e rate in un unico pannello organizzato.',
    '在统一的面板中管理您所有的信用卡品牌、账单、额度和分期付款。',
    'Gérez toutes vos cartes, factures, plafonds et paiements échelonnés dans un seul tableau de bord.',
    'Verwalten Sie alle Karten, Abrechnungen, Limits und Ratenzahlungen in einem übersichtlichen Dashboard.'
  ],
  'Planejamento de Viagens': [
    'Planeamento de Viagens',
    'Travel Planning',
    'Planificación de Viajes',
    'Pianificazione Viaggi',
    '旅行规划',
    'Planification de Voyages',
    'Reiseplanung'
  ],
  'Simule roteiros completos com passagens, bagagens, hospedagem, gorjetas, câmbio em tempo real (IOF) e gastos multimoeda.': [
    'Simule roteiros completos com bilhetes, bagagens, alojamento, gorjetas, câmbio em tempo real e gastos multimoeda.',
    'Simulate complete itineraries with flights, luggage, lodging, tips, live exchange rates, and multi-currency expenses.',
    'Simula itinerarios completos con pasajes, equipaje, hospedaje, propinas, cambio en tiempo real y gastos multimoneda.',
    'Simula itinerari completi con voli, bagagli, alloggio, mance, cambio in tempo reale e spese multivaluta.',
    '模拟完整行程，包含机票、行李、住宿、小费、实时汇率及多币种开销。',
    'Simulez des itinéraires complets avec vols, bagages, hébergement, pourboires, taux de change en direct et dépenses multidevises.',
    'Simulieren Sie komplette Reiserouten mit Flügen, Gepäck, Unterkunft, Trinkgeld, Echtzeit-Wechselkursen und Mehrwährungsausgaben.'
  ],
  'Gráficos Inteligentes': [
    'Gráficos Inteligentes',
    'Smart Charts',
    'Gráficos Inteligentes',
    'Grafici Intelligenti',
    '智能图表',
    'Graphiques Intelligents',
    'Intelligente Diagramme'
  ],
  'Entenda seus hábitos de consumo com gráficos visuais e intuitivos. A informação é poder.': [
    'Compreenda os seus hábitos de consumo com gráficos visuais e intuitivos. A informação é poder.',
    'Understand your spending habits with visual, intuitive charts. Information is power.',
    'Comprende tus hábitos de consumo con gráficos visuales e intuitivos. La información es poder.',
    'Comprendi le tue abitudini di spesa con grafici visivi e intuitivi. L’informazione è potere.',
    '通过直观的可视化图表了解您的消费习惯。信息就是力量。',
    'Comprenez vos habitudes de consommation grâce à des graphiques visuels et intuitifs.',
    'Verstehen Sie Ihre Konsumgewohnheiten mit anschaulichen und intuitiven Diagrammen.'
  ],
  'Metas Financeiras': [
    'Metas Financeiras',
    'Financial Goals',
    'Metas Financieras',
    'Obiettivi Finanziari',
    '财务目标',
    'Objectifs Financiers',
    'Finanzziele'
  ],
  'Defina objetivos e acompanhe seu progresso. A motivação que você precisa para continuar.': [
    'Defina objetivos e acompanhe o seu progresso. A motivação de que precisa para continuar.',
    'Set goals and track your progress. The motivation you need to keep moving forward.',
    'Define objetivos y sigue tu progreso. La motivación que necesitas para continuar.',
    'Definisci gli obiettivi e segui i tuoi progressi. La motivazione che ti serve per continuare.',
    '设定目标并跟踪进度，为您提供持续前进的动力。',
    'Définissez des objectifs et suivez vos progrès. La motivation dont vous avez besoin pour avancer.',
    'Setzen Sie Ziele und verfolgen Sie Ihren Fortschritt. Die Motivation, die Sie brauchen.'
  ],
  'DRE & Multimoeda': [
    'DRE & Multimoeda',
    'P&L & Multi-Currency',
    'Estado de Resultados y Multimoneda',
    'Conto Economico & Multivaluta',
    '损益表与多币种',
    'Compte de Résultat & Multidevise',
    'GuV & Mehrwährung'
  ],
  'Acompanhe seu Demonstrativo de Resultados mensal, trimestral ou anual com conversão automática para Dólar, Euro e Libra.': [
    'Acompanhe a sua Demonstração de Resultados mensal, trimestral ou anual com conversão automática para Dólar, Euro e Libra.',
    'Track your monthly, quarterly, or annual Profit & Loss Statement with automatic conversion to USD, EUR, and GBP.',
    'Sigue tu Estado de Resultados mensual, trimestral o anual con conversión automática a Dólar, Euro y Libra.',
    'Segui il tuo Conto Economico mensile, trimestrale o annuale con conversione automatica in Dollaro, Euro e Sterlina.',
    '按月、季或年跟踪您的损益表，并自动换算为美元、欧元和英镑。',
    'Suivez votre compte de résultat mensuel, trimestriel ou annuel avec conversion automatique en Dollar, Euro et Livre.',
    'Verfolgen Sie Ihre monatliche, vierteljährliche oder jährliche GuV-Rechnung mit automatischer Währungsumrechnung.'
  ],
  'Comece sua transformação hoje': [
    'Comece a sua transformação hoje',
    'Start your transformation today',
    'Comienza tu transformación hoy',
    'Inizia la tua trasformazione oggi',
    '今天就开始您的财务蜕变',
    'Commencez votre transformation aujourd’hui',
    'Starten Sie Ihre Veränderung noch heute'
  ],
  'Criar Minha Conta Gratuita': [
    'Criar a Minha Conta Gratuita',
    'Create My Free Account',
    'Crear Mi Cuenta Gratuita',
    'Crea il Mio Account Gratuito',
    '免费创建我的账户',
    'Créer Mon Compte Gratuit',
    'Mein kostenloses Konto erstellen'
  ],
  'Junte-se a mais de 5.000 pessoas que já mudaram de vida.': [
    'Junte-se a mais de 5.000 pessoas que já mudaram de vida.',
    'Join over 5,000 people who have already transformed their lives.',
    'Únete a más de 5.000 personas que ya cambiaron su vida.',
    'Unisciti a oltre 5.000 persone che hanno già cambiato vita.',
    '加入超过 5,000 名已经改变生活的用户行列。',
    'Rejoignez plus de 5 000 personnes qui ont déjà changé de vie.',
    'Schließen Sie sich über 5.000 Menschen an, die ihr Leben bereits verändert haben.'
  ],
  'Verificação de Conta': [
    'Verificação de Conta',
    'Account Verification',
    'Verificación de Cuenta',
    'Verifica Account',
    '账户验证',
    'Vérification du Compte',
    'Kontoverifizierung'
  ],
  'Digite o código de 6 dígitos enviado para': [
    'Introduza o código de 6 dígitos enviado para',
    'Enter the 6-digit code sent to',
    'Ingresa el código de 6 dígitos enviado a',
    'Inserisci il codice a 6 cifre inviato a',
    '请输入发送至以下邮箱的6位验证码：',
    'Entrez le code à 6 chiffres envoyé à',
    'Geben Sie den 6-stelligen Code ein, der gesendet wurde an'
  ],
  'Voltar para o login': [
    'Voltar para o início de sessão',
    'Back to sign in',
    'Volver al inicio de sesión',
    'Torna al login',
    '返回登录',
    'Retour à la connexion',
    'Zurück zum Login'
  ],
  'Redefinir Senha': [
    'Redefinir Palavra-passe',
    'Reset Password',
    'Restablecer Contraseña',
    'Reimposta Password',
    '重置密码',
    'Réinitialiser le Mot de Passe',
    'Passwort zurücksetzen'
  ],
  'Enviar Código': [
    'Enviar Código',
    'Send Code',
    'Enviar Código',
    'Invia Codice',
    '发送验证码',
    'Envoyer le Code',
    'Code senden'
  ]
};

// Placeholders comuns de inputs
const PLACEHOLDER_MAP = {
  'Informe seu e-mail': [
    'Introduza o seu e-mail',
    'Enter your email',
    'Ingresa tu correo electrónico',
    'Inserisci la tua email',
    '请输入您的电子邮箱',
    'Entrez votre e-mail',
    'Geben Sie Ihre E-Mail ein'
  ],
  'Informe sua senha': [
    'Introduza a sua palavra-passe',
    'Enter your password',
    'Ingresa tu contraseña',
    'Inserisci la tua password',
    '请输入您的密码',
    'Entrez votre mot de passe',
    'Geben Sie Ihr Passwort ein'
  ],
  'Informe seu usuário admin': [
    'Introduza o seu utilizador admin',
    'Enter your admin username',
    'Ingresa tu usuario admin',
    'Inserisci il tuo utente admin',
    '请输入管理员用户名',
    'Entrez votre identifiant admin',
    'Geben Sie Ihren Admin-Benutzernamen ein'
  ],
  'Informe seu nome completo': [
    'Introduza o seu nome completo',
    'Enter your full name',
    'Ingresa tu nombre completo',
    'Inserisci il tuo nome completo',
    '请输入您的全名',
    'Entrez votre nom complet',
    'Geben Sie Ihren vollständigen Namen ein'
  ],
  'Informe seu melhor e-mail': [
    'Introduza o seu melhor e-mail',
    'Enter your best email',
    'Ingresa tu mejor correo',
    'Inserisci la tua migliore email',
    '请输入您的常用邮箱',
    'Entrez votre meilleur e-mail',
    'Geben Sie Ihre beste E-Mail ein'
  ],
  'Mín. 6 dígitos': [
    'Mín. 6 dígitos',
    'Min. 6 characters',
    'Mín. 6 caracteres',
    'Min. 6 caratteri',
    '至少6位字符',
    'Min. 6 caractères',
    'Mind. 6 Zeichen'
  ],
  'Repita a senha': [
    'Repita a palavra-passe',
    'Repeat password',
    'Repite la contraseña',
    'Ripeti la password',
    '重复输入密码',
    'Répétez le mot de passe',
    'Passwort wiederholen'
  ]
};

const LANG_INDEX = {
  'pt-PT': 0,
  en: 1,
  es: 2,
  it: 3,
  zh: 4,
  fr: 5,
  de: 6
};

// Dicionário de palavras soltas / termos compostos frequentes nas telas internas para tradução automática de nós de texto
const WORD_REPLACEMENTS = {
  'pt-PT': [
    ['Controle', 'Controlo'],
    ['controle', 'controlo'],
    ['Planejamento', 'Planeamento'],
    ['planejamento', 'planeamento'],
    ['Orçamentos', 'Orçamentos'],
    ['Usuários', 'Utilizadores'],
    ['Usuário', 'Utilizador'],
    ['usuário', 'utilizador'],
    ['Senha', 'Palavra-passe'],
    ['senha', 'palavra-passe'],
    ['Cadastrar', 'Registar'],
    ['Cadastro', 'Registo'],
    ['Gerenciamento', 'Gestão'],
    ['Relatório', 'Relatório'],
    ['Cartão de Crédito', 'Cartão de Crédito'],
    ['Hospedagem', 'Alojamento'],
    ['Passagens', 'Bilhetes']
  ],
  en: [
    ['Bem-vindo de volta', 'Welcome back'],
    ['Bem-vindo', 'Welcome'],
    ['Controle Financeiro', 'Financial Control'],
    ['Gestão Financeira', 'Financial Management'],
    ['Adicionar', 'Add'],
    ['Novo', 'New'],
    ['Nova', 'New'],
    ['Total', 'Total'],
    ['Mensal', 'Monthly'],
    ['Anual', 'Annual'],
    ['Período', 'Period'],
    ['Mês', 'Month'],
    ['Ano', 'Year'],
    ['Hoje', 'Today'],
    ['Ontem', 'Yesterday'],
    ['Pesquisar', 'Search'],
    ['Buscar', 'Search'],
    ['Exportar', 'Export'],
    ['Importar', 'Import'],
    ['Configurações', 'Settings'],
    ['Orçamento', 'Budget'],
    ['Receitas', 'Income'],
    ['Despesas', 'Expenses'],
    ['Cartões', 'Cards'],
    ['Viagens', 'Trips'],
    ['Relatórios', 'Reports'],
    ['Metas', 'Goals'],
    ['Meta', 'Goal'],
    ['Gastos', 'Spending'],
    ['Saldo', 'Balance'],
    ['Investimentos', 'Investments'],
    ['Reserva', 'Savings'],
    ['Próxima', 'Next'],
    ['Anterior', 'Previous'],
    ['Todos', 'All'],
    ['Todas', 'All'],
    ['Nenhum registro encontrado', 'No records found'],
    ['Carregando...', 'Loading...'],
    ['Atualizar', 'Update'],
    ['Confirmar', 'Confirm'],
    ['Fechar', 'Close'],
    ['Voltar', 'Back']
  ],
  es: [
    ['Bem-vindo de volta', 'Bienvenido de nuevo'],
    ['Bem-vindo', 'Bienvenido'],
    ['Controle Financeiro', 'Control Financiero'],
    ['Gestão Financeira', 'Gestión Financiera'],
    ['Adicionar', 'Agregar'],
    ['Novo', 'Nuevo'],
    ['Nova', 'Nueva'],
    ['Mensal', 'Mensual'],
    ['Anual', 'Anual'],
    ['Período', 'Período'],
    ['Mês', 'Mes'],
    ['Ano', 'Año'],
    ['Hoje', 'Hoy'],
    ['Ontem', 'Ayer'],
    ['Pesquisar', 'Buscar'],
    ['Buscar', 'Buscar'],
    ['Exportar', 'Exportar'],
    ['Importar', 'Importar'],
    ['Configurações', 'Configuración'],
    ['Orçamento', 'Presupuesto'],
    ['Receitas', 'Ingresos'],
    ['Despesas', 'Gastos'],
    ['Cartões', 'Tarjetas'],
    ['Viagens', 'Viajes'],
    ['Relatórios', 'Informes'],
    ['Metas', 'Metas'],
    ['Gastos', 'Gastos'],
    ['Saldo', 'Saldo'],
    ['Investimentos', 'Inversiones'],
    ['Reserva', 'Reserva'],
    ['Próxima', 'Siguiente'],
    ['Anterior', 'Anterior'],
    ['Todos', 'Todos'],
    ['Todas', 'Todas'],
    ['Nenhum registro encontrado', 'No se encontraron registros'],
    ['Carregando...', 'Cargando...'],
    ['Atualizar', 'Actualizar'],
    ['Confirmar', 'Confirmar'],
    ['Fechar', 'Cerrar'],
    ['Voltar', 'Volver']
  ],
  it: [
    ['Bem-vindo de volta', 'Bentornato'],
    ['Bem-vindo', 'Benvenuto'],
    ['Controle Financeiro', 'Controllo Finanziario'],
    ['Gestão Financeira', 'Gestione Finanziaria'],
    ['Adicionar', 'Aggiungi'],
    ['Novo', 'Nuovo'],
    ['Nova', 'Nuova'],
    ['Mensal', 'Mensile'],
    ['Anual', 'Annuale'],
    ['Período', 'Periodo'],
    ['Mês', 'Mese'],
    ['Ano', 'Anno'],
    ['Hoje', 'Oggi'],
    ['Pesquisar', 'Cerca'],
    ['Buscar', 'Cerca'],
    ['Exportar', 'Esporta'],
    ['Importar', 'Importa'],
    ['Configurações', 'Impostazioni'],
    ['Orçamento', 'Budget'],
    ['Receitas', 'Entrate'],
    ['Despesas', 'Spese'],
    ['Cartões', 'Carte'],
    ['Viagens', 'Viaggi'],
    ['Relatórios', 'Report'],
    ['Metas', 'Obiettivi'],
    ['Gastos', 'Spese'],
    ['Saldo', 'Saldo'],
    ['Investimentos', 'Investimenti'],
    ['Carregando...', 'Caricamento...'],
    ['Atualizar', 'Aggiorna'],
    ['Confirmar', 'Conferma'],
    ['Fechar', 'Chiudi'],
    ['Voltar', 'Indietro']
  ],
  zh: [
    ['Bem-vindo de volta', '欢迎回来'],
    ['Bem-vindo', '欢迎'],
    ['Controle Financeiro', '财务控制'],
    ['Gestão Financeira', '财务管理'],
    ['Adicionar', '添加'],
    ['Novo', '新建'],
    ['Nova', '新建'],
    ['Mensal', '月度'],
    ['Anual', '年度'],
    ['Período', '周期'],
    ['Mês', '月'],
    ['Ano', '年'],
    ['Hoje', '今天'],
    ['Pesquisar', '搜索'],
    ['Buscar', '搜索'],
    ['Exportar', '导出'],
    ['Importar', '导入'],
    ['Configurações', '设置'],
    ['Orçamento', '预算'],
    ['Receitas', '收入'],
    ['Despesas', '支出'],
    ['Cartões', '银行卡'],
    ['Viagens', '旅行'],
    ['Relatórios', '报表'],
    ['Metas', '目标'],
    ['Gastos', '开销'],
    ['Saldo', '余额'],
    ['Investimentos', '投资'],
    ['Carregando...', '加载中...'],
    ['Atualizar', '更新'],
    ['Confirmar', '确认'],
    ['Fechar', '关闭'],
    ['Voltar', '返回']
  ],
  fr: [
    ['Bem-vindo de volta', 'Bon retour'],
    ['Bem-vindo', 'Bienvenue'],
    ['Controle Financeiro', 'Contrôle Financier'],
    ['Gestão Financeira', 'Gestion Financière'],
    ['Adicionar', 'Ajouter'],
    ['Novo', 'Nouveau'],
    ['Nova', 'Nouvelle'],
    ['Mensal', 'Mensuel'],
    ['Anual', 'Annuel'],
    ['Período', 'Période'],
    ['Mês', 'Mois'],
    ['Ano', 'Année'],
    ['Hoje', 'Aujourd’hui'],
    ['Pesquisar', 'Rechercher'],
    ['Buscar', 'Rechercher'],
    ['Exportar', 'Exporter'],
    ['Importar', 'Importer'],
    ['Configurações', 'Paramètres'],
    ['Orçamento', 'Budget'],
    ['Receitas', 'Revenus'],
    ['Despesas', 'Dépenses'],
    ['Cartões', 'Cartes'],
    ['Viagens', 'Voyages'],
    ['Relatórios', 'Rapports'],
    ['Metas', 'Objectifs'],
    ['Gastos', 'Dépenses'],
    ['Saldo', 'Solde'],
    ['Investimentos', 'Investissements'],
    ['Carregando...', 'Chargement...'],
    ['Atualizar', 'Mettre à jour'],
    ['Confirmar', 'Confirmer'],
    ['Fechar', 'Fermer'],
    ['Voltar', 'Retour']
  ],
  de: [
    ['Bem-vindo de volta', 'Willkommen zurück'],
    ['Bem-vindo', 'Willkommen'],
    ['Controle Financeiro', 'Finanzkontrolle'],
    ['Gestão Financeira', 'Finanzmanagement'],
    ['Adicionar', 'Hinzufügen'],
    ['Novo', 'Neu'],
    ['Nova', 'Neue'],
    ['Mensal', 'Monatlich'],
    ['Anual', 'Jährlich'],
    ['Período', 'Zeitraum'],
    ['Mês', 'Monat'],
    ['Ano', 'Jahr'],
    ['Hoje', 'Heute'],
    ['Pesquisar', 'Suchen'],
    ['Buscar', 'Suchen'],
    ['Exportar', 'Exportieren'],
    ['Importar', 'Importieren'],
    ['Configurações', 'Einstellungen'],
    ['Orçamento', 'Budget'],
    ['Receitas', 'Einnahmen'],
    ['Despesas', 'Ausgaben'],
    ['Cartões', 'Karten'],
    ['Viagens', 'Reisen'],
    ['Relatórios', 'Berichte'],
    ['Metas', 'Ziele'],
    ['Gastos', 'Ausgaben'],
    ['Saldo', 'Kontostand'],
    ['Investimentos', 'Investitionen'],
    ['Carregando...', 'Laden...'],
    ['Atualizar', 'Aktualisieren'],
    ['Confirmar', 'Bestätigen'],
    ['Fechar', 'Schließen'],
    ['Voltar', 'Zurück']
  ]
};

export function translateString(str, lang) {
  if (!str || typeof str !== 'string') return str;
  if (lang === 'pt-BR') return str;

  const idx = LANG_INDEX[lang];
  if (idx === undefined) return str;

  const trimmed = str.trim();
  if (!trimmed) return str;

  // 1. Correspondência exata de frase
  if (PHRASE_MAP[trimmed]) {
    const translated = PHRASE_MAP[trimmed][idx];
    if (translated) {
      return str.replace(trimmed, translated);
    }
  }

  // 2. Correspondência exata de placeholder
  if (PLACEHOLDER_MAP[trimmed]) {
    const translated = PLACEHOLDER_MAP[trimmed][idx];
    if (translated) {
      return str.replace(trimmed, translated);
    }
  }

  // 3. Substituição parcial de frases conhecidas e termos frequentes
  let result = str;
  for (const [ptPhrase, translations] of Object.entries(PHRASE_MAP)) {
    if (ptPhrase.length > 4 && result.includes(ptPhrase) && translations[idx]) {
      result = result.split(ptPhrase).join(translations[idx]);
    }
  }

  const wordPairs = WORD_REPLACEMENTS[lang] || [];
  for (const [ptWord, targetWord] of wordPairs) {
    if (result.includes(ptWord)) {
      result = result.split(ptWord).join(targetWord);
    }
  }

  return result;
}

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('meu_bolso_lang') || 'pt-BR';
    } catch {
      return 'pt-BR';
    }
  });

  const setLanguage = useCallback((newLang) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('meu_bolso_lang', newLang);
    } catch {
      // ignore storage errors
    }
  }, []);

  const t = useCallback(
    (text) => {
      return translateString(text, language);
    },
    [language]
  );

  // Tradutor automático de nós de texto e placeholders do DOM para cobrir 100% das páginas do sistema
  useEffect(() => {
    document.documentElement.lang = language;

    let isApplying = false;

    const processDomTree = (root) => {
      if (!root || isApplying) return;
      isApplying = true;

      try {
        // 1. Traduzir nós de texto
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA') {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent.closest('[data-no-translate="true"]')) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        });

        let currentNode = walker.nextNode();
        while (currentNode) {
          const val = currentNode.nodeValue;
          if (val && val.trim().length > 0) {
            if (currentNode.__origPtBr === undefined) {
              currentNode.__origPtBr = val;
            } else if (language !== 'pt-BR' && val !== currentNode.__lastTranslated) {
              // Se o React atualizou o texto dinamicamente com um novo texto em PT-BR
              currentNode.__origPtBr = val;
            }

            const baseText = currentNode.__origPtBr;
            const newText = language === 'pt-BR' ? baseText : translateString(baseText, language);

            if (currentNode.nodeValue !== newText) {
              currentNode.__lastTranslated = newText;
              currentNode.nodeValue = newText;
            }
          }
          currentNode = walker.nextNode();
        }

        // 2. Traduzir atributos placeholder e title
        if (root.querySelectorAll) {
          const elements = root.querySelectorAll('[placeholder], [title]');
          elements.forEach((el) => {
            if (el.closest('[data-no-translate="true"]')) return;

            if (el.hasAttribute('placeholder')) {
              const currentPh = el.getAttribute('placeholder');
              if (el.__origPlaceholder === undefined) {
                el.__origPlaceholder = currentPh;
              }
              const nextPh =
                language === 'pt-BR'
                  ? el.__origPlaceholder
                  : translateString(el.__origPlaceholder, language);
              if (currentPh !== nextPh) {
                el.setAttribute('placeholder', nextPh);
              }
            }

            if (el.hasAttribute('title')) {
              const currentTitle = el.getAttribute('title');
              if (el.__origTitle === undefined) {
                el.__origTitle = currentTitle;
              }
              const nextTitle =
                language === 'pt-BR'
                  ? el.__origTitle
                  : translateString(el.__origTitle, language);
              if (currentTitle !== nextTitle) {
                el.setAttribute('title', nextTitle);
              }
            }
          });
        }
      } finally {
        isApplying = false;
      }
    };

    processDomTree(document.body);

    const observer = new MutationObserver((mutations) => {
      if (isApplying) return;
      let shouldProcess = false;
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          shouldProcess = true;
          break;
        }
        if (m.type === 'characterData') {
          shouldProcess = true;
          break;
        }
      }
      if (shouldProcess) {
        processDomTree(document.body);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, [language]);

  const currentLanguageObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguage: currentLanguageObj,
        t,
        LANGUAGES,
        FEATURED_LANGUAGES,
        OTHER_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
};
