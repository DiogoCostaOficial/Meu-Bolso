import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lgpdService } from '../../services/api';

const ROTULOS = {
  assistente_ia: 'Personalização com o assistente de IA (FIN)',
  comunicacao_whatsapp: 'Comunicações por WhatsApp'
};

export default function PrivacidadeMeusDados() {
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');

  const carregar = () => lgpdService.status().then((r) => r && r.success && setStatus(r));
  useEffect(() => {
    carregar();
  }, []);

  const alternar = async (finalidade, concedido) => {
    const r = await lgpdService.definirConsentimento(finalidade, concedido);
    setMsg(r && r.success ? r.message : 'Não foi possível atualizar o consentimento.');
    carregar();
  };

  const baixar = async () => {
    const ok = await lgpdService.baixarMeusDados();
    setMsg(ok ? 'Arquivo gerado. Verifique seus downloads.' : 'Não foi possível exportar seus dados.');
  };

  return (
    <section aria-labelledby="privacidade-titulo" className="bg-custom-card rounded-2xl p-6 shadow-custom text-custom-main space-y-4">
      <h3 id="privacidade-titulo" className="text-base font-bold">Privacidade e meus dados (LGPD)</h3>
      <p className="text-sm opacity-70">
        Você controla seus dados: pode baixar uma cópia, gerenciar consentimentos e excluir a conta (abaixo).{' '}
        <Link to="/privacidade" className="text-custom-gold hover:underline">Política de Privacidade</Link> ·{' '}
        <Link to="/termos" className="text-custom-gold hover:underline">Termos de Uso</Link>
      </p>

      {status && status.opcionais.map((o) => (
        <label key={o.finalidade} className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" className="h-4 w-4 accent-yellow-500" checked={o.concedido} onChange={(e) => alternar(o.finalidade, e.target.checked)} />
          {ROTULOS[o.finalidade] || o.finalidade}
        </label>
      ))}

      <button type="button" onClick={baixar} className="rounded-xl border border-custom-gold px-4 py-2 text-sm font-bold text-custom-gold hover:bg-custom-gold/10">
        Baixar meus dados (JSON)
      </button>
      {msg && <p role="status" className="text-xs opacity-80">{msg}</p>}
    </section>
  );
}
