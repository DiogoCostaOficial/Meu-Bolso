/**
 * MOTOR MULTILÍNGUE DO FIN (8 IDIOMAS: pt-BR, en, es, pt-PT, it, zh, fr, de)
 * - Segue automaticamente o idioma selecionado no sistema (LanguageContext)
 * - Também detecta automaticamente caso o cliente digite uma pergunta em outro idioma (ex: Inglês ou Espanhol)
 * - Traduz legendas, passos e narração de voz (SpeechSynthesis) dos Vídeos Curtos do Manual, Quiz e Respostas do FIN.
 */

export const SPEECH_LOCALE_BY_LANG = {
  'pt-BR': 'pt-BR',
  'pt-PT': 'pt-PT',
  en: 'en-US',
  es: 'es-ES',
  it: 'it-IT',
  zh: 'zh-CN',
  fr: 'fr-FR',
  de: 'de-DE'
};

export const LANGUAGE_NAMES_FOR_GEMINI = {
  'pt-BR': 'Português do Brasil (pt-BR)',
  'pt-PT': 'Português de Portugal (pt-PT)',
  en: 'English (en-US)',
  es: 'Español (es)',
  it: 'Italiano (it)',
  zh: 'Mandarin Chinese / 中文 (zh-CN)',
  fr: 'Français (fr)',
  de: 'Deutsch (de)'
};

/**
 * Detecta se a pergunta digitada pelo cliente está claramente em outro idioma.
 * Caso contrário, retorna o idioma ativo do sistema (activeLang).
 */
