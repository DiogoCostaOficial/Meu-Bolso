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
  // Meses do Ano (Maiúsculas e Minúsculas)
  'Janeiro': ['Janeiro', 'January', 'Enero', 'Gennaio', '一月', 'Janvier', 'Januar'],
  'Fevereiro': ['Fevereiro', 'February', 'Febrero', 'Febbraio', '二月', 'Février', 'Februar'],
  'Março': ['Março', 'March', 'Marzo', 'Marzo', '三月', 'Mars', 'März'],
  'Abril': ['Abril', 'April', 'Abril', 'Aprile', '四月', 'Avril', 'April'],
  'Maio': ['Maio', 'May', 'Mayo', 'Maggio', '五月', 'Mai', 'Mai'],
  'Junho': ['Junho', 'June', 'Junio', 'Giugno', '六月', 'Juin', 'Juni'],
  'Julho': ['Julho', 'July', 'Julio', 'Luglio', '七月', 'Juillet', 'Juli'],
  'Agosto': ['Agosto', 'August', 'Agosto', 'Agosto', '八月', 'Août', 'August'],
  'Setembro': ['Setembro', 'September', 'Septiembre', 'Settembre', '九月', 'Septembre', 'September'],
  'Outubro': ['Outubro', 'October', 'Octubre', 'Ottobre', '十月', 'Octobre', 'Oktober'],
  'Novembro': ['Novembro', 'November', 'Noviembre', 'Novembre', '十一月', 'Novembre', 'November'],
  'Dezembro': ['Dezembro', 'December', 'Diciembre', 'Dicembre', '十二月', 'Décembre', 'Dezember'],

  'janeiro': ['janeiro', 'january', 'enero', 'gennaio', '一月', 'janvier', 'januar'],
  'fevereiro': ['fevereiro', 'february', 'febrero', 'febbraio', '二月', 'février', 'februar'],
  'março': ['março', 'march', 'marzo', 'marzo', '三月', 'mars', 'märz'],
  'abril': ['abril', 'april', 'abril', 'aprile', '四月', 'avril', 'april'],
  'maio': ['maio', 'may', 'mayo', 'maggio', '五月', 'mai', 'mai'],
  'junho': ['junho', 'june', 'junio', 'giugno', '六月', 'juin', 'juni'],
  'julho': ['julho', 'july', 'julio', 'luglio', '七月', 'juillet', 'juli'],
  'agosto': ['agosto', 'august', 'agosto', 'agosto', '八月', 'août', 'august'],
  'setembro': ['setembro', 'september', 'septiembre', 'settembre', '九月', 'septembre', 'september'],
  'outubro': ['outubro', 'october', 'octubre', 'ottobre', '十月', 'octobre', 'oktober'],
  'novembro': ['novembro', 'november', 'noviembre', 'novembre', '十一月', 'novembre', 'november'],
  'dezembro': ['dezembro', 'december', 'diciembre', 'dicembre', '十二月', 'décembre', 'dezember'],

  'Jan': ['Jan', 'Jan', 'Ene', 'Gen', '1月', 'Jan', 'Jan'],
  'Fev': ['Fev', 'Feb', 'Feb', 'Feb', '2月', 'Fév', 'Feb'],
  'Mar': ['Mar', 'Mar', 'Mar', 'Mar', '3月', 'Mar', 'Mär'],
  'Abr': ['Abr', 'Apr', 'Abr', 'Apr', '4月', 'Avr', 'Apr'],
  'Mai': ['Mai', 'May', 'May', 'Mag', '5月', 'Mai', 'Mai'],
  'Jun': ['Jun', 'Jun', 'Jun', 'Giu', '6月', 'Juin', 'Jun'],
  'Jul': ['Jul', 'Jul', 'Jul', 'Lug', '7月', 'Juil', 'Jul'],
  'Ago': ['Ago', 'Aug', 'Ago', 'Ago', '8月', 'Aoû', 'Aug'],
  'Set': ['Set', 'Sep', 'Sep', 'Set', '9月', 'Sep', 'Sep'],
  'Out': ['Out', 'Oct', 'Oct', 'Ott', '10月', 'Oct', 'Okt'],
  'Nov': ['Nov', 'Nov', 'Nov', 'Nov', '11月', 'Nov', 'Nov'],
  'Dez': ['Dez', 'Dec', 'Dic', 'Dic', '12月', 'Déc', 'Dez'],

  // Níveis de Experiência
  'Iniciante': ['Iniciante', 'Beginner', 'Principiante', 'Principiante', '初学者', 'Débutant', 'Anfänger'],
  'Fácil': ['Fácil', 'Easy', 'Fácil', 'Facile', '简单', 'Facile', 'Einfach'],
  'Intermediário': ['Intermediário', 'Intermediate', 'Intermedio', 'Intermedio', '中级', 'Intermédiaire', 'Mittelstufe'],
  'Avançado': ['Avançado', 'Advanced', 'Avanzado', 'Avanzato', '高级', 'Avancé', 'Fortgeschritten'],
  'Avançado (PRO)': ['Avançado (PRO)', 'Advanced (PRO)', 'Avanzado (PRO)', 'Avanzato (PRO)', '高级 (PRO)', 'Avancé (PRO)', 'Fortgeschritten (PRO)'],

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
    'Tema Claro': [
    'Tema Claro',
    'Light Theme',
    'Tema Claro',
    'Tema Chiaro',
    '浅色主题',
    'Thème Clair',
    'Helles Thema'
  ],
  'Tema Escuro': [
    'Tema Escuro',
    'Dark Theme',
    'Tema Oscuro',
    'Tema Scuro',
    '深色主题',
    'Thème Sombre',
    'Dunkles Thema'
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
  ],

  // =========================================================================
  // DESPESAS & RECEITAS — FORMULÁRIOS, FILTROS, CATEGORIAS E SUBCATEGORIAS
  // =========================================================================
  'Gerencie seus gastos e mantenha sua saúde financeira em dia.': [
    'Gira os seus gastos e mantenha a sua saúde financeira em dia.',
    'Manage your spending and keep your financial health on track.',
    'Gestiona tus gastos y mantén tu salud financiera al día.',
    'Gestisci le tue spese e mantieni in ordine la tua salute finanziaria.',
    '管理您的日常支出，保持财务健康。',
    'Gérez vos dépenses et gardez votre santé financière à jour.',
    'Verwalten Sie Ihre Ausgaben und halten Sie Ihre Finanzen gesund.'
  ],
  'Adicionar Nova Despesa': [
    'Adicionar Nova Despesa',
    'Add New Expense',
    'Agregar Nuevo Gasto',
    'Aggiungi Nuova Spesa',
    '添加新支出',
    'Ajouter une Nouvelle Dépense',
    'Neue Ausgabe hinzufügen'
  ],
  'Editar Despesa': [
    'Editar Despesa',
    'Edit Expense',
    'Editar Gasto',
    'Modifica Spesa',
    '编辑支出',
    'Modifier la Dépense',
    'Ausgabe bearbeiten'
  ],
  'Adicionar Despesa': [
    'Adicionar Despesa',
    'Add Expense',
    'Agregar Gasto',
    'Aggiungi Spesa',
    '添加支出',
    'Ajouter la Dépense',
    'Ausgabe hinzufügen'
  ],
  'Salvar Edição': [
    'Guardar Edição',
    'Save Changes',
    'Guardar Edición',
    'Salva Modifiche',
    '保存修改',
    'Enregistrer les Modifications',
    'Änderungen speichern'
  ],
  'Data da Despesa': [
    'Data da Despesa',
    'Expense Date',
    'Fecha del Gasto',
    'Data della Spesa',
    '支出日期',
    'Date de la Dépense',
    'Ausgabedatum'
  ],
  'Data despesa (sistema)': [
    'Data despesa (sistema)',
    'Expense date (system)',
    'Fecha de gasto (sistema)',
    'Data spesa (sistema)',
    '支出日期（系统记录）',
    'Date dépense (système)',
    'Ausgabedatum (System)'
  ],
  'Data compra retroativo (opcional)': [
    'Data compra retroativo (opcional)',
    'Retroactive purchase date (optional)',
    'Fecha de compra retroactiva (opcional)',
    'Data acquisto retroattiva (opzionale)',
    '补录实际购买日期（可选）',
    'Date d’achat rétroactive (optionnel)',
    'Rückwirkendes Kaufdatum (optional)'
  ],
  'Data compra retroativo': [
    'Data compra retroativo',
    'Retroactive purchase date',
    'Fecha de compra retroactiva',
    'Data acquisto retroattiva',
    '补录实际购买日期',
    'Date d’achat rétroactive',
    'Rückwirkendes Kaufdatum'
  ],
  'Informe a data de lançamento da despesa no sistema. Esta é a data principal utilizada para contabilizar o gasto no mês correspondente do seu Orçamento e Relatórios.': [
    'Informe a data de lançamento da despesa no sistema. Esta é a data principal utilizada para contabilizar o gasto no mês correspondente do seu Orçamento e Relatórios.',
    'Enter the date this expense is recorded in the system. This is the primary date used to account for the expense in the corresponding month of your Budget and Reports.',
    'Ingresa la fecha de registro del gasto en el sistema. Esta es la fecha principal utilizada para contabilizar el gasto en el mes correspondiente de tu Presupuesto e Informes.',
    'Inserisci la data di registrazione della spesa nel sistema. Questa è la data principale utilizzata per contabilizzare la spesa nel mese corrispondente di Budget e Report.',
    '输入在系统中登记该支出的日期。这是将该笔开销计入对应月份预算和报表的主日期。',
    'Indiquez la date d’enregistrement de la dépense dans le système. C’est la date principale utilisée pour comptabiliser la dépense dans votre Budget et vos Rapports.',
    'Geben Sie das Buchungsdatum der Ausgabe im System ein. Dies ist das Hauptdatum für die Zuordnung zum jeweiligen Monat in Budget und Berichten.'
  ],
  '*Exemplo: Você está lançando hoje (05/11) uma despesa no sistema. Se a compra também aconteceu hoje, basta manter esta data preenchida.': [
    '*Exemplo: Está a lançar hoje (05/11) uma despesa no sistema. Se a compra também aconteceu hoje, basta manter esta data preenchida.',
    '*Example: You are recording an expense in the system today (11/05). If the purchase also happened today, simply keep this date filled in.',
    '*Ejemplo: Hoy (05/11) estás registrando un gasto en el sistema. Si la compra también ocurrió hoy, basta con mantener esta fecha.',
    '*Esempio: Oggi (05/11) stai registrando una spesa nel sistema. Se l’acquisto è avvenuto oggi stesso, basta mantenere questa data.',
    '*示例：您今天（11月5日）在系统中登记一笔支出。如果购买也是今天发生的，只需保留此日期即可。',
    '*Exemple : Vous saisissez aujourd’hui (05/11) une dépense dans le système. Si l’achat a également eu lieu aujourd’hui, conservez simplement cette date.',
    '*Beispiel: Sie erfassen heute (05.11.) eine Ausgabe im System. Wenn der Kauf ebenfalls heute stattfand, behalten Sie einfach dieses Datum bei.'
  ],
  "**OBS: Caso a compra tenha sido feita em uma data anterior ao lançamento de hoje, informe o dia exato da compra no campo 'Data compra retroativo (opcional)'.": [
    "**OBS: Caso a compra tenha sido feita numa data anterior ao lançamento de hoje, informe o dia exato da compra no campo 'Data compra retroativo (opcional)'.",
    "**NOTE: If the purchase was made on an earlier date than today's entry, enter the exact purchase day in the 'Retroactive purchase date (optional)' field.",
    "**NOTA: Si la compra se realizó en una fecha anterior al registro de hoy, informa el día exacto de la compra en el campo 'Fecha de compra retroactiva (opcional)'.",
    "**NOTA: Se l’acquisto è stato effettuato in una data precedente alla registrazione di oggi, indica il giorno esatto nel campo 'Data acquisto retroattiva (opzionale)'.",
    "**注：如果实际购买发生在今天登记之前的日期，请在“补录实际购买日期（可选）”字段中填写确切的购买日。",
    "**REMARQUE : Si l’achat a été effectué à une date antérieure à la saisie d’aujourd’hui, indiquez le jour exact de l’achat dans le champ « Date d’achat rétroactive (optionnel) ».",
    "**HINWEIS: Falls der Kauf an einem früheren Tag als der heutigen Buchung stattfand, tragen Sie den genauen Kauftag im Feld „Rückwirkendes Kaufdatum (optional)“ ein."
  ],
  'Utilize este campo para informar de forma retroativa quando foi realizada uma compra cujo lançamento no sistema está sendo feito em outra data. Assim você preserva a data exata da compra.': [
    'Utilize este campo para informar de forma retroativa quando foi realizada uma compra cujo lançamento no sistema está a ser feito noutra data. Assim preserva a data exata da compra.',
    'Use this field to retroactively report when a purchase was made if you are recording it in the system on a different date. This preserves the exact purchase date.',
    'Utiliza este campo para informar de forma retroactiva cuándo se realizó una compra cuyo registro en el sistema se hace en otra fecha. Así conservas la fecha exacta de la compra.',
    'Utilizza questo campo per indicare in modo retroattivo quando è stato effettuato un acquisto registrato nel sistema in un’altra data. Così conservi la data esatta dell’acquisto.',
    '当您在另一天补录支出时，使用此字段以追溯方式填写实际发生购买的日期，从而保留准确的购买日。',
    'Utilisez ce champ pour indiquer de manière rétroactive la date réelle d’un achat lorsque sa saisie dans le système est effectuée à une autre date.',
    'Nutzen Sie dieses Feld, um rückwirkend anzugeben, wann ein Kauf getätigt wurde, wenn die Erfassung im System an einem anderen Datum erfolgt.'
  ],
  '*Exemplo: Posso lançar um título de despesa no dia de hoje, 05/11 (lançamento no sistema), porém a data em que comprei o item foi no dia 01/11. Preencha 01/11 neste campo de forma retroativa.': [
    '*Exemplo: Posso lançar um título de despesa no dia de hoje, 05/11 (lançamento no sistema), porém a data em que comprei o item foi no dia 01/11. Preencha 01/11 neste campo de forma retroativa.',
    '*Example: You can record an expense entry today, 11/05 (system entry date), while the actual date you bought the item was 11/01. Enter 11/01 in this field retroactively.',
    '*Ejemplo: Puedo registrar un gasto hoy, 05/11 (registro en el sistema), pero la fecha en que compré el artículo fue el 01/11. Completa 01/11 en este campo de forma retroactiva.',
    '*Esempio: Posso registrare una spesa oggi, 05/11 (registrazione nel sistema), ma la data in cui ho acquistato l’articolo era lo 01/11. Inserisci 01/11 in questo campo in modo retroattivo.',
    '*示例：您可以今天（11月5日，系统记录日）登记一笔支出，但实际购买该商品是在11月1日。请在此字段中追溯填写 11/01。',
    '*Exemple : Je peux saisir une dépense aujourd’hui le 05/11 (saisie système), alors que j’ai acheté l’article le 01/11. Renseignez 01/11 dans ce champ de façon rétroactive.',
    '*Beispiel: Ich kann heute am 05.11. eine Ausgabe buchen (Systembuchung), obwohl ich den Artikel am 01.11. gekauft habe. Tragen Sie hier rückwirkend den 01.11. ein.'
  ],
  '**OBS: Se o lançamento no sistema está sendo feito no mesmo dia da compra, deixe este campo em branco.': [
    '**OBS: Se o lançamento no sistema está a ser feito no mesmo dia da compra, deixe este campo em branco.',
    '**NOTE: If you are recording the expense in the system on the same day as the purchase, leave this field blank.',
    '**NOTA: Si el registro en el sistema se realiza el mismo día de la compra, deja este campo en blanco.',
    '**NOTA: Se la registrazione nel sistema avviene lo stesso giorno dell’acquisto, lascia vuoto questo campo.',
    '**注：如果您在购买当天就在系统中登记该支出，请将此字段留空。',
    '**REMARQUE : Si la saisie dans le système est faite le jour même de l’achat, laissez ce champ vide.',
    '**HINWEIS: Wenn die Erfassung im System am selben Tag wie der Kauf erfolgt, lassen Sie dieses Feld leer.'
  ],
  'Ajuda': [
    'Ajuda',
    'Help',
    'Ayuda',
    'Aiuto',
    '帮助说明',
    'Aide',
    'Hilfe'
  ],
  'Informe um título curto e claro que identifique onde ou com o quê o dinheiro foi gasto ou recebido.': [
    'Informe um título curto e claro que identifique onde ou com o quê o dinheiro foi gasto ou recebido.',
    'Enter a short, clear title identifying where or how the money was spent or received.',
    'Ingresa un título corto y claro que identifique dónde o en qué se gastó o recibió el dinero.',
    'Inserisci un titolo breve e chiaro che identifichi dove o come è stato speso o ricevuto il denaro.',
    '输入简短清晰的标题，说明这笔资金是在哪里或因何事支出或收到的。',
    'Saisissez un titre court et clair identifiant où ou comment l’argent a été dépensé ou reçu.',
    'Geben Sie einen kurzen, klaren Titel ein, der angibt, wofür das Geld ausgegeben oder erhalten wurde.'
  ],
  '*Exemplo: "Supermercado Compra do Mês", "Conta de Energia", "Salário Mensal" ou "Aluguel".': [
    '*Exemplo: "Supermercado Compra do Mês", "Conta da Luz", "Salário Mensal" ou "Renda".',
    '*Example: "Monthly Groceries", "Electricity Bill", "Monthly Salary", or "Rent".',
    '*Ejemplo: "Compra del Mes en Supermercado", "Factura de Luz", "Salario Mensual" o "Alquiler".',
    '*Esempio: "Spesa Mensile Supermercato", "Bolletta Luce", "Stipendio Mensile" o "Affitto".',
    '*示例：“每月超市采购”、“电费账单”、“每月工资”或“房租”。',
    '*Exemple : « Courses du Mois », « Facture d’Électricité », « Salaire Mensuel » ou « Loyer ».',
    '*Beispiel: „Monatseinkauf Supermarkt“, „Stromrechnung“, „Monatsgehalt“ oder „Miete“.'
  ],
  '**OBS: Uma boa descrição facilita encontrar o lançamento depois usando a barra de busca nos Filtros.': [
    '**OBS: Uma boa descrição facilita encontrar o lançamento depois usando a barra de pesquisa nos Filtros.',
    '**NOTE: A clear description makes it easy to find this entry later using the search bar in Filters.',
    '**NOTA: Una buena descripción facilita encontrar el registro después usando la barra de búsqueda en Filtros.',
    '**NOTA: Una buona descrizione rende facile trovare la voce in seguito tramite la barra di ricerca nei Filtri.',
    '**注：清晰的描述有助于之后在“筛选”搜索栏中快速找到该笔记录。',
    '**REMARQUE : Une bonne description facilite la recherche ultérieure via la barre de filtres.',
    '**HINWEIS: Eine klare Beschreibung erleichtert das spätere Auffinden über die Suchleiste in den Filtern.'
  ],
  'Digite o valor monetário total da transação utilizando números e casas decimais.': [
    'Introduza o valor monetário total da transação utilizando números e casas decimais.',
    'Enter the total monetary amount of the transaction using numbers and decimals.',
    'Ingresa el monto monetario total de la transacción utilizando números y decimales.',
    'Inserisci l’importo monetario totale della transazione utilizzando numeri e decimali.',
    '使用数字和小数输入该笔交易的总金额。',
    'Saisissez le montant monétaire total de la transaction en chiffres et décimales.',
    'Geben Sie den gesamten Geldbetrag der Transaktion mit Zahlen und Dezimalstellen ein.'
  ],
  '*Exemplo: Digite 150.00 para cento e cinquenta reais. Se for uma despesa parcelada, informe o valor total da compra para que o sistema divida pelas parcelas.': [
    '*Exemplo: Introduza 150.00. Se for uma despesa parcelada, informe o valor total da compra para que o sistema divida pelas prestações.',
    '*Example: Enter 150.00. If this is an installment expense, enter the total purchase amount so the system divides it across installments.',
    '*Ejemplo: Escribe 150.00. Si es un gasto en cuotas, informa el monto total de la compra para que el sistema lo divida entre las cuotas.',
    '*Esempio: Digita 150.00. Se è una spesa rateizzata, inserisci l’importo totale dell’acquisto affinché il sistema lo divida per le rate.',
    '*示例：输入 150.00。如果是分期支出，请输入购买总金额，系统会自动按分期期数平摊。',
    '*Exemple : Tapez 150.00. S’il s’agit d’une dépense échelonnée, indiquez le montant total de l’achat pour que le système le divise.',
    '*Beispiel: Geben Sie 150.00 ein. Bei Ratenzahlung geben Sie den Gesamtkaufbetrag an, damit das System ihn auf die Raten aufteilt.'
  ],
  '**OBS: O valor será convertido automaticamente caso você alterne a moeda de visualização no topo da tela.': [
    '**OBS: O valor será convertido automaticamente caso alterne a moeda de visualização no topo do ecrã.',
    '**NOTE: The amount will be automatically converted if you switch the display currency at the top of the screen.',
    '**NOTA: El monto se convertirá automáticamente si cambias la moneda de visualización en la parte superior.',
    '**NOTA: L’importo verrà convertito automaticamente se cambi la valuta di visualizzazione in alto.',
    '**注：如果您在页面顶部切换显示货币，金额将按实时汇率自动换算。',
    '**REMARQUE : Le montant sera automatiquement converti si vous changez la devise d’affichage en haut de l’écran.',
    '**HINWEIS: Der Betrag wird automatisch umgerechnet, wenn Sie oben die Anzeigewährung wechseln.'
  ],
  'Selecione o cartão de crédito utilizado nesta compra para vincular o gasto automaticamente à fatura mensal daquele cartão.': [
    'Selecione o cartão de crédito utilizado nesta compra para associar o gasto automaticamente à fatura mensal desse cartão.',
    'Select the credit card used for this purchase to automatically link the expense to that card’s monthly statement.',
    'Selecciona la tarjeta de crédito utilizada en esta compra para vincular el gasto automáticamente a su factura mensual.',
    'Seleziona la carta di credito utilizzata per questo acquisto per collegare automaticamente la spesa al relativo estratto conto mensile.',
    '选择此次消费使用的信用卡，系统会自动将该笔支出关联至该卡的月度账单。',
    'Sélectionnez la carte de crédit utilisée pour cet achat afin de lier automatiquement la dépense à son relevé mensuel.',
    'Wählen Sie die für diesen Einkauf verwendete Kreditkarte aus, um die Ausgabe automatisch mit deren Monatsabrechnung zu verknüpfen.'
  ],
  '*Exemplo: Ao escolher seu cartão (ex: Nubank ou Itaú), o sistema preenche sozinho o campo "Data de Vencimento (opcional)" com base no dia de vencimento cadastrado no cartão.': [
    '*Exemplo: Ao escolher o seu cartão, o sistema preenche sozinho o campo "Data de Vencimento (opcional)" com base no dia de vencimento registado no cartão.',
    '*Example: When you select your card, the system automatically fills in the "Due Date (optional)" field based on the card’s configured due day.',
    '*Ejemplo: Al elegir tu tarjeta, el sistema completa automáticamente el campo "Fecha de Vencimiento (opcional)" según el día de vencimiento de la tarjeta.',
    '*Esempio: Scegliendo la tua carta, il sistema compila automaticamente il campo "Data di Scadenza (opzionale)" in base al giorno di scadenza della carta.',
    '*示例：选择您的银行卡后，系统会根据该卡设置的还款日自动填入“到期日（可选）”字段。',
    '*Exemple : En choisissant votre carte, le système remplit automatiquement le champ « Date d’échéance (optionnel) » selon le jour d’échéance configuré.',
    '*Beispiel: Wenn Sie Ihre Karte auswählen, füllt das System das Feld „Fälligkeitsdatum (optional)“ automatisch anhand des Karten-Fälligkeitstags aus.'
  ],
  '**OBS: Se a despesa foi paga via Pix, Dinheiro ou Boleto, mantenha a opção "Nenhum (Não vinculado)".': [
    '**OBS: Se a despesa foi paga via Transferência, Dinheiro ou Multibanco, mantenha a opção "Nenhum (Não associado)".',
    '**NOTE: If the expense was paid via bank transfer, cash, or bill/invoice, keep "None (Unlinked)" selected.',
    '**NOTA: Si el gasto fue pagado por transferencia, efectivo o recibo, mantén la opción "Ninguna (No vinculada)".',
    '**NOTA: Se la spesa è stata pagata tramite bonifico, contanti o bollettino, mantieni l’opzione "Nessuna (Non collegata)".',
    '**注：如果该笔支出是通过转账、现金或普通账单支付的，请保持选择“无（未关联）”。',
    '**REMARQUE : Si la dépense a été payée par virement, espèces ou facture, laissez « Aucune (Non liée) ».',
    '**HINWEIS: Wenn die Ausgabe per Überweisung, Bargeld oder Rechnung bezahlt wurde, lassen Sie „Keine (Nicht verknüpft)“ ausgewählt.'
  ],
  'Define a data limite de pagamento deste débito (como boletos, contas de consumo ou faturas de cartão).': [
    'Define a data limite de pagamento deste débito (como faturas de serviços ou cartões).',
    'Sets the payment due date for this debit (such as utility bills, invoices, or card statements).',
    'Define la fecha límite de pago de este débito (como recibos, servicios o facturas de tarjeta).',
    'Definisce la data di scadenza del pagamento di questo addebito (come bollette, fatture o estratti conto).',
    '设置该笔欠款（如水电账单、分期账单或信用卡账单）的最后还款期限。',
    'Définit la date limite de paiement de ce débit (comme les factures ou relevés de carte).',
    'Legt das Fälligkeitsdatum für diese Zahlung fest (z. B. Rechnungen, Abschläge oder Kartenabrechnungen).'
  ],
  '*Exemplo: Se você selecionou um Cartão acima, esta data já é preenchida automaticamente. Para outros débitos (luz, condomínio, boleto), informe o dia do vencimento aqui.': [
    '*Exemplo: Se selecionou um Cartão acima, esta data já é preenchida automaticamente. Para outros débitos (luz, condomínio, serviços), informe o dia do vencimento aqui.',
    '*Example: If you selected a Card above, this date is filled in automatically. For other debits (electricity, HOA, bills), enter the due date here.',
    '*Ejemplo: Si seleccionaste una Tarjeta arriba, esta fecha se completa sola. Para otros débitos (luz, alquiler, recibos), ingresa el vencimiento aquí.',
    '*Esempio: Se hai selezionato una Carta sopra, questa data viene compilata automaticamente. Per altri addebiti (luce, condominio), inserisci qui la scadenza.',
    '*示例：如果您在上方选择了银行卡，此日期会自动填入。对于其他账单（电费、物业费等），请在此手动输入到期日。',
    '*Exemple : Si vous avez sélectionné une Carte ci-dessus, cette date est remplie automatiquement. Pour les autres débits, indiquez l’échéance ici.',
    '*Beispiel: Wenn Sie oben eine Karte gewählt haben, wird dieses Datum automatisch ausgefüllt. Für andere Abbuchungen tragen Sie die Fälligkeit hier ein.'
  ],
  '**OBS: Ajuda a controlar quais contas vencem em cada dia do mês.': [
    '**OBS: Ajuda a controlar quais contas vencem em cada dia do mês.',
    '**NOTE: Helps you track which bills are due on each day of the month.',
    '**NOTA: Ayuda a controlar qué cuentas vencen cada día del mes.',
    '**NOTA: Aiuta a tenere sotto controllo quali conti scadono in ogni giorno del mese.',
    '**注：帮助您清晰掌握每月每天有哪些账单即将到期。',
    '**REMARQUE : Aide à suivre quelles factures arrivent à échéance chaque jour du mois.',
    '**HINWEIS: Hilft Ihnen im Blick zu behalten, welche Rechnungen an welchem Tag im Monat fällig sind.'
  ],
  'Classifica o lançamento dentro de um dos grandes grupos do seu planejamento financeiro (Princípio 50-20-20-0-10 ou categorias de receita).': [
    'Classifica o lançamento dentro de um dos grandes grupos do seu planeamento financeiro (Princípio 50-20-20-0-10 ou categorias de receita).',
    'Classifies the entry into one of the main groups of your financial plan (50-20-20-0-10 Principle or income categories).',
    'Clasifica el registro dentro de uno de los grandes grupos de tu planificación financiera (Principio 50-20-20-0-10 o categorías de ingreso).',
    'Classifica la voce in uno dei gruppi principali della tua pianificazione finanziaria (Principio 50-20-20-0-10 o categorie di entrata).',
    '将该笔记录归类到您的财务规划大类中（50-20-20-0-10 原则或收入类别）。',
    'Classe l’opération dans l’un des grands groupes de votre planification financière (Principe 50-20-20-0-10 ou catégories de revenus).',
    'Ordnet den Eintrag einer der Hauptgruppen Ihrer Finanzplanung zu (50-20-20-0-10-Prinzip oder Einnahmekategorien).'
  ],
  '*Exemplo: "Despesas Fixas" (50%), "Lazer" (20%), "Educação" (20%), "Investimentos" (0%), "Reserva de Emergência" (10%) ou "Receita Principal".': [
    '*Exemplo: "Despesas Fixas" (50%), "Lazer" (20%), "Educação" (20%), "Investimentos" (0%), "Reserva de Emergência" (10%) ou "Receita Principal".',
    '*Example: "Fixed Expenses" (50%), "Leisure" (20%), "Education" (20%), "Investments" (0%), "Emergency Fund" (10%), or "Primary Income".',
    '*Ejemplo: "Gastos Fijos" (50%), "Ocio" (20%), "Educación" (20%), "Inversiones" (0%), "Fondo de Emergencia" (10%) o "Ingreso Principal".',
    '*Esempio: "Spese Fisse" (50%), "Tempo Libero" (20%), "Istruzione" (20%), "Investimenti" (0%), "Fondo di Emergenza" (10%) o "Entrata Principale".',
    '*示例：“固定支出”(50%)、“休闲娱乐”(20%)、“教育学习”(20%)、“投资”(0%)、“应急储备金”(10%) 或 “主要收入”。',
    '*Exemple : « Dépenses Fixes » (50%), « Loisirs » (20%), « Éducation » (20%), « Investissements » (0%), « Fonds d’Urgence » (10%) ou « Revenu Principal ».',
    '*Beispiel: „Fixkosten“ (50%), „Freizeit“ (20%), „Bildung“ (20%), „Investitionen“ (0%), „Notgroschen“ (10%) oder „Haupteinkommen“.'
  ],
  '**OBS: A escolha da categoria conecta automaticamente este lançamento às barras de metas do Dashboard e do Orçamento.': [
    '**OBS: A escolha da categoria liga automaticamente este lançamento às barras de metas do Painel e do Orçamento.',
    '**NOTE: Choosing a category automatically links this entry to the goal progress bars in the Dashboard and Budget.',
    '**NOTA: La elección de la categoría conecta automáticamente este registro con las barras de metas del Panel y Presupuesto.',
    '**NOTA: La scelta della categoria collega automaticamente questa voce alle barre degli obiettivi nella Dashboard e nel Budget.',
    '**注：选择类别后，该记录会自动关联至总览和预算页面中的目标进度条。',
    '**REMARQUE : Le choix de la catégorie relie automatiquement cette opération aux barres d’objectifs du Tableau de Bord et du Budget.',
    '**HINWEIS: Die Kategoriewahl verknüpft diesen Eintrag automatisch mit den Ziel-Fortschrittsbalken im Dashboard und Budget.'
  ],
  'Detalha de forma específica a origem ou o destino do lançamento dentro da Categoria escolhida.': [
    'Detalha de forma específica a origem ou o destino do lançamento dentro da Categoria escolhida.',
    'Specifically details the source or destination of the entry within the selected Category.',
    'Detalla específicamente el origen o destino del registro dentro de la Categoría elegida.',
    'Specifica nel dettaglio l’origine o la destinazione della voce all’interno della Categoria scelta.',
    '在所选大类下进一步细分该笔收支的具体来源或用途。',
    'Détaille spécifiquement l’origine ou la destination de l’opération au sein de la Catégorie choisie.',
    'Spezifiziert die genaue Herkunft oder Verwendung des Eintrags innerhalb der gewählten Kategorie.'
  ],
  '*Exemplo: Dentro de "Despesas Fixas", você pode escolher "Moradia", "Mercado", "Saúde" ou "Transporte".': [
    '*Exemplo: Dentro de "Despesas Fixas", pode escolher "Habitação", "Supermercado", "Saúde" ou "Transporte".',
    '*Example: Under "Fixed Expenses", you can choose "Housing", "Groceries", "Healthcare", or "Transportation".',
    '*Ejemplo: Dentro de "Gastos Fijos", puedes elegir "Vivienda", "Supermercado", "Salud" o "Transporte".',
    '*Esempio: All’interno di "Spese Fisse", puoi scegliere "Abitazione", "Supermercato", "Salute" o "Trasporti".',
    '*示例：在“固定支出”下，您可以选择“住房”、“超市采购”、“医疗健康”或“交通出行”。',
    '*Exemple : Dans « Dépenses Fixes », vous pouvez choisir « Logement », « Supermarché », « Santé » ou « Transport ».',
    '*Beispiel: Unter „Fixkosten“ können Sie „Wohnen“, „Lebensmittel“, „Gesundheit“ oder „Transport“ wählen.'
  ],
  '**OBS: Você pode criar novas subcategorias personalizadas a qualquer momento na tela de Configurações.': [
    '**OBS: Pode criar novas subcategorias personalizadas a qualquer momento no ecrã de Configurações.',
    '**NOTE: You can create custom subcategories at any time on the Settings screen.',
    '**NOTA: Puedes crear nuevas subcategorías personalizadas en cualquier momento en la pantalla de Configuración.',
    '**NOTA: Puoi creare nuove sottocategorie personalizzate in qualsiasi momento nella schermata Impostazioni.',
    '**注：您可以随时在“设置”页面中创建自定义子类别。',
    '**REMARQUE : Vous pouvez créer de nouvelles sous-catégories personnalisées à tout moment dans les Paramètres.',
    '**HINWEIS: Sie können jederzeit unter „Einstellungen“ eigene Unterkategorien anlegen.'
  ],
  'Indica se o valor desta despesa já saiu da sua conta ("Pago") ou se ainda será pago futuramente ("Pendente").': [
    'Indica se o valor desta despesa já saiu da sua conta ("Pago") ou se ainda será pago futuramente ("Pendente").',
    'Indicates whether this expense has already been paid ("Paid") or is still awaiting payment ("Pending").',
    'Indica si el valor de este gasto ya fue pagado ("Pagado") o si aún está por pagar ("Pendiente").',
    'Indica se l’importo di questa spesa è già stato saldato ("Pagato") o se deve ancora essere pagato ("In sospeso").',
    '指示该笔支出是已经付款（“已付”）还是待未来支付（“待付”）。',
    'Indique si le montant de cette dépense a déjà été réglé (« Payé ») ou reste à payer (« En attente »).',
    'Gibt an, ob diese Ausgabe bereits bezahlt wurde („Bezahlt“) oder noch offen ist („Ausstehend“).'
  ],
  '*Exemplo: Marque "Pendente" ao cadastrar uma conta que vence no fim do mês e altere para "Pago" assim que quitar o pagamento.': [
    '*Exemplo: Marque "Pendente" ao registar uma conta que vence no fim do mês e altere para "Pago" assim que liquidar o pagamento.',
    '*Example: Select "Pending" when recording a bill due at the end of the month, and switch it to "Paid" once settled.',
    '*Ejemplo: Marca "Pendiente" al registrar una cuenta que vence a fin de mes y cámbialo a "Pagado" cuando realices el pago.',
    '*Esempio: Seleziona "In sospeso" quando registri una bolletta che scade a fine mese e passa a "Pagato" appena saldata.',
    '*示例：登记月底到期的账单时先选“待付”，完成付款后即可切换为“已付”。',
    '*Exemple : Sélectionnez « En attente » lors de la saisie d’une facture à échoir, puis passez à « Payé » une fois réglée.',
    '*Beispiel: Wählen Sie „Ausstehend“ für eine Rechnung am Monatsende und ändern Sie den Status nach der Zahlung auf „Bezahlt“.'
  ],
  '**OBS: Na tabela de despesas, você também pode clicar direto sobre o selo Pago/Pendente para alternar o status rapidamente.': [
    '**OBS: Na tabela de despesas, também pode clicar diretamente sobre o selo Pago/Pendente para alternar o estado rapidamente.',
    '**NOTE: In the expense table, you can also click directly on the Paid/Pending badge to toggle the status with one click.',
    '**NOTA: En la tabla de gastos, também puedes hacer clic directamente sobre la etiqueta Pagado/Pendiente para cambiar el estado rápidamente.',
    '**NOTA: Nella tabella delle spese, puoi anche cliccare direttamente sul badge Pagato/In sospeso per cambiare stato rapidamente.',
    '**注：在支出列表中，您也可以直接点击“已付/待付”标签一键切换状态。',
    '**REMARQUE : Dans le tableau des dépenses, vous pouvez aussi cliquer directement sur le badge Payé/En attente pour basculer le statut.',
    '**HINWEIS: In der Ausgabentabelle können Sie auch direkt auf das Badge „Bezahlt/Ausstehend“ klicken, um den Status umzuschalten.'
  ],
  'Espaço livre para registrar detalhes extras, número de comprovante, nome da loja ou lembretes sobre este lançamento.': [
    'Espaço livre para registar detalhes extras, número de comprovativo, nome da loja ou lembretes sobre este lançamento.',
    'Free space to record extra details, receipt numbers, store names, or reminders about this entry.',
    'Espacio libre para registrar detalles adicionales, número de comprobante, tienda o recordatorios sobre este registro.',
    'Spazio libero per annotare dettagli extra, numero di ricevuta, nome del negozio o promemoria su questa voce.',
    '自由备注区，可记录收据编号、店铺名称或关于该笔收支的额外提醒。',
    'Espace libre pour noter des détails supplémentaires, numéro de reçu, nom du magasin ou rappels sur cette opération.',
    'Freifeld für zusätzliche Details, Belegnummern, Geschäftsnamen oder Erinnerungen zu diesem Eintrag.'
  ],
  '*Exemplo: "Referente à consulta médica com reembolso parcial" ou "Dividido com a família".': [
    '*Exemplo: "Referente à consulta médica com reembolso parcial" ou "Dividido com a família".',
    '*Example: "Medical appointment with partial reimbursement" or "Split with family".',
    '*Ejemplo: "Consulta médica con reembolso parcial" o "Dividido con la familia".',
    '*Esempio: "Visita medica con rimborso parziale" o "Diviso con la famiglia".',
    '*示例：“部分报销的医疗门诊”或“与家人平摊”。',
    '*Exemple : « Consultation médicale avec remboursement partiel » ou « Partagé en famille ».',
    '*Beispiel: „Arzttermin mit Teilerstattung“ oder „Mit der Familie geteilt“.'
  ],
  'Marque esta opção quando a compra for dividida em 2 ou mais prestações mensais.': [
    'Marque esta opção quando a compra for dividida em 2 ou mais prestações mensais.',
    'Check this option when the purchase is split into 2 or more monthly installments.',
    'Marca esta opción cuando la compra se divida en 2 o más cuotas mensuales.',
    'Seleziona questa opzione quando l’acquisto è suddiviso in 2 o più rate mensili.',
    '当该笔消费分为2期或更多月度分期付款时，请勾选此项。',
    'Cochez cette option lorsque l’achat est divisé en 2 échéances mensuelles ou plus.',
    'Aktivieren Sie diese Option, wenn der Einkauf in 2 oder mehr monatliche Raten aufgeteilt wird.'
  ],
  '*Exemplo: Ao comprar um eletrodoméstico de R$ 1.200 em 6 vezes, marque esta opção e informe 6 no Número de Parcelas. O sistema criará automaticamente as 6 parcelas nos meses seguintes.': [
    '*Exemplo: Ao comprar um eletrodoméstico de 1.200 em 6 vezes, marque esta opção e informe 6 no Número de Prestações. O sistema criará automaticamente as 6 prestações nos meses seguintes.',
    '*Example: When buying a $1,200 appliance in 6 installments, check this box and enter 6 in Number of Installments. The system will automatically create all 6 monthly entries.',
    '*Ejemplo: Al comprar un electrodoméstico de 1.200 en 6 cuotas, marca esta opción e indica 6 en Número de Cuotas. El sistema creará automáticamente las 6 cuotas mensuales.',
    '*Esempio: Acquistando un elettrodomestico da 1.200 in 6 rate, spunta questa opzione e inserisci 6 in Numero di Rate. Il sistema creerà automaticamente le 6 rate nei mesi successivi.',
    '*示例：购买 1,200 元的家电分 6 期付款时，勾选此项并在分期期数填 6，系统会自动在接下来 6 个月生成对应分期记录。',
    '*Exemple : Pour un achat de 1 200 en 6 fois, cochez cette option et indiquez 6 dans Nombre d’Échéances. Le système créera automatiquement les 6 mensualités.',
    '*Beispiel: Beim Kauf eines Geräts für 1.200 in 6 Raten aktivieren Sie diese Option und geben 6 bei Anzahl der Raten ein. Das System erstellt automatisch alle 6 Monatsraten.'
  ],
  'Informe em quantas prestações mensais consecutivas o valor total da despesa será dividido.': [
    'Informe em quantas prestações mensais consecutivas o valor total da despesa será dividido.',
    'Enter how many consecutive monthly installments the total expense amount will be divided into.',
    'Indica en cuántas cuotas mensuales consecutivas se dividirá el valor total del gasto.',
    'Indica in quante rate mensili consecutive verrà suddiviso l’importo totale della spesa.',
    '输入将该笔支出总额平摊到的连续月度分期期数。',
    'Indiquez en combien d’échéances mensuelles consécutives le montant total sera divisé.',
    'Geben Sie an, auf wie viele aufeinanderfolgende Monatsraten der Gesamtbetrag aufgeteilt wird.'
  ],
  '*Exemplo: Digite 10 para dividir o valor total em 10 parcelas mensais iguais.': [
    '*Exemplo: Introduza 10 para dividir o valor total em 10 prestações mensais iguais.',
    '*Example: Enter 10 to split the total amount into 10 equal monthly installments.',
    '*Ejemplo: Escribe 10 para dividir el monto total en 10 cuotas mensuales iguales.',
    '*Esempio: Digita 10 per dividere l’importo totale in 10 rate mensili uguali.',
    '*示例：输入 10 即可将总金额平均分为 10 期每月还款。',
    '*Exemple : Tapez 10 pour diviser le montant total en 10 mensualités égales.',
    '*Beispiel: Geben Sie 10 ein, um den Gesamtbetrag in 10 gleiche Monatsraten zu teilen.'
  ],
  'Define se este lançamento deve entrar nos cálculos de saldo, metas do Orçamento, gráficos do Dashboard e Relatórios.': [
    'Define se este lançamento deve entrar nos cálculos de saldo, metas do Orçamento, gráficos do Painel e Relatórios.',
    'Determines whether this entry is included in balance calculations, Budget goals, Dashboard charts, and Reports.',
    'Define si este registro debe entrar en los cálculos de saldo, metas del Presupuesto, gráficos del Panel e Informes.',
    'Stabilisce se questa voce deve rientrare nei calcoli del saldo, obiettivi del Budget, grafici della Dashboard e Report.',
    '设置该笔记录是否计入结余计算、预算目标、总览图表和财务报表中。',
    'Définit si cette opération doit être incluse dans les calculs de solde, objectifs du Budget, graphiques et Rapports.',
    'Legt fest, ob dieser Eintrag in Saldoberechnungen, Budgetziele, Dashboard-Diagramme und Berichte einfließt.'
  ],
  '*Exemplo: Mantenha marcado para 99% dos seus gastos e receitas reais. Desmarque apenas se quiser registrar uma movimentação neutra (como transferência entre contas próprias) sem afetar o orçamento.': [
    '*Exemplo: Mantenha marcado para a maioria dos seus gastos e receitas reais. Desmarque apenas se quiser registar uma movimentação neutra sem afetar o orçamento.',
    '*Example: Keep checked for 99% of your real expenses and income. Uncheck only if logging a neutral transfer between your own accounts without affecting your budget.',
    '*Ejemplo: Mantenlo marcado para tus gastos e ingresos reales. Desmárcalo solo si deseas registrar un movimiento neutro sin afectar el presupuesto.',
    '*Esempio: Mantieni selezionato per le spese e entrate reali. Deseleziona solo per registrare un giroconto neutro senza influire sul budget.',
    '*示例：绝大多数真实收支请保持勾选。仅在记录本人账户间互转等中性流水、不希望影响预算时才取消勾选。',
    '*Exemple : Gardez coché pour vos dépenses et revenus réels. Décochez uniquement pour enregistrer un virement interne neutre.',
    '*Beispiel: Für alle regulären Ausgaben und Einnahmen aktiviert lassen. Nur deaktivieren, wenn eine neutrale Umbuchung das Budget nicht beeinflussen soll.'
  ],
  'Define para quantos meses consecutivos esta receita será gerada automaticamente a partir da data informada.': [
    'Define para quantos meses consecutivos esta receita será gerada automaticamente a partir da data informada.',
    'Sets how many consecutive months this income entry will be automatically generated for, starting from the entered date.',
    'Define para cuántos meses consecutivos se generará automáticamente este ingreso a partir de la fecha indicada.',
    'Definisce per quanti mesi consecutivi questa entrata verrà generata automaticamente a partire dalla data inserita.',
    '设置从所填日期起，连续多少个月自动生成该笔收入记录。',
    'Définit pour combien de mois consécutifs ce revenu sera généré automatiquement à partir de la date indiquée.',
    'Legt fest, für wie viele aufeinanderfolgende Monate diese Einnahme ab dem angegebenen Datum automatisch erzeugt wird.'
  ],
  '*Exemplo: Se deixar "1", cadastra apenas neste mês. Se digitar "12", o sistema criará 12 lançamentos mensais consecutivos (ideal para salários fixos ou contratos anuais).': [
    '*Exemplo: Se deixar "1", regista apenas neste mês. Se introduzir "12", o sistema criará 12 lançamentos mensais consecutivos (ideal para salários fixos ou contratos anuais).',
    '*Example: Leaving "1" records it only for this month. Entering "12" creates 12 consecutive monthly entries (ideal for fixed salaries or annual contracts).',
    '*Ejemplo: Si dejas "1", se registra solo este mes. Si escribes "12", el sistema creará 12 ingresos mensuales consecutivos (ideal para salarios fijos o alquileres).',
    '*Esempio: Lasciando "1" registra solo questo mese. Digitando "12", il sistema creerà 12 voci mensili consecutive (ideale per stipendi fissi o contratti annuali).',
    '*示例：保留“1”仅登记本月；输入“12”则会连续创建12个月的收入记录（非常适合固定月薪或年度合同）。',
    '*Exemple : Laisser « 1 » l’enregistre uniquement pour ce mois. Saisir « 12 » crée 12 entrées mensuelles consécutives (idéal pour un salaire fixe).',
    '*Beispiel: Bei „1“ wird nur dieser Monat gebucht. Bei „12“ erstellt das System 12 aufeinanderfolgende Monatseinträge (ideal für Festgehalt).'
  ],
  'Identifica que esta entrada de dinheiro acontece regularmente todos os meses (como salário, aposentadoria ou aluguel recebido).': [
    'Identifica que esta entrada de dinheiro acontece regularmente todos os meses (como salário, reforma ou renda recebida).',
    'Identifies that this income occurs regularly every month (such as salary, pension, or rental income).',
    'Identifica que este ingreso ocurre regularmente todos los meses (como salario, jubilación o alquiler recibido).',
    'Identifica che questa entrata avviene regolarmente ogni mese (come stipendio, pensione o affitto percepito).',
    '标记该笔收入为每月固定发生的定期收入（如工资、退休金或房租收入）。',
    'Identifie que cette entrée d’argent a lieu régulièrement chaque mois (comme un salaire, une retraite ou un loyer perçu).',
    'Kennzeichnet, dass diese Einnahme regelmäßig jeden Monat erfolgt (z. B. Gehalt, Rente oder Mieteinnahmen).'
  ],
  '*Exemplo: Marque esta opção para destacar visualmente na lista quais receitas são fixas/recorrentes.': [
    '*Exemplo: Marque esta opção para destacar visualmente na lista quais receitas são fixas/recorrentes.',
    '*Example: Check this box to visually highlight in the list which income entries are fixed/recurring.',
    '*Ejemplo: Marca esta opción para destacar visualmente en la lista qué ingresos son fijos/recurrentes.',
    '*Esempio: Spunta questa opzione per evidenziare visivamente nell’elenco quali entrate sono fisse/ricorrenti.',
    '*示例：勾选此项可在列表中直观高亮显示哪些收入属于固定定期收入。',
    '*Exemple : Cochez cette option pour mettre en évidence dans la liste les revenus fixes/récurrents.',
    '*Beispiel: Aktivieren Sie diese Option, um feste/wiederkehrende Einnahmen in der Liste optisch hervorzuheben.'
  ],
  'Data de Vencimento': [
    'Data de Vencimento',
    'Due Date',
    'Fecha de Vencimiento',
    'Data di Scadenza',
    '到期日期',
    'Date d’Échéance',
    'Fälligkeitsdatum'
  ],
  'Data de Vencimento (opcional)': [
    'Data de Vencimento (opcional)',
    'Due Date (optional)',
    'Fecha de Vencimiento (opcional)',
    'Data di Scadenza (opzionale)',
    '到期日（可选）',
    'Date d’échéance (optionnel)',
    'Fälligkeitsdatum (optional)'
  ],
  'Data da Compra': [
    'Data da Compra',
    'Purchase Date',
    'Fecha de Compra',
    'Data di Acquisto',
    '购买日期',
    'Date d’Achat',
    'Kaufdatum'
  ],
  'Data da Compra (opcional)': [
    'Data da Compra (opcional)',
    'Purchase Date (optional)',
    'Fecha de Compra (opcional)',
    'Data di Acquisto (opzionale)',
    '购买日期（可选）',
    'Date d’achat (optionnel)',
    'Kaufdatum (optional)'
  ],
  'Data Lançamento': [
    'Data de Lançamento',
    'Entry Date',
    'Fecha de Registro',
    'Data di Registrazione',
    '记录日期',
    'Date de Saisie',
    'Buchungsdatum'
  ],
  'Data Compra': [
    'Data da Compra',
    'Purchase Date',
    'Fecha de Compra',
    'Data Acquisto',
    '购买日期',
    'Date d’Achat',
    'Kaufdatum'
  ],
  'Data Vencimento': [
    'Data de Vencimento',
    'Due Date',
    'Fecha de Vencimiento',
    'Data Scadenza',
    '到期日期',
    'Date d’Échéance',
    'Fälligkeitsdatum'
  ],
  'Subcategoria': [
    'Subcategoria',
    'Subcategory',
    'Subcategoría',
    'Sottocategoria',
    '子类别',
    'Sous-catégorie',
    'Unterkategorie'
  ],
  'Subcategorias': [
    'Subcategorias',
    'Subcategories',
    'Subcategorías',
    'Sottocategorie',
    '子类别',
    'Sous-catégories',
    'Unterkategorien'
  ],
  'Status de Pagamento': [
    'Estado de Pagamento',
    'Payment Status',
    'Estado de Pago',
    'Stato del Pagamento',
    '付款状态',
    'Statut de Paiement',
    'Zahlungsstatus'
  ],
  'Cartão (opcional)': [
    'Cartão (opcional)',
    'Card (optional)',
    'Tarjeta (opcional)',
    'Carta (opzionale)',
    '银行卡（可选）',
    'Carte (optionnel)',
    'Karte (optional)'
  ],
  'Cartão': [
    'Cartão',
    'Card',
    'Tarjeta',
    'Carta',
    '银行卡',
    'Carte',
    'Karte'
  ],
  'Nenhum (Não vinculado)': [
    'Nenhum (Não associado)',
    'None (Unlinked)',
    'Ninguna (No vinculada)',
    'Nessuna (Non collegata)',
    '无（未关联）',
    'Aucune (Non liée)',
    'Keine (Nicht verknüpft)'
  ],
  'Nenhum': [
    'Nenhum',
    'None',
    'Ninguno',
    'Nessuno',
    '无',
    'Aucun',
    'Keine'
  ],
  'Observações': [
    'Observações',
    'Notes',
    'Observaciones',
    'Note',
    '备注',
    'Notes',
    'Notizen'
  ],
  'Observações (opcional)': [
    'Observações (opcional)',
    'Notes (optional)',
    'Observaciones (opcional)',
    'Note (opzionale)',
    '备注（可选）',
    'Notes (optionnel)',
    'Notizen (optional)'
  ],
  'Observações (Opcional)': [
    'Observações (Opcional)',
    'Notes (Optional)',
    'Observaciones (Opcional)',
    'Note (Opzionale)',
    '备注（可选）',
    'Notes (Optionnel)',
    'Notizen (Optional)'
  ],
  'Parcelar despesa': [
    'Parcelar despesa',
    'Split into installments',
    'Fraccionar gasto en cuotas',
    'Rateizza spesa',
    '分期付款',
    'Échelonner la dépense',
    'Ausgabe in Raten zahlen'
  ],
  'Número de Parcelas': [
    'Número de Prestações',
    'Number of Installments',
    'Número de Cuotas',
    'Numero di Rate',
    '分期期数',
    'Nombre d’Échéances',
    'Anzahl der Raten'
  ],
  'Valor de cada parcela:': [
    'Valor de cada prestação:',
    'Installment amount:',
    'Valor de cada cuota:',
    'Importo di ogni rata:',
    '每期金额：',
    'Montant de chaque échéance :',
    'Betrag pro Rate:'
  ],
  'Somar ao Orçamento e Relatórios': [
    'Somar ao Orçamento e Relatórios',
    'Include in Budget & Reports',
    'Sumar al Presupuesto e Informes',
    'Includi in Budget e Report',
    '计入预算与报表',
    'Inclure au Budget et aux Rapports',
    'In Budget & Berichte einbeziehen'
  ],
  'Soma no Orçamento': [
    'Soma no Orçamento',
    'Included in Budget',
    'Suma al Presupuesto',
    'Incluso nel Budget',
    '计入预算',
    'Inclus au Budget',
    'Im Budget enthalten'
  ],
  'Não soma': [
    'Não soma',
    'Excluded',
    'No suma',
    'Escluso',
    '不计入',
    'Exclu',
    'Ausgeschlossen'
  ],
  'Sim (Padrão)': [
    'Sim (Padrão)',
    'Yes (Default)',
    'Sí (Predeterminado)',
    'Sì (Predefinito)',
    '是（默认）',
    'Oui (Par défaut)',
    'Ja (Standard)'
  ],
  'Não (Ignorar nos cálculos)': [
    'Não (Ignorar nos cálculos)',
    'No (Exclude from calculations)',
    'No (Ignorar en los cálculos)',
    'No (Ignora nei calcoli)',
    '否（在计算中忽略）',
    'Non (Ignorer dans les calculs)',
    'Nein (In Berechnungen ignorieren)'
  ],
  'Editar Receita': [
    'Editar Receita',
    'Edit Income',
    'Editar Ingreso',
    'Modifica Entrata',
    '编辑收入',
    'Modifier le Revenu',
    'Einnahme bearbeiten'
  ],
  'Adicionar Receita': [
    'Adicionar Receita',
    'Add Income',
    'Agregar Ingreso',
    'Aggiungi Entrata',
    '添加收入',
    'Ajouter le Revenu',
    'Einnahme hinzufügen'
  ],
  'Atualizar Receita': [
    'Atualizar Receita',
    'Update Income',
    'Actualizar Ingreso',
    'Aggiorna Entrata',
    '更新收入',
    'Mettre à jour le Revenu',
    'Einnahme aktualisieren'
  ],
  'Quantidade de Títulos': [
    'Quantidade de Títulos',
    'Number of Entries',
    'Cantidad de Registros',
    'Quantità di Voci',
    '连续期数',
    'Nombre d’Entrées',
    'Anzahl der Einträge'
  ],
  'Quantidade de Títulos *': [
    'Quantidade de Títulos *',
    'Number of Entries *',
    'Cantidad de Registros *',
    'Quantità di Voci *',
    '连续期数 *',
    'Nombre d’Entrées *',
    'Anzahl der Einträge *'
  ],
  'Descrição *': [
    'Descrição *',
    'Description *',
    'Descripción *',
    'Descrizione *',
    '描述 *',
    'Description *',
    'Beschreibung *'
  ],
  'Valor *': [
    'Valor *',
    'Amount *',
    'Monto *',
    'Importo *',
    '金额 *',
    'Montant *',
    'Betrag *'
  ],
  'Data *': [
    'Data *',
    'Date *',
    'Fecha *',
    'Data *',
    '日期 *',
    'Date *',
    'Datum *'
  ],
  'Categoria *': [
    'Categoria *',
    'Category *',
    'Categoría *',
    'Categoria *',
    '类别 *',
    'Catégorie *',
    'Kategorie *'
  ],
  'Selecione uma subcategoria (opcional)': [
    'Selecione uma subcategoria (opcional)',
    'Select a subcategory (optional)',
    'Selecciona una subcategoría (opcional)',
    'Seleziona una sottocategoria (opzionale)',
    '选择子类别（可选）',
    'Sélectionnez une sous-catégorie (optionnel)',
    'Unterkategorie wählen (optional)'
  ],
  'Receita recorrente (mensal)': [
    'Receita recorrente (mensal)',
    'Recurring income (monthly)',
    'Ingreso recurrente (mensual)',
    'Entrata ricorrente (mensile)',
    '定期收入（每月）',
    'Revenu récurrent (mensuel)',
    'Wiederkehrende Einnahme (monatlich)'
  ],
  'Recorrente': [
    'Recorrente',
    'Recurring',
    'Recurrente',
    'Ricorrente',
    '定期',
    'Récurrent',
    'Wiederkehrend'
  ],
  'Filtros': [
    'Filtros',
    'Filters',
    'Filtros',
    'Filtri',
    '筛选',
    'Filtres',
    'Filter'
  ],
  'Limpar Filtros': [
    'Limpar Filtros',
    'Clear Filters',
    'Limpiar Filtros',
    'Cancella Filtri',
    '清除筛选',
    'Effacer les Filtres',
    'Filter zurücksetzen'
  ],
  'Expandir Filtros': [
    'Expandir Filtros',
    'Expand Filters',
    'Expandir Filtros',
    'Espandi Filtri',
    '展开筛选',
    'Développer les Filtres',
    'Filter ausklappen'
  ],
  'Minimizar Filtros': [
    'Minimizar Filtros',
    'Collapse Filters',
    'Minimizar Filtros',
    'Riduci Filtri',
    '收起筛选',
    'Réduire les Filtres',
    'Filter einklappen'
  ],
  'Expandir Formulário': [
    'Expandir Formulário',
    'Expand Form',
    'Expandir Formulario',
    'Espandi Modulo',
    '展开表单',
    'Développer le Formulaire',
    'Formular ausklappen'
  ],
  'Minimizar Formulário': [
    'Minimizar Formulário',
    'Collapse Form',
    'Minimizar Formulario',
    'Riduci Modulo',
    '收起表单',
    'Réduire le Formulaire',
    'Formular einklappen'
  ],
  'Todas as categorias': [
    'Todas as categorias',
    'All categories',
    'Todas las categorías',
    'Tutte le categorie',
    '所有类别',
    'Toutes les catégories',
    'Alle Kategorien'
  ],
  'Todas as Categorias': [
    'Todas as Categorias',
    'All Categories',
    'Todas las Categorías',
    'Tutte le Categorie',
    '所有类别',
    'Toutes les Catégories',
    'Alle Kategorien'
  ],
  'Todas as subcategorias': [
    'Todas as subcategorias',
    'All subcategories',
    'Todas las subcategorías',
    'Tutte le sottocategorie',
    '所有子类别',
    'Toutes les sous-catégories',
    'Alle Unterkategorien'
  ],
  'Todas as Subcategorias': [
    'Todas as Subcategorias',
    'All Subcategories',
    'Todas las Subcategorías',
    'Tutte le Sottocategorie',
    '所有子类别',
    'Toutes les Sous-catégories',
    'Alle Unterkategorien'
  ],
  'Selecione o mês': [
    'Selecione o mês',
    'Select month',
    'Selecciona el mes',
    'Seleziona il mese',
    '选择月份',
    'Sélectionnez le mois',
    'Monat auswählen'
  ],
  'Todos os Anos': [
    'Todos os Anos',
    'All Years',
    'Todos los Años',
    'Tutti gli Anni',
    '所有年份',
    'Toutes les Années',
    'Alle Jahre'
  ],
  'Todos os anos': [
    'Todos os anos',
    'All years',
    'Todos los años',
    'Tutti gli anni',
    '所有年份',
    'Toutes les années',
    'Alle Jahre'
  ],
  'Todos os Meses': [
    'Todos os Meses',
    'All Months',
    'Todos los Meses',
    'Tutti i Mesi',
    '所有月份',
    'Tous les Mois',
    'Alle Monate'
  ],
  'Todos os meses': [
    'Todos os meses',
    'All months',
    'Todos los meses',
    'Tutti i mesi',
    '所有月份',
    'Tous les mois',
    'Alle Monate'
  ],
  'Todos os status': [
    'Todos os estados',
    'All statuses',
    'Todos los estados',
    'Tutti gli stati',
    '所有状态',
    'Tous les statuts',
    'Alle Status'
  ],
  'Todos os Status': [
    'Todos os Estados',
    'All Statuses',
    'Todos los Estados',
    'Tutti gli Stati',
    '所有状态',
    'Tous les Statuts',
    'Alle Status'
  ],
  'Data Início': [
    'Data de Início',
    'Start Date',
    'Fecha de Inicio',
    'Data Inizio',
    '开始日期',
    'Date de Début',
    'Startdatum'
  ],
  'Data Fim': [
    'Data de Fim',
    'End Date',
    'Fecha de Fin',
    'Data Fine',
    '结束日期',
    'Date de Fin',
    'Enddatum'
  ],
  'Buscar por descrição': [
    'Pesquisar por descrição',
    'Search by description',
    'Buscar por descripción',
    'Cerca per descrizione',
    '按描述搜索',
    'Rechercher par description',
    'Nach Beschreibung suchen'
  ],
  'categorias ativas': [
    'categorias ativas',
    'active categories',
    'categorías activas',
    'categorie attive',
    '个活跃类别',
    'catégories actives',
    'aktive Kategorien'
  ],
  'subcategorias ativas': [
    'subcategorias ativas',
    'active subcategories',
    'subcategorías activas',
    'sottocategorie attive',
    '个活跃子类别',
    'sous-catégories actives',
    'aktive Unterkategorien'
  ],
  'ativas': [
    'ativas',
    'active',
    'activas',
    'attive',
    '活跃',
    'actives',
    'aktiv'
  ],
  'Lista de Despesas': [
    'Lista de Despesas',
    'Expense List',
    'Lista de Gastos',
    'Elenco Spese',
    '支出列表',
    'Liste des Dépenses',
    'Ausgabenliste'
  ],
  'Lista de Receitas': [
    'Lista de Receitas',
    'Income List',
    'Lista de Ingresos',
    'Elenco Entrate',
    '收入列表',
    'Liste des Revenus',
    'Einnahmenliste'
  ],
  'Marcar como Pago': [
    'Marcar como Pago',
    'Mark as Paid',
    'Marcar como Pagado',
    'Segna come Pagato',
    '标记为已付',
    'Marquer comme Payé',
    'Als bezahlt markieren'
  ],
  'Marcar como Pendente': [
    'Marcar como Pendente',
    'Mark as Pending',
    'Marcar como Pendiente',
    'Segna come In Sospeso',
    '标记为待付',
    'Marquer en Attente',
    'Als ausstehend markieren'
  ],
  'Nenhuma despesa cadastrada': [
    'Nenhuma despesa registada',
    'No expenses recorded',
    'Ningún gasto registrado',
    'Nessuna spesa registrata',
    '暂无支出记录',
    'Aucune dépense enregistrée',
    'Keine Ausgaben erfasst'
  ],
  'Nenhuma despesa encontrada com os filtros aplicados': [
    'Nenhuma despesa encontrada com os filtros aplicados',
    'No expenses found matching the applied filters',
    'No se encontraron gastos con los filtros aplicados',
    'Nessuna spesa trovata con i filtri applicati',
    '未找到符合筛选条件的支出',
    'Aucune dépense trouvée avec les filtres appliqués',
    'Keine Ausgaben mit den angewendeten Filtern gefunden'
  ],
  'Nenhuma receita cadastrada': [
    'Nenhuma receita registada',
    'No income recorded',
    'Ningún ingreso registrado',
    'Nessuna entrata registrata',
    '暂无收入记录',
    'Aucun revenu enregistré',
    'Keine Einnahmen erfasst'
  ],
  'Nenhuma receita encontrada com os filtros aplicados': [
    'Nenhuma receita encontrada com os filtros aplicados',
    'No income found matching the applied filters',
    'No se encontraron ingresos con los filtros aplicados',
    'Nessuna entrata trovata con i filtri applicati',
    '未找到符合筛选条件的收入',
    'Aucun revenu trouvé avec les filtres appliqués',
    'Keine Einnahmen mit den angewendeten Filtern gefunden'
  ],
  'Sem data de vencimento': [
    'Sem data de vencimento',
    'No due date',
    'Sin fecha de vencimiento',
    'Senza data di scadenza',
    '无到期日',
    'Sans date d’échéance',
    'Kein Fälligkeitsdatum'
  ],
  'Atualizar Selecionadas': [
    'Atualizar Selecionadas',
    'Update Selected',
    'Actualizar Seleccionados',
    'Aggiorna Selezionate',
    '更新所选',
    'Mettre à jour la Sélection',
    'Ausgewählte aktualisieren'
  ],
  'Manter Descrição': [
    'Manter Descrição',
    'Keep Description',
    'Mantener Descripción',
    'Mantieni Descrizione',
    '保持原描述',
    'Conserver la Description',
    'Beschreibung beibehalten'
  ],
  'Manter Categoria': [
    'Manter Categoria',
    'Keep Category',
    'Mantener Categoría',
    'Mantieni Categoria',
    '保持原类别',
    'Conserver la Catégorie',
    'Kategorie beibehalten'
  ],
  'Manter Subcategoria': [
    'Manter Subcategoria',
    'Keep Subcategory',
    'Mantener Subcategoría',
    'Mantieni Sottocategoria',
    '保持原子类别',
    'Conserver la Sous-catégorie',
    'Unterkategorie beibehalten'
  ],
  'Manter Status': [
    'Manter Estado',
    'Keep Status',
    'Mantener Estado',
    'Mantieni Stato',
    '保持原状态',
    'Conserver le Statut',
    'Status beibehalten'
  ],
  'Manter Configuração': [
    'Manter Configuração',
    'Keep Setting',
    'Mantener Configuración',
    'Mantieni Impostazione',
    '保持原设置',
    'Conserver le Paramètre',
    'Einstellung beibehalten'
  ],
  'Nova Descrição (opcional)': [
    'Nova Descrição (opcional)',
    'New Description (optional)',
    'Nueva Descripción (opcional)',
    'Nuova Descrizione (opzionale)',
    '新描述（可选）',
    'Nouvelle Description (optionnel)',
    'Neue Beschreibung (optional)'
  ],
  'Nova Categoria (opcional)': [
    'Nova Categoria (opcional)',
    'New Category (optional)',
    'Nueva Categoría (opcional)',
    'Nuova Categoria (opzionale)',
    '新类别（可选）',
    'Nouvelle Catégorie (optionnel)',
    'Neue Kategorie (optional)'
  ],
  'Nova Subcategoria (opcional)': [
    'Nova Subcategoria (opcional)',
    'New Subcategory (optional)',
    'Nueva Subcategoría (opcional)',
    'Nuova Sottocategoria (opzionale)',
    '新子类别（可选）',
    'Nouvelle Sous-catégorie (optionnel)',
    'Neue Unterkategorie (optional)'
  ],
  'Novo Status de Pagamento (opcional)': [
    'Novo Estado de Pagamento (opcional)',
    'New Payment Status (optional)',
    'Nuevo Estado de Pago (opcional)',
    'Nuovo Stato di Pagamento (opzionale)',
    '新付款状态（可选）',
    'Nouveau Statut de Paiement (optionnel)',
    'Neuer Zahlungsstatus (optional)'
  ],
  'Somar ao Orçamento (opcional)': [
    'Somar ao Orçamento (opcional)',
    'Include in Budget (optional)',
    'Sumar al Presupuesto (opcional)',
    'Includi nel Budget (opzionale)',
    '计入预算（可选）',
    'Inclure au Budget (optionnel)',
    'In Budget einbeziehen (optional)'
  ],

  // =========================================================================
  // CATEGORIAS E SUBCATEGORIAS PADRÃO DO SISTEMA (DESPESAS E RECEITAS)
  // =========================================================================
  'Despesas Fixas': [
    'Despesas Fixas',
    'Fixed Expenses',
    'Gastos Fijos',
    'Spese Fisse',
    '固定支出',
    'Dépenses Fixes',
    'Fixkosten'
  ],
  'Lazer': [
    'Lazer',
    'Leisure',
    'Ocio',
    'Tempo Libero',
    '休闲娱乐',
    'Loisirs',
    'Freizeit'
  ],
  'Educação': [
    'Educação',
    'Education',
    'Educación',
    'Istruzione',
    '教育学习',
    'Éducation',
    'Bildung'
  ],
  'Reserva de Emergência': [
    'Reserva de Emergência',
    'Emergency Fund',
    'Fondo de Emergencia',
    'Fondo di Emergenza',
    '应急储备金',
    'Fonds d’Urgence',
    'Notgroschen'
  ],
  'Outros': [
    'Outros',
    'Others',
    'Otros',
    'Altro',
    '其他',
    'Autres',
    'Sonstiges'
  ],
  'Moradia': [
    'Habitação',
    'Housing',
    'Vivienda',
    'Abitazione',
    '住房',
    'Logement',
    'Wohnen'
  ],
  'Mercado': [
    'Supermercado',
    'Groceries',
    'Supermercado',
    'Supermercato',
    '超市采购',
    'Supermarché',
    'Lebensmittel'
  ],
  'Saúde': [
    'Saúde',
    'Healthcare',
    'Salud',
    'Salute',
    '医疗健康',
    'Santé',
    'Gesundheit'
  ],
  'Carro': [
    'Automóvel',
    'Car',
    'Auto',
    'Auto',
    '汽车开销',
    'Voiture',
    'Auto'
  ],
  'Transporte': [
    'Transporte',
    'Transportation',
    'Transporte',
    'Trasporti',
    '交通出行',
    'Transport',
    'Transport'
  ],
  'Bichos': [
    'Animais de Estimação',
    'Pets',
    'Mascotas',
    'Animali Domestici',
    '宠物',
    'Animaux',
    'Haustiere'
  ],
  'Diversos Fixos': [
    'Diversos Fixos',
    'Misc. Fixed',
    'Varios Fijos',
    'Varie Fisse',
    '其他固定支出',
    'Divers Fixes',
    'Sonstige Fixkosten'
  ],
  'Junkie Food': [
    'Fast Food',
    'Fast Food',
    'Comida Rápida',
    'Fast Food',
    '快餐零食',
    'Restauration Rapide',
    'Fast Food'
  ],
  'Assinaturas': [
    'Subscrições',
    'Subscriptions',
    'Suscripciones',
    'Abbonamenti',
    '订阅服务',
    'Abonnements',
    'Abonnements'
  ],
  'Rolês e Passeios': [
    'Saídas e Passeios',
    'Outings & Events',
    'Salidas y Paseos',
    'Uscite e Svago',
    '聚会与出游',
    'Sorties et Balades',
    'Ausflüge & Events'
  ],
  'Datas especiais': [
    'Datas especiais',
    'Special occasions',
    'Fechas especiales',
    'Occasioni speciali',
    '特殊节日',
    'Occasions spéciales',
    'Besondere Anlässe'
  ],
  'Datas Especiais': [
    'Datas Especiais',
    'Special Occasions',
    'Fechas Especiales',
    'Occasioni Speciali',
    '特殊节日',
    'Occasions Spéciales',
    'Besondere Anlässe'
  ],
  'Presentes': [
    'Presentes',
    'Gifts',
    'Regalos',
    'Regali',
    '礼物',
    'Cadeaux',
    'Geschenke'
  ],
  'Diversos Lazer': [
    'Diversos Lazer',
    'Misc. Leisure',
    'Varios Ocio',
    'Varie Tempo Libero',
    '其他休闲娱乐',
    'Divers Loisirs',
    'Sonstige Freizeit'
  ],
  'Cursos': [
    'Cursos',
    'Courses',
    'Cursos',
    'Corsi',
    '课程培训',
    'Cours',
    'Kurse'
  ],
  'Livros': [
    'Livros',
    'Books',
    'Libros',
    'Libri',
    '书籍',
    'Livres',
    'Bücher'
  ],
  'Workshops': [
    'Workshops',
    'Workshops',
    'Talleres',
    'Workshop',
    '研讨会',
    'Ateliers',
    'Workshops'
  ],
  'Material Escolar': [
    'Material Escolar',
    'School Supplies',
    'Material Escolar',
    'Materiale Scolastico',
    '学习用品',
    'Fournitures Scolaires',
    'Schulmaterial'
  ],
  'Faculdade': [
    'Universidade',
    'College / University',
    'Universidad',
    'Università',
    '大学学费',
    'Université',
    'Studium / Universität'
  ],
  'Idiomas': [
    'Idiomas',
    'Languages',
    'Idiomas',
    'Lingue',
    '语言学习',
    'Langues',
    'Sprachen'
  ],
  'Pós-graduação': [
    'Pós-graduação',
    'Postgraduate',
    'Posgrado',
    'Post-laurea',
    '研究生进修',
    'Troisième Cycle',
    'Postgraduiertenstudium'
  ],
  'Diversos Educação': [
    'Diversos Educação',
    'Misc. Education',
    'Varios Educación',
    'Varie Istruzione',
    '其他教育支出',
    'Divers Éducation',
    'Sonstige Bildung'
  ],
  'Investimentos BR': [
    'Investimentos Locais',
    'Domestic Investments',
    'Inversiones Locales',
    'Investimenti Nazionali',
    '国内投资',
    'Investissements Locaux',
    'Inländische Investitionen'
  ],
  'Investimentos US': [
    'Investimentos Internacionais',
    'International Investments',
    'Inversiones Internacionales',
    'Investimenti Internazionali',
    '国际/美股投资',
    'Investissements Internationaux',
    'Internationale Investitionen'
  ],
  'Cripto': [
    'Cripto',
    'Crypto',
    'Cripto',
    'Cripto',
    '加密货币',
    'Crypto',
    'Krypto'
  ],
  'Diversos Investimentos': [
    'Diversos Investimentos',
    'Misc. Investments',
    'Varios Inversiones',
    'Vari Investimenti',
    '其他投资',
    'Divers Investissements',
    'Sonstige Investitionen'
  ],
  'Fundo de Emergência': [
    'Fundo de Emergência',
    'Emergency Fund',
    'Fondo de Emergencia',
    'Fondo di Emergenza',
    '应急基金',
    'Fonds d’Urgence',
    'Notfallfonds'
  ],
  'Fundo de Oportunidade': [
    'Fundo de Oportunidade',
    'Opportunity Fund',
    'Fondo de Oportunidad',
    'Fondo Opportunità',
    '机会基金',
    'Fonds d’Opportunité',
    'Chancenfonds'
  ],
  'Diversos Reserva': [
    'Diversos Reserva',
    'Misc. Savings',
    'Varios Reserva',
    'Varie Riserve',
    '其他储备',
    'Divers Réserve',
    'Sonstige Rücklagen'
  ],
  'Passagens e Deslocamento': [
    'Bilhetes e Deslocação',
    'Flights & Transit',
    'Pasajes y Desplazamiento',
    'Biglietti e Spostamenti',
    '机票与交通',
    'Billets et Déplacements',
    'Tickets & Anreise'
  ],
  'Hospedagem': [
    'Alojamento',
    'Lodging / Hotel',
    'Alojamiento',
    'Alloggio',
    '住宿',
    'Hébergement',
    'Unterkunft'
  ],
  'Alimentação em Viagem': [
    'Alimentação em Viagem',
    'Travel Dining',
    'Alimentación en Viaje',
    'Pasti in Viaggio',
    '旅行餐饮',
    'Repas en Voyage',
    'Verpflegung auf Reisen'
  ],
  'Passeios e Ingressos': [
    'Passeios e Bilhetes',
    'Tours & Tickets',
    'Paseos y Entradas',
    'Tour e Biglietti',
    '景点门票与游览',
    'Excursions et Billets',
    'Ausflüge & Tickets'
  ],
  'Documentação e Seguros': [
    'Documentação e Seguros',
    'Documents & Insurance',
    'Documentación y Seguros',
    'Documenti e Assicurazioni',
    '证件与保险',
    'Documents et Assurances',
    'Dokumente & Versicherung'
  ],
  'Compras e Lembranças': [
    'Compras e Lembranças',
    'Shopping & Souvenirs',
    'Compras y Recuerdos',
    'Shopping e Souvenir',
    '购物与纪念品',
    'Achats et Souvenirs',
    'Shopping & Souvenirs'
  ],
  'Câmbio e Taxas': [
    'Câmbio e Taxas',
    'Currency Exchange & Fees',
    'Cambio y Tasas',
    'Cambio e Commissioni',
    '换汇与手续费',
    'Change et Frais',
    'Währungswechsel & Gebühren'
  ],
  'Imprevistos e Emergências': [
    'Imprevistos e Emergências',
    'Unexpected & Emergencies',
    'Imprevistos y Emergencias',
    'Imprevisti ed Emergenze',
    '意外与紧急开销',
    'Imprévus et Urgences',
    'Unvorhergesehenes & Notfälle'
  ],
  'Receita Principal': [
    'Receita Principal',
    'Primary Income',
    'Ingreso Principal',
    'Entrata Principale',
    '主要收入',
    'Revenu Principal',
    'Haupteinkommen'
  ],
  'Renda Extra': [
    'Rendimento Extra',
    'Side Income',
    'Ingreso Extra',
    'Entrata Extra',
    '额外收入',
    'Revenu Complémentaire',
    'Nebeneinkommen'
  ],
  'Investimentos e Rendimentos': [
    'Investimentos e Rendimentos',
    'Investments & Returns',
    'Inversiones y Rendimientos',
    'Investimenti e Rendimenti',
    '投资与收益',
    'Investissements et Rendements',
    'Investitionen & Erträge'
  ],
  'Vendas e Comissões': [
    'Vendas e Comissões',
    'Sales & Commissions',
    'Ventas y Comisiones',
    'Vendite e Commissioni',
    '销售与佣金',
    'Ventes et Commissions',
    'Verkäufe & Provisionen'
  ],
  'Reembolsos e Restituições': [
    'Reembolsos e Restituições',
    'Refunds & Reimbursements',
    'Reembolsos y Devoluciones',
    'Rimborsi e Restituzioni',
    '报销与退税',
    'Remboursements et Restitutions',
    'Erstattungen & Rückzahlungen'
  ],
  'Presentes e Doações': [
    'Presentes e Doações',
    'Gifts & Donations',
    'Regalos y Donaciones',
    'Regali e Donazioni',
    '礼金与赠予',
    'Cadeaux et Dons',
    'Geschenke & Spenden'
  ],
  'Salário Mensal (CLT / Público)': [
    'Salário Mensal (Contrato / Público)',
    'Monthly Salary (Full-time / Public)',
    'Salario Mensual (Fijo / Público)',
    'Stipendio Mensile (Dipendente / Pubblico)',
    '每月工资（全职/公职）',
    'Salaire Mensuel (CDI / Public)',
    'Monatsgehalt (Festanstellung / Öffentlich)'
  ],
  'Pró-labore / Empresarial': [
    'Pró-labore / Empresarial',
    'Owner’s Draw / Business Income',
    'Honorarios / Empresarial',
    'Compenso Amministratore / Impresa',
    '企业主薪酬 / 经营收入',
    'Rémunération Dirigeant / Entreprise',
    'Unternehmerlohn / Geschäftseinkommen'
  ],
  'Aposentadoria / Pensão': [
    'Reforma / Pensão',
    'Retirement / Pension',
    'Jubilación / Pensión',
    'Pensione',
    '退休金 / 养老金',
    'Retraite / Pension',
    'Rente / Pension'
  ],
  '13º Salário': [
    'Subsídio de Natal / 13.º Mês',
    '13th Month Salary / Year-End Bonus',
    'Aguinaldo / 13º Salario',
    'Tredicesima',
    '年底双薪 / 十三薪',
    '13e Mois / Prime de Fin d’Année',
    '13. Monatsgehalt / Weihnachtsgeld'
  ],
  'Férias': [
    'Subsídio de Férias',
    'Vacation Pay',
    'Vacaciones',
    'Ferie Retribuite',
    '带薪休假补贴',
    'Congés Payés',
    'Urlaubsgeld'
  ],
  'PLR / Bônus / Participação': [
    'Bónus / Participação nos Lucros',
    'Profit Sharing / Bonus',
    'Bonos / Participación en Ganancias',
    'Bonus / Partecipazione agli Utili',
    '分红 / 奖金 / 绩效',
    'Participation / Bonus',
    'Gewinnbeteiligung / Bonus'
  ],
  'Adiantamento Salarial': [
    'Adiantamento Salarial',
    'Salary Advance',
    'Adelanto Salarial',
    'Anticipo Stipendio',
    '预支工资',
    'Avance sur Salaire',
    'Gehaltsvorschuss'
  ],
  'Outras Receitas Principais': [
    'Outras Receitas Principais',
    'Other Primary Income',
    'Otros Ingresos Principales',
    'Altre Entrate Principali',
    '其他主要收入',
    'Autres Revenus Principaux',
    'Sonstige Haupteinnahmen'
  ],
  'Freelance / Serviços Prestados': [
    'Freelance / Serviços Prestados',
    'Freelance / Services Provided',
    'Freelance / Servicios Prestados',
    'Freelance / Servizi Prestati',
    '自由职业 / 劳务服务',
    'Freelance / Prestations de Services',
    'Freelance / Dienstleistungen'
  ],
  'Consultoria / Mentoria': [
    'Consultoria / Mentoria',
    'Consulting / Mentoring',
    'Consultoría / Mentoría',
    'Consulenza / Mentoring',
    '咨询 / 辅导',
    'Conseil / Mentorat',
    'Beratung / Mentoring'
  ],
  'Hora Extra': [
    'Horas Extra',
    'Overtime Pay',
    'Horas Extras',
    'Straordinari',
    '加班费',
    'Heures Supplémentaires',
    'Überstundenvergütung'
  ],
  'Aluguel de Imóveis / Temporada': [
    'Arrendamento de Imóveis / Temporada',
    'Property / Short-Term Rental',
    'Alquiler de Inmuebles / Temporada',
    'Affitto Immobili / Breve Termine',
    '房产租金 / 短租收入',
    'Location Immobilière / Saisonnière',
    'Immobilien- / Ferienvermietung'
  ],
  'Aulas Particulares / Treinamentos': [
    'Aulas Particulares / Formações',
    'Private Lessons / Training',
    'Clases Particulares / Capacitaciones',
    'Lezioni Private / Formazione',
    '私教课 / 培训收入',
    'Cours Particuliers / Formations',
    'Privatunterricht / Schulungen'
  ],
  'Trabalhos por Aplicativo': [
    'Trabalhos por Aplicação',
    'Gig / App Work',
    'Trabajos por Aplicación',
    'Lavori tramite App',
    '平台兼职 / 零工收入',
    'Travail via Application',
    'Plattform- / App-Arbeit'
  ],
  'Outras Rendas Extras': [
    'Outras Rendas Extras',
    'Other Side Income',
    'Otros Ingresos Extras',
    'Altre Entrate Extra',
    '其他额外收入',
    'Autres Revenus Complémentaires',
    'Sonstige Nebeneinnahmen'
  ],
  'Dividendos / JCP': [
    'Dividendos / Juros sobre Capital',
    'Dividends / Interest on Equity',
    'Dividendos / Intereses sobre Capital',
    'Dividendi / Interessi sul Capitale',
    '股息 / 红利',
    'Dividendes / Intérêts sur Capital',
    'Dividenden / Kapitalzinsen'
  ],
  'Rendimentos de Renda Fixa (CDB, Tesouro, LCI/LCA)': [
    'Rendimentos de Renda Fixa (Depósitos, Obrigações)',
    'Fixed Income Returns (Bonds, Treasury, CDs)',
    'Rendimientos de Renta Fija (Bonos, Tesoro)',
    'Rendimenti a Reddito Fisso (Titoli, Obbligazioni)',
    '固定收益（定期存款、国债、理财）',
    'Revenus à Taux Fixe (Obligations, Épargne)',
    'Festverzinsliche Erträge (Anleihen, Festgeld)'
  ],
  'Fundos Imobiliários (FIIs)': [
    'Fundos Imobiliários (REITs / FIIs)',
    'Real Estate Funds (REITs)',
    'Fondos Inmobiliarios (REITs)',
    'Fondi Immobiliari (REITs)',
    '房地产投资信托 (REITs)',
    'Fonds Immobiliers (SCPI / REITs)',
    'Immobilienfonds (REITs)'
  ],
  'Lucro com Ações / Day Trade': [
    'Lucro com Ações / Trading',
    'Stock Gains / Trading',
    'Ganancias en Acciones / Trading',
    'Profitti Azionari / Trading',
    '股票收益 / 交易盈利',
    'Gains Boursiers / Trading',
    'Aktiengewinne / Trading'
  ],
  'Criptomoedas': [
    'Criptomoedas',
    'Cryptocurrencies',
    'Criptomonedas',
    'Criptovalute',
    '加密货币收益',
    'Cryptomonnaies',
    'Kryptowährungen'
  ],
  'Juros sobre Capital': [
    'Juros sobre Capital',
    'Capital Interest',
    'Intereses sobre Capital',
    'Interessi sul Capitale',
    '资本利息',
    'Intérêts sur le Capital',
    'Kapitalzinsen'
  ],
  'Outros Rendimentos': [
    'Outros Rendimentos',
    'Other Investment Returns',
    'Otros Rendimientos',
    'Altri Rendimenti',
    '其他投资收益',
    'Autres Rendements',
    'Sonstige Erträge'
  ],
  'Venda de Produtos': [
    'Venda de Produtos',
    'Product Sales',
    'Venta de Productos',
    'Vendita di Prodotti',
    '商品销售',
    'Vente de Produits',
    'Produktverkäufe'
  ],
  'Venda de Bens / Desapego': [
    'Venda de Bens Usados',
    'Secondhand / Asset Sales',
    'Venta de Bienes / Usados',
    'Vendita di Beni / Usato',
    '闲置物品出售',
    'Vente de Biens / Occasion',
    'Verkauf von Gebrauchtwaren / Vermögenswerten'
  ],
  'Comissão de Vendas': [
    'Comissão de Vendas',
    'Sales Commission',
    'Comisión de Ventas',
    'Commissioni di Vendita',
    '销售佣金',
    'Commission sur Ventes',
    'Verkaufsprovision'
  ],
  'Afiliados / Infoprodutos': [
    'Afiliados / Infoprodutos',
    'Affiliates / Digital Products',
    'Afiliados / Infoproductos',
    'Affiliati / Prodotti Digitali',
    '联盟营销 / 数字产品',
    'Affiliation / Produits Numériques',
    'Affiliate / Digitale Produkte'
  ],
  'Cashback / Programas de Pontos': [
    'Cashback / Programas de Pontos',
    'Cashback / Rewards Programs',
    'Cashback / Programas de Puntos',
    'Cashback / Programmi Fedeltà',
    '返现 / 积分奖励',
    'Cashback / Programmes de Fidélité',
    'Cashback / Bonusprogramme'
  ],
  'Outras Vendas': [
    'Outras Vendas',
    'Other Sales',
    'Otras Ventas',
    'Altre Vendite',
    '其他销售收入',
    'Autres Ventes',
    'Sonstige Verkäufe'
  ],
  'Reembolso de Despesas / Empresa': [
    'Reembolso de Despesas / Empresa',
    'Expense Reimbursement / Company',
    'Reembolso de Gastos / Empresa',
    'Rimborso Spese / Azienda',
    '公司费用报销',
    'Remboursement de Frais / Entreprise',
    'Spesenerstattung / Unternehmen'
  ],
  'Reembolso Médico / Plano de Saúde': [
    'Reembolso Médico / Seguro de Saúde',
    'Medical / Health Insurance Reimbursement',
    'Reembolso Médico / Seguro de Salud',
    'Rimborso Medico / Assicurazione Sanitaria',
    '医疗 / 医保报销',
    'Remboursement Médical / Mutuelle',
    'Arzt- / Krankenkassenerstattung'
  ],
  'Restituição do Imposto de Renda': [
    'Reembolso de IRS / Imposto',
    'Income Tax Refund',
    'Devolución de Impuestos',
    'Rimborso Fiscale / Dichiarazione',
    '个人所得税退税',
    'Remboursement d’Impôt sur le Revenu',
    'Einkommensteuererstattung'
  ],
  'Devolução / Estorno de Compra': [
    'Devolução / Estorno de Compra',
    'Purchase Refund / Chargeback',
    'Devolución / Reverso de Compra',
    'Rimborso / Storno Acquisto',
    '购物退款 / 冲正',
    'Remboursement / Annulation d’Achat',
    'Kauferstattung / Rückbuchung'
  ],
  'Empréstimo Recebido / Quitação': [
    'Empréstimo Recebido / Liquidação',
    'Loan Repayment Received',
    'Préstamo Recibido / Liquidación',
    'Prestito Ricevuto / Rimborso',
    '收到还款 / 借款收回',
    'Remboursement de Prêt Reçu',
    'Erhaltene Kreditrückzahlung'
  ],
  'Outros Reembolsos': [
    'Outros Reembolsos',
    'Other Refunds',
    'Otros Reembolsos',
    'Altri Rimborsi',
    '其他报销或退款',
    'Autres Remboursements',
    'Sonstige Erstattungen'
  ],
  'Presente em Dinheiro / PIX': [
    'Presente em Dinheiro / Transferência',
    'Cash Gift / Transfer',
    'Regalo en Efectivo / Transferencia',
    'Regalo in Denaro / Bonifico',
    '现金红包 / 转账礼金',
    'Cadeau en Espèces / Virement',
    'Geldgeschenk / Überweisung'
  ],
  'Mesada / Ajuda Familiar': [
    'Mesada / Apoio Familiar',
    'Allowance / Family Support',
    'Mesada / Ayuda Familiar',
    'Paghetta / Supporto Familiare',
    '零花钱 / 家庭资助',
    'Argent de Poche / Aide Familiale',
    'Taschengeld / Familienunterstützung'
  ],
  'Premiação / Sorteio': [
    'Prémio / Sorteio',
    'Prize / Giveaway',
    'Premio / Sorteo',
    'Premio / Estrazione',
    '奖金 / 抽奖中奖',
    'Prix / Tirage au Sort',
    'Preis / Gewinnspiel'
  ],
  'Herança / Doação': [
    'Herança / Doação',
    'Inheritance / Donation',
    'Herencia / Donación',
    'Eredità / Donazione',
    '遗产 / 捐赠',
    'Héritage / Donation',
    'Erbschaft / Schenkung'
  ],
  'Saldo Inicial / Ajuste de Caixa': [
    'Saldo Inicial / Ajuste de Caixa',
    'Opening Balance / Cash Adjustment',
    'Saldo Inicial / Ajuste de Caja',
    'Saldo Iniziale / Rettifica Cassa',
    '期初余额 / 现金调整',
    'Solde Initial / Ajustement de Caisse',
    'Anfangssaldo / Kassenanpassung'
  ],
  'Entrada Eventual': [
    'Entrada Eventual',
    'Occasional Income',
    'Ingreso Eventual',
    'Entrata Occasionale',
    '临时收入',
    'Entrée Occasionnelle',
    'Gelegentliche Einnahme'
  ],
  'Outras Entradas': [
    'Outras Entradas',
    'Other Inflows',
    'Otras Entradas',
    'Altre Entrate',
    '其他收入项',
    'Autres Entrées',
    'Sonstige Zugänge'
  ],

  // =========================================================================
  // DASHBOARD, ORÇAMENTO, CARTÕES, VIAGENS, RELATÓRIOS, DRE, BACKUP, CONFIGS
  // =========================================================================
  'Visão geral das suas finanças': [
    'Visão geral das suas finanças',
    'Overview of your finances',
    'Visión general de tus finanzas',
    'Panoramica delle tue finanze',
    '您的财务总览',
    'Aperçu général de vos finances',
    'Übersicht Ihrer Finanzen'
  ],
  'Importar Planilha': [
    'Importar Folha de Cálculo',
    'Import Spreadsheet',
    'Importar Hoja de Cálculo',
    'Importa Foglio di Calcolo',
    '导入表格',
    'Importer un Tableur',
    'Tabelle importieren'
  ],
  'Importar planilha de receitas e despesas': [
    'Importar folha de cálculo de receitas e despesas',
    'Import income and expenses spreadsheet',
    'Importar hoja de cálculo de ingresos y gastos',
    'Importa foglio di calcolo di entrate e spese',
    '导入收入与支出表格',
    'Importer un tableur de revenus et dépenses',
    'Einnahmen- und Ausgabentabelle importieren'
  ],
  'Saldo Final': [
    'Saldo Final',
    'Final Balance',
    'Saldo Final',
    'Saldo Finale',
    '最终结余',
    'Solde Final',
    'Endsaldo'
  ],
  'Percentual Sobra': [
    'Percentagem de Sobra',
    'Surplus Percentage',
    'Porcentaje de Excedente',
    'Percentuale di Avanzo',
    '结余比例',
    'Pourcentage d’Excédent',
    'Überschussquote'
  ],
  'Status Financeiro': [
    'Estado Financeiro',
    'Financial Status',
    'Estado Financiero',
    'Stato Finanziario',
    '财务状态',
    'Statut Financier',
    'Finanzstatus'
  ],
  'Sobrando no mês': [
    'Sobrando no mês',
    'Monthly surplus',
    'Sobrante en el mes',
    'Avanzo nel mese',
    '本月有结余',
    'Excédent du mois',
    'Monatlicher Überschuss'
  ],
  'Déficit no mês': [
    'Défice no mês',
    'Monthly deficit',
    'Déficit en el mes',
    'Deficit nel mese',
    '本月赤字',
    'Déficit du mois',
    'Monatliches Defizit'
  ],
  'Excelente!': [
    'Excelente!',
    'Excellent!',
    '¡Excelente!',
    'Eccellente!',
    '非常棒！',
    'Excellent !',
    'Ausgezeichnet!'
  ],
  'Bom': [
    'Bom',
    'Good',
    'Bueno',
    'Buono',
    '良好',
    'Bon',
    'Gut'
  ],
  'Atenção': [
    'Atenção',
    'Warning',
    'Atención',
    'Attenzione',
    '注意',
    'Attention',
    'Achtung'
  ],
  'Déficit': [
    'Défice',
    'Deficit',
    'Déficit',
    'Deficit',
    '赤字',
    'Déficit',
    'Defizit'
  ],
  'Metas por Categoria': [
    'Metas por Categoria',
    'Category Goals',
    'Metas por Categoría',
    'Obiettivi per Categoria',
    '分类目标',
    'Objectifs par Catégorie',
    'Ziele nach Kategorie'
  ],
  'Acompanhamento dos limites planejados para o mês': [
    'Acompanhamento dos limites planeados para o mês',
    'Tracking planned monthly limits',
    'Seguimiento de los límites planificados para el mes',
    'Monitoraggio dei limiti pianificati per il mese',
    '跟踪本月计划限额执行情况',
    'Suivi des plafonds prévus pour le mois',
    'Überwachung der geplanten Monatslimits'
  ],
  'Gasto': [
    'Gasto',
    'Spent',
    'Gastado',
    'Speso',
    '已支',
    'Dépensé',
    'Ausgegeben'
  ],
  'Excedeu a meta': [
    'Excedeu a meta',
    'Exceeded goal',
    'Excedió la meta',
    'Obiettivo superato',
    '超出目标',
    'Objectif dépassé',
    'Ziel überschritten'
  ],
  'Próximo do limite': [
    'Próximo do limite',
    'Near limit',
    'Cerca del límite',
    'Vicino al limite',
    '接近限额',
    'Proche de la limite',
    'Nahe am Limit'
  ],
  'Dentro da meta': [
    'Dentro da meta',
    'Within goal',
    'Dentro de la meta',
    'Entro l’obiettivo',
    '在目标范围内',
    'Dans l’objectif',
    'Im Zielbereich'
  ],
  'Evolução Mensal (Fluxo de Caixa)': [
    'Evolução Mensal (Fluxo de Caixa)',
    'Monthly Evolution (Cash Flow)',
    'Evolución Mensual (Flujo de Caja)',
    'Evoluzione Mensile (Flusso di Cassa)',
    '月度趋势（现金流）',
    'Évolution Mensuelle (Flux de Trésorerie)',
    'Monatliche Entwicklung (Cashflow)'
  ],
  'Receitas vs Despesas nos últimos 6 meses': [
    'Receitas vs Despesas nos últimos 6 meses',
    'Income vs Expenses over the last 6 months',
    'Ingresos vs Gastos en los últimos 6 meses',
    'Entrate vs Spese negli ultimi 6 mesi',
    '近6个月收入与支出对比',
    'Revenus vs Dépenses sur les 6 derniers mois',
    'Einnahmen vs. Ausgaben der letzten 6 Monate'
  ],
  'Distribuição de Gastos': [
    'Distribuição de Gastos',
    'Spending Breakdown',
    'Distribución de Gastos',
    'Distribuzione delle Spese',
    '支出分布',
    'Répartition des Dépenses',
    'Ausgabenverteilung'
  ],
  'Gastos por Categoria': [
    'Gastos por Categoria',
    'Spending by Category',
    'Gastos por Categoría',
    'Spese per Categoria',
    '按类别支出',
    'Dépenses par Catégorie',
    'Ausgaben nach Kategorie'
  ],
  'Sem dados de despesas para este ano': [
    'Sem dados de despesas para este ano',
    'No expense data for this year',
    'Sin datos de gastos para este año',
    'Nessun dato di spesa per quest’anno',
    '本年度暂无支出数据',
    'Aucune donnée de dépense pour cette année',
    'Keine Ausgabendaten für dieses Jahr'
  ],
  'Planejamento financeiro mensal por categoria': [
    'Planeamento financeiro mensal por categoria',
    'Monthly financial planning by category',
    'Planificación financiera mensual por categoría',
    'Pianificazione finanziaria mensile per categoria',
    '按类别进行月度财务规划',
    'Planification financière mensuelle par catégorie',
    'Monatliche Finanzplanung nach Kategorie'
  ],
  'Copiar Mês Anterior': [
    'Copiar Mês Anterior',
    'Copy Previous Month',
    'Copiar Mes Anterior',
    'Copia Mese Precedente',
    '复制上月预算',
    'Copier le Mois Précédent',
    'Vormonat kopieren'
  ],
  'Salvar Orçamento': [
    'Guardar Orçamento',
    'Save Budget',
    'Guardar Presupuesto',
    'Salva Budget',
    '保存预算',
    'Enregistrer le Budget',
    'Budget speichern'
  ],
  'Renda do Mês (Base para cálculo de %)': [
    'Rendimento do Mês (Base para cálculo de %)',
    'Monthly Income (Base for % calculation)',
    'Ingreso del Mes (Base para cálculo de %)',
    'Reddito del Mese (Base per il calcolo %)',
    '本月收入（百分比计算基准）',
    'Revenu du Mois (Base de calcul des %)',
    'Monatseinkommen (Basis für %-Berechnung)'
  ],
  'Usar Receitas Cadastradas': [
    'Usar Receitas Registadas',
    'Use Recorded Income',
    'Usar Ingresos Registrados',
    'Usa Entrate Registrate',
    '使用已登记收入',
    'Utiliser les Revenus Enregistrés',
    'Erfasste Einnahmen verwenden'
  ],
  'Total Orçado': [
    'Total Orçamentado',
    'Total Budgeted',
    'Total Presupuestado',
    'Totale Preventivato',
    '预算总额',
    'Total Budgété',
    'Gesamtbudget'
  ],
  'Total Gasto': [
    'Total Gasto',
    'Total Spent',
    'Total Gastado',
    'Totale Speso',
    '实际总支出',
    'Total Dépensé',
    'Gesamtausgaben'
  ],
  'Saldo do Orçamento': [
    'Saldo do Orçamento',
    'Budget Balance',
    'Saldo del Presupuesto',
    'Saldo del Budget',
    '预算结余',
    'Solde du Budget',
    'Budgetsaldo'
  ],
  'Gerenciar Cartões': [
    'Gerir Cartões',
    'Manage Cards',
    'Gestionar Tarjetas',
    'Gestisci Carte',
    '管理银行卡',
    'Gérer les Cartes',
    'Karten verwalten'
  ],
  'Controle de faturas e gastos por cartão de crédito': [
    'Controlo de faturas e gastos por cartão de crédito',
    'Track statements and credit card spending',
    'Control de facturas y gastos por tarjeta de crédito',
    'Controllo estratti conto e spese per carta di credito',
    '管理信用卡账单与各卡消费明细',
    'Suivi des relevés et dépenses par carte bancaire',
    'Abrechnungen und Kreditkartenausgaben verwalten'
  ],
  'Adicionar Cartão': [
    'Adicionar Cartão',
    'Add Card',
    'Agregar Tarjeta',
    'Aggiungi Carta',
    '添加银行卡',
    'Ajouter une Carte',
    'Karte hinzufügen'
  ],
  'Editar Cartão': [
    'Editar Cartão',
    'Edit Card',
    'Editar Tarjeta',
    'Modifica Carta',
    '编辑银行卡',
    'Modifier la Carte',
    'Karte bearbeiten'
  ],
  'Nome do Cartão': [
    'Nome do Cartão',
    'Card Name',
    'Nombre de la Tarjeta',
    'Nome della Carta',
    '银行卡名称',
    'Nom de la Carte',
    'Kartenname'
  ],
  'Dia de Vencimento (opcional)': [
    'Dia de Vencimento (opcional)',
    'Due Day (optional)',
    'Día de Vencimiento (opcional)',
    'Giorno di Scadenza (opzionale)',
    '每月还款日（可选）',
    'Jour d’échéance (optionnel)',
    'Fälligkeitstag (optional)'
  ],
  'Sem dia de vencimento fixo': [
    'Sem dia de vencimento fixo',
    'No fixed due day',
    'Sin día de vencimiento fijo',
    'Nessun giorno di scadenza fisso',
    '无固定还款日',
    'Pas de jour d’échéance fixe',
    'Kein fester Fälligkeitstag'
  ],
  'Ao selecionar este cartão em uma Nova Despesa, a Data de Vencimento será preenchida automaticamente.': [
    'Ao selecionar este cartão numa Nova Despesa, a Data de Vencimento será preenchida automaticamente.',
    'When selecting this card in a New Expense, the Due Date will be filled in automatically.',
    'Al seleccionar esta tarjeta en un Nuevo Gasto, la Fecha de Vencimiento se completará automáticamente.',
    'Selezionando questa carta in una Nuova Spesa, la Data di Scadenza verrà compilata automaticamente.',
    '在新增支出中选择此卡时，系统将自动填入到期还款日。',
    'En sélectionnant cette carte dans une Nouvelle Dépense, la Date d’échéance sera remplie automatiquement.',
    'Wenn Sie diese Karte bei einer Neuen Ausgabe auswählen, wird das Fälligkeitsdatum automatisch ausgefüllt.'
  ],
  'Cor do Cartão': [
    'Cor do Cartão',
    'Card Color',
    'Color de la Tarjeta',
    'Colore della Carta',
    '卡片颜色',
    'Couleur de la Carte',
    'Kartenfarbe'
  ],
  'Salvar Cartão': [
    'Guardar Cartão',
    'Save Card',
    'Guardar Tarjeta',
    'Salva Carta',
    '保存银行卡',
    'Enregistrer la Carte',
    'Karte speichern'
  ],
  'Total dos Cartões no Ano': [
    'Total dos Cartões no Ano',
    'Total Card Spending in Year',
    'Total de Tarjetas en el Año',
    'Totale Carte nell’Anno',
    '本年银行卡总消费',
    'Total des Cartes sur l’Année',
    'Kartenausgaben im Jahr gesamt'
  ],
  'Planejamento, orçamento, roteiro e controle de gastos de viagens': [
    'Planeamento, orçamento, roteiro e controlo de gastos de viagens',
    'Trip planning, budget, itinerary, and travel expense tracking',
    'Planificación, presupuesto, itinerario y control de gastos de viaje',
    'Pianificazione, budget, itinerario e controllo spese di viaggio',
    '旅行规划、预算、行程与旅途支出管理',
    'Planification, budget, itinéraire et suivi des dépenses de voyage',
    'Reiseplanung, Budget, Reiseroute und Reisekostenkontrolle'
  ],
  'Análise detalhada das suas finanças': [
    'Análise detalhada das suas finanças',
    'Detailed analysis of your finances',
    'Análisis detallado de tus finanzas',
    'Analisi dettagliata delle tue finanze',
    '您的财务详细分析',
    'Analyse détaillée de vos finances',
    'Detaillierte Analyse Ihrer Finanzen'
  ],
  'Demonstrativo de Resultado do Exercício': [
    'Demonstração de Resultados do Exercício',
    'Income Statement (P&L)',
    'Estado de Resultados (DRE)',
    'Conto Economico (P&L)',
    '损益表 (DRE)',
    'Compte de Résultat',
    'Gewinn- und Verlustrechnung (GuV)'
  ],
  'Exporte, importe e proteja todos os seus dados financeiros': [
    'Exporte, importe e proteja todos os seus dados financeiros',
    'Export, import, and protect all your financial data',
    'Exporta, importa y protege todos tus datos financieros',
    'Esporta, importa e proteggi tutti i tuoi dati finanziari',
    '导出、导入并保护您的所有财务数据',
    'Exportez, importez et protégez toutes vos données financières',
    'Exportieren, importieren und schützen Sie all Ihre Finanzdaten'
  ],
  'Personalize categorias, metas e preferências do sistema': [
    'Personalize categorias, metas e preferências do sistema',
    'Customize categories, goals, and system preferences',
    'Personaliza categorías, metas y preferencias del sistema',
    'Personalizza categorie, obiettivi e preferenze del sistema',
    '自定义类别、目标与系统偏好设置',
    'Personnalisez les catégories, objectifs et préférences du système',
    'Kategorien, Ziele und Systemeinstellungen anpassen'
  ],
  'Assistir Explicação': [
    'Ver Explicação',
    'Watch Tutorial',
    'Ver Explicación',
    'Guarda Spiegazione',
    '观看讲解视频',
    'Voir l’Explication',
    'Erklärung ansehen'
  ],
  'Como usar esta tela': [
    'Como usar este ecrã',
    'How to use this screen',
    'Cómo usar esta pantalla',
    'Come usare questa schermata',
    '如何使用此页面',
    'Comment utiliser cet écran',
    'So nutzen Sie diese Seite'
  ],
  'Ajuda em Vídeo desta Tela': [
    'Ajuda em Vídeo deste Ecrã',
    'Video Help for This Screen',
    'Ayuda en Video de esta Pantalla',
    'Guida Video per questa Schermata',
    '本页视频帮助',
    'Aide Vidéo pour cet Écran',
    'Videohilfe für diese Seite'
  ],
  'Orçamento Mensal': [
    'Orçamento Mensal',
    'Monthly Budget',
    'Presupuesto Mensual',
    'Budget Mensile',
    '月度预算',
    'Budget Mensuel',
    'Monatsbudget'
  ],
  'Orçamento Anual': [
    'Orçamento Anual',
    'Annual Budget',
    'Presupuesto Anual',
    'Budget Annuale',
    '年度预算',
    'Budget Annuel',
    'Jahresbudget'
  ],
  'Planejado': [
    'Planeado',
    'Planned',
    'Planificado',
    'Pianificato',
    '计划金额',
    'Prévu',
    'Geplant'
  ],
  'Realizado': [
    'Realizado',
    'Actual',
    'Realizado',
    'Effettivo',
    '实际金额',
    'Réalisé',
    'Ist-Wert'
  ],
  'Diferença': [
    'Diferença',
    'Difference',
    'Diferencia',
    'Differenza',
    '差额',
    'Différence',
    'Differenz'
  ],
  'Progresso': [
    'Progresso',
    'Progress',
    'Progreso',
    'Progresso',
    '进度',
    'Progression',
    'Fortschritt'
  ],
  'Percentual (%)': [
    'Percentagem (%)',
    'Percentage (%)',
    'Porcentaje (%)',
    'Percentuale (%)',
    '百分比 (%)',
    'Pourcentage (%)',
    'Prozentsatz (%)'
  ],
  'Valor Fixo (R$)': [
    'Valor Fixo',
    'Fixed Amount',
    'Valor Fijo',
    'Importo Fisso',
    '固定金额',
    'Montant Fixe',
    'Fester Betrag'
  ],
  'Distribuir Automaticamente': [
    'Distribuir Automaticamente',
    'Auto-Distribute',
    'Distribuir Automáticamente',
    'Distribuisci Automaticamente',
    '自动分配比例',
    'Répartir Automatiquement',
    'Automatisch verteilen'
  ],
  'Restaurar Padrão (50-20-20-0-10)': [
    'Restaurar Padrão (50-20-20-0-10)',
    'Restore Default (50-20-20-0-10)',
    'Restaurar Predeterminado (50-20-20-0-10)',
    'Ripristina Predefinito (50-20-20-0-10)',
    '恢复默认比例 (50-20-20-0-10)',
    'Restaurer par Défaut (50-20-20-0-10)',
    'Standard wiederherstellen (50-20-20-0-10)'
  ],
  'Faturas Mensais por Cartão': [
    'Faturas Mensais por Cartão',
    'Monthly Statements by Card',
    'Facturas Mensuales por Tarjeta',
    'Estratti Conto Mensili per Carta',
    '各银行卡月度账单',
    'Relevés Mensuels par Carte',
    'Monatliche Abrechnungen pro Karte'
  ],
  'Lançamentos no Cartão': [
    'Lançamentos no Cartão',
    'Card Transactions',
    'Movimientos de la Tarjeta',
    'Movimenti della Carta',
    '银行卡交易明细',
    'Opérations sur la Carte',
    'Kartenumsätze'
  ],
  'Nova Compra no Cartão': [
    'Nova Compra no Cartão',
    'New Card Purchase',
    'Nueva Compra con Tarjeta',
    'Nuovo Acquisto con Carta',
    '新增刷卡消费',
    'Nouvel Achat par Carte',
    'Neuer Karteneinkauf'
  ],
  'Nenhum cartão cadastrado': [
    'Nenhum cartão registado',
    'No cards registered',
    'Ninguna tarjeta registrada',
    'Nessuna carta registrata',
    '暂无已登记银行卡',
    'Aucune carte enregistrée',
    'Keine Karten registriert'
  ],
  'Adicione seus cartões de crédito para acompanhar as faturas mensais.': [
    'Adicione os seus cartões de crédito para acompanhar as faturas mensais.',
    'Add your credit cards to track monthly statements.',
    'Agrega tus tarjetas de crédito para seguir las facturas mensuales.',
    'Aggiungi le tue carte di credito per monitorare gli estratti conto mensili.',
    '添加您的信用卡以跟踪每月账单。',
    'Ajoutez vos cartes de crédit pour suivre vos relevés mensuels.',
    'Fügen Sie Ihre Kreditkarten hinzu, um monatliche Abrechnungen zu verfolgen.'
  ],
  'Mês da Fatura': [
    'Mês da Fatura',
    'Statement Month',
    'Mes de la Factura',
    'Mese Estratto Conto',
    '账单月份',
    'Mois du Relevé',
    'Abrechnungsmonat'
  ],
  'A Compra entra na Fatura do Mês Seguinte': [
    'A Compra entra na Fatura do Mês Seguinte',
    'Purchase enters Next Month’s Statement',
    'La Compra entra en la Factura del Mes Siguiente',
    'L’Acquisto entra nell’Estratto Conto del Mese Successivo',
    '消费计入下月账单',
    'L’Achat entre sur le Relevé du Mois Suivant',
    'Kauf wird in der Abrechnung des Folgemonats verbucht'
  ],
  'Voz da narração:': [
    'Voz da narração:',
    'Narration voice:',
    'Voz de narración:',
    'Voce narrante:',
    '旁白语音：',
    'Voix de narration :',
    'Erzählstimme:'
  ],
  'Homem': [
    'Homem',
    'Man',
    'Hombre',
    'Uomo',
    '男声',
    'Homme',
    'Mann'
  ],
  'Mulher': [
    'Mulher',
    'Woman',
    'Mujer',
    'Donna',
    '女声',
    'Femme',
    'Frau'
  ],
  'Criança': [
    'Criança',
    'Child',
    'Niño',
    'Bambino',
    '童声',
    'Enfant',
    'Kind'
  ],
  'Reproduzir': [
    'Reproduzir',
    'Play',
    'Reproducir',
    'Riproduci',
    '播放',
    'Lire',
    'Abspielen'
  ],
  'Pausar': [
    'Pausar',
    'Pause',
    'Pausar',
    'Pausa',
    '暂停',
    'Pause',
    'Pause'
  ],
  'Reiniciar': [
    'Reiniciar',
    'Restart',
    'Reiniciar',
    'Ricomincia',
    '重播',
    'Recommencer',
    'Neu starten'
  ],
  'Minimizar Menu': [
    'Minimizar Menu',
    'Collapse Menu',
    'Minimizar Menú',
    'Riduci Menu',
    '收起菜单',
    'Réduire le Menu',
    'Menü einklappen'
  ],
  'Expandir Menu': [
    'Expandir Menu',
    'Expand Menu',
    'Expandir Menú',
    'Espandi Menu',
    '展开菜单',
    'Développer le Menu',
    'Menü ausklappen'
  ],
  'Exportar Dados': [
    'Exportar Dados',
    'Export Data',
    'Exportar Datos',
    'Esporta Dati',
    '导出数据',
    'Exporter les Données',
    'Daten exportieren'
  ],
  'Importar Dados': [
    'Importar Dados',
    'Import Data',
    'Importar Datos',
    'Importa Dati',
    '导入数据',
    'Importer les Données',
    'Daten importieren'
  ],
  'Backup Completo (JSON)': [
    'Cópia de Segurança Completa (JSON)',
    'Full Backup (JSON)',
    'Copia de Seguridad Completa (JSON)',
    'Backup Completo (JSON)',
    '完整备份 (JSON)',
    'Sauvegarde Complète (JSON)',
    'Vollständiges Backup (JSON)'
  ],
  'Exportar Excel (.xlsx)': [
    'Exportar Excel (.xlsx)',
    'Export Excel (.xlsx)',
    'Exportar Excel (.xlsx)',
    'Esporta Excel (.xlsx)',
    '导出 Excel (.xlsx)',
    'Exporter Excel (.xlsx)',
    'Excel exportieren (.xlsx)'
  ],
  'Exportar CSV (.csv)': [
    'Exportar CSV (.csv)',
    'Export CSV (.csv)',
    'Exportar CSV (.csv)',
    'Esporta CSV (.csv)',
    '导出 CSV (.csv)',
    'Exporter CSV (.csv)',
    'CSV exportieren (.csv)'
  ],
  'Exportar PDF (.pdf)': [
    'Exportar PDF (.pdf)',
    'Export PDF (.pdf)',
    'Exportar PDF (.pdf)',
    'Esporta PDF (.pdf)',
    '导出 PDF (.pdf)',
    'Exporter PDF (.pdf)',
    'PDF exportieren (.pdf)'
  ],
  'Categorias de Despesas': [
    'Categorias de Despesas',
    'Expense Categories',
    'Categorías de Gastos',
    'Categorie di Spesa',
    '支出类别',
    'Catégories de Dépenses',
    'Ausgabenkategorien'
  ],
  'Nova Categoria': [
    'Nova Categoria',
    'New Category',
    'Nueva Categoría',
    'Nuova Categoria',
    '新增类别',
    'Nouvelle Catégorie',
    'Neue Kategorie'
  ],
  'Salvar Configurações': [
    'Guardar Configurações',
    'Save Settings',
    'Guardar Configuración',
    'Salva Impostazioni',
    '保存设置',
    'Enregistrer les Paramètres',
    'Einstellungen speichern'
  ],
  'Mapa de Calor de Gastos Diários': [
    'Mapa de Calor de Gastos Diários',
    'Daily Spending Heatmap',
    'Mapa de Calor de Gastos Diarios',
    'Mappa di Calore delle Spese Giornaliere',
    '每日支出热力图',
    'Carte Thermique des Dépenses Quotidiennes',
    'Heatmap der täglichen Ausgaben'
  ],
  'Restauração & Versionamento': [
    'Restauração e Versionamento',
    'System Restore & Versioning',
    'Restauración y Versionado',
    'Ripristino e Versionamento',
    '系统还原与版本控制',
    'Restauration et Versionnage',
    'Wiederherstellung & Versionierung'
  ],
  'Ambiente de Homologação': [
    'Ambiente de Homologação',
    'Staging Environment',
    'Entorno de Homologación',
    'Ambiente di Staging',
    '测试验证环境',
    'Environnement de Préproduction',
    'Staging-Umgebung'
  ],
  'Filtra os lançamentos e indicadores para exibir apenas as movimentações do mês selecionado.': [
    'Filtra os lançamentos e indicadores para exibir apenas os movimentos do mês selecionado.',
    'Filters transactions and indicators to display only entries from the selected month.',
    'Filtra los registros e indicadores para mostrar solo los movimientos del mes seleccionado.',
    'Filtra le registrazioni e gli indicatori per mostrare solo i movimenti del mese selezionato.',
    '筛选记录和指标，仅显示所选月份的财务流水。',
    'Filtre les écritures et indicateurs pour n’afficher que les mouvements du mois sélectionné.',
    'Filtert Buchungen und Kennzahlen, um nur Bewegungen des ausgewählten Monats anzuzeigen.'
  ],
  '*Exemplo: Selecione "Novembro" para analisar exclusivamente os registros de novembro.': [
    '*Exemplo: Selecione "Novembro" para analisar exclusivamente os registos de novembro.',
    '*Example: Select "November" to analyze November records exclusively.',
    '*Ejemplo: Selecciona "Noviembre" para analizar exclusivamente los registros de noviembre.',
    '*Esempio: Seleziona "Novembre" per analizzare esclusivamente i record di novembre.',
    '*示例：选择“十一月”以仅分析11月份的记录。',
    '*Exemple : Sélectionnez « Novembre » pour analyser exclusivement les écritures de novembre.',
    '*Beispiel: Wählen Sie „November“, um ausschließlich die Einträge vom November zu analysieren.'
  ],
  'Filtra os dados exibidos na tela para o ano correspondente.': [
    'Filtra os dados exibidos no ecrã para o ano correspondente.',
    'Filters the data displayed on the screen for the corresponding year.',
    'Filtra los datos mostrados en pantalla para el año correspondiente.',
    'Filtra i dati visualizzati sullo schermo per l’anno corrispondente.',
    '按对应年份筛选屏幕上显示的数据。',
    'Filtre les données affichées à l’écran pour l’année correspondante.',
    'Filtert die auf dem Bildschirm angezeigten Daten nach dem entsprechenden Jahr.'
  ],
  '*Exemplo: Escolha "2026" ou selecione "Todos os Anos" para ver o histórico completo.': [
    '*Exemplo: Escolha "2026" ou selecione "Todos os Anos" para ver o histórico completo.',
    '*Example: Choose "2026" or select "All Years" to view the full history.',
    '*Ejemplo: Elige "2026" o selecciona "Todos los Años" para ver el historial completo.',
    '*Esempio: Scegli "2026" o seleziona "Tutti gli Anni" per vedere lo storico completo.',
    '*示例：选择“2026”或选择“所有年份”以查看完整历史记录。',
    '*Exemple : Choisissez « 2026 » ou sélectionnez « Toutes les Années » pour voir l’historique complet.',
    '*Beispiel: Wählen Sie „2026“ oder „Alle Jahre“, um den gesamten Verlauf anzuzeigen.'
  ],
  'Define a data inicial de um intervalo personalizado de busca.': [
    'Define a data inicial de um intervalo personalizado de pesquisa.',
    'Sets the start date for a custom search date range.',
    'Define la fecha inicial de un intervalo de búsqueda personalizado.',
    'Definisce la data iniziale di un intervallo di ricerca personalizzato.',
    '设置自定义搜索日期范围的起始日期。',
    'Définit la date de début d’une plage de recherche personnalisée.',
    'Legt das Startdatum für einen benutzerdefinierten Suchzeitraum fest.'
  ],
  '*Exemplo: Preencha 01/11/2026 para ver apenas lançamentos feitos a partir dessa data.': [
    '*Exemplo: Preencha 01/11/2026 para ver apenas lançamentos efetuados a partir dessa data.',
    '*Example: Enter 11/01/2026 to view only entries from that date onward.',
    '*Ejemplo: Ingresa 01/11/2026 para ver solo los registros realizados a partir de esa fecha.',
    '*Esempio: Inserisci 01/11/2026 per vedere solo i movimenti effettuati a partire da quella data.',
    '*示例：填写 2026/11/01 以仅查看该日期之后的记录。',
    '*Exemple : Saisissez 01/11/2026 pour ne voir que les écritures à partir de cette date.',
    '*Beispiel: Geben Sie 01.11.2026 ein, um nur Buchungen ab diesem Datum anzuzeigen.'
  ],
  'Define a data limite final de um intervalo personalizado de busca.': [
    'Define a data limite final de um intervalo personalizado de pesquisa.',
    'Sets the end date limit for a custom search date range.',
    'Define la fecha límite final de un intervalo de búsqueda personalizado.',
    'Definisce la data finale di un intervallo di ricerca personalizzato.',
    '设置自定义搜索日期范围的截止日期。',
    'Définit la date de fin d’une plage de recherche personnalisée.',
    'Legt das Enddatum für einen benutzerdefinierten Suchzeitraum fest.'
  ],
  '*Exemplo: Preencha 15/11/2026 para ver lançamentos realizados até essa data.': [
    '*Exemplo: Preencha 15/11/2026 para ver lançamentos realizados até essa data.',
    '*Example: Enter 11/15/2026 to view entries recorded up to that date.',
    '*Ejemplo: Ingresa 15/11/2026 para ver registros realizados hasta esa fecha.',
    '*Esempio: Inserisci 15/11/2026 per vedere i movimenti effettuati fino a quella data.',
    '*示例：填写 2026/11/15 以查看截至该日期的记录。',
    '*Exemple : Saisissez 15/11/2026 pour voir les écritures réalisées jusqu’à cette date.',
    '*Beispiel: Geben Sie 15.11.2026 ein, um Buchungen bis zu diesem Datum anzuzeigen.'
  ],
  'Filtra a tabela em tempo real procurando qualquer palavra digitada dentro da descrição dos lançamentos.': [
    'Filtra a tabela em tempo real procurando qualquer palavra introduzida na descrição dos lançamentos.',
    'Filters the table in real time by searching for any word typed in the entry descriptions.',
    'Filtra la tabla en tiempo real buscando cualquier palabra escrita en la descripción de los registros.',
    'Filtra la tabella in tempo reale cercando qualsiasi parola digitata nella descrizione dei movimenti.',
    '通过搜索交易描述中包含的任意关键词，实时筛选表格。',
    'Filtre le tableau en temps réel en recherchant tout mot saisi dans la description des écritures.',
    'Filtert die Tabelle in Echtzeit nach jedem Wort in der Beschreibung der Buchungen.'
  ],
  '*Exemplo: Digite "Uber" ou "Luz" para listar imediatamente todas as despesas com esse nome.': [
    '*Exemplo: Digite "Uber" ou "Luz" para listar imediatamente todas as despesas com esse nome.',
    '*Example: Type "Uber" or "Electricity" to immediately list all matching expenses.',
    '*Ejemplo: Escribe "Uber" o "Luz" para listar de inmediato todos los gastos con ese nombre.',
    '*Esempio: Digita "Uber" o "Luce" per elencare immediatamente tutte le spese con quel nome.',
    '*示例：输入“打车”或“电费”即可立即列出所有包含该名称的支出。',
    '*Exemple : Tapez « Uber » ou « Électricité » pour lister immédiatement toutes les dépenses correspondantes.',
    '*Beispiel: Geben Sie „Uber“ oder „Strom“ ein, um sofort alle passenden Ausgaben aufzulisten.'
  ],
  'Altera simultaneamente a descrição de todas as despesas selecionadas na tabela.': [
    'Altera simultaneamente a descrição de todas as despesas selecionadas na tabela.',
    'Simultaneously updates the description of all expenses selected in the table.',
    'Cambia simultáneamente la descripción de todos los gastos seleccionados en la tabla.',
    'Modifica contemporaneamente la descrizione di tutte le spese selezionate nella tabella.',
    '同时批量修改表格中所有已选支出的描述。',
    'Modifie simultanément la description de toutes les dépenses sélectionnées dans le tableau.',
    'Ändert gleichzeitig die Beschreibung aller in der Tabelle ausgewählten Ausgaben.'
  ],
  '*Exemplo: Deixe em branco caso queira manter a descrição original de cada item.': [
    '*Exemplo: Deixe em branco caso queira manter a descrição original de cada item.',
    '*Example: Leave blank if you want to keep the original description of each item.',
    '*Ejemplo: Déjalo en blanco si deseas mantener la descripción original de cada ítem.',
    '*Esempio: Lascia vuoto se desideri mantenere la descrizione originale di ogni voce.',
    '*示例：如果希望保留每项的原始描述，请留空。',
    '*Exemple : Laissez vide si vous souhaitez conserver la description d’origine de chaque élément.',
    '*Beispiel: Leer lassen, wenn Sie die ursprüngliche Beschreibung jedes Eintrags beibehalten möchten.'
  ],
  'Move todas as despesas selecionadas na tabela para uma nova Categoria de uma só vez.': [
    'Move todas as despesas selecionadas na tabela para uma nova Categoria de uma só vez.',
    'Moves all selected expenses in the table to a new Category at once.',
    'Mueve todos los gastos seleccionados en la tabla a una nueva Categoría de una sola vez.',
    'Sposta tutte le spese selezionate nella tabella in una nuova Categoria in un’unica volta.',
    '一次性将表格中所有已选支出移至新类别。',
    'Déplace toutes les dépenses sélectionnées du tableau vers une nouvelle Catégorie en une seule fois.',
    'Verschiebt alle ausgewählten Ausgaben in der Tabelle auf einmal in eine neue Kategorie.'
  ],
  '*Exemplo: Selecione "Lazer" para reclassificar todos os itens marcados.': [
    '*Exemplo: Selecione "Lazer" para reclassificar todos os itens marcados.',
    '*Example: Select "Leisure" to reclassify all checked items.',
    '*Ejemplo: Selecciona "Ocio" para reclasificar todos los ítems marcados.',
    '*Esempio: Seleziona "Tempo Libero" per riclassificare tutte le voci selezionate.',
    '*示例：选择“休闲娱乐”以重新归类所有勾选项。',
    '*Exemple : Sélectionnez « Loisirs » pour reclasser tous les éléments cochés.',
    '*Beispiel: Wählen Sie „Freizeit“, um alle markierten Einträge neu zuzuordnen.'
  ],
  'Atualiza em lote a Subcategoria de todas as despesas selecionadas.': [
    'Atualiza em lote a Subcategoria de todas as despesas selecionadas.',
    'Batch-updates the Subcategory for all selected expenses.',
    'Actualiza en lote la Subcategoría de todos los gastos seleccionados.',
    'Aggiorna in blocco la Sottocategoria di tutte le spese selezionate.',
    '批量更新所有已选支出的子类别。',
    'Met à jour par lot la Sous-catégorie de toutes les dépenses sélectionnées.',
    'Aktualisiert stapelweise die Unterkategorie aller ausgewählten Ausgaben.'
  ],
  '*Exemplo: Escolha "Mercado" para padronizar os itens selecionados.': [
    '*Exemplo: Escolha "Supermercado" para padronizar os itens selecionados.',
    '*Example: Choose "Groceries" to standardize the selected items.',
    '*Ejemplo: Elige "Supermercado" para estandarizar los ítems seleccionados.',
    '*Esempio: Scegli "Supermercato" per uniformare le voci selezionate.',
    '*示例：选择“超市采购”以统一所选项目。',
    '*Exemple : Choisissez « Supermarché » pour uniformiser les éléments sélectionnés.',
    '*Beispiel: Wählen Sie „Lebensmittel“, um die ausgewählten Einträge zu vereinheitlichen.'
  ],
  'Altera o status de pagamento (Pago ou Pendente) de todas as despesas selecionadas de uma só vez.': [
    'Altera o estado de pagamento (Pago ou Pendente) de todas as despesas selecionadas de uma só vez.',
    'Changes the payment status (Paid or Pending) of all selected expenses at once.',
    'Cambia el estado de pago (Pagado o Pendiente) de todos los gastos seleccionados de una vez.',
    'Modifica lo stato di pagamento (Pagato o In Sospeso) di tutte le spese selezionate in una volta.',
    '一次性修改所有已选支出的付款状态（已付或待付）。',
    'Modifie le statut de paiement (Payé ou En Attente) de toutes les dépenses sélectionnées en une fois.',
    'Ändert den Zahlungsstatus (Bezahlt oder Ausstehend) aller ausgewählten Ausgaben auf einmal.'
  ],
  '*Exemplo: Escolha "Pago" para dar baixa em várias contas ao mesmo tempo.': [
    '*Exemplo: Escolha "Pago" para liquidar várias contas ao mesmo tempo.',
    '*Example: Choose "Paid" to mark multiple bills as paid at the same time.',
    '*Ejemplo: Elige "Pagado" para dar por pagadas varias cuentas al mismo tiempo.',
    '*Esempio: Scegli "Pagato" per saldare più conti contemporaneamente.',
    '*示例：选择“已付”可同时将多笔账单标记为已结清。',
    '*Exemple : Choisissez « Payé » pour solder plusieurs factures en même temps.',
    '*Beispiel: Wählen Sie „Bezahlt“, um mehrere Rechnungen gleichzeitig als bezahlt zu markieren.'
  ],
  'Altera em massa se as despesas selecionadas devem ou não ser somadas aos cálculos do Orçamento e Relatórios.': [
    'Altera em massa se as despesas selecionadas devem ou não ser somadas aos cálculos do Orçamento e Relatórios.',
    'Bulk-updates whether the selected expenses should be included in Budget and Report calculations.',
    'Cambia en masa si los gastos seleccionados deben sumarse o no a los cálculos de Presupuesto e Informes.',
    'Modifica in blocco se le spese selezionate devono essere incluse o meno nei calcoli di Budget e Report.',
    '批量更改是否将已选支出计入预算和报表计算。',
    'Modifie en masse si les dépenses sélectionnées doivent être incluses dans les calculs du Budget et des Rapports.',
    'Ändert gesammelt, ob die ausgewählten Ausgaben in die Budget- und Berichtsberechnungen einfließen sollen.'
  ],
  '*Exemplo: Escolha "Sim (Padrão)" para incluir nos cálculos.': [
    '*Exemplo: Escolha "Sim (Padrão)" para incluir nos cálculos.',
    '*Example: Choose "Yes (Default)" to include them in calculations.',
    '*Ejemplo: Elige "Sí (Predeterminado)" para incluirlos en los cálculos.',
    '*Esempio: Scegli "Sì (Predefinito)" per includerle nei calcoli.',
    '*示例：选择“是（默认）”以计入计算。',
    '*Exemple : Choisissez « Oui (Par défaut) » pour les inclure dans les calculs.',
    '*Beispiel: Wählen Sie „Ja (Standard)“, um sie in die Berechnungen einzubeziehen.'
  ],
  'Informe quanto você planeja receber de renda bruta total neste mês.': [
    'Informe quanto planeia receber de rendimento bruto total neste mês.',
    'Enter how much total gross income you expect to receive this month.',
    'Indica cuánto planeas recibir de ingreso bruto total en este mes.',
    'Indica quanto prevedi di ricevere come reddito lordo totale in questo mese.',
    '输入您本月预计收到的总毛收入。',
    'Indiquez le revenu brut total que vous prévoyez de percevoir ce mois-ci.',
    'Geben Sie an, wie viel Bruttoeinkommen Sie in diesem Monat insgesamt erwarten.'
  ],
  '*Exemplo: Digite R$ 5.000,00 se essa for a soma estimada do seu salário e rendas do mês.': [
    '*Exemplo: Digite 5.000,00 se essa for a soma estimada do seu salário e rendimentos do mês.',
    '*Example: Enter 5,000.00 if that is the estimated sum of your monthly salary and income.',
    '*Ejemplo: Escribe 5.000,00 si esa es la suma estimada de tu salario e ingresos del mes.',
    '*Esempio: Digita 5.000,00 se questa è la somma stimata del tuo stipendio e delle entrate del mese.',
    '*示例：如果您本月的工资和各项收入预计总和为 5,000.00，请输入该金额。',
    '*Exemple : Saisissez 5 000,00 si c’est la somme estimée de votre salaire et de vos revenus du mois.',
    '*Beispiel: Geben Sie 5.000,00 ein, wenn dies die geschätzte Summe Ihres Monatsgehalts und Ihrer Einnahmen ist.'
  ],
  '**OBS: A Renda Real Disponível será calculada descontando eventuais Dívidas informadas abaixo.': [
    '**OBS: O Rendimento Real Disponível será calculado descontando eventuais Dívidas informadas abaixo.',
    '**NOTE: Available Real Income will be calculated by deducting any Debts entered below.',
    '**NOTA: El Ingreso Real Disponible se calculará descontando las eventuales Deudas indicadas abajo.',
    '**NOTA: Il Reddito Reale Disponibile verrà calcolato detraendo eventuali Debiti inseriti qui sotto.',
    '**注意：实际可用收入将通过扣除下方填写的债务金额自动计算。',
    '**NOTE : Le Revenu Réel Disponible sera calculé en déduisant les éventuelles Dettes renseignées ci-dessous.',
    '**HINWEIS: Das tatsächlich verfügbare Einkommen wird berechnet, indem unten angegebene Schulden abgezogen werden.'
  ],
  'Informe o valor de compromissos ou abatimentos prévios que devem ser descontados da Renda Prevista antes de distribuir o orçamento pelas categorias.': [
    'Informe o valor de compromissos ou abatimentos prévios que devem ser descontados do Rendimento Previsto antes de distribuir o orçamento pelas categorias.',
    'Enter the amount of prior commitments or deductions to subtract from Expected Income before distributing the budget across categories.',
    'Indica el valor de compromisos o deducciones previas que deben descontarse del Ingreso Previsto antes de distribuir el presupuesto en las categorías.',
    'Inserisci l’importo di impegni o detrazioni preliminari da sottrarre dal Reddito Previsto prima di distribuire il budget tra le categorie.',
    '输入在按类别分配预算之前，需要从预计收入中优先扣除的债务或固定承诺金额。',
    'Indiquez le montant des engagements ou déductions préalables à soustraire du Revenu Prévu avant de répartir le budget par catégorie.',
    'Geben Sie den Betrag vorrangiger Verpflichtungen oder Abzüge an, die vom erwarteten Einkommen abgezogen werden sollen, bevor das Budget auf die Kategorien verteilt wird.'
  ],
  '*Exemplo: Se você recebe R$ 5.000,00 mas precisa separar R$ 500,00 para quitar um acordo prévio, a sua Renda Real Disponível para distribuir nas categorias será R$ 4.500,00.': [
    '*Exemplo: Se recebe 5.000,00 mas precisa de separar 500,00 para liquidar um acordo prévio, o seu Rendimento Real Disponível para distribuir nas categorias será 4.500,00.',
    '*Example: If you earn 5,000.00 but need to set aside 500.00 to pay off a prior agreement, your Available Real Income to distribute across categories will be 4,500.00.',
    '*Ejemplo: Si recibes 5.000,00 pero necesitas apartar 500,00 para pagar un acuerdo previo, tu Ingreso Real Disponible para distribuir en las categorías será de 4.500,00.',
    '*Esempio: Se ricevi 5.000,00 ma devi mettere da parte 500,00 per saldare un accordo precedente, il tuo Reddito Reale Disponibile da distribuire nelle categorie sarà 4.500,00.',
    '*示例：如果您收入 5,000.00，但需要预留 500.00 偿还既有债务，则您可用于分配到各类别的实际可用收入为 4,500.00。',
    '*Exemple : Si vous gagnez 5 000,00 mais devez mettre de côté 500,00 pour régler un accord préalable, votre Revenu Réel Disponible à répartir sera de 4 500,00.',
    '*Beispiel: Wenn Sie 5.000,00 verdienen, aber 500,00 für eine bestehende Vereinbarung zurücklegen müssen, beträgt Ihr verfügbares Realeinkommen für die Kategorien 4.500,00.'
  ],
  'Representa o valor líquido efetivo (Renda Prevista menos Dívidas) que serve como base de 100% para calcular o limite de gastos de cada categoria.': [
    'Representa o valor líquido efetivo (Rendimento Previsto menos Dívidas) que serve como base de 100% para calcular o limite de gastos de cada categoria.',
    'Represents the effective net amount (Expected Income minus Debts) used as the 100% baseline to calculate the spending limit for each category.',
    'Representa el valor neto efectivo (Ingreso Previsto menos Deudas) que sirve como base del 100% para calcular el límite de gasto de cada categoría.',
    'Rappresenta l’importo netto effettivo (Reddito Previsto meno Debiti) che funge da base del 100% per calcolare il limite di spesa di ciascuna categoria.',
    '代表有效净收入（预计收入减去债务），作为计算每个类别支出限额的 100% 基准。',
    'Représente le montant net effectif (Revenu Prévu moins Dettes) servant de base à 100 % pour calculer le plafond de dépenses de chaque catégorie.',
    'Stellt den effektiven Nettobetrag (Erwartetes Einkommen minus Schulden) dar, der als 100%-Basis zur Berechnung des Ausgabenlimits jeder Kategorie dient.'
  ],
  '*Exemplo: Pelo princípio inicial 50-20-20-0-10, 50% desta Renda Real vai para Despesas Fixas, 20% para Lazer, 20% para Educação, 0% para Investimentos e 10% para Reserva de Emergência.': [
    '*Exemplo: Pelo princípio inicial 50-20-20-0-10, 50% deste Rendimento Real vai para Despesas Fixas, 20% para Lazer, 20% para Educação, 0% para Investimentos e 10% para Reserva de Emergência.',
    '*Example: Under the default 50-20-20-0-10 rule, 50% of this Real Income goes to Fixed Expenses, 20% to Leisure, 20% to Education, 0% to Investments, and 10% to Emergency Fund.',
    '*Ejemplo: Según el principio inicial 50-20-20-0-10, el 50% de este Ingreso Real va a Gastos Fijos, 20% a Ocio, 20% a Educación, 0% a Inversiones y 10% a Fondo de Emergencia.',
    '*Esempio: Secondo il principio iniziale 50-20-20-0-10, il 50% di questo Reddito Reale va alle Spese Fisse, il 20% al Tempo Libero, il 20% all’Istruzione, lo 0% agli Investimenti e il 10% al Fondo di Emergenza.',
    '*示例：按照初始 50-20-20-0-10 原则，该实际收入的 50% 用于固定支出，20% 用于休闲娱乐，20% 用于教育学习，0% 用于投资，10% 用于应急储备金。',
    '*Exemple : Selon le principe initial 50-20-20-0-10, 50 % de ce Revenu Réel va aux Dépenses Fixes, 20 % aux Loisirs, 20 % à l’Éducation, 0 % aux Investissements et 10 % au Fonds d’Urgence.',
    '*Beispiel: Nach dem 50-20-20-0-10-Prinzip fließen 50 % dieses Realeinkommens in Fixkosten, 20 % in Freizeit, 20 % in Bildung, 0 % in Investitionen und 10 % in den Notgroschen.'
  ],
  'Define o dia fixo do mês em que vence a fatura deste cartão de crédito.': [
    'Define o dia fixo do mês em que vence a fatura deste cartão de crédito.',
    'Sets the fixed day of the month when this credit card statement is due.',
    'Define el día fijo del mes en que vence la factura de esta tarjeta de crédito.',
    'Definisce il giorno fisso del mese in cui scade l’estratto conto di questa carta di credito.',
    '设置此信用卡账单每月的固定到期还款日。',
    'Définit le jour fixe du mois où arrive à échéance le relevé de cette carte de crédit.',
    'Legt den festen Tag im Monat fest, an dem die Abrechnung dieser Kreditkarte fällig ist.'
  ],
  '*Exemplo: Selecione "Dia 10". Sempre que você criar uma Nova Despesa e escolher este cartão, o campo "Data de Vencimento (opcional)" será preenchido automaticamente com o dia 10!': [
    '*Exemplo: Selecione "Dia 10". Sempre que criar uma Nova Despesa e escolher este cartão, o campo "Data de Vencimento (opcional)" será preenchido automaticamente com o dia 10!',
    '*Example: Select "Day 10". Whenever you create a New Expense and choose this card, the "Due Date (optional)" field will automatically fill with the 10th!',
    '*Ejemplo: Selecciona "Día 10". ¡Siempre que crees un Nuevo Gasto y elijas esta tarjeta, el campo "Fecha de Vencimiento (opcional)" se completará automáticamente con el día 10!',
    '*Esempio: Seleziona "Giorno 10". Ogni volta che crei una Nuova Spesa e scegli questa carta, il campo "Data di Scadenza (opzionale)" verrà compilato automaticamente con il giorno 10!',
    '*示例：选择“每月10日”。每当您新建支出并选择此卡时，“到期日（可选）”字段将自动填充为10日！',
    '*Exemple : Sélectionnez « Jour 10 ». Chaque fois que vous créez une Nouvelle Dépense et choisissez cette carte, le champ « Date d’Échéance (optionnel) » sera automatiquement rempli au 10 !',
    '*Beispiel: Wählen Sie „Tag 10“. Jedes Mal, wenn Sie eine Neue Ausgabe erstellen und diese Karte wählen, wird das Feld „Fälligkeitsdatum (optional)“ automatisch mit dem 10. ausgefüllt!'
  ],
  '*Exemplo: Ao escolher "Dia 15", toda nova despesa vinculada a este cartão terá o vencimento preenchido automaticamente no dia 15.': [
    '*Exemplo: Ao escolher "Dia 15", toda a nova despesa associada a este cartão terá o vencimento preenchido automaticamente no dia 15.',
    '*Example: By choosing "Day 15", every new expense linked to this card will have its due date automatically set to the 15th.',
    '*Ejemplo: Al elegir "Día 15", todo nuevo gasto vinculado a esta tarjeta tendrá el vencimiento completado automáticamente el día 15.',
    '*Esempio: Scegliendo "Giorno 15", ogni nuova spesa collegata a questa carta avrà la scadenza compilata automaticamente al giorno 15.',
    '*示例：选择“每月15日”后，绑定到此卡的每笔新支出都会自动将到期日设为15日。',
    '*Exemple : En choisissant « Jour 15 », chaque nouvelle dépense liée à cette carte aura son échéance automatiquement fixée au 15.',
    '*Beispiel: Wenn Sie „Tag 15“ wählen, wird bei jeder neuen Ausgabe mit dieser Karte automatisch der 15. als Fälligkeitsdatum eingetragen.'
  ],
  'Informe o nome ou apelido do seu cartão de crédito para identificá-lo nas faturas e no cadastro de despesas.': [
    'Informe o nome ou apelido do seu cartão de crédito para o identificar nas faturas e no registo de despesas.',
    'Enter the name or nickname of your credit card to identify it in statements and expense entries.',
    'Indica el nombre o alias de tu tarjeta de crédito para identificarla en las facturas y en el registro de gastos.',
    'Inserisci il nome o il soprannome della tua carta di credito per identificarla negli estratti conto e nella registrazione delle spese.',
    '输入您的信用卡名称或别名，以便在账单和支出记录中轻松识别。',
    'Indiquez le nom ou le surnom de votre carte de crédit pour l’identifier sur les relevés et lors de la saisie des dépenses.',
    'Geben Sie den Namen oder Spitznamen Ihrer Kreditkarte ein, um sie in Abrechnungen und bei der Ausgabenerfassung zu erkennen.'
  ],
  '*Exemplo: "Nubank Ultravioleta", "Itaú Click" ou "Cartão Corporativo".': [
    '*Exemplo: "Millennium Prestige", "Revolut Metal" ou "Cartão Corporativo".',
    '*Example: "Chase Sapphire", "Amex Gold", or "Corporate Card".',
    '*Ejemplo: "Santander Platinum", "BBVA Azul" o "Tarjeta Corporativa".',
    '*Esempio: "Intesa Gold", "UniCredit Flexia" o "Carta Aziendale".',
    '*示例：“招行白金卡”、“工行信用卡”或“公司商务卡”。',
    '*Exemple : « BNP Premier », « Revolut Metal » ou « Carte Entreprise ».',
    '*Beispiel: „DKB Visa“, „Amex Gold“ oder „Firmenkarte“.'
  ],
  'Dê um título especial para identificar o seu planejamento de viagem.': [
    'Dê um título especial para identificar o seu planeamento de viagem.',
    'Give a special title to identify your trip plan.',
    'Dale un título especial para identificar tu planificación de viaje.',
    'Assegna un titolo speciale per identificare la pianificazione del tuo viaggio.',
    '为您的旅行计划起一个专属名称。',
    'Donnez un titre spécial pour identifier votre projet de voyage.',
    'Vergeben Sie einen besonderen Titel, um Ihre Reiseplanung zu kennzeichnen.'
  ],
  '*Exemplo: "Férias em Gramado 2026" ou "Eurotrip Família".': [
    '*Exemplo: "Férias no Algarve 2026" ou "Eurotrip Família".',
    '*Example: "Summer Vacation 2026" or "Family Eurotrip".',
    '*Ejemplo: "Vacaciones en Cancún 2026" o "Eurotrip Familiar".',
    '*Esempio: "Vacanze in Sardegna 2026" o "Eurotrip Famiglia".',
    '*示例：“2026三亚度假”或“家庭欧洲之旅”。',
    '*Exemple : « Vacances d’Été 2026 » ou « Eurotrip en Famille ».',
    '*Beispiel: „Sommerurlaub 2026“ oder „Familien-Eurotrip“.'
  ],
  'Informe a cidade, estado ou país de destino da viagem.': [
    'Informe a cidade, região ou país de destino da viagem.',
    'Enter the destination city, state, or country for the trip.',
    'Indica la ciudad, estado o país de destino del viaje.',
    'Inserisci la città, la regione o il paese di destinazione del viaggio.',
    '输入旅行目的地的城市、省份或国家。',
    'Indiquez la ville, la région ou le pays de destination du voyage.',
    'Geben Sie die Stadt, das Bundesland oder das Zielland der Reise ein.'
  ],
  '*Exemplo: "Orlando, EUA" ou "Maceió - AL".': [
    '*Exemplo: "Orlando, EUA" ou "Lisboa, Portugal".',
    '*Example: "Orlando, USA" or "Paris, France".',
    '*Ejemplo: "Orlando, EE. UU." o "Madrid, España".',
    '*Esempio: "Orlando, USA" o "Roma, Italia".',
    '*示例：“美国奥兰多”或“日本东京”。',
    '*Exemple : « Orlando, États-Unis » ou « Nice, France ».',
    '*Beispiel: „Orlando, USA“ oder „München, Deutschland“.'
  ],
  'Data de partida ou início oficial da sua viagem.': [
    'Data de partida ou início oficial da sua viagem.',
    'Departure date or official start date of your trip.',
    'Fecha de salida o inicio oficial de tu viaje.',
    'Data di partenza o inizio ufficiale del tuo viaggio.',
    '您旅行的出发日期或正式开始日期。',
    'Date de départ ou début officiel de votre voyage.',
    'Abreisedatum oder offizieller Beginn Ihrer Reise.'
  ],
  '*Exemplo: O sistema calcula automaticamente a duração em dias com base na Data de Ida e Data de Volta.': [
    '*Exemplo: O sistema calcula automaticamente a duração em dias com base na Data de Ida e Data de Volta.',
    '*Example: The system automatically calculates the duration in days based on the Departure Date and Return Date.',
    '*Ejemplo: El sistema calcula automáticamente la duración en días según la Fecha de Ida y la Fecha de Vuelta.',
    '*Esempio: Il sistema calcola automaticamente la durata in giorni in base alla Data di Andata e alla Data di Ritorno.',
    '*示例：系统会根据去程日期和返程日期自动计算旅行天数。',
    '*Exemple : Le système calcule automatiquement la durée en jours à partir de la Date d’Aller et de la Date de Retour.',
    '*Beispiel: Das System berechnet automatisch die Reisedauer in Tagen anhand von Hin- und Rückreisedatum.'
  ],
  'Data de retorno ou encerramento da viagem.': [
    'Data de regresso ou encerramento da viagem.',
    'Return date or end date of the trip.',
    'Fecha de regreso o finalización del viaje.',
    'Data di ritorno o conclusione del viaggio.',
    '旅行的返程日期或结束日期。',
    'Date de retour ou de fin du voyage.',
    'Rückreisedatum oder Ende der Reise.'
  ],
  '*Exemplo: Deve ser igual ou posterior à Data de Ida.': [
    '*Exemplo: Deve ser igual ou posterior à Data de Ida.',
    '*Example: Must be equal to or later than the Departure Date.',
    '*Ejemplo: Debe ser igual o posterior a la Fecha de Ida.',
    '*Esempio: Deve essere uguale o successiva alla Data di Andata.',
    '*示例：必须等于或晚于去程日期。',
    '*Exemple : Doit être égale ou postérieure à la Date d’Aller.',
    '*Beispiel: Muss gleich oder nach dem Hinreisedatum liegen.'
  ],
  'Defina o teto máximo que você planeja gastar somando passagens, hospedagem, alimentação e passeios nesta viagem.': [
    'Defina o teto máximo que planeia gastar somando bilhetes, alojamento, alimentação e passeios nesta viagem.',
    'Set the maximum budget you plan to spend across flights, lodging, dining, and tours on this trip.',
    'Define el tope máximo que planeas gastar sumando pasajes, alojamiento, alimentación y paseos en este viaje.',
    'Definisci il tetto massimo che prevedi di spendere sommando biglietti, alloggio, pasti ed escursioni in questo viaggio.',
    '设定本次旅行在机票、住宿、餐饮和游览方面的最高预计总预算。',
    'Définissez le plafond maximal que vous prévoyez de dépenser en cumulant billets, hébergement, repas et excursions pour ce voyage.',
    'Legen Sie die Obergrenze fest, die Sie für Tickets, Unterkunft, Verpflegung und Ausflüge auf dieser Reise insgesamt ausgeben möchten.'
  ],
  '*Exemplo: Digite 8000.00 para acompanhar a barra de consumo do orçamento da viagem em tempo real.': [
    '*Exemplo: Digite 8000.00 para acompanhar a barra de consumo do orçamento da viagem em tempo real.',
    '*Example: Enter 8000.00 to track the trip budget consumption bar in real time.',
    '*Ejemplo: Escribe 8000.00 para seguir la barra de consumo del presupuesto del viaje en tiempo real.',
    '*Esempio: Digita 8000.00 per monitorare in tempo reale la barra di consumo del budget di viaggio.',
    '*示例：输入 8000.00 即可实时跟踪旅行预算消耗进度条。',
    '*Exemple : Saisissez 8000.00 pour suivre la barre de consommation du budget de voyage en temps réel.',
    '*Beispiel: Geben Sie 8000.00 ein, um den Budgetverbrauch der Reise in Echtzeit über den Fortschrittsbalken zu verfolgen.'
  ],
  'Escolha a moeda principal utilizada no destino da viagem.': [
    'Escolha a moeda principal utilizada no destino da viagem.',
    'Choose the primary currency used at your travel destination.',
    'Elige la moneda principal utilizada en el destino del viaje.',
    'Scegli la valuta principale utilizzata nella destinazione del viaggio.',
    '选择旅行目的地使用的主要货币。',
    'Choisissez la devise principale utilisée sur votre lieu de voyage.',
    'Wählen Sie die Hauptwährung Ihres Reiseziels.'
  ],
  '*Exemplo: BRL (R$), USD (US$) ou EUR (€).': [
    '*Exemplo: EUR (€), USD (US$) ou BRL (R$).',
    '*Example: USD (US$), EUR (€), or BRL (R$).',
    '*Ejemplo: USD (US$), EUR (€) o BRL (R$).',
    '*Esempio: EUR (€), USD (US$) o BRL (R$).',
    '*示例：USD (US$)、EUR (€) 或 BRL (R$)。',
    '*Exemple : EUR (€), USD (US$) ou BRL (R$).',
    '*Beispiel: EUR (€), USD (US$) oder BRL (R$).'
  ],
  'Informe o nome da categoria financeira para agrupar suas despesas e definir metas no Orçamento.': [
    'Informe o nome da categoria financeira para agrupar as suas despesas e definir metas no Orçamento.',
    'Enter the financial category name to group your expenses and set goals in the Budget.',
    'Indica el nombre de la categoría financiera para agrupar tus gastos y definir metas en el Presupuesto.',
    'Inserisci il nome della categoria finanziaria per raggruppare le tue spese e definire obiettivi nel Budget.',
    '输入财务类别名称，以便对支出进行分组并在预算中设定目标。',
    'Indiquez le nom de la catégorie financière pour regrouper vos dépenses et définir des objectifs dans le Budget.',
    'Geben Sie den Namen der Finanzkategorie ein, um Ihre Ausgaben zu gruppieren und Ziele im Budget festzulegen.'
  ],
  '*Exemplo: "Despesas Fixas", "Lazer", "Educação", "Investimentos" ou "Reserva de Emergência".': [
    '*Exemplo: "Despesas Fixas", "Lazer", "Educação", "Investimentos" ou "Reserva de Emergência".',
    '*Example: "Fixed Expenses", "Leisure", "Education", "Investments", or "Emergency Fund".',
    '*Ejemplo: "Gastos Fijos", "Ocio", "Educación", "Inversiones" o "Fondo de Emergencia".',
    '*Esempio: "Spese Fisse", "Tempo Libero", "Istruzione", "Investimenti" o "Fondo di Emergenza".',
    '*示例：“固定支出”、“休闲娱乐”、“教育学习”、“投资”或“应急储备金”。',
    '*Exemple : « Dépenses Fixes », « Loisirs », « Éducation », « Investissements » ou « Fonds d’Urgence ».',
    '*Beispiel: „Fixkosten“, „Freizeit“, „Bildung“, „Investitionen“ oder „Notgroschen“.'
  ],
  'Escolha uma cor para identificar visualmente esta categoria nos gráficos do Dashboard, Orçamento e Relatórios.': [
    'Escolha uma cor para identificar visualmente esta categoria nos gráficos do Painel, Orçamento e Relatórios.',
    'Choose a color to visually identify this category in Dashboard, Budget, and Report charts.',
    'Elige un color para identificar visualmente esta categoría en los gráficos del Panel, Presupuesto e Informes.',
    'Scegli un colore per identificare visivamente questa categoria nei grafici di Dashboard, Budget e Report.',
    '选择一种颜色，以便在仪表盘、预算和报表图表中直观区分此类别。',
    'Choisissez une couleur pour identifier visuellement cette catégorie dans les graphiques du Tableau de Bord, du Budget et des Rapports.',
    'Wählen Sie eine Farbe, um diese Kategorie in den Diagrammen von Dashboard, Budget und Berichten optisch hervorzuheben.'
  ],
  '*Exemplo: Vermelho para Despesas Fixas, Azul para Lazer, Verde para Educação.': [
    '*Exemplo: Vermelho para Despesas Fixas, Azul para Lazer, Verde para Educação.',
    '*Example: Red for Fixed Expenses, Blue for Leisure, Green for Education.',
    '*Ejemplo: Rojo para Gastos Fijos, Azul para Ocio, Verde para Educación.',
    '*Esempio: Rosso per Spese Fisse, Blu per Tempo Libero, Verde per Istruzione.',
    '*示例：红色代表固定支出，蓝色代表休闲娱乐，绿色代表教育学习。',
    '*Exemple : Rouge pour Dépenses Fixes, Bleu pour Loisirs, Vert pour Éducation.',
    '*Beispiel: Rot für Fixkosten, Blau für Freizeit, Grün für Bildung.'
  ],
  'Define se o limite mensal desta categoria será calculado em Percentual (%) da sua renda ou como um Valor Fixo em dinheiro.': [
    'Define se o limite mensal desta categoria será calculado em Percentagem (%) do seu rendimento ou como um Valor Fixo em dinheiro.',
    'Sets whether the monthly limit for this category is calculated as a Percentage (%) of your income or as a Fixed Amount.',
    'Define si el límite mensual de esta categoría se calculará en Porcentaje (%) de tu ingreso o como un Valor Fijo en dinero.',
    'Definisce se il limite mensile di questa categoria sarà calcolato in Percentuale (%) del tuo reddito o come Importo Fisso.',
    '设置此类别的月度限额是按收入的百分比 (%) 计算，还是按固定金额计算。',
    'Définit si le plafond mensuel de cette catégorie est calculé en Pourcentage (%) de votre revenu ou en Montant Fixe.',
    'Legt fest, ob das monatliche Limit dieser Kategorie als Prozentsatz (%) Ihres Einkommens oder als fester Geldbetrag berechnet wird.'
  ],
  '*Exemplo: No princípio 50-20-20-0-10, utiliza-se "Percentual (%)" para que a meta se ajuste automaticamente quando sua renda variar.': [
    '*Exemplo: No princípio 50-20-20-0-10, utiliza-se "Percentagem (%)" para que a meta se ajuste automaticamente quando o seu rendimento variar.',
    '*Example: Under the 50-20-20-0-10 rule, "Percentage (%)" is used so the goal adjusts automatically whenever your income changes.',
    '*Ejemplo: En el principio 50-20-20-0-10, se utiliza "Porcentaje (%)" para que la meta se ajuste automáticamente cuando varíe tu ingreso.',
    '*Esempio: Nel principio 50-20-20-0-10 si utilizza "Percentuale (%)" affinché l’obiettivo si adatti automaticamente al variare del reddito.',
    '*示例：在 50-20-20-0-10 原则中，使用“百分比 (%)”可让目标随收入变化自动调整。',
    '*Exemple : Dans le principe 50-20-20-0-10, on utilise « Pourcentage (%) » afin que l’objectif s’ajuste automatiquement lorsque votre revenu varie.',
    '*Beispiel: Beim 50-20-20-0-10-Prinzip wird „Prozentsatz (%)“ verwendet, damit sich das Ziel bei Einkommensänderungen automatisch anpasst.'
  ],
  'Informe a porcentagem (%) ou o valor monetário planejado como teto para esta categoria.': [
    'Informe a percentagem (%) ou o valor monetário planeado como teto para esta categoria.',
    'Enter the percentage (%) or monetary amount planned as the cap for this category.',
    'Indica el porcentaje (%) o el valor monetario planeado como tope para esta categoría.',
    'Inserisci la percentuale (%) o l’importo monetario pianificato come tetto per questa categoria.',
    '输入为此类别计划的百分比 (%) 或最高金额上限。',
    'Indiquez le pourcentage (%) ou le montant monétaire prévu comme plafond pour cette catégorie.',
    'Geben Sie den Prozentsatz (%) oder den Geldbetrag ein, der als Obergrenze für diese Kategorie geplant ist.'
  ],
  '*Exemplo: Digite 50 para destinar 50% da sua renda às Despesas Fixas.': [
    '*Exemplo: Digite 50 para destinar 50% do seu rendimento às Despesas Fixas.',
    '*Example: Enter 50 to allocate 50% of your income to Fixed Expenses.',
    '*Ejemplo: Escribe 50 para destinar el 50% de tu ingreso a Gastos Fijos.',
    '*Esempio: Digita 50 per destinare il 50% del tuo reddito alle Spese Fisse.',
    '*示例：输入 50 即表示将您收入的 50% 分配给固定支出。',
    '*Exemple : Saisissez 50 pour allouer 50 % de votre revenu aux Dépenses Fixes.',
    '*Beispiel: Geben Sie 50 ein, um 50 % Ihres Einkommens für Fixkosten einzuplanen.'
  ],
  '*Exemplo: Clique no ícone de calendário à direita do campo para escolher o dia, mês e ano.': [
    '*Exemplo: Clique no ícone de calendário à direita do campo para escolher o dia, mês e ano.',
    '*Example: Click the calendar icon on the right side of the field to pick the day, month, and year.',
    '*Ejemplo: Haz clic en el icono de calendario a la derecha del campo para elegir el día, mes y año.',
    '*Esempio: Clicca sull’icona del calendario a destra del campo per scegliere giorno, mese e anno.',
    '*示例：点击字段右侧的日历图标以选择日、月和年。',
    '*Exemple : Cliquez sur l’icône de calendrier à droite du champ pour choisir le jour, le mois et l’année.',
    '*Beispiel: Klicken Sie auf das Kalendersymbol rechts im Feld, um Tag, Monat und Jahr auszuwählen.'
  ],
  '*Exemplo: Digite apenas números (ex: 250.00).': [
    '*Exemplo: Digite apenas números (ex: 250.00).',
    '*Example: Type numbers only (e.g., 250.00).',
    '*Ejemplo: Escribe solo números (ej: 250.00).',
    '*Esempio: Digita solo numeri (es: 250.00).',
    '*示例：仅输入数字（例如：250.00）。',
    '*Exemple : Saisissez uniquement des chiffres (ex : 250.00).',
    '*Beispiel: Geben Sie nur Zahlen ein (z. B. 250.00).'
  ],
  '*Exemplo: Escolha uma das opções da lista para atualizar os resultados imediatamente.': [
    '*Exemplo: Escolha uma das opções da lista para atualizar os resultados imediatamente.',
    '*Example: Choose one of the options from the list to update the results immediately.',
    '*Ejemplo: Elige una de las opciones de la lista para actualizar los resultados de inmediato.',
    '*Esempio: Scegli una delle opzioni dall’elenco per aggiornare immediatamente i risultati.',
    '*示例：从列表中选择一个选项以立即更新结果。',
    '*Exemple : Choisissez l’une des options de la liste pour mettre à jour les résultats immédiatement.',
    '*Beispiel: Wählen Sie eine der Optionen aus der Liste, um die Ergebnisse sofort zu aktualisieren.'
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
  ],
  'Ex: Aluguel, Conta de Luz, Supermercado': [
    'Ex: Renda, Conta da Luz, Supermercado',
    'E.g., Rent, Electricity Bill, Groceries',
    'Ej: Alquiler, Luz, Supermercado',
    'Es: Affitto, Bolletta Luce, Supermercato',
    '例如：房租、电费、超市采购',
    'Ex : Loyer, Électricité, Supermarché',
    'z. B. Miete, Stromrechnung, Supermarkt'
  ],
  'Adicione detalhes ou notas importantes sobre a despesa...': [
    'Adicione detalhes ou notas importantes sobre a despesa...',
    'Add important details or notes about this expense...',
    'Agrega detalles o notas importantes sobre el gasto...',
    'Aggiungi dettagli o note importanti sulla spesa...',
    '添加关于此支出的重要详情或备注...',
    'Ajoutez des détails ou des notes importantes sur la dépense...',
    'Wichtige Details oder Notizen zur Ausgabe hinzufügen...'
  ],
  'Ex: Salário, Venda, Freelance...': [
    'Ex: Salário, Venda, Freelance...',
    'E.g., Salary, Sale, Freelance...',
    'Ej: Salario, Venta, Freelance...',
    'Es: Stipendio, Vendita, Freelance...',
    '例如：工资、销售、兼职...',
    'Ex : Salaire, Vente, Freelance...',
    'z. B. Gehalt, Verkauf, Freelance...'
  ],
  'Adicione detalhes adicionais sobre a receita...': [
    'Adicione detalhes adicionais sobre a receita...',
    'Add additional details about this income...',
    'Agrega detalles adicionales sobre el ingreso...',
    'Aggiungi ulteriori dettagli sull’entrata...',
    '添加关于此收入的更多详情...',
    'Ajoutez des détails supplémentaires sur ce revenu...',
    'Weitere Details zu dieser Einnahme hinzufügen...'
  ],
  'Buscar...': [
    'Pesquisar...',
    'Search...',
    'Buscar...',
    'Cerca...',
    '搜索...',
    'Rechercher...',
    'Suchen...'
  ],
  'Digite a descrição...': [
    'Introduza a descrição...',
    'Enter description...',
    'Ingresa la descripción...',
    'Inserisci la descrizione...',
    '输入描述...',
    'Saisissez la description...',
    'Beschreibung eingeben...'
  ],
  'Deixe em branco para manter a descrição atual': [
    'Deixe em branco para manter a descrição atual',
    'Leave blank to keep current description',
    'Deja en blanco para mantener la descripción actual',
    'Lascia vuoto per mantenere la descrizione attuale',
    '留空以保持当前描述',
    'Laisser vide pour conserver la description actuelle',
    'Leer lassen, um aktuelle Beschreibung beizubehalten'
  ],
  'Ex: Nubank, Itaú, Inter...': [
    'Ex: Millennium, ActivoBank, Revolut...',
    'E.g., Chase, Amex, Citi, Revolut...',
    'Ej: Santander, BBVA, Revolut...',
    'Es: Intesa, UniCredit, Revolut...',
    '例如：招商银行、工商银行、Visa...',
    'Ex : BNP, BoursoBank, Revolut...',
    'z. B. N26, DKB, Sparkasse, Revolut...'
  ]
};

