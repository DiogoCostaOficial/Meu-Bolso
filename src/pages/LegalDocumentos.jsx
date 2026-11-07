import React from 'react';
import { Link } from 'react-router-dom';

const VERSAO = '2026-10-29';
const CONTATO_DPO = '[E-MAIL DO ENCARREGADO — a definir pelo controlador]';

const Pagina = ({ titulo, children }) => (
  <main className="min-h-screen bg-custom-bg px-4 py-10 text-custom-main">
    <article className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed">
      <Link to="/" className="text-custom-gold hover:underline">← Voltar</Link>
      <h1 className="text-2xl font-bold">{titulo}</h1>
      <p className="opacity-60">Versão {VERSAO}. Texto-base técnico, sujeito a revisão jurídica antes da publicação definitiva.</p>
      {children}
    </article>
  </main>
);

const H = ({ children }) => <h2 className="pt-3 text-lg font-bold">{children}</h2>;

export function Termos() {
  return (
    <Pagina titulo="Termos de Uso — Meu Bolso">
      <H>1. O serviço</H>
      <p>O Meu Bolso é uma ferramenta de organização financeira pessoal (receitas, despesas, cartões, orçamento, viagens e relatórios), com assistente virtual educativo (FIN). Ele não constitui consultoria financeira, de investimentos, contábil ou jurídica.</p>
      <H>2. Conta e responsabilidade</H>
      <p>Você deve informar dados verdadeiros, manter sua senha em sigilo e é responsável pelas atividades da sua conta. O uso é destinado a maiores de 18 anos; menores devem usar o serviço com acompanhamento e consentimento de um responsável legal.</p>
      <H>3. Uso adequado</H>
      <p>É proibido tentar acessar dados de terceiros, burlar mecanismos de segurança, sobrecarregar o serviço ou usá-lo para fins ilícitos.</p>
      <H>4. Seus dados</H>
      <p>O tratamento de dados pessoais segue a <Link to="/privacidade" className="text-custom-gold hover:underline">Política de Privacidade</Link>. Você pode exportar ou excluir seus dados a qualquer momento em Configurações.</p>
      <H>5. Disponibilidade e alterações</H>
      <p>O serviço é oferecido no estado em que se encontra, podendo sofrer interrupções. Alterações relevantes nestes Termos exigirão novo aceite.</p>
      <H>6. Contato</H>
      <p>Dúvidas: {CONTATO_DPO}.</p>
    </Pagina>
  );
}

export function Privacidade() {
  return (
    <Pagina titulo="Política de Privacidade — Meu Bolso">
      <p>Esta política explica, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), como tratamos seus dados pessoais.</p>
      <H>1. Controlador e encarregado (DPO)</H>
      <p>Controlador: responsável pelo Meu Bolso. Encarregado pelo tratamento de dados: {CONTATO_DPO}.</p>
      <H>2. Dados que tratamos e finalidades</H>
      <ul className="list-disc space-y-1 pl-5">
        <li><b>Cadastro</b> (nome, e-mail, senha criptografada, país): criar e autenticar sua conta. Base legal: execução de contrato (art. 7º, V).</li>
        <li><b>Telefone/WhatsApp</b> (opcional): contato e comunicações, mediante seu consentimento (art. 7º, I).</li>
        <li><b>Dados financeiros</b> que você lança (receitas, despesas, cartões, categorias, orçamentos, viagens): prestar o serviço. Base legal: execução de contrato.</li>
        <li><b>Registros de acesso e de segurança</b> (IP, data/hora, ações administrativas): segurança e prevenção a fraudes (art. 7º, IX) e obrigação legal (Marco Civil da Internet).</li>
        <li><b>Assistente de IA</b> (opcional): personalização com seu consentimento, que pode ser revogado a qualquer momento.</li>
      </ul>
      <H>3. Compartilhamento e operadores</H>
      <p>Utilizamos provedores de infraestrutura e serviços: hospedagem (Vercel), banco de dados (Supabase/PostgreSQL), autenticação (Google, quando você escolhe entrar com Google), envio de e-mail e, quando aplicável, IA generativa (Google Gemini). Alguns provedores podem processar dados fora do Brasil (transferência internacional, art. 33), com garantias contratuais adequadas. Não vendemos seus dados.</p>
      <H>4. Seus direitos (art. 18)</H>
      <p>Você pode: confirmar a existência de tratamento, acessar, corrigir, portar (exportar), anonimizar ou eliminar dados, revogar consentimentos e solicitar revisão de decisões automatizadas. Em <b>Configurações → Privacidade e meus dados</b> você baixa uma cópia dos seus dados, gerencia consentimentos e exclui a conta. Outras solicitações: {CONTATO_DPO}.</p>
      <H>5. Retenção e exclusão</H>
      <p>Mantemos seus dados enquanto sua conta existir. Ao excluir a conta, apagamos seus dados pessoais e financeiros. Mantemos apenas registros mínimos e pseudonimizados (comprovação de consentimento e trilha de segurança) pelo prazo legal necessário.</p>
      <H>6. Segurança</H>
      <p>Senhas são armazenadas com hash, as comunicações usam HTTPS, o acesso administrativo exige autenticação e é registrado em trilha de auditoria, e há limites contra tentativas de força bruta.</p>
      <H>7. Incidentes</H>
      <p>Em caso de incidente de segurança que possa causar risco relevante, comunicaremos você e a ANPD nos termos do art. 48.</p>
      <H>8. Alterações</H>
      <p>Mudanças nesta política serão comunicadas e poderão exigir novo aceite.</p>
    </Pagina>
  );
}