export function detectQuestionLanguage(questionText = '', activeLang = 'pt-BR') {
  const q = String(questionText || '').toLowerCase().trim();
  if (!q) return activeLang || 'pt-BR';

  // Detecção de caracteres chineses
  if (/[\u4e00-\u9fa5]/.test(q)) return 'zh';

  // Padrões fortes de Inglês
  if (/\b(what is|how do|how does|where is|why|can i|budget|income|expenses|credit card|heatmap|report|settings|trip|investment|for what)\b/i.test(q)) {
    return 'en';
  }

  // Padrões fortes de Espanhol
  if (/[¿¡]|\b(qué es|para qué|cómo funciona|presupuesto|gastos|ingresos|tarjeta|viajes|ahorro|configuración)\b/i.test(q)) {
    return 'es';
  }

  // Padrões fortes de Francês
  if (/\b(qu'est-ce|comment fonctionne|pourquoi|dépenses|revenus|carte de crédit|épargne|voyages)\b/i.test(q)) {
    return 'fr';
  }

  // Padrões fortes de Alemão
  if (/\b(was ist|wie funktioniert|warum|ausgaben|einnahmen|kreditkarte|reisen|einstellungen)\b/i.test(q)) {
    return 'de';
  }

  // Padrões fortes de Italiano
  if (/\b(che cos'è|come funziona|perché|spese|entrate|carta di credito|viaggi|impostazioni)\b/i.test(q)) {
    return 'it';
  }

  return activeLang || 'pt-BR';
}

/**
 * Traduções nativas das cenas dos Vídeos Curtos do Manual para Inglês e Espanhol,
 * além de tradução dinâmica assistida para todos os 8 idiomas do sistema.
 */
const VIDEO_TRANSLATIONS = {
  en: {
    orcamento: {
      title: 'Monthly Budget (Give Every Dollar a Name)',
      shortLabel: '🏷️ Budget',
      scenes: [
        {
          badge: 'Step 1 • Monthly Income',
          visualTitle: '💰 Expected Income vs. Real Income',
          visualDetail: 'Enter how much you expect to earn (Expected Income) and what actually arrived in your account (Real Income).',
          narration: 'Hi! For the Quiz and your budget control to work, start in the Budget menu by filling in your Expected Income and Real Income for the month!'
        },
        {
          badge: 'Step 2 • Emergency Fund',
          visualTitle: '🛡️ Pay Yourself First (10%)',
          visualDetail: 'Set aside 10% to 20% of your income for your safety piggy bank before spending.',
          narration: 'Next, set your Emergency Fund percentage. Saving first ensures your future is always protected!'
        },
        {
          badge: 'Step 3 • Category Goals',
          visualTitle: '🎯 Limit per Category (% or Amount)',
          visualDetail: 'Define how much each category (Housing, Leisure, Fixed Expenses) can spend in the month.',
          narration: 'Now give your money a name! Set a percentage or amount goal for each category, such as Fixed Expenses and Leisure.'
        },
        {
          badge: 'Step 4 • Smart Traffic Light',
          visualTitle: '🚦 Green (<80%) • Yellow (80-100%) • Red (>100%)',
          visualDetail: 'Click Save Budget and watch the bars change color as you record your expenses!',
          narration: 'Click Save Budget! Done: now the progress bars show in green, yellow, or red if there are still coins left in your jar!'
        }
      ]
    },
    dashboard: {
      title: 'Overview (Dashboard) & Spending Heatmap',
      shortLabel: '📊 Dashboard',
      scenes: [
        {
          badge: 'Step 1 • Period Filter',
          visualTitle: '📅 Month and Year Selector at the Top',
          visualDetail: 'Switch between any month to inspect the past or plan ahead.',
          narration: 'Welcome to the Dashboard, the command center of your pocket! At the top of the screen, choose the month and year you want to analyze.'
        },
        {
          badge: 'Step 2 • The 4 Main Cards',
          visualTitle: '💳 Income • Expenses • Balance • Cards',
          visualDetail: 'Instantly see if your Monthly Balance is positive or in the red.',
          narration: 'Right below, the four summary cards show everything that came in, everything that went out, your Free Balance, and total card bills.'
        },
        {
          badge: 'Step 3 • Spending Heatmap',
          visualTitle: '🔥 Daily Spending Intensity Calendar',
          visualDetail: 'Green = Frugal day | Yellow = Moderate spending | Red = High spending day.',
          narration: 'In the Financial Heatmap, each day of the month gets a color: green days were thrifty and red days had higher spending!'
        },
        {
          badge: 'Step 4 • Import Spreadsheet',
          visualTitle: '📥 Import Spreadsheet Button (Excel/CSV)',
          visualDetail: 'Bring your Cash Flow spreadsheet in seconds and filter out zero-value items.',
          narration: 'And if you already have an Excel spreadsheet, click Import Spreadsheet at the top of the Dashboard to bring all your data at once!'
        }
      ]
    },
    receitas: {
      title: 'Income (Recording Your Earnings)',
      shortLabel: '📈 Income',
      scenes: [
        {
          badge: 'Step 1 • New Income',
          visualTitle: '➕ "+ New Income" Button',
          visualDetail: 'Record Salary, Freelance work, Dividends, Rents, or Refunds.',
          narration: 'On the Income screen you record all money coming into your pocket! Click the New Income button to begin.'
        },
        {
          badge: 'Step 2 • Filling Details',
          visualTitle: '📝 Description, Amount, Date & Category',
          visualDetail: 'Enter where the money came from and the exact date received.',
          narration: 'Fill in the description, the amount received, the date it hit your account, and choose the category, like Salary or Extra Income.'
        },
        {
          badge: 'Step 3 • Recurring Income',
          visualTitle: '🔄 Mark as Fixed / Recurring',
          visualDetail: 'Enable for earnings that repeat automatically every month.',
          narration: 'If it is an amount you receive every month, mark it as Fixed Income so it feeds your Dashboard Balance automatically!'
        }
      ]
    },
    despesas: {
      title: 'Expenses & Daily Spending Control',
      shortLabel: '💸 Expenses',
      scenes: [
        {
          badge: 'Step 1 • Log Expense',
          visualTitle: '➕ "+ New Expense" Button',
          visualDetail: 'Log everything from coffee to rent so invisible leaks do not drain your coins.',
          narration: 'Logging every expense on the Expenses screen is the secret so your money never disappears! Click New Expense.'
        },
        {
          badge: 'Step 2 • Category & Payment',
          visualTitle: '🏷️ Category + Payment Method',
          visualDetail: 'Link the same category used in your Budget (e.g., Leisure, Housing) and pick Pix, Debit, or Card.',
          narration: 'Choose the same category you configured in your Budget! That way the system deducts it from the right jar automatically.'
        },
        {
          badge: 'Step 3 • Count in Budget',
          visualTitle: '☑️ "Count in Budget" Option',
          visualDetail: 'Keep checked to deduct from your monthly goal, or uncheck for reimbursable expenses.',
          narration: 'Keep the Count in Budget box checked so this expense updates your goal traffic light and the Spending Heatmap!'
        }
      ]
    },
    cartoes: {
      title: 'Credit Cards & Installment Purchases',
      shortLabel: '💳 Cards',
      scenes: [
        {
          badge: 'Step 1 • Add Credit Card',
          visualTitle: '💳 Total Limit, Closing Day & Due Day',
          visualDetail: 'The Closing Day determines which monthly bill your purchase will land on!',
          narration: 'In the Credit Cards module, register the card name, Total Limit, Statement Closing Day, and Due Day.'
        },
        {
          badge: 'Step 2 • Installment Purchases',
          visualTitle: '🛍️ Automatic Installment Split (e.g., 10x)',
          visualDetail: 'Enter total amount and number of installments: the system distributes future months automatically!',
          narration: 'Bought in installments? Just enter the total value and number of installments and the system schedules each monthly payment!'
        },
        {
          badge: 'Step 3 • Golden Rule',
          visualTitle: '🛡️ Never Pay Only the Minimum!',
          visualDetail: 'Watch the Available Limit bar to avoid revolving credit interest.',
          narration: 'Keep an eye on your Available Limit and always pay the full statement by the due date to avoid interest traps!'
        }
      ]
    },
    investimentos: {
      title: 'Investments & Compound Interest Snowball',
      shortLabel: '💎 Investments',
      scenes: [
        {
          badge: 'Step 1 • Log Investment',
          visualTitle: '🌱 New Investment (Fixed Income, Bonds, REITs, Stocks)',
          visualDetail: 'Register where your money is working for you.',
          narration: 'In the Investments tab you watch your coins having baby coins! Click New Investment to record each contribution.'
        },
        {
          badge: 'Step 2 • Net Worth Goal',
          visualTitle: '🎯 Invested Amount vs. Current Value',
          visualDetail: 'Compare what came out of your pocket with the updated balance including returns.',
          narration: 'Enter the Invested Amount and update the Current Value. That way you see the real profit of your Snowball growing every month!'
        }
      ]
    },
    viagens: {
      title: 'Trips & Multi-Currency Itineraries',
      shortLabel: '✈️ Trips',
      scenes: [
        {
          badge: 'Step 1 • Create Itinerary',
          visualTitle: '✈️ Destination, Dates, Currency & Target Budget',
          visualDetail: 'Pick BRL, USD, or EUR and set the maximum ceiling to travel debt-free.',
          narration: 'Going on a trip? Click Create Itinerary, pick your destination, dates, currency, and the Target Budget you planned to spend!'
        },
        {
          badge: 'Step 2 • Trip Expenses',
          visualTitle: '🏨 Flights, Lodging, Food & Tours',
          visualDetail: 'Log each expense inside the itinerary to track your remaining vacation budget.',
          narration: 'Inside the itinerary, add flights, hotel, and tours! Meu Bolso shows right away how much of your vacation budget is left!'
        }
      ]
    },
    relatorios: {
      title: 'Customizable Reports & Export',
      shortLabel: '📑 Reports',
      scenes: [
        {
          badge: 'Step 1 • Customize Report',
          visualTitle: '🎛️ Minimized 2x4 Panel at the Top',
          visualDetail: 'Click Show Options to toggle the 8 analytical sections of the report.',
          narration: 'On the Reports screen, click Customize Report at the top to choose which of the 8 charts and tables you want to display!'
        },
        {
          badge: 'Step 2 • Export PDF or Excel',
          visualTitle: '📄 Print-Ready Executive Export',
          visualDetail: 'Generate an executive PDF or spreadsheet with your complete monthly closing.',
          narration: 'After analyzing your monthly closing and category breakdown, you can export everything to PDF or spreadsheet with one click!'
        }
      ]
    },
    configuracoes: {
      title: 'Settings, Currency, Theme & Security',
      shortLabel: '⚙️ Settings',
      scenes: [
        {
          badge: 'Step 1 • Profile & FIN Greeting',
          visualTitle: '👤 How You Like to Be Called',
          visualDetail: 'Customize your name, greeting style, Light/Dark theme, and Primary Currency.',
          narration: 'In Settings you make Meu Bolso truly yours! Choose how I should call you, switch the screen theme, and pick your primary currency.'
        },
        {
          badge: 'Step 2 • Custom Categories & Security',
          visualTitle: '🔒 Custom Categories, Password & Account',
          visualDetail: 'Create new spending categories, change your password, or manage your account data.',
          narration: 'You can also create new categories for your Budget and manage your password security at any time!'
        }
      ]
    },
    fin_quiz: {
      title: 'How to Use FIN, Accessibility (A-/A+) & the Quiz',
      shortLabel: '🎮 Quiz & FIN',
      scenes: [
        {
          badge: 'Step 1 • Inclusive Accessibility',
          visualTitle: '🔠 A- / A+ Buttons & Expand Window',
          visualDetail: 'Increase font size across 4 levels or expand FIN in the center of the screen for easy reading.',
          narration: 'Did you know you can make my text super large? Use the A plus, A minus, and expand buttons right at the top of my window!'
        },
        {
          badge: 'Step 2 • Quiz: Can I Spend?',
          visualTitle: '🍬 Simulator Before Opening Your Wallet',
          visualDetail: 'Tell me what you want to buy, the price, category, and if it is a Need (Lunch) or a Want (Candy).',
          narration: 'Before spending out there, open the Can I Spend Quiz! I check your Budget right away and tell you if it fits or if something is missing!'
        },
        {
          badge: 'Step 3 • Ask About Any Field',
          visualTitle: '💬 Ask "What is this field for?"',
          visualDetail: 'I know the entire User Manual and explain every button and indicator in the system!',
          narration: 'And if you have a question about any field on the screen, just type it in the question box below and I will explain it step by step!'
        }
      ]
    }
  },
  es: {
    orcamento: {
      title: 'Presupuesto Mensual (Ponle Nombre a tu Dinero)',
      shortLabel: '🏷️ Presupuesto',
      scenes: [
        {
          badge: 'Paso 1 • Renta del Mes',
          visualTitle: '💰 Renta Prevista vs. Renta Real',
          visualDetail: 'Indica cuánto esperas ganar (Renta Prevista) y cuánto entró realmente en tu cuenta (Renta Real).',
          narration: '¡Hola! Para que el Quiz y tu control funcionen, empieza en el menú Presupuesto completando tu Renta Prevista y tu Renta Real del mes.'
        },
        {
          badge: 'Paso 2 • Reserva de Emergencia',
          visualTitle: '🛡️ Págate a ti Primero (10%)',
          visualDetail: 'Separa del 10% al 20% de tus ingresos para tu alcancía de seguridad antes de gastar.',
          narration: 'Después, define el porcentaje de tu Reserva de Emergencia. ¡Ahorrar primero garantiza que tu futuro esté siempre protegido!'
        },
        {
          badge: 'Paso 3 • Metas por Categoría',
          visualTitle: '🎯 Límite por Categoría (% o Monto)',
          visualDetail: 'Define cuánto puede gastar cada categoría (Vivienda, Ocio, Gastos Fijos) en el mes.',
          narration: '¡Ahora ponle nombre a tu dinero! Coloca una meta en porcentaje o en dinero para cada categoría, como Gastos Fijos y Ocio.'
        },
        {
          badge: 'Paso 4 • Semáforo Inteligente',
          visualTitle: '🚦 Verde (<80%) • Amarillo (80-100%) • Rojo (>100%)',
          visualDetail: '¡Haz clic en Guardar Presupuesto y mira cómo cambian de color las barras según tus gastos!',
          narration: '¡Haz clic en Guardar Presupuesto! Listo: ahora las barras muestran en verde, amarillo o rojo si aún quedan monedas en tu bote.'
        }
      ]
    }
  }
};

/**
 * Retorna o objeto de vídeo traduzido para o idioma ativo do cliente.
 */
export function getLocalizedVideo(videoObj, lang = 'pt-BR', tFunc = (x) => x) {
  if (!videoObj || lang === 'pt-BR') return videoObj;

  const langPack = VIDEO_TRANSLATIONS[lang]?.[videoObj.id];
  const localizedMockFields = Array.isArray(videoObj.mockFields)
    ? videoObj.mockFields.map((f) => ({
        ...f,
        label: translateFinParagraph(f.label, lang, tFunc),
        placeholder: translateFinParagraph(f.placeholder, lang, tFunc)
      }))
    : [];

  if (langPack) {
    return {
      ...videoObj,
      title: langPack.title || videoObj.title,
      shortLabel: langPack.shortLabel || videoObj.shortLabel,
      screenHeader: translateFinParagraph(videoObj.screenHeader || videoObj.title, lang, tFunc),
      mockFields: localizedMockFields,
      scenes: videoObj.scenes.map((sc, idx) => ({
        ...sc,
        ...(langPack.scenes?.[idx] || {}),
        typedValue: translateFinParagraph(sc.typedValue || '', lang, tFunc),
        secondaryTypedValue: translateFinParagraph(sc.secondaryTypedValue || '', lang, tFunc)
      }))
    };
  }

  // Fallback para outros idiomas usando o tradutor global tFunc + adaptações de frases do FIN
  return {
    ...videoObj,
    title: translateFinParagraph(videoObj.title, lang, tFunc),
    shortLabel: translateFinParagraph(videoObj.shortLabel, lang, tFunc),
    screenHeader: translateFinParagraph(videoObj.screenHeader || videoObj.title, lang, tFunc),
    mockFields: localizedMockFields,
    scenes: videoObj.scenes.map((sc) => ({
      ...sc,
      badge: translateFinParagraph(sc.badge, lang, tFunc),
      visualTitle: translateFinParagraph(sc.visualTitle, lang, tFunc),
      visualDetail: translateFinParagraph(sc.visualDetail, lang, tFunc),
      narration: translateFinParagraph(sc.narration, lang, tFunc),
      typedValue: translateFinParagraph(sc.typedValue || '', lang, tFunc),
      secondaryTypedValue: translateFinParagraph(sc.secondaryTypedValue || '', lang, tFunc)
    }))
  };
}

/**
 * Dicionário de termos e expressões frequentes nas explicações do FIN, Manual e Quiz
 */
const FIN_MULTILINGUAL_REPLACEMENTS = {
  en: [
    ['Falta preencher o seu Orçamento Mensal deste mês (menu Orçamento).', 'Your Monthly Budget for this month is not filled out yet (Budget menu).'],
    ['Falta preencher a sua Renda Mensal (Renda Prevista/Real no Orçamento ou cadastrar suas Receitas do mês).', 'Your Monthly Income is missing (fill in Expected/Real Income in Budget or add your monthly Incomes).'],
    ['Falta preencher o seu Orçamento Mensal!', 'Your Monthly Budget needs to be filled out!'],
    ['Falta preencher Dados no Orçamento!', 'Missing Data in Your Budget!'],
    ['⚠️ Ops! Falta Preencher Dados no Orçamento!', '⚠️ Oops! Missing Data in Your Budget!'],
    ['O que falta preencher para o cálculo completo:', 'What needs to be filled out for the full calculation:'],
    ['Falta definir a Meta de gastos (em % ou R$) para o pote', 'Missing spending Goal (in % or amount) for category'],
    ['lá na tela de Orçamento.', 'on the Budget screen.'],
    ['O que você quer comprar:', 'What you want to buy:'],
    ['Quanto você já gastou em', 'How much you already spent in'],
    ['neste mês:', 'this month:'],
    ['este mês:', 'this month:'],
    ['Sua Renda Base do mês:', 'Your Base Monthly Income:'],
    ['Não informada', 'Not informed'],
    ['Saldo geral após a compra:', 'Overall balance after purchase:'],
    ['Suor de trabalho: Isso vale', 'Work effort: This costs'],
    ['horas inteirinhas do seu esforço lá fora!', 'full hours of your hard work!'],
    ['Limite planejado para', 'Planned limit for'],
    ['Já utilizado:', 'Already used:'],
    ['Ainda livre:', 'Still available:'],
    ['Disponível hoje:', 'Available today:'],
    ['Se comprar agora: Ainda sobram', 'If you buy now: You still have'],
    ['livres', 'left'],
    ['usado', 'used'],
    ['Na ponta do lápis: Custa', 'Bottom line: Costs'],
    ['horas do seu suor.', 'hours of your work.'],
    ['Toca Aqui ✋! Cabe no Nosso Pote!', 'High Five ✋! It Fits in Your Budget!'],
    ['Toca Aqui ✋! Cabe na Nossa Caixinha!', 'High Five ✋! It Fits in Your Budget!'],
    ['Atenção! Vai Raspar o Fundo do Pote!', 'Careful! Almost Reaching the Budget Limit!'],
    ['PARA TUDO! Larga a Carteira Agora!', 'HOLD ON! Over the Budget Limit!'],
    ['Contando as Balinhas do seu Pote:', 'Checking Your Budget Numbers:'],
    ['Testar Outra Compra', 'Test Another Purchase'],
    ['Preencher Orçamento', 'Fill Out Budget'],
    ['Ir ao Orçamento', 'Go to Budget'],
    ['Voltar para a Dica da Tela', 'Back to Screen Tip'],
    ['Voltar à Dica da Tela', 'Back to Screen Tip'],
    ['Onde ou com o quê você quer gastar', 'Where or what do you want to spend on'],
    ['Quantas moedas custa?', 'How much does it cost?'],
    ['Qual Pote de Balas?', 'Which Budget Category?'],
    ['Promessa de dedinho (sem mentir pro FIN!): Isso é...', 'Pinky promise (be honest with FIN!): Is this...'],
    ['Almoço (Preciso!)', 'Need (Essential!)'],
    ['É necessidade real', 'It is a real need'],
    ['Balinha (Vontade!)', 'Want (Desire!)'],
    ['É um desejo meu', 'It is a personal wish'],
    ['Ver se Sobra Balinha no Pote!', 'Check if it Fits My Budget!'],
    ['Quiz: Posso Gastar?', 'Quiz: Can I Spend?'],
    ['O FIN calcula o impacto no seu pote na hora!', 'FIN calculates the impact on your budget right away!'],
    ['FIN • Seu Conselheiro Financeiro', 'FIN • Your Financial Advisor'],
    ['Vídeos do Manual', 'Manual Videos'],
    ['Ver Vídeo Explicativo', 'Watch Explanatory Video'],
    ['Dar nome ao dinheiro', 'Give money a name'],
    ['Necessidade vs Desejo', 'Need vs Want'],
    ['Bola de neve', 'Snowball effect'],
    ['Você perguntou:', 'You asked:'],
    ['Pergunte algo ao FIN (ex: Para que serve Renda Real?)...', 'Ask FIN anything (e.g. What is Real Income for?)...'],
    ['Passo', 'Step'],
    ['Cena', 'Scene'],
    ['Manual Oficial', 'Official Manual'],
    ['FALANDO', 'SPEAKING'],
    ['Voz IA', 'AI Voice'],
    ['Sem Som', 'Muted'],
    ['Abrir Tela de', 'Open Screen:'],
    ['Gerar MP4 (Gemini Omni)', 'Generate MP4 (Gemini Omni)'],
    ['Recriar MP4 (Gemini IA)', 'Regenerate MP4 (Gemini AI)'],
    ['Para que serve:', 'What it is for:'],
    ['Como usar:', 'How to use:'],
    ['Onde fica:', 'Where to find it:'],
    ['Como funciona:', 'How it works:'],
    ['Dica do FIN:', 'FIN Tip:']
  ],
  es: [
    ['Falta preencher o seu Orçamento Mensal deste mês (menu Orçamento).', 'Falta completar tu Presupuesto Mensual de este mes (menú Presupuesto).'],
    ['Falta preencher a sua Renda Mensal (Renda Prevista/Real no Orçamento ou cadastrar suas Receitas do mês).', 'Falta completar tu Renta Mensual (Renta Prevista/Real en Presupuesto o registrar tus Ingresos del mes).'],
    ['Falta preencher o seu Orçamento Mensal!', '¡Falta completar tu Presupuesto Mensual!'],
    ['⚠️ Ops! Falta Preencher Dados no Orçamento!', '⚠️ ¡Ups! ¡Faltan Datos en el Presupuesto!'],
    ['O que falta preencher para o cálculo completo:', 'Qué falta completar para el cálculo completo:'],
    ['Falta definir a Meta de gastos (em % ou R$) para o pote', 'Falta definir la Meta de gastos (en % o monto) para la categoría'],
    ['lá na tela de Orçamento.', 'en la pantalla de Presupuesto.'],
    ['O que você quer comprar:', 'Lo que quieres comprar:'],
    ['Quanto você já gastou em', 'Cuánto ya gastaste en'],
    ['neste mês:', 'en este mes:'],
    ['Sua Renda Base do mês:', 'Tu Renta Base del mes:'],
    ['Não informada', 'No informada'],
    ['Contando as Balinhas do seu Pote:', 'Contando las Monedas de tu Bote:'],
    ['Testar Outra Compra', 'Probar Otra Compra'],
    ['Preencher Orçamento', 'Completar Presupuesto'],
    ['Ir ao Orçamento', 'Ir al Presupuesto'],
    ['Onde ou com o quê você quer gastar', 'Dónde o en qué quieres gastar'],
    ['Quantas moedas custa?', '¿Cuántas monedas cuesta?'],
    ['Qual Pote de Balas?', '¿Qué Categoría del Presupuesto?'],
    ['Almoço (Preciso!)', 'Almuerzo (¡Lo necesito!)'],
    ['É necessidade real', 'Es una necesidad real'],
    ['Balinha (Vontade!)', 'Dulce (¡Capricho!)'],
    ['É um desejo meu', 'Es un deseo mío'],
    ['Ver se Sobra Balinha no Pote!', '¡Ver si Cabe en mi Presupuesto!'],
    ['Quiz: Posso Gastar?', 'Quiz: ¿Puedo Gastar?'],
    ['O FIN calcula o impacto no seu pote na hora!', '¡FIN calcula el impacto en tu presupuesto al instante!'],
    ['FIN • Seu Conselheiro Financeiro', 'FIN • Tu Consejero Financiero'],
    ['Vídeos do Manual', 'Videos del Manual'],
    ['Ver Vídeo Explicativo', 'Ver Video Explicativo'],
    ['Dar nome ao dinheiro', 'Dar nombre al dinero'],
    ['Necessidade vs Desejo', 'Necesidad vs Deseo'],
    ['Bola de neve', 'Bola de nieve'],
    ['Você perguntou:', 'Preguntaste:'],
    ['Pergunte algo ao FIN (ex: Para que serve Renda Real?)...', 'Pregúntale algo a FIN (ej: ¿Para qué sirve Renta Real?)...'],
    ['Para que serve:', 'Para qué sirve:'],
    ['Como usar:', 'Cómo usar:'],
    ['Onde fica:', 'Dónde está:'],
    ['Como funciona:', 'Cómo funciona:'],
    ['Dica do FIN:', 'Consejo de FIN:']
  ]
};

/**
 * Traduz textos compostos ou parágrafos do FIN combinando o dicionário multilíngue do FIN
 * e o tradutor global tFunc do LanguageContext.
 */
export function translateFinParagraph(text, targetLang = 'pt-BR', tFunc = (x) => x) {
  if (!text || targetLang === 'pt-BR') return text;

  let output = String(text);

  // Aplicar pares de substituição específicos do FIN para o idioma alvo (ou inglês como ponte para idiomas europeus/asiáticos se necessário)
  const pairs = FIN_MULTILINGUAL_REPLACEMENTS[targetLang] || [];
  for (const [ptStr, targetStr] of pairs) {
    if (output.includes(ptStr)) {
      output = output.split(ptStr).join(targetStr);
    }
  }

  // Passar também pelo tradutor de frases/palavras do LanguageContext
  if (typeof tFunc === 'function') {
    output = tFunc(output);
  }

  return output;
}