// Ajuda contextual de colunas e seções (ordem: pt-PT, en, es, it, zh, fr, de)
const SECTION_HELP_TRANSLATIONS = [
  ['Valor que você definiu como meta ou limite para esta categoria no mês, calculado a partir do Orçamento.', 'Amount you set as the goal or limit for this category this month, based on the Budget.', 'Valor que definiste como meta o límite para esta categoría en el mes, según el Presupuesto.', 'Importo che hai impostato come obiettivo o limite per questa categoria nel mese, in base al Budget.', '您在预算中为该类别设定的本月目标或限额。', 'Montant que vous avez défini comme objectif ou plafond pour cette catégorie ce mois-ci, selon le Budget.', 'Betrag, den Sie als Ziel oder Limit für diese Kategorie im Monat festgelegt haben (aus dem Budget).'],
  ['Valor planejado dividido pelas semanas do mês, para ajudar a controlar o ritmo de gastos.', 'Planned amount divided by the weeks of the month, to help you pace your spending.', 'Valor planificado dividido por las semanas del mes, para controlar el ritmo de gasto.', 'Importo pianificato diviso per le settimane del mese, per controllare il ritmo di spesa.', '将计划金额按本月周数拆分，帮助控制支出节奏。', 'Montant prévu divisé par les semaines du mois, pour maîtriser le rythme des dépenses.', 'Geplanter Betrag, auf die Wochen des Monats verteilt, um das Ausgabetempo zu steuern.'],
  ['Total já gasto no período, somando as despesas lançadas.', 'Total already spent in the period, summing the recorded expenses.', 'Total ya gastado en el período, sumando los gastos registrados.', 'Totale già speso nel periodo, sommando le spese registrate.', '本期已支出的总额（汇总已记录的支出）。', 'Total déjà dépensé sur la période, somme des dépenses saisies.', 'Im Zeitraum bereits ausgegebener Gesamtbetrag aus den erfassten Ausgaben.'],
  ['Total já gasto nesta categoria no período, somando as despesas lançadas.', 'Total already spent in this category in the period, summing the recorded expenses.', 'Total ya gastado en esta categoría en el período, sumando los gastos registrados.', 'Totale già speso in questa categoria nel periodo, sommando le spese registrate.', '本期该类别已支出的总额（汇总已记录的支出）。', 'Total déjà dépensé dans cette catégorie sur la période, somme des dépenses saisies.', 'Im Zeitraum in dieser Kategorie bereits ausgegebener Betrag aus den erfassten Ausgaben.'],
  ['Quanto ainda resta do valor planejado (Planejado menos Gasto). Valor negativo indica que o limite foi ultrapassado.', 'How much of the planned amount is left (Planned minus Spent). A negative value means the limit was exceeded.', 'Cuánto queda del valor planificado (Planificado menos Gasto). Un valor negativo indica que se superó el límite.', 'Quanto resta dell’importo pianificato (Pianificato meno Speso). Un valore negativo indica che il limite è stato superato.', '计划金额的剩余部分（计划减已支出）。负值表示已超出限额。', 'Ce qu’il reste du montant prévu (Prévu moins Dépensé). Une valeur négative indique un dépassement.', 'Wie viel vom geplanten Betrag übrig ist (Geplant minus Ausgegeben). Ein negativer Wert bedeutet Überschreitung.'],
  ['Quanto ainda pode ser gasto por semana até o fim do mês, sem estourar o planejado.', 'How much can still be spent per week until month end without exceeding the plan.', 'Cuánto aún se puede gastar por semana hasta fin de mes sin exceder lo planificado.', 'Quanto si può ancora spendere a settimana fino a fine mese senza superare il piano.', '到月底前每周还能花多少而不超出计划。', 'Ce que vous pouvez encore dépenser par semaine d’ici la fin du mois sans dépasser le prévu.', 'Wie viel pro Woche bis Monatsende noch ausgegeben werden kann, ohne den Plan zu überschreiten.'],
  ['Percentual do valor planejado que já foi consumido pelos gastos.', 'Percentage of the planned amount already consumed by spending.', 'Porcentaje del valor planificado ya consumido por los gastos.', 'Percentuale dell’importo pianificato già consumata dalle spese.', '计划金额中已被支出消耗的百分比。', 'Pourcentage du montant prévu déjà consommé par les dépenses.', 'Prozentsatz des geplanten Betrags, der bereits durch Ausgaben verbraucht wurde.'],
  ['Escolha se a meta da categoria é definida em valor (R$) ou em percentual (%) da renda.', 'Choose whether the category goal is set as an amount (\$) or as a percentage (%) of income.', 'Elige si la meta de la categoría se define en valor ($) o en porcentaje (%) del ingreso.', 'Scegli se l’obiettivo della categoria è un importo ($) o una percentuale (%) del reddito.', '选择类别目标按金额还是按收入百分比 (%) 设定。', 'Choisissez si l’objectif de la catégorie est un montant ($) ou un pourcentage (%) du revenu.', 'Wählen Sie, ob das Kategorieziel als Betrag ($) oder als Prozentsatz (%) des Einkommens gilt.'],
  ['Valor ou percentual definido como meta desta categoria no mês selecionado.', 'Amount or percentage set as the goal for this category in the selected month.', 'Valor o porcentaje definido como meta de esta categoría en el mes seleccionado.', 'Importo o percentuale impostato come obiettivo di questa categoria nel mese selezionato.', '所选月份该类别设定的目标金额或百分比。', 'Montant ou pourcentage défini comme objectif de cette catégorie pour le mois sélectionné.', 'Betrag oder Prozentsatz, der als Ziel dieser Kategorie im gewählten Monat festgelegt ist.'],
  ['Indica a situação do item, como dentro do limite, estourado, pago ou pendente.', 'Shows the item’s situation, such as within limit, exceeded, paid or pending.', 'Indica la situación del ítem, como dentro del límite, excedido, pagado o pendiente.', 'Indica la situazione della voce, ad esempio entro il limite, superato, pagato o in sospeso.', '显示该项状态，如在限额内、已超支、已付或待付。', 'Indique la situation de l’élément : dans la limite, dépassé, payé ou en attente.', 'Zeigt den Zustand des Eintrags, z. B. im Limit, überschritten, bezahlt oder ausstehend.'],
  ['Valor monetário total do registro ou da categoria no período.', 'Total monetary amount of the record or category in the period.', 'Valor monetario total del registro o de la categoría en el período.', 'Importo monetario totale del record o della categoria nel periodo.', '该记录或类别在本期的总金额。', 'Montant total de l’enregistrement ou de la catégorie sur la période.', 'Gesamtbetrag des Eintrags oder der Kategorie im Zeitraum.'],
  ['Soma de todo o dinheiro recebido no período selecionado.', 'Sum of all money received in the selected period.', 'Suma de todo el dinero recibido en el período seleccionado.', 'Somma di tutto il denaro ricevuto nel periodo selezionato.', '所选期间收到的全部款项总和。', 'Somme de tout l’argent reçu sur la période sélectionnée.', 'Summe aller im gewählten Zeitraum erhaltenen Beträge.'],
  ['Soma de todos os gastos lançados no período selecionado.', 'Sum of all expenses recorded in the selected period.', 'Suma de todos los gastos registrados en el período seleccionado.', 'Somma di tutte le spese registrate nel periodo selezionato.', '所选期间已记录的全部支出总和。', 'Somme de toutes les dépenses saisies sur la période sélectionnée.', 'Summe aller im gewählten Zeitraum erfassten Ausgaben.'],
  ['Diferença entre receitas e despesas do período. Positivo significa sobra; negativo, déficit.', 'Difference between income and expenses in the period. Positive means surplus; negative, deficit.', 'Diferencia entre ingresos y gastos del período. Positivo significa sobrante; negativo, déficit.', 'Differenza tra entrate e spese del periodo. Positivo indica avanzo; negativo, disavanzo.', '本期收入与支出的差额。正数为结余，负数为赤字。', 'Différence entre revenus et dépenses de la période. Positif : excédent ; négatif : déficit.', 'Differenz zwischen Einnahmen und Ausgaben. Positiv bedeutet Überschuss, negativ Defizit.'],
  ['Resultado do período: receitas menos despesas.', 'Result of the period: income minus expenses.', 'Resultado del período: ingresos menos gastos.', 'Risultato del periodo: entrate meno spese.', '本期结果：收入减去支出。', 'Résultat de la période : revenus moins dépenses.', 'Ergebnis des Zeitraums: Einnahmen minus Ausgaben.'],
  ['Percentual da receita que sobrou após pagar as despesas.', 'Percentage of income left after paying expenses.', 'Porcentaje del ingreso que sobró tras pagar los gastos.', 'Percentuale delle entrate rimasta dopo aver pagato le spese.', '支付支出后剩余收入的百分比。', 'Pourcentage du revenu restant après paiement des dépenses.', 'Prozentsatz der Einnahmen, der nach den Ausgaben übrig bleibt.'],
  ['Agrupa os dados em blocos de 3 meses do ano.', 'Groups the data into 3-month blocks of the year.', 'Agrupa los datos en bloques de 3 meses del año.', 'Raggruppa i dati in blocchi di 3 mesi dell’anno.', '将数据按一年中的 3 个月分组。', 'Regroupe les données par blocs de 3 mois.', 'Fasst die Daten in 3-Monats-Blöcke des Jahres zusammen.'],
  ['Botões para editar ou excluir este registro.', 'Buttons to edit or delete this record.', 'Botones para editar o eliminar este registro.', 'Pulsanti per modificare o eliminare questo record.', '用于编辑或删除此记录的按钮。', 'Boutons pour modifier ou supprimer cet enregistrement.', 'Schaltflächen zum Bearbeiten oder Löschen dieses Eintrags.'],
  ['Use os filtros para restringir a lista por categoria, período, status ou texto.', 'Use filters to narrow the list by category, period, status or text.', 'Usa los filtros para acotar la lista por categoría, período, estado o texto.', 'Usa i filtri per restringere l’elenco per categoria, periodo, stato o testo.', '使用筛选按类别、期间、状态或文本缩小列表范围。', 'Utilisez les filtres pour restreindre la liste par catégorie, période, statut ou texte.', 'Mit Filtern grenzen Sie die Liste nach Kategorie, Zeitraum, Status oder Text ein.'],
  ['Defina a renda prevista do mês e as dívidas a abater para calcular a renda real disponível.', 'Set the month’s expected income and the debts to deduct to calculate the available real income.', 'Define el ingreso previsto del mes y las deudas a descontar para calcular el ingreso real disponible.', 'Imposta il reddito previsto del mese e i debiti da detrarre per calcolare il reddito reale disponibile.', '设置本月预计收入及需扣除的债务，以计算实际可用收入。', 'Définissez le revenu prévu du mois et les dettes à déduire pour calculer le revenu réel disponible.', 'Legen Sie das erwartete Monatseinkommen und abzuziehende Schulden fest, um das verfügbare Realeinkommen zu berechnen.'],
  ['Gráfico que mostra como a renda do mês está dividida entre as categorias.', 'Chart showing how the month’s income is split among categories.', 'Gráfico que muestra cómo se divide el ingreso del mes entre las categorías.', 'Grafico che mostra come il reddito del mese è suddiviso tra le categorie.', '显示本月收入如何在各类别间分配的图表。', 'Graphique montrant comment le revenu du mois est réparti entre les catégories.', 'Diagramm, das zeigt, wie das Monatseinkommen auf die Kategorien verteilt ist.'],
  ['Defina o limite de cada categoria em valor (R$) ou percentual (%) da renda.', 'Set each category’s limit as an amount or a percentage (%) of income.', 'Define el límite de cada categoría en valor o porcentaje (%) del ingreso.', 'Imposta il limite di ogni categoria come importo o percentuale (%) del reddito.', '按金额或收入百分比 (%) 设置每个类别的限额。', 'Définissez le plafond de chaque catégorie en montant ou en pourcentage (%) du revenu.', 'Legen Sie das Limit jeder Kategorie als Betrag oder Prozentsatz (%) des Einkommens fest.'],
  ['Compara o que foi planejado com o que já foi gasto em cada categoria.', 'Compares what was planned with what has been spent in each category.', 'Compara lo planificado con lo ya gastado en cada categoría.', 'Confronta ciò che era pianificato con ciò che è stato speso in ogni categoria.', '比较每个类别的计划金额与已支出金额。', 'Compare le prévu avec le dépensé pour chaque catégorie.', 'Vergleicht Geplantes mit bereits Ausgegebenem je Kategorie.'],
  ['Compara os gastos reais com a distribuição planejada no orçamento.', 'Compares actual spending with the distribution planned in the budget.', 'Compara los gastos reales con la distribución planificada en el presupuesto.', 'Confronta le spese reali con la distribuzione pianificata nel budget.', '比较实际支出与预算中的计划分配。', 'Compare les dépenses réelles avec la répartition prévue au budget.', 'Vergleicht tatsächliche Ausgaben mit der im Budget geplanten Verteilung.'],
  ['Média mensal dos seus gastos essenciais (Despesas Fixas, Educação e Lazer).', 'Monthly average of your essential spending (Fixed Expenses, Education and Leisure).', 'Promedio mensual de tus gastos esenciales (Gastos Fijos, Educación y Ocio).', 'Media mensile delle tue spese essenziali (Spese Fisse, Istruzione e Tempo Libero).', '您的基本支出（固定支出、教育、休闲）的月均值。', 'Moyenne mensuelle de vos dépenses essentielles (Dépenses Fixes, Éducation et Loisirs).', 'Monatlicher Durchschnitt Ihrer wesentlichen Ausgaben (Fixkosten, Bildung und Freizeit).'],
  ['Escolha quais relatórios exibir, a ordem e o tamanho de cada gráfico.', 'Choose which reports to show, their order and the size of each chart.', 'Elige qué informes mostrar, su orden y el tamaño de cada gráfico.', 'Scegli quali report mostrare, l’ordine e la dimensione di ogni grafico.', '选择要显示的报表、顺序以及每个图表的大小。', 'Choisissez les rapports à afficher, leur ordre et la taille de chaque graphique.', 'Wählen Sie, welche Berichte angezeigt werden, deren Reihenfolge und die Größe jedes Diagramms.'],
  ['Mostra receitas e despesas dos últimos 6 meses para você acompanhar a tendência.', 'Shows income and expenses of the last 6 months so you can follow the trend.', 'Muestra ingresos y gastos de los últimos 6 meses para seguir la tendencia.', 'Mostra entrate e spese degli ultimi 6 mesi per seguire la tendenza.', '显示最近 6 个月的收入与支出，便于观察趋势。', 'Affiche revenus et dépenses des 6 derniers mois pour suivre la tendance.', 'Zeigt Einnahmen und Ausgaben der letzten 6 Monate, um den Trend zu verfolgen.'],
  ['Mostra a participação de cada categoria no total gasto.', 'Shows each category’s share of total spending.', 'Muestra la participación de cada categoría en el total gastado.', 'Mostra la quota di ogni categoria sul totale speso.', '显示每个类别在总支出中的占比。', 'Montre la part de chaque catégorie dans le total dépensé.', 'Zeigt den Anteil jeder Kategorie an den Gesamtausgaben.'],
  ['Ranking do total gasto em cada categoria.', 'Ranking of total spent in each category.', 'Ranking del total gastado en cada categoría.', 'Classifica del totale speso in ogni categoria.', '各类别支出总额排名。', 'Classement du total dépensé par catégorie.', 'Rangliste der Gesamtausgaben je Kategorie.'],
  ['Percentual da receita que sobrou (ou faltou) no mês.', 'Percentage of income left over (or missing) in the month.', 'Porcentaje del ingreso que sobró (o faltó) en el mes.', 'Percentuale delle entrate avanzata (o mancante) nel mese.', '本月收入剩余（或不足）的百分比。', 'Pourcentage du revenu restant (ou manquant) dans le mois.', 'Prozentsatz der Einnahmen, der im Monat übrig blieb (oder fehlte).'],
  ['Total recebido agrupado por categoria, com a participação de cada uma.', 'Total received grouped by category, with each one’s share.', 'Total recibido agrupado por categoría, con la participación de cada una.', 'Totale ricevuto raggruppato per categoria, con la quota di ciascuna.', '按类别汇总的收入总额及各自占比。', 'Total reçu regroupé par catégorie, avec la part de chacune.', 'Erhaltene Summe nach Kategorie gruppiert, mit dem Anteil jeder Kategorie.'],
  ['Total gasto agrupado por categoria, com a participação de cada uma.', 'Total spent grouped by category, with each one’s share.', 'Total gastado agrupado por categoría, con la participación de cada una.', 'Totale speso raggruppato per categoria, con la quota di ciascuna.', '按类别汇总的支出总额及各自占比。', 'Total dépensé regroupé par catégorie, avec la part de chacune.', 'Ausgaben nach Kategorie gruppiert, mit dem Anteil jeder Kategorie.'],
  ['Compara receitas, despesas e resultado entre períodos diferentes.', 'Compares income, expenses and result across different periods.', 'Compara ingresos, gastos y resultado entre distintos períodos.', 'Confronta entrate, spese e risultato tra periodi diversi.', '比较不同期间的收入、支出和结果。', 'Compare revenus, dépenses et résultat entre différentes périodes.', 'Vergleicht Einnahmen, Ausgaben und Ergebnis zwischen verschiedenen Zeiträumen.'],
  ['Informação exibida nesta coluna, calculada a partir dos seus lançamentos do período selecionado.', 'Information shown in this column, calculated from your entries in the selected period.', 'Información mostrada en esta columna, calculada a partir de tus registros del período seleccionado.', 'Informazione mostrata in questa colonna, calcolata dai tuoi movimenti del periodo selezionato.', '此列显示的信息，根据所选期间的记录计算得出。', 'Information affichée dans cette colonne, calculée à partir de vos écritures de la période sélectionnée.', 'In dieser Spalte angezeigte Information, berechnet aus Ihren Buchungen im gewählten Zeitraum.'],
  ['Esta seção apresenta informações calculadas automaticamente a partir dos seus lançamentos do período selecionado.', 'This section shows information calculated automatically from your entries in the selected period.', 'Esta sección muestra información calculada automáticamente a partir de tus registros del período seleccionado.', 'Questa sezione mostra informazioni calcolate automaticamente dai tuoi movimenti del periodo selezionato.', '本部分显示根据所选期间的记录自动计算的信息。', 'Cette section affiche des informations calculées automatiquement à partir de vos écritures de la période sélectionnée.', 'Dieser Bereich zeigt automatisch berechnete Informationen aus Ihren Buchungen im gewählten Zeitraum.']
];
SECTION_HELP_TRANSLATIONS.push(
  ['**OBS: Para criar ou editar categorias e metas, acesse o menu Configurações > aba "Categorias & Metas" e use o botão "Nova Categoria" ou o ícone de lápis no cartão da categoria.', '**NOTE: To create or edit categories and goals, go to Settings > "Categories & Goals" tab and use the "New Category" button or the pencil icon on the category card.', '**NOTA: Para crear o editar categorías y metas, ve a Configuración > pestaña "Categorías y Metas" y usa el botón "Nueva Categoría" o el icono de lápiz en la tarjeta de la categoría.', '**NOTA: Per creare o modificare categorie e obiettivi, vai su Impostazioni > scheda "Categorie e Obiettivi" e usa il pulsante "Nuova Categoria" o l’icona della matita sulla scheda della categoria.', '**注意：要创建或编辑类别和目标，请前往“设置”>“类别与目标”标签页，使用“新增类别”按钮或类别卡片上的铅笔图标。', '**NOTE : Pour créer ou modifier des catégories et objectifs, allez dans Paramètres > onglet « Catégories et Objectifs » et utilisez le bouton « Nouvelle Catégorie » ou l’icône crayon sur la carte de la catégorie.', '**HINWEIS: Kategorien und Ziele erstellen oder bearbeiten Sie unter Einstellungen > Tab „Kategorien & Ziele“ über die Schaltfläche „Neue Kategorie“ oder das Stiftsymbol auf der Kategoriekarte.'],
  ['**OBS: Para criar ou editar subcategorias, acesse o menu Configurações > aba "Categorias & Metas", digite em "+ Nova subcategoria..." no cartão da categoria e clique em +. Para remover, use o X ao lado dela.', '**NOTE: To create or edit subcategories, go to Settings > "Categories & Goals" tab, type in "+ New subcategory..." on the category card and click +. To remove one, use the X next to it.', '**NOTA: Para crear o editar subcategorías, ve a Configuración > pestaña "Categorías y Metas", escribe en "+ Nueva subcategoría..." en la tarjeta de la categoría y haz clic en +. Para eliminar, usa la X junto a ella.', '**NOTA: Per creare o modificare sottocategorie, vai su Impostazioni > scheda "Categorie e Obiettivi", scrivi in "+ Nuova sottocategoria..." sulla scheda della categoria e clicca +. Per rimuoverla usa la X accanto.', '**注意：要创建或编辑子类别，请前往“设置”>“类别与目标”标签页，在类别卡片的“+ 新子类别...”中输入并点击 +。删除请点击旁边的 X。', '**NOTE : Pour créer ou modifier des sous-catégories, allez dans Paramètres > onglet « Catégories et Objectifs », saisissez dans « + Nouvelle sous-catégorie... » sur la carte de la catégorie et cliquez sur +. Pour supprimer, utilisez le X à côté.', '**HINWEIS: Unterkategorien erstellen oder bearbeiten Sie unter Einstellungen > Tab „Kategorien & Ziele“: in „+ Neue Unterkategorie...“ auf der Kategoriekarte eingeben und auf + klicken. Zum Entfernen das X daneben nutzen.']
);
SECTION_HELP_TRANSLATIONS.forEach((row) => {
  PHRASE_MAP[row[0]] = row;
});

