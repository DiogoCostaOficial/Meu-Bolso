import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Não desenhar cabeçalho/rodapé na capa

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Cabeçalho
        self.drawString(54, 750, "SISTEMA MEU BOLSO / FINANÇAS FÁCIL — DOCUMENTAÇÃO DE ARQUITETURA E ENGENHARIA")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 743, letter[0] - 54, 743)

        # Rodapé
        self.line(54, 45, letter[0] - 54, 45)
        self.drawString(54, 32, "Base Acadêmica: Engenharia de Software I (Igor F. Menezes, EAD Laureate) | Metodologias Ágeis")
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(letter[0] - 54, 32, page_str)
        self.restoreState()

def build_pdf(filename):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Cores do Sistema
    gold = colors.HexColor("#B48A1B")
    dark_gold = colors.HexColor("#8C6B0F")
    dark_gray = colors.HexColor("#1E293B")
    slate_gray = colors.HexColor("#475569")
    light_bg = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#E2E8F0")

    # Estilos Customizados
    styles.add(ParagraphStyle(
        name="CoverPreTitle",
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=gold,
        alignment=1, # Centralizado
        spaceAfter=15
    ))

    styles.add(ParagraphStyle(
        name="CoverTitle",
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=dark_gray,
        alignment=1,
        spaceAfter=12
    ))

    styles.add(ParagraphStyle(
        name="CoverSubtitle",
        fontName="Helvetica",
        fontSize=13,
        leading=17,
        textColor=slate_gray,
        alignment=1,
        spaceAfter=30
    ))

    styles.add(ParagraphStyle(
        name="CoverMeta",
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=slate_gray,
        alignment=1
    ))

    styles.add(ParagraphStyle(
        name="SecTitle",
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=18,
        textColor=dark_gray,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name="SubSecTitle",
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=gold,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name="BodyTextCustom",
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=dark_gray,
        spaceAfter=6
    ))

    styles.add(ParagraphStyle(
        name="CalloutText",
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0F172A")
    ))

    styles.add(ParagraphStyle(
        name="TableHeader",
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=1
    ))

    styles.add(ParagraphStyle(
        name="TableCell",
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=dark_gray
    ))

    styles.add(ParagraphStyle(
        name="TableCellBold",
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=dark_gray
    ))

    story = []

    # ==========================
    # CAPA
    # ==========================
    story.append(Spacer(1, 40))
    story.append(Paragraph("ENGENHARIA DE SOFTWARE I &bull; PROJETO DE SISTEMAS", styles["CoverPreTitle"]))
    story.append(Paragraph("DOCUMENTO DE ARQUITETURA E ESPECIFICAÇÃO DE REQUISITOS", styles["CoverTitle"]))
    story.append(Paragraph("Sistema de Gestão Financeira Pessoal e Familiar &bull; <i>Meu Bolso</i>", styles["CoverSubtitle"]))
    
    story.append(HRFlowable(width="80%", thickness=2, color=gold, spaceBefore=10, spaceAfter=25))

    # Box com Alinhamento Curricular
    box_content = [
        [Paragraph("<b>Alinhamento Acadêmico:</b> Capítulo 1 — <i>Como produzir um software de qualidade elevada?</i><br/>"
                   "<b>Autor Base Teórica:</b> Prof. Igor Fernandes Menezes (EAD Laureate)<br/>"
                   "<b>Principais Referências:</b> Pressman (2016), Sommerville (2011), Larman (2007), Magela (2006), Teles (2004)<br/>"
                   "<b>Metodologia Adotada:</b> Métodos Ágeis (Scrum + XP) com Prototipagem Evolutiva<br/>"
                   "<b>Arquitetura de Software:</b> Camadas Desacopladas (SPA React + API RESTful Node/Express + PostgreSQL)", styles["CalloutText"])]
    ]
    t_box = Table(box_content, colWidths=[500])
    t_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF9C3")), # Amarelo suave
        ('BORDER', (0,0), (-1,-1), 1, gold),
        ('PADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_box)

    story.append(Spacer(1, 100))
    meta_info = "<b>Projeto:</b> Meu Bolso (Finanças Fácil) &bull; Versão 2.0<br/>" \
                "<b>Data do Documento:</b> Outubro de 2026<br/>" \
                "<b>Status:</b> Homologação Local / Documentação de Engenharia"
    story.append(Paragraph(meta_info, styles["CoverMeta"]))
    story.append(PageBreak())

    # ==========================================
    # 1. INTRODUÇÃO E CONTEXTO ACADÊMICO
    # ==========================================
    story.append(Paragraph("1. Introdução e Contexto Acadêmico", styles["SecTitle"]))
    story.append(Paragraph(
        "A produção de um software de elevada qualidade exige a aplicação sistemática de práticas consolidadas da "
        "Engenharia de Software, superando abordagens amadoras conhecidas na literatura acadêmica como <b>'codifica-remenda'</b> "
        "(Menezes, p. 8; Boente, Moré e Cosenza, 2009). Conforme ensina Shari Pfleeger (2004, p. 2), 'como engenheiros de software, "
        "utilizamos nosso conhecimento sobre computadores e computação para ajudar a resolver problemas práticos'.",
        styles["BodyTextCustom"]
    ))
    story.append(Paragraph(
        "O presente documento formaliza a arquitetura, o modelo de ciclo de vida e a especificação de requisitos do sistema "
        "<b>Meu Bolso</b>, fundamentando cada decisão técnica nas teorias de Engenharia de Software ministradas no capítulo "
        "analisado, conectando-as à realidade prática de uma fábrica de software ágil moderna.",
        styles["BodyTextCustom"]
    ))

    story.append(Paragraph("1.1 O Perigo do Modelo 'Codifica-Remenda' e a Pirâmide de Erro", styles["SubSecTitle"]))
    story.append(Paragraph(
        "O texto acadêmico alerta com rigor sobre o perigo de iniciar a codificação sem planejamento estruturado. De acordo com "
        "Magela (2006, p. 13) através da <b>Pirâmide de Propagação de Erro</b>, um requisito omitido ou mal compreendido acarreta um custo exponencialmente "
        "maior à medida que o projeto avança:",
        styles["BodyTextCustom"]
    ))

    piramide_data = [
        [Paragraph("<b>Fase do Ciclo de Vida</b>", styles["TableHeader"]), Paragraph("<b>Fator de Custo Relativo de Correção (Magela, 2006)</b>", styles["TableHeader"]), Paragraph("<b>Impacto no Projeto Meu Bolso</b>", styles["TableHeader"])],
        [Paragraph("Requisitos / Concepção", styles["TableCellBold"]), Paragraph("1 &ndash; 2x", styles["TableCell"]), Paragraph("Definição clara das regras financeiras e entidades.", styles["TableCell"])],
        [Paragraph("Análise", styles["TableCellBold"]), Paragraph("5x", styles["TableCell"]), Paragraph("Modelagem conceitual de fluxo de caixa e orçamentos.", styles["TableCell"])],
        [Paragraph("Projeto / Arquitetura", styles["TableCellBold"]), Paragraph("10x", styles["TableCell"]), Paragraph("Definição do desacoplamento REST e contratos de API.", styles["TableCell"])],
        [Paragraph("Implementação", styles["TableCellBold"]), Paragraph("20x", styles["TableCell"]), Paragraph("Codificação com TDD para evitar retrabalho de regras.", styles["TableCell"])],
        [Paragraph("Testes", styles["TableCellBold"]), Paragraph("50x", styles["TableCell"]), Paragraph("Testes automatizados e homologação em ambiente local.", styles["TableCell"])],
        [Paragraph("Manutenção (Produção)", styles["TableCellBold"]), Paragraph("<b>200x</b> (Crítico)", styles["TableCell"]), Paragraph("Evitado mediante entregas contínuas e validações prévias.", styles["TableCell"])],
    ]
    t_piramide = Table(piramide_data, colWidths=[130, 150, 220])
    t_piramide.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), dark_gray),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_piramide)
    story.append(Spacer(1, 10))

    # ==========================================
    # 2. ANÁLISE DOS MODELOS DE CICLO DE VIDA
    # ==========================================
    story.append(Paragraph("2. Comparativo dos Modelos de Ciclo de Vida (Menezes, 2018)", styles["SecTitle"]))
    story.append(Paragraph(
        "O capítulo acadêmico revisa os principais modelos de processo de software tradicionais e evolutivos. A tabela abaixo sintetiza "
        "as características analisadas pelo autor:",
        styles["BodyTextCustom"]
    ))

    modelos_data = [
        [Paragraph("<b>Modelo</b>", styles["TableHeader"]), Paragraph("<b>Origem / Autor</b>", styles["TableHeader"]), Paragraph("<b>Vantagens</b>", styles["TableHeader"]), Paragraph("<b>Limitações / Riscos</b>", styles["TableHeader"])],
        [Paragraph("<b>Cascata Puro</b>", styles["TableCell"]), Paragraph("Royce (1970)", styles["TableCell"]), Paragraph("Fases e marcos bem definidos; controle rígido.", styles["TableCell"]), Paragraph("Baixa visibilidade para o cliente; não permite retorno; alto risco de insatisfação.", styles["TableCell"])],
        [Paragraph("<b>Cascata c/ Retorno</b>", styles["TableCell"]), Paragraph("Rodrigues (2005)", styles["TableCell"]), Paragraph("Permite recuar uma fase anterior para correções.", styles["TableCell"]), Paragraph("Risco de retrabalho elevado; difícil mensuração de esforço.", styles["TableCell"])],
        [Paragraph("<b>Espiral</b>", styles["TableCell"]), Paragraph("Boehm / Sommerville (2011)", styles["TableCell"]), Paragraph("Excelente gestão de riscos; iterações contínuas.", styles["TableCell"]), Paragraph("Alta complexidade de gerenciamento; exige especialistas em risco.", styles["TableCell"])],
        [Paragraph("<b>Prototipagem Evolutiva</b>", styles["TableCell"]), Paragraph("Rodrigues (2005)", styles["TableCell"]), Paragraph("Visibilidade imediata das telas; cliente valida requisitos reais.", styles["TableCell"]), Paragraph("Pode gerar ilusão de que o sistema está pronto apenas pelas telas.", styles["TableCell"])],
        [Paragraph("<b>Entrega Evolutiva</b>", styles["TableCell"]), Paragraph("Rodrigues (2005)", styles["TableCell"]), Paragraph("Separa desenho arquitetônico das iterações funcionais.", styles["TableCell"]), Paragraph("Exige arquiteto sênior no início e boa divisão de escopo.", styles["TableCell"])],
        [Paragraph("<b>RUP (Rational)</b>", styles["TableCell"]), Paragraph("IBM / Rational (1998)", styles["TableCell"]), Paragraph("Processo completo com 4 fases e 9 disciplinas.", styles["TableCell"]), Paragraph("Pesado para equipes enxutas; alto custo de artefatos.", styles["TableCell"])]
    ]
    t_modelos = Table(modelos_data, colWidths=[90, 85, 160, 165])
    t_modelos.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), gold),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_modelos)
    story.append(Spacer(1, 10))

    # ==========================================
    # 3. METODOLOGIA ÁGIL ADOTADA
    # ==========================================
    story.append(Paragraph("3. Metodologia Ágil Selecionada: Justificativa", styles["SecTitle"]))
    story.append(Paragraph(
        "Conforme indicado na síntese do material acadêmico (p. 22-23), para projetos contemporâneos em ambientes dinâmicos "
        "com requisitos evolutivos, a abordagem mais eficaz é a combinação de <b>Métodos Ágeis</b> com <b>Prototipagem Evolutiva</b>. "
        "O sistema <i>Meu Bolso</i> adota um modelo híbrido estruturado:",
        styles["BodyTextCustom"]
    ))

    story.append(Paragraph(
        "<b>1. Gestão por Scrum (Sommerville, 2011):</b><br/>"
        "&bull; <i>Sprints curtas (2 semanas):</i> Entregas de incrementos funcionais (software operável a cada ciclo).<br/>"
        "&bull; <i>Product Backlog priorizado por MoSCoW (Oliveira, 2014):</i> 'Tem que fazer' (Must), 'Deve fazer' (Should), "
        "'Poderia fazer' (Could) e 'Interessante fazer' (Won't).<br/>"
        "&bull; <i>Reuniões diárias (Daily Scrum):</i> 10 a 15 minutos em pé para identificação rápida de impedimentos.",
        styles["BodyTextCustom"]
    ))

    story.append(Paragraph(
        "<b>2. Engenharia Técnica por Extreme Programming - XP (Teles, 2004):</b><br/>"
        "&bull; <i>Desenvolvimento Orientado a Testes (TDD):</i> Criação do teste antes do código, garantindo qualidade intrínseca.<br/>"
        "&bull; <i>Refatoração Contínua:</i> Limpeza sistemática do código sem alteração do comportamento externo.<br/>"
        "&bull; <i>Pequenas Versões e Integração Contínua:</i> Deploy em ambiente de homologação local antes de produção.<br/>"
        "&bull; <i>Posse Coletiva e Padrões de Código:</i> Convenções limpas mantidas por toda a equipe.<br/>"
        "&bull; <i>Ritmo Sustentável:</i> Produtividade contínua evitando débitos técnicos.",
        styles["BodyTextCustom"]
    ))
    story.append(PageBreak())

    # ==========================================
    # 4. ARQUITETURA RECOMENDADA PARA MÉTODOS ÁGEIS
    # ==========================================
    story.append(Paragraph("4. Arquitetura de Software Ideal para Métodos Ágeis", styles["SecTitle"]))
    story.append(Paragraph(
        "Para suportar iterações ágeis frequentes sem gerar quebras estruturais, a Engenharia de Software preconiza uma "
        "<b>Arquitetura em Camadas Desacoplada (Decoupled Layered Architecture)</b>, operando sob o paradigma <b>Client-Server RESTful</b>. "
        "Essa arquitetura maximiza a independência dos times e atende aos princípios de flexibilidade e manutenção.",
        styles["BodyTextCustom"]
    ))

    story.append(Paragraph("4.1 Visão Estrutural das Camadas do Sistema", styles["SubSecTitle"]))

    arq_data = [
        [Paragraph("<b>Camada</b>", styles["TableHeader"]), Paragraph("<b>Tecnologias</b>", styles["TableHeader"]), Paragraph("<b>Papel no Contexto Ágil & Engenharia</b>", styles["TableHeader"])],
        [
            Paragraph("<b>1. Apresentação (Frontend SPA)</b>", styles["TableCellBold"]),
            Paragraph("React 18 &bull; Vite 7 &bull; Tailwind CSS &bull; Lucide &bull; Recharts", styles["TableCell"]),
            Paragraph("Materializa a <i>Prototipagem Evolutiva</i> (Rodrigues, 2005). As telas são protótipos funcionais que evoluem diretamente para código final. Comunica-se de forma assíncrona via JSON com a API.", styles["TableCell"])
        ],
        [
            Paragraph("<b>2. Fachada de API (Controllers / Gateway)</b>", styles["TableCellBold"]),
            Paragraph("Node.js &bull; Express REST API &bull; Middlewares (JWT, CORS)", styles["TableCell"]),
            Paragraph("Expõe contratos estáveis (Endpoints REST). Permite mock de dados durante o desenvolvimento ágil, acelerando testes de tela enquanto o backend implementa as regras.", styles["TableCell"])
        ],
        [
            Paragraph("<b>3. Domínio / Lógica de Negócios (Services Layer)</b>", styles["TableCellBold"]),
            Paragraph("Módulos JS isolados &bull; Regras de Cálculo Financeiro &bull; DRE &bull; Câmbio", styles["TableCell"]),
            Paragraph("Concentra as <i>Regras de Negócio (RN)</i> puras, independentes de interface gráfica ou banco. Viabiliza TDD (XP) com testes unitários de alta velocidade.", styles["TableCell"])
        ],
        [
            Paragraph("<b>4. Persistência de Dados (Data Access Layer)</b>", styles["TableCellBold"]),
            Paragraph("PostgreSQL &bull; Supabase &bull; Pool de Conexões &bull; Migrations", styles["TableCell"]),
            Paragraph("Garante integridade referencial ACID para contas, cartões e transações. Possibilita rotinas de backup, auditoria e rollback automático.", styles["TableCell"])
        ]
    ]
    t_arq = Table(arq_data, colWidths=[120, 140, 240])
    t_arq.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), dark_gray),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_arq)
    story.append(Spacer(1, 12))

    story.append(Paragraph("4.2 Por Que Esta Arquitetura é Superior em Métodos Ágeis?", styles["SubSecTitle"]))
    story.append(Paragraph(
        "<b>1. Desacoplamento Front-End / Back-End:</b> O front-end e o back-end possuem ciclos de deploy e desenvolvimento autônomos. "
        "A equipe de UX/UI pode refinar temas, mascote FIN e dashboards sem tocar nas regras de transações do banco.<br/>"
        "<b>2. Testabilidade Extrema (TDD de XP):</b> Ao isolar a camada de serviços (Service Layer), testes automatizados validam cálculos de DRE, "
        "juros e orçamentos em milissegundos sem depender de navegador aberto.<br/>"
        "<b>3. Suporte Multiplataforma:</b> A mesma API RESTful que alimenta a Web alimenta o aplicativo mobile (Android/Capacitor), "
        "eliminando duplicidade de regras de negócio.",
        styles["BodyTextCustom"]
    ))
    story.append(Spacer(1, 10))

    # ==========================================
    # 5. ENGENHARIA DE REQUISITOS (PADRÃO ACADÊMICO)
    # ==========================================
    story.append(Paragraph("5. Engenharia de Requisitos Aplicada (Menezes, p. 20-21)", styles["SecTitle"]))
    story.append(Paragraph(
        "Conforme estabelecido nas páginas 20 e 21 do material de Engenharia de Software I, um requisito de software possui "
        "uma sintaxe formal estrita para garantir conformidade e eliminar ambiguidades:<br/>"
        "&nbsp;&nbsp;&nbsp;&bull; <b>Identificação do Sistema:</b> O Sistema no qual deve ser construída a funcionalidade.<br/>"
        "&nbsp;&nbsp;&nbsp;&bull; <b>Ator:</b> Quem provoca estímulo (Pessoa, Sistema Externo, Periférico).<br/>"
        "&nbsp;&nbsp;&nbsp;&bull; <b>Funcionalidade / Ação:</b> O que deve ser executado pelo sistema.",
        styles["BodyTextCustom"]
    ))

    story.append(Paragraph("5.1 Requisitos Funcionais (RF) com Priorização MoSCoW", styles["SubSecTitle"]))

    rf_data = [
        [Paragraph("<b>ID</b>", styles["TableHeader"]), Paragraph("<b>Descrição Formal do Requisito Funcional</b>", styles["TableHeader"]), Paragraph("<b>MoSCoW</b>", styles["TableHeader"])],
        [Paragraph("<b>RF01</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> realize cadastro, autenticação (e-mail/senha ou Google) e recuperação de acesso.", styles["TableCell"]), Paragraph("Must", styles["TableCellBold"])],
        [Paragraph("<b>RF02</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> registre, edite e categorize receitas financeiras.", styles["TableCell"]), Paragraph("Must", styles["TableCellBold"])],
        [Paragraph("<b>RF03</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> registre, edite e categorize despesas financeiras com forma de pagamento.", styles["TableCell"]), Paragraph("Must", styles["TableCellBold"])],
        [Paragraph("<b>RF04</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> gerencie cartões de crédito, limites, faturas e parcelamentos.", styles["TableCell"]), Paragraph("Must", styles["TableCellBold"])],
        [Paragraph("<b>RF05</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> estabeleça orçamentos mensais e acompanhe metas de economia.", styles["TableCell"]), Paragraph("Should", styles["TableCellBold"])],
        [Paragraph("<b>RF06</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> visualize relatórios gráficos analíticos de fluxo de caixa.", styles["TableCell"]), Paragraph("Should", styles["TableCellBold"])],
        [Paragraph("<b>RF07</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> emita o demonstrativo contábil DRE (Demonstrativo do Resultado).", styles["TableCell"]), Paragraph("Should", styles["TableCellBold"])],
        [Paragraph("<b>RF08</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> planeje e controle orçamentos de viagens em múltiplas moedas.", styles["TableCell"]), Paragraph("Could", styles["TableCellBold"])],
        [Paragraph("<b>RF09</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> consulte cotações de moedas internacionais em tempo real.", styles["TableCell"]), Paragraph("Could", styles["TableCellBold"])],
        [Paragraph("<b>RF10</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> interaja com o mascote educacional FIN para auxílio e dicas.", styles["TableCell"]), Paragraph("Could", styles["TableCellBold"])],
        [Paragraph("<b>RF11</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> realize backup criptografado e restauração dos seus dados.", styles["TableCell"]), Paragraph("Should", styles["TableCellBold"])],
        [Paragraph("<b>RF12</b>", styles["TableCellBold"]), Paragraph("O <b>Sistema Meu Bolso</b> deve permitir que o <b>Usuário</b> alterne entre os temas <i>Preto com Dourado</i> e <i>Branco com Dourado</i>.", styles["TableCell"]), Paragraph("Should", styles["TableCellBold"])],
    ]
    t_rf = Table(rf_data, colWidths=[40, 400, 60])
    t_rf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), gold),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_rf)
    story.append(PageBreak())

    # ==========================================
    # 5.2 REQUISITOS NÃO FUNCIONAIS E REGRAS DE NEGÓCIO
    # ==========================================
    story.append(Paragraph("5.2 Requisitos Não Funcionais (RNF) — Qualidade de Software", styles["SubSecTitle"]))
    story.append(Paragraph(
        "Conforme Sommerville (2011, p. 73), requisitos não funcionais são restrições e propriedades de qualidade do sistema:",
        styles["BodyTextCustom"]
    ))

    rnf_data = [
        [Paragraph("<b>ID</b>", styles["TableHeader"]), Paragraph("<b>Categoria</b>", styles["TableHeader"]), Paragraph("<b>Especificação do Requisito Não Funcional</b>", styles["TableHeader"])],
        [Paragraph("<b>RNF01</b>", styles["TableCellBold"]), Paragraph("Segurança", styles["TableCell"]), Paragraph("O <b>Sistema Meu Bolso</b> deve proteger senhas com hash BCrypt (salt > 10) e utilizar tokens JWT com expiração de sessão.", styles["TableCell"])],
        [Paragraph("<b>RNF02</b>", styles["TableCellBold"]), Paragraph("Desempenho", styles["TableCell"]), Paragraph("O <b>Sistema Meu Bolso</b> deve carregar o Dashboard e responder às requisições da API em tempo inferior a 1,5s sob conexões normais.", styles["TableCell"])],
        [Paragraph("<b>RNF03</b>", styles["TableCellBold"]), Paragraph("Portabilidade", styles["TableCell"]), Paragraph("O <b>Sistema Meu Bolso</b> deve operar em navegadores modernos (Chrome, Edge, Firefox, Safari) e em dispositivos móveis via Capacitor/PWA.", styles["TableCell"])],
        [Paragraph("<b>RNF04</b>", styles["TableCellBold"]), Paragraph("Usabilidade", styles["TableCell"]), Paragraph("O <b>Sistema Meu Bolso</b> deve manter suporte a dois temas de alto contraste (Preto c/ Dourado e Branco c/ Dourado) com feedbacks de ação via Toasts.", styles["TableCell"])],
        [Paragraph("<b>RNF05</b>", styles["TableCellBold"]), Paragraph("Confiabilidade", styles["TableCell"]), Paragraph("O <b>Sistema Meu Bolso</b> deve realizar operações financeiras sob transações atômicas no banco com rollback em falhas.", styles["TableCell"])],
    ]
    t_rnf = Table(rnf_data, colWidths=[50, 90, 360])
    t_rnf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), dark_gray),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_rnf)
    story.append(Spacer(1, 10))

    story.append(Paragraph("5.3 Regras de Negócio (RN) — Domínio Financeiro", styles["SubSecTitle"]))
    story.append(Paragraph(
        "Para Larman (2007, p. 85), regras de negócio transcendem a tecnologia e pertencem às políticas do domínio da aplicação:",
        styles["BodyTextCustom"]
    ))

    rn_data = [
        [Paragraph("<b>ID</b>", styles["TableHeader"]), Paragraph("<b>Nome da Regra</b>", styles["TableHeader"]), Paragraph("<b>Descrição da Regra de Negócio</b>", styles["TableHeader"])],
        [Paragraph("<b>RN01</b>", styles["TableCellBold"]), Paragraph("Valor Positivo", styles["TableCell"]), Paragraph("Nenhum lançamento de receita ou despesa pode possuir valor monetário zerado ou negativo no ato da inserção.", styles["TableCell"])],
        [Paragraph("<b>RN02</b>", styles["TableCellBold"]), Paragraph("Vínculo Obrigatório", styles["TableCell"]), Paragraph("Toda transação deve obrigatoriamente estar vinculada a um usuário cadastrado e a uma categoria financeira válida.", styles["TableCell"])],
        [Paragraph("<b>RN03</b>", styles["TableCellBold"]), Paragraph("Consistência de DRE", styles["TableCell"]), Paragraph("O cálculo do Demonstrativo DRE deve deduzir despesas operacionais da receita operacional líquida segundo normas de contabilidade gerencial.", styles["TableCell"])],
        [Paragraph("<b>RN04</b>", styles["TableCellBold"]), Paragraph("Alerta de Limite", styles["TableCell"]), Paragraph("Ao cadastrar despesa em cartão cujo total ultrapasse o limite definido, o sistema deve alertar o usuário sobre o estouro de fatura.", styles["TableCell"])],
        [Paragraph("<b>RN05</b>", styles["TableCellBold"]), Paragraph("Segurança de Senha", styles["TableCell"]), Paragraph("Senhas devem possuir no mínimo 6 caracteres para atendimento à política de proteção básica de contas.", styles["TableCell"])],
    ]
    t_rn = Table(rn_data, colWidths=[45, 110, 345])
    t_rn.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), gold),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_rn)
    story.append(Spacer(1, 12))

    # ==========================================
    # 6. ESTRUTURA FÍSICA E DIRETÓRIOS DO SISTEMA
    # ==========================================
    story.append(Paragraph("6. Estrutura Física dos Módulos do Sistema", styles["SecTitle"]))
    story.append(Paragraph(
        "A estrutura de pastas do projeto reflete fielmente o desacoplamento de responsabilidades e as boas práticas de Clean Code:",
        styles["BodyTextCustom"]
    ))

    folders_data = [
        [Paragraph("<b>Caminho / Diretório</b>", styles["TableHeader"]), Paragraph("<b>Tipo / Camada</b>", styles["TableHeader"]), Paragraph("<b>Responsabilidade no Sistema</b>", styles["TableHeader"])],
        [Paragraph("<code>src/components/</code>", styles["TableCellBold"]), Paragraph("UI / Apresentação", styles["TableCell"]), Paragraph("Componentes reutilizáveis (LayoutNovo, Mascote FIN, Toaster, ThemeProvider).", styles["TableCell"])],
        [Paragraph("<code>src/pages/</code>", styles["TableCellBold"]), Paragraph("Visões / Telas", styles["TableCell"]), Paragraph("Telas do sistema: Dashboard, Receitas, Despesas, Cartões, Orçamento, DRE, etc.", styles["TableCell"])],
        [Paragraph("<code>src/contexts/</code>", styles["TableCellBold"]), Paragraph("Estado Global", styles["TableCell"]), Paragraph("Contextos de autenticação (AuthContext), moedas (CurrencyContext) e layout.", styles["TableCell"])],
        [Paragraph("<code>src/services/api.js</code>", styles["TableCellBold"]), Paragraph("Integração REST", styles["TableCell"]), Paragraph("Cliente Axios/Fetch para comunicação com os endpoints da API backend.", styles["TableCell"])],
        [Paragraph("<code>server/</code> ou <code>api/</code>", styles["TableCellBold"]), Paragraph("Backend / Serviços", styles["TableCell"]), Paragraph("Controladores, rotas de autenticação, serviços de banco de dados PostgreSQL.", styles["TableCell"])],
        [Paragraph("<code>android/</code>", styles["TableCellBold"]), Paragraph("Mobile Container", styles["TableCell"]), Paragraph("Configuração Capacitor para build nativo Android a partir da mesma SPA.", styles["TableCell"])],
        [Paragraph("<code>docs/</code>", styles["TableCellBold"]), Paragraph("Engenharia", styles["TableCell"]), Paragraph("Documentação arquitetural, guias de migração e especificações de software.", styles["TableCell"])],
    ]
    t_folders = Table(folders_data, colWidths=[120, 100, 280])
    t_folders.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), dark_gray),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_folders)
    story.append(Spacer(1, 12))

    # ==========================================
    # 7. CONCLUSÃO E REFERÊNCIAS
    # ==========================================
    story.append(Paragraph("7. Conclusão e Recomendações", styles["SecTitle"]))
    story.append(Paragraph(
        "A fundamentação do projeto <b>Meu Bolso</b> nos princípios de Engenharia de Software I comprova que a união de "
        "<b>processos ágeis (Scrum/XP)</b> com uma <b>arquitetura desacoplada em camadas</b> neutraliza os riscos da "
        "abordagem 'codifica-remenda', garante aderência às necessidades reais dos usuários através de protótipos evolutivos e "
        "assegura baixo custo de manutenção ao longo de todo o ciclo de vida do software.",
        styles["BodyTextCustom"]
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("8. Referências Bibliográficas (Material Acadêmico)", styles["SecTitle"]))
    story.append(Paragraph(
        "&bull; <b>BOENTE, A.; MORÉ, J.; COSENZA, H.</b> Avaliação Fuzzy da qualidade de produtos de software numa fundação pública estadual. VII SIMPEP, 2009.<br/>"
        "&bull; <b>LARMAN, C.</b> Utilizando UML e padrões: uma introdução à análise e ao projeto orientado a objetos e ao desenvolvimento iterativo. 3. ed. Porto Alegre: Bookman, 2007.<br/>"
        "&bull; <b>MAGELA, R.</b> Engenharia de Software aplicada &ndash; fundamentos. Rio de Janeiro: Alta Books, 2006.<br/>"
        "&bull; <b>MENEZES, I. F.</b> Engenharia de Software I: Como produzir um software de qualidade elevada? EAD Laureate Brasil, 2018.<br/>"
        "&bull; <b>OLIVEIRA, R. R.</b> A Técnica de Priorização MoSCoW. Management Plaza International, 2014.<br/>"
        "&bull; <b>PFLEEGER, S. L.</b> Engenharia de Software &ndash; Teoria e Prática. 2. ed. São Paulo: Pearson, 2004.<br/>"
        "&bull; <b>PRESSMAN, R.</b> Engenharia de Software: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.<br/>"
        "&bull; <b>RODRIGUES, C. Á.</b> Engenharia de Software. Apostila de Especialização, Centro Universitário UNA, 2005.<br/>"
        "&bull; <b>SOMMERVILLE, I.</b> Engenharia de Software. 9. ed. São Paulo: Pearson Addison Wesley, 2011.<br/>"
        "&bull; <b>TELES, V. M.</b> Extreme Programming: aprenda como encantar seus usuários desenvolvendo software com agilidade e alta qualidade. São Paulo: Novatec, 2004.",
        styles["BodyTextCustom"]
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF gerado com sucesso em: {filename}")

if __name__ == "__main__":
    out = os.path.abspath("docs/DOCUMENTACAO_ARQUITETURA_SISTEMA.pdf")
    build_pdf(out)
