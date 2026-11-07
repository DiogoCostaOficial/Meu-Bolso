// src/components/NiveisConfigSection.jsx
import React, { useState, useEffect } from 'react';
import { useLevel } from '../contexts/LevelContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Compass,
  Check,
  Sprout,
  CheckCircle2,
  Layers,
  Crown,
  Bell,
  Mail,
  ShieldAlert,
  ArrowRight,
  Info,
  Sparkles,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const LEVEL_ICONS = {
  Sprout: Sprout,
  CheckCircle2: CheckCircle2,
  Layers: Layers,
  Crown: Crown,
};

const NOTIF_STORAGE_KEY = 'financas_notificacoes_config';

const NiveisConfigSection = () => {
  const { currentLevel, changeLevel, allLevels, openOnboardingModal } = useLevel();
  const { user } = useAuth();

  const [notifConfig, setNotifConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return {
      lembreteDiarioInApp: true,
      resumoSemanalEmail: true,
      alertaTetoOrcamento: true,
    };
  });

  const [salvandoNotif, setSalvandoNotif] = useState(false);

  const handleToggleNotif = (key) => {
    setNotifConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSalvarNotificacoes = async () => {
    setSalvandoNotif(true);
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifConfig));
      // Tenta persistir no backend silenciosamente
      await api.post('/user/dados', { notificacoesConfig: notifConfig });
      toast.success('Preferências de notificação salvas com sucesso!');
    } catch (err) {
      toast.success('Preferências salvas localmente!');
    } finally {
      setSalvandoNotif(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-custom-card border border-custom-color rounded-2xl p-6 shadow-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-custom-color">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-custom-gold/15 border border-custom-gold/30 text-custom-gold flex items-center justify-center flex-shrink-0 shadow-xs">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-custom-main flex items-center gap-2">
                Modo de Uso do Sistema
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-custom-gold/20 text-custom-gold border border-custom-gold/40 font-semibold">
                  Livre & Sem Custos
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Adapte a interface ao seu momento financeiro: simplifique para dar os primeiros passos ou expanda para recursos avançados.
              </p>
            </div>
          </div>

          {currentLevel === 'iniciante' && (
            <button
              type="button"
              onClick={openOnboardingModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-custom-gold text-black hover:bg-yellow-400 transition-all flex items-center gap-1.5 shadow-sm self-start md:self-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Rever Questionário de Início
            </button>
          )}
        </div>

        {/* Grade dos 4 Níveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {Object.values(allLevels).map((level) => {
            const Icon = LEVEL_ICONS[level.iconName] || Crown;
            const isCurrent = currentLevel === level.id;

            return (
              <div
                key={level.id}
                className={`relative flex flex-col rounded-2xl border p-5 transition-all duration-200 ${
                  isCurrent
                    ? `${level.colorBg} ${level.colorBorder} shadow-lg ring-2 ${level.colorRing}`
                    : 'bg-white/40 dark:bg-slate-900/40 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Badge Ativo */}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-custom-gold text-black text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ATIVO
                  </div>
                )}

                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${level.colorBg} ${level.colorText} border ${level.colorBorder}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-custom-main">
                      {level.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs font-semibold text-custom-gold mb-2">
                  {level.tagline}
                </p>

                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 flex-1">
                  {level.description}
                </p>

                {/* Features */}
                <div className="space-y-1.5 mb-5 border-t border-b border-custom-color py-3">
                  {level.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      {feat.included ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <span className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600 flex-shrink-0 text-center leading-3">—</span>
                      )}
                      <span className={feat.included ? 'text-gray-700 dark:text-slate-200' : 'text-gray-400 dark:text-slate-500 line-through opacity-70'}>
                        {feat.text}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => changeLevel(level.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-custom-gold text-black cursor-default shadow-xs'
                      : 'bg-gray-100 dark:bg-slate-800 hover:bg-custom-gold hover:text-black text-custom-main'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-4 h-4" />
                      Nível Atual
                    </>
                  ) : (
                    <>
                      Ativar Modo {level.name}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seção de Notificações & Lembretes (App & E-mail apenas, sem custos de WhatsApp) */}
      <div className="bg-custom-card border border-custom-color rounded-2xl p-6 shadow-custom">
        <div className="flex items-center gap-3 pb-4 border-b border-custom-color mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-500 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-custom-main flex items-center gap-2">
              Lembretes & Notificações
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold border border-emerald-500/30">
                100% Gratuito (App & E-mail)
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Receba avisos inteligentes diretamente no aplicativo e no seu e-mail cadastrado ({user?.email || 'seu e-mail'}). Sem custos adicionais com canais pagos.
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl">
          {/* Lembrete 1: In-App Diário */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-custom-color bg-custom-primary/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-custom-gold/15 text-custom-gold border border-custom-gold/30 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-custom-main">Lembrete Diário no App</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Exibe um lembrete sutil e amigável no Dashboard para registrar os gastos do dia caso ainda não tenham sido anotados.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={notifConfig.lembreteDiarioInApp}
                onChange={() => handleToggleNotif('lembreteDiarioInApp')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-custom-gold"></div>
            </label>
          </div>

          {/* Lembrete 2: Resumo Semanal por E-mail */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-custom-color bg-custom-primary/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500/15 text-sky-500 border border-sky-500/30 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-custom-main">Resumo Semanal por E-mail</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Receba aos domingos um resumo sintético das suas receitas, despesas e economia acumulada da semana.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={notifConfig.resumoSemanalEmail}
                onChange={() => handleToggleNotif('resumoSemanalEmail')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-custom-gold"></div>
            </label>
          </div>

          {/* Lembrete 3: Alerta de Teto de Orçamento */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-custom-color bg-custom-primary/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-custom-main">Alerta de Limite do Orçamento</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Avisa quando uma categoria atingir 80% e 100% do teto planejado para evitar surpresas no fechamento do mês.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={notifConfig.alertaTetoOrcamento}
                onChange={() => handleToggleNotif('alertaTetoOrcamento')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-custom-gold"></div>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={salvandoNotif}
              onClick={handleSalvarNotificacoes}
              className="px-5 py-2 rounded-xl bg-custom-gold text-black font-bold text-xs hover:bg-yellow-400 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {salvandoNotif ? 'Salvando...' : 'Salvar Preferências'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NiveisConfigSection;