const LANG_INDEX = {
  'pt-PT': 0,
  en: 1,
  es: 2,
  it: 3,
  zh: 4,
  fr: 5,
  de: 6
};

// Índices pré-computados (case-insensitive e ordenados do maior comprimento para o menor)
const PHRASE_MAP_LOWER = Object.create(null);
for (const [k, v] of Object.entries(PHRASE_MAP)) {
  PHRASE_MAP_LOWER[k.toLowerCase()] = v;
}

const PLACEHOLDER_MAP_LOWER = Object.create(null);
for (const [k, v] of Object.entries(PLACEHOLDER_MAP)) {
  PLACEHOLDER_MAP_LOWER[k.toLowerCase()] = v;
}

const SORTED_PHRASE_ENTRIES = Object.entries(PHRASE_MAP)
  .filter(([k]) => k.length > 4)
  .sort((a, b) => b[0].length - a[0].length);

// Padrões dinâmicos frequentes (contadores, parcelas, vencimentos, metas)
const DYNAMIC_PATTERNS = [
  {
    regex: /^Serão criados (\d+) título\(s\) com datas mensais consecutivas$/i,
    templates: [
      'Serão criados $1 título(s) com datas mensais consecutivas',
      '$1 entry(ies) will be created with consecutive monthly dates',
      'Se crearán $1 registro(s) con fechas mensuales consecutivas',
      'Verranno creati $1 titolo(i) con date mensili consecutive',
      '将按连续月份日期创建 $1 条记录',
      '$1 entrée(s) seront créées avec des dates mensuelles consécutives',
      'Es werden $1 Eintrag/Einträge mit aufeinanderfolgenden monatlichen Daten erstellt'
    ]
  },
  {
    regex: /^(\d+)\s+despesa\(s\)$/i,
    templates: [
      '$1 despesa(s)',
      '$1 expense(s)',
      '$1 gasto(s)',
      '$1 spesa(e)',
      '$1 笔支出',
      '$1 dépense(s)',
      '$1 Ausgabe(n)'
    ]
  },
  {
    regex: /^(\d+)\s+receita\(s\)$/i,
    templates: [
      '$1 receita(s)',
      '$1 income(s)',
      '$1 ingreso(s)',
      '$1 entrata(e)',
      '$1 笔收入',
      '$1 revenu(s)',
      '$1 Einnahme(n)'
    ]
  },
  {
    regex: /^(\d+)\s+compra\(s\)$/i,
    templates: [
      '$1 compra(s)',
      '$1 purchase(s)',
      '$1 compra(s)',
      '$1 acquisto(i)',
      '$1 笔消费',
      '$1 achat(s)',
      '$1 Einkauf/Einkäufe'
    ]
  },
  {
    regex: /^Editar Despesas Selecionadas \((\d+)\)$/i,
    templates: [
      'Editar Despesas Selecionadas ($1)',
      'Edit Selected Expenses ($1)',
      'Editar Gastos Seleccionados ($1)',
      'Modifica Spese Selezionate ($1)',
      '编辑已选支出 ($1)',
      'Modifier les Dépenses Sélectionnées ($1)',
      'Ausgewählte Ausgaben bearbeiten ($1)'
    ]
  },
  {
    regex: /^(\d+) de (\d+) dentro da meta$/i,
    templates: [
      '$1 de $2 dentro da meta',
      '$1 of $2 within goal',
      '$1 de $2 dentro de la meta',
      '$1 di $2 entro l’obiettivo',
      '$1 / $2 在目标范围内',
      '$1 sur $2 dans l’objectif',
      '$1 von $2 im Zielbereich'
    ]
  },
  {
    regex: /^Meta \((\d+(?:[.,]\d+)?)%\)$/i,
    templates: [
      'Meta ($1%)',
      'Goal ($1%)',
      'Meta ($1%)',
      'Obiettivo ($1%)',
      '目标 ($1%)',
      'Objectif ($1%)',
      'Ziel ($1%)'
    ]
  },
  {
    regex: /^Resta (.+)$/i,
    templates: [
      'Resta $1',
      'Remaining $1',
      'Resta $1',
      'Restano $1',
      '剩余 $1',
      'Reste $1',
      'Verbleibend $1'
    ]
  },
  {
    regex: /^Dia (\d+)$/i,
    templates: [
      'Dia $1',
      'Day $1',
      'Día $1',
      'Giorno $1',
      '每月 $1 日',
      'Jour $1',
      'Tag $1'
    ]
  },
  {
    regex: /^(.+?)\s*\(Venc\.\s*dia\s*(\d+)\)$/i,
    templates: [
      '$1 (Venc. dia $2)',
      '$1 (Due day $2)',
      '$1 (Venc. día $2)',
      '$1 (Scad. giorno $2)',
      '$1 (还款日 $2日)',
      '$1 (Éch. jour $2)',
      '$1 (Fällig am $2.)'
    ]
  },
  {
    regex: /^Venc\.\s*dia\s*(\d+)$/i,
    templates: [
      'Venc. dia $1',
      'Due day $1',
      'Venc. día $1',
      'Scad. giorno $1',
      '还款日 $1日',
      'Éch. jour $1',
      'Fällig am $1.'
    ]
  },
  {
    regex: /^Vencimento:\s*(.+)$/i,
    templates: [
      'Vencimento: $1',
      'Due date: $1',
      'Vencimiento: $1',
      'Scadenza: $1',
      '到期日: $1',
      'Échéance : $1',
      'Fälligkeit: $1'
    ]
  },
  {
    regex: /^Etapa (\d+) de (\d+)$/i,
    templates: [
      'Etapa $1 de $2',
      'Step $1 of $2',
      'Paso $1 de $2',
      'Passo $1 di $2',
      '第 $1 / $2 步',
      'Étape $1 sur $2',
      'Schritt $1 von $2'
    ]
  },
  {
    regex: /^Selecione ou digite a data referente a "(.+)" para registrar ou filtrar o período exato no sistema\.$/i,
    templates: [
      'Selecione ou introduza a data referente a "$1" para registar ou filtrar o período exato no sistema.',
      'Select or type the date for "$1" to record or filter the exact period in the system.',
      'Selecciona o escribe la fecha correspondiente a "$1" para registrar o filtrar el período exacto en el sistema.',
      'Seleziona o digita la data relativa a "$1" per registrare o filtrare il periodo esatto nel sistema.',
      '选择或输入与“$1”对应的日期，以便在系统中记录或筛选准确的时期。',
      'Sélectionnez ou saisissez la date relative à « $1 » pour enregistrer ou filtrer la période exacte dans le système.',
      'Wählen oder geben Sie das Datum für „$1“ ein, um den genauen Zeitraum im System zu erfassen oder zu filtern.'
    ]
  },
  {
    regex: /^Informe o valor numérico correspondente a "(.+)" para que o sistema calcule os totais e indicadores automaticamente\.$/i,
    templates: [
      'Informe o valor numérico correspondente a "$1" para que o sistema calcule os totais e indicadores automaticamente.',
      'Enter the numeric amount for "$1" so the system can calculate totals and indicators automatically.',
      'Indica el valor numérico correspondiente a "$1" para que el sistema calcule los totales e indicadores automáticamente.',
      'Inserisci il valore numerico corrispondente a "$1" affinché il sistema calcoli automaticamente i totali e gli indicatori.',
      '输入“$1”对应的数值金额，以便系统自动计算总额和各项指标。',
      'Indiquez la valeur numérique correspondant à « $1 » afin que le système calcule automatiquement les totaux et indicateurs.',
      'Geben Sie den numerischen Wert für „$1“ ein, damit das System Summen und Kennzahlen automatisch berechnet.'
    ]
  },
  {
    regex: /^Selecione ou preencha "(.+)" para classificar ou refinar os registros exibidos nesta tela\.$/i,
    templates: [
      'Selecione ou preencha "$1" para classificar ou refinar os registos exibidos neste ecrã.',
      'Select or fill in "$1" to classify or refine the records displayed on this screen.',
      'Selecciona o completa "$1" para clasificar o refinar los registros mostrados en esta pantalla.',
      'Seleziona o compila "$1" per classificare o affinare i record visualizzati in questa schermata.',
      '选择或填写“$1”以对当前屏幕显示的记录进行分类或筛选。',
      'Sélectionnez ou remplissez « $1 » pour classer ou affiner les enregistrements affichés sur cet écran.',
      'Wählen oder füllen Sie „$1“ aus, um die auf diesem Bildschirm angezeigten Einträge zu klassifizieren oder zu filtern.'
    ]
  },
  {
    regex: /^Preencha ou selecione a informação correspondente ao campo "(.+)" para registrar seus dados com precisão no sistema\.$/i,
    templates: [
      'Preencha ou selecione a informação correspondente ao campo "$1" para registar os seus dados com precisão no sistema.',
      'Fill in or select the information for "$1" to accurately record your data in the system.',
      'Completa o selecciona la información correspondiente al campo "$1" para registrar tus datos con precisión en el sistema.',
      'Compila o seleziona l’informazione corrispondente al campo "$1" per registrare con precisione i tuoi dati nel sistema.',
      '填写或选择与“$1”字段对应的信息，以便在系统中准确记录您的数据。',
      'Remplissez ou sélectionnez l’information correspondant au champ « $1 » pour enregistrer vos données avec précision dans le système.',
      'Füllen Sie die Information für das Feld „$1“ aus oder wählen Sie sie aus, um Ihre Daten präzise im System zu erfassen.'
    ]
  },
  {
    regex: /^\*Exemplo: Informe os dados solicitados em "(.+)" antes de salvar\.$/i,
    templates: [
      '*Exemplo: Informe os dados solicitados em "$1" antes de guardar.',
      '*Example: Enter the requested details in "$1" before saving.',
      '*Ejemplo: Ingresa los datos solicitados en "$1" antes de guardar.',
      '*Esempio: Inserisci i dati richiesti in "$1" prima di salvare.',
      '*示例：保存前请在“$1”中填写所需信息。',
      '*Exemple : Renseignez les informations demandées dans « $1 » avant d’enregistrer.',
      '*Beispiel: Geben Sie vor dem Speichern die angeforderten Daten in „$1“ ein.'
    ]
  }
];

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
    ['Voltar', 'Back'],
    ['Janeiro', 'January'],
    ['Fevereiro', 'February'],
    ['Março', 'March'],
    ['Abril', 'April'],
    ['Maio', 'May'],
    ['Junho', 'June'],
    ['Julho', 'July'],
    ['Agosto', 'August'],
    ['Setembro', 'September'],
    ['Outubro', 'October'],
    ['Novembro', 'November'],
    ['Dezembro', 'December'],
    ['Selecione o mês', 'Select month'],
    ['Todos os Meses', 'All Months'],
    ['Todos os Anos', 'All Years']
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
    ['Voltar', 'Volver'],
    ['Janeiro', 'Enero'],
    ['Fevereiro', 'Febrero'],
    ['Março', 'Marzo'],
    ['Abril', 'Abril'],
    ['Maio', 'Mayo'],
    ['Junho', 'Junio'],
    ['Julho', 'Julio'],
    ['Agosto', 'Agosto'],
    ['Setembro', 'Septiembre'],
    ['Outubro', 'Octubre'],
    ['Novembro', 'Noviembre'],
    ['Dezembro', 'Diciembre'],
    ['Selecione o mês', 'Seleccione el mes'],
    ['Todos os Meses', 'Todos los Meses'],
    ['Todos os Anos', 'Todos los Años']
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

  // 1. Correspondência exata de frase (case-sensitive e case-insensitive)
  const exactPhrase = PHRASE_MAP[trimmed] || PHRASE_MAP_LOWER[trimmed.toLowerCase()];
  if (exactPhrase && exactPhrase[idx]) {
    return str.replace(trimmed, exactPhrase[idx]);
  }

  // 2. Correspondência exata de placeholder (case-sensitive e case-insensitive)
  const exactPlaceholder = PLACEHOLDER_MAP[trimmed] || PLACEHOLDER_MAP_LOWER[trimmed.toLowerCase()];
  if (exactPlaceholder && exactPlaceholder[idx]) {
    return str.replace(trimmed, exactPlaceholder[idx]);
  }

  // 3. Correspondência preservando símbolos de borda (ex: "Data *", "• Total:", "- Receitas")
  const borderMatch = trimmed.match(/^([•\-\*\+\s:]+)?(.+?)([\s\*:\-]+)?$/);
  if (borderMatch) {
    const prefix = borderMatch[1] || '';
    const core = (borderMatch[2] || '').trim();
    const suffix = borderMatch[3] || '';
    if (core && core !== trimmed) {
      const coreEntry =
        PHRASE_MAP[core] ||
        PHRASE_MAP_LOWER[core.toLowerCase()] ||
        PLACEHOLDER_MAP[core] ||
        PLACEHOLDER_MAP_LOWER[core.toLowerCase()];
      if (coreEntry && coreEntry[idx]) {
        return str.replace(trimmed, `${prefix}${coreEntry[idx]}${suffix}`);
      }
    }
  }

  // 4. Padrões dinâmicos (contadores, parcelas, vencimento de cartão, metas)
  for (const pattern of DYNAMIC_PATTERNS) {
    const match = trimmed.match(pattern.regex);
    if (match && pattern.templates[idx]) {
      let formatted = pattern.templates[idx];
      for (let i = 1; i < match.length; i++) {
        formatted = formatted.split(`$${i}`).join(match[i]);
      }
      return str.replace(trimmed, formatted);
    }
  }

  // 5. Substituição parcial ordenada das frases mais longas para as mais curtas
  let result = str;
  for (const [ptPhrase, translations] of SORTED_PHRASE_ENTRIES) {
    if (result.includes(ptPhrase) && translations[idx]) {
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
            if (language === 'pt-BR') {
              if (currentNode.__lastTranslated !== undefined) {
                if (currentNode.__origPtBr !== undefined && currentNode.nodeValue !== currentNode.__origPtBr) {
                  currentNode.nodeValue = currentNode.__origPtBr;
                }
                delete currentNode.__lastTranslated;
              }
              currentNode.__origPtBr = currentNode.nodeValue;
            } else {
              if (currentNode.__origPtBr === undefined) {
                currentNode.__origPtBr = val;
              } else if (val !== currentNode.__lastTranslated) {
                currentNode.__origPtBr = val;
              }

              const baseText = currentNode.__origPtBr;
              const newText = translateString(baseText, language);

              if (currentNode.nodeValue !== newText) {
                currentNode.__lastTranslated = newText;
                currentNode.nodeValue = newText;
              }
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
              if (language === 'pt-BR') {
                if (el.__lastTranslatedPlaceholder !== undefined) {
                  if (el.__origPlaceholder !== undefined) {
                    el.setAttribute('placeholder', el.__origPlaceholder);
                  }
                  delete el.__lastTranslatedPlaceholder;
                }
                el.__origPlaceholder = currentPh;
              } else {
                if (el.__origPlaceholder === undefined) {
                  el.__origPlaceholder = currentPh;
                } else if (currentPh !== el.__lastTranslatedPlaceholder) {
                  el.__origPlaceholder = currentPh;
                }
                const nextPh = translateString(el.__origPlaceholder, language);
                if (currentPh !== nextPh) {
                  el.__lastTranslatedPlaceholder = nextPh;
                  el.setAttribute('placeholder', nextPh);
                }
              }
            }

            if (el.hasAttribute('title')) {
              const currentTitle = el.getAttribute('title');
              if (language === 'pt-BR') {
                if (el.__lastTranslatedTitle !== undefined) {
                  if (el.__origTitle !== undefined) {
                    el.setAttribute('title', el.__origTitle);
                  }
                  delete el.__lastTranslatedTitle;
                }
                el.__origTitle = currentTitle;
              } else {
                if (el.__origTitle === undefined) {
                  el.__origTitle = currentTitle;
                } else if (currentTitle !== el.__lastTranslatedTitle) {
                  el.__origTitle = currentTitle;
                }
                const nextTitle = translateString(el.__origTitle, language);
                if (currentTitle !== nextTitle) {
                  el.__lastTranslatedTitle = nextTitle;
                  el.setAttribute('title', nextTitle);
                }
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
