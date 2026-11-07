import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { lgpdService } from '../../services/api';

// Solicita novo aceite quando a versão dos Termos/Política mudou (ou nunca foi aceita).
export default function AceiteModal() {
  const { user } = useAuth();
  const [pendente, setPendente] = useState(false);
  const [aceito, setAceito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!user) return;
    let ativo = true;
    lgpdService.status().then((r) => {
      if (!ativo || !r || !r.success) return;
      const data = r.data || r.dados || r;
      if (data.aceitouVersaoVigente === false) setPendente(true);
    }).catch(() => {});
    return () => {
      ativo = false;
    };
  }, [user]);

  if (!pendente) return null;

  const confirmar = async () => {
    setEnviando(true);
    const r = await lgpdService.aceitar();
    setEnviando(false);
    if (r && r.success) setPendente(false);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="lgpd-titulo" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-custom-card p-6 shadow-custom text-custom-main">
        <h2 id="lgpd-titulo" className="text-lg font-bold">Atualização de Termos e Privacidade</h2>
        <p className="mt-2 text-sm opacity-80">
          Para continuar usando o Meu Bolso, precisamos do seu aceite aos nossos Termos de Uso e à Política de
          Privacidade, em conformidade com a LGPD (Lei 13.709/2018).
        </p>
        <label className="mt-4 flex items-start gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} className="mt-0.5 h-4 w-4 accent-yellow-500" />
          <span>
            Li e concordo com os{' '}
            <Link to="/termos" target="_blank" className="font-bold text-custom-gold hover:underline">Termos de Uso</Link> e a{' '}
            <Link to="/privacidade" target="_blank" className="font-bold text-custom-gold hover:underline">Política de Privacidade</Link>.
          </span>
        </label>
        <button
          type="button"
          disabled={!aceito || enviando}
          onClick={confirmar}
          className="mt-5 w-full rounded-xl bg-custom-gold px-4 py-2 font-bold text-black disabled:opacity-40"
        >
          {enviando ? 'Salvando...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}
