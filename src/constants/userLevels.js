// src/constants/userLevels.js

export const USER_LEVELS = {
  INICIANTE: 'iniciante',
  FACIL: 'facil',
  INTERMEDIARIO: 'intermediario',
  AVANCADO: 'avancado',
};

export const DEFAULT_USER_LEVEL = USER_LEVELS.AVANCADO;

export const LEVEL_DEFINITIONS = {
  [USER_LEVELS.INICIANTE]: {
    id: USER_LEVELS.INICIANTE,
    name: 'Iniciante',
    badge: '🌱 Iniciante',
    tagline: 'Primeiros passos sem complicação',
    description: 'Interface simplificada para quem nunca controlou gastos antes. Foco apenas no que Entrou, no que Saiu e no saldo imediato.',
    colorText: 'text-emerald-500 dark:text-emerald-400',
    colorBg: 'bg-emerald-500/10 border-emerald-500/30',
    colorBorder: 'border-emerald-500/40',
    colorRing: 'ring-emerald-500/30',
    accentColor: '#10b981',
    iconName: 'Sprout',
    allowedPaths: [
      '/dashboard',
      '/receitas',
      '/despesas',
      '/configuracoes',
      '/admin'
    ],
    labelsOverride: {
      '/receitas': 'Entrou (Receitas)',
      '/despesas': 'Saiu (Despesas)',
    },
    features: [
      { text: 'Registro rápido em 4 campos essenciais', included: true },
      { text: 'Vocabulário amigável ("Entrou" e "Saiu")', included: true },
      { text: 'Dashboard acolhedor com saldo imediato', included: true },
      { text: 'Ajuda interativa FIN passo a passo', included: true },
      { text: 'Orçamento com metas percentuais', included: false },
      { text: 'Gestão de múltiplos cartões e faturas', included: false },
      { text: 'DRE contábil e relatórios fiscais', included: false },
    ]
  },
  [USER_LEVELS.FACIL]: {
    id: USER_LEVELS.FACIL,
    name: 'Fácil',
    badge: '🟢 Fácil',
    tagline: 'Organização prática do dia a dia',
    description: 'Controle diário prático com planejamento financeiro básico, orçamento visual, filtros por categoria e importação de planilhas.',
    colorText: 'text-sky-500 dark:text-sky-400',
    colorBg: 'bg-sky-500/10 border-sky-500/30',
    colorBorder: 'border-sky-500/40',
    colorRing: 'ring-sky-500/30',
    accentColor: '#0ea5e9',
    iconName: 'CheckCircle2',
    allowedPaths: [
      '/dashboard',
      '/orcamento',
      '/receitas',
      '/despesas',
      '/configuracoes',
      '/admin'
    ],
    labelsOverride: {},
    features: [
      { text: 'Tudo do nível Iniciante', included: true },
      { text: 'Planejamento e metas de orçamento', included: true },
      { text: 'Filtros avançados de despesas e receitas', included: true },
      { text: 'Importação de extratos e planilhas Excel', included: true },
      { text: 'Gestão de múltiplos cartões e faturas', included: false },
      { text: 'Relatórios avançados e gráficos comparativos', included: false },
      { text: 'DRE contábil empresarial', included: false },
    ]
  },
  [USER_LEVELS.INTERMEDIARIO]: {
    id: USER_LEVELS.INTERMEDIARIO,
    name: 'Intermediário',
    badge: '🟡 Intermediário',
    tagline: 'Gestão completa de contas e crédito',
    description: 'Gestão sólida com cartões de crédito, parcelamentos, relatórios analíticos essenciais e backup completo dos seus dados.',
    colorText: 'text-amber-500 dark:text-amber-400',
    colorBg: 'bg-amber-500/10 border-amber-500/30',
    colorBorder: 'border-amber-500/40',
    colorRing: 'ring-amber-500/30',
    accentColor: '#f59e0b',
    iconName: 'Layers',
    allowedPaths: [
      '/dashboard',
      '/orcamento',
      '/receitas',
      '/despesas',
      '/cartoes',
      '/relatorios',
      '/backup',
      '/configuracoes',
      '/admin'
    ],
    labelsOverride: {},
    features: [
      { text: 'Tudo do nível Fácil', included: true },
      { text: 'Múltiplos cartões de crédito e faturas', included: true },
      { text: 'Controle de parcelamentos automáticos', included: true },
      { text: 'Relatórios analíticos e exportação em PDF', included: true },
      { text: 'Rotinas completas de Backup de segurança', included: true },
      { text: 'Módulo de viagens internacionais e câmbio', included: false },
      { text: 'DRE contábil profissional', included: false },
    ]
  },
  [USER_LEVELS.AVANCADO]: {
    id: USER_LEVELS.AVANCADO,
    name: 'Avançado (PRO)',
    badge: '👑 Avançado',
    tagline: 'Poder total e visão empresarial',
    description: 'Acesso irrestrito a todo o poder do sistema: DRE contábil detalhada, módulo dedicado de Viagens com conversão de moedas, relatórios PRO e restauração técnica.',
    colorText: 'text-custom-gold dark:text-custom-gold',
    colorBg: 'bg-custom-gold/15 border-custom-gold/30',
    colorBorder: 'border-custom-gold/50',
    colorRing: 'ring-custom-gold/30',
    accentColor: '#eab308',
    iconName: 'Crown',
    allowedPaths: [
      '/dashboard',
      '/orcamento',
      '/receitas',
      '/despesas',
      '/cartoes',
      '/viagens',
      '/relatorios',
      '/dre',
      '/backup',
      '/restauracao',
      '/configuracoes',
      '/admin'
    ],
    labelsOverride: {},
    features: [
      { text: 'Acesso completo e irrestrito ao sistema', included: true },
      { text: 'Demonstrativo do Resultado do Exercício (DRE)', included: true },
      { text: 'Módulo de Viagens com multi-moedas e orçamentos', included: true },
      { text: 'Relatórios PRO consolidados com filtros profundos', included: true },
      { text: 'Backup e Restauração técnica de dados', included: true },
      { text: 'Configurações avançadas de categorias e subcategorias', included: true },
    ]
  }
};
