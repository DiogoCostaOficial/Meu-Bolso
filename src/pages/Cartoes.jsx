import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, CreditCard, Calendar, X, RotateCcw, Zap, Wallet, CheckCircle2, Info } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useEdu } from '../contexts/EduContext';
import { useLanguage } from '../contexts/LanguageContext';
import CurrencySelector from '../components/CurrencySelector';
import FieldHelpTooltip from '../components/FieldHelpTooltip';

const Cartoes = () => {
    const { userData, updateUserData } = useAuth();
    const { formatCurrency } = useCurrency();
    const { showLesson } = useEdu();
    const { t } = useLanguage();
    const [cartoes, setCartoes] = useState([]);
    const [despesas, setDespesas] = useState([]);
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [modalDetalhes, setModalDetalhes] = useState(null);

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const mesesCurto = [
        'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
        'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
    ];

    const mesesChaves = [
        '01', '02', '03', '04', '05', '06',
        '07', '08', '09', '10', '11', '12'
    ];

    const mesAtualIndex = new Date().getMonth();

    useEffect(() => {
        carregarDados();
    }, []);

    const garantirFormaFixaDinheiro = (lista = []) => {
        let encontrouDinheiro = false;
        const formatados = lista.map((c) => {
            const nomeLimpo = String(c.nome || '').trim();
            const isDinheiro = nomeLimpo.toLowerCase() === 'dinheiro' || c.id === 'forma-fixa-dinheiro';
            if (isDinheiro) {
                encontrouDinheiro = true;
                return {
                    ...c,
                    nome: 'Dinheiro',
                    diaVencimento: '',
                    tipoForma: 'avista',
                    fixo: true
                };
            }
            return c;
        });

        if (!encontrouDinheiro) {
            const idxVazioAVista = formatados.findIndex(
                (c) => !c.diaVencimento && !String(c.nome || '').trim()
            );
            if (idxVazioAVista !== -1) {
                formatados[idxVazioAVista] = {
                    ...formatados[idxVazioAVista],
                    nome: 'Dinheiro',
                    diaVencimento: '',
                    tipoForma: 'avista',
                    fixo: true
                };
            } else {
                formatados.unshift({
                    id: 'forma-fixa-dinheiro',
                    nome: 'Dinheiro',
                    diaVencimento: '',
                    tipoForma: 'avista',
                    fixo: true,
                    valores: {},
                    manualOverrides: {}
                });
            }
        }

        return formatados;
    };

    const carregarDados = async () => {
        try {
            setLoading(true);
            const response = await api.get('/user/dados');
            const data = response.data.dados || {};

            if (Array.isArray(data.cartoes)) {
                const cartoesFormatados = data.cartoes.map(c => {
                    const valores = c.valores || {};
                    const overrides = valores._manualOverrides || c.manualOverrides || {};
                    const diaVenc = c.diaVencimento ?? valores._diaVencimento ?? '';
                    const tipoForma = c.tipoForma ?? valores._tipoForma ?? (diaVenc ? 'credito' : 'avista');
                    return {
                        ...c,
                        diaVencimento: diaVenc !== null && diaVenc !== undefined ? diaVenc : '',
                        tipoForma,
                        valores,
                        manualOverrides: overrides
                    };
                });
                setCartoes(garantirFormaFixaDinheiro(cartoesFormatados));
                setDespesas(Array.isArray(data.despesas) ? data.despesas : []);
            } else {
                setCartoes(garantirFormaFixaDinheiro([]));
                setDespesas(Array.isArray(data.despesas) ? data.despesas : []);
            }
        } catch (error) {
            console.error('Erro ao carregar formas de pagamento e despesas:', error);
            toast.error('Erro ao carregar formas de pagamento');
        } finally {
            setLoading(false);
        }
    };

    const prepararCartoesParaSalvar = (listaCartoes) => {
        return garantirFormaFixaDinheiro(listaCartoes).map(c => {
            const isDinheiroFixo = Boolean(c.fixo || String(c.nome || '').trim().toLowerCase() === 'dinheiro');
            const cardId = c.id || crypto.randomUUID();
            const novosValores = { ...(c.valores || {}) };
            mesesChaves.forEach((mesChave, idx) => {
                const chave = `${anoSelecionado}-${mesChave}`;
                novosValores[chave] = getValorEfetivo(c, idx);
            });
            novosValores._manualOverrides = c.manualOverrides || {};
            const diaVencNum = !isDinheiroFixo && c.diaVencimento ? Math.min(31, Math.max(1, parseInt(c.diaVencimento, 10))) : null;
            novosValores._diaVencimento = diaVencNum;
            novosValores._tipoForma = diaVencNum ? 'credito' : 'avista';

            return {
                ...c,
                id: cardId,
                nome: isDinheiroFixo ? 'Dinheiro' : c.nome,
                fixo: isDinheiroFixo,
                diaVencimento: diaVencNum || '',
                tipoForma: diaVencNum ? 'credito' : 'avista',
                valores: novosValores
            };
        });
    };

    const salvarDados = async () => {
        try {
            setSalvando(true);
            const cartoesAtualizados = prepararCartoesParaSalvar(cartoes);
            await api.post('/user/dados', { cartoes: cartoesAtualizados });
            setCartoes(cartoesAtualizados);
            toast.success('Formas de pagamento salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar formas de pagamento:', error);
            toast.error('Erro ao salvar dados');
        } finally {
            setSalvando(false);
        }
    };

    const adicionarCartaoCredito = () => {
        const novoCartao = {
            id: crypto.randomUUID(),
            nome: 'Novo Cartão de Crédito',
            diaVencimento: 10,
            tipoForma: 'credito',
            valores: {},
            manualOverrides: {}
        };
        setCartoes([...cartoes, novoCartao]);
        toast.info('Novo Cartão de Crédito adicionado! Ajuste o nome, o dia de vencimento e clique em "Salvar Alterações".');
    };

    const adicionarFormaAVista = (nomeSugerido = 'Nova Forma à Vista') => {
        const jaExiste = cartoes.some(c => (c.nome || '').trim().toLowerCase() === nomeSugerido.trim().toLowerCase());
        if (jaExiste && nomeSugerido !== 'Nova Forma à Vista') {
            toast.info(`"${nomeSugerido}" já está cadastrado na sua lista!`);
            return;
        }
        const novaForma = {
            id: crypto.randomUUID(),
            nome: nomeSugerido,
            diaVencimento: '',
            tipoForma: 'avista',
            valores: {},
            manualOverrides: {}
        };
        setCartoes([...cartoes, novaForma]);
        toast.info(`Forma de pagamento "${nomeSugerido}" adicionada (saída imediata sem fatura). Clique em "Salvar Alterações".`);
    };

    const removerCartao = async (id) => {
        const cartaoParaRemover = cartoes.find(c => c.id === id);
        if (cartaoParaRemover?.fixo || String(cartaoParaRemover?.nome || '').trim().toLowerCase() === 'dinheiro') {
            toast.info('A forma de pagamento "Dinheiro" é fixa do sistema e não pode ser removida.');
            return;
        }
        const nomeCartao = cartaoParaRemover?.nome || 'esta forma de pagamento';
        const despesasVinculadas = despesas.filter(d => isCartaoMatch(d, cartaoParaRemover));

        let mensagemConfirm = `Tem certeza que deseja remover "${nomeCartao}"?`;
        if (despesasVinculadas.length > 0) {
            mensagemConfirm += `\n\nAtenção: Existem ${despesasVinculadas.length} despesa(s) associada(s) a este item. A exclusão será definitiva no banco de dados.`;
        }

        if (!window.confirm(mensagemConfirm)) {
            return;
        }

        const novosCartoes = cartoes.filter(c => c.id !== id);
        setCartoes(novosCartoes);

        try {
            setSalvando(true);
            const cartoesAtualizados = prepararCartoesParaSalvar(novosCartoes);
            await api.post('/user/dados', { cartoes: cartoesAtualizados });
            setCartoes(cartoesAtualizados);
            toast.success(`"${nomeCartao}" excluído em definitivo!`);
        } catch (error) {
            console.error('Erro ao excluir no servidor:', error);
            toast.error('Erro ao salvar exclusão no servidor. As alterações foram revertidas.');
            setCartoes(cartoes);
        } finally {
            setSalvando(false);
        }
    };

    const atualizarNomeCartao = (id, novoNome) => {
        setCartoes(cartoes.map(c =>
            c.id === id ? { ...c, nome: novoNome } : c
        ));
    };

    const atualizarDiaVencimentoCartao = (id, novoDia) => {
        const limpo = novoDia === '' ? '' : Math.min(31, Math.max(1, parseInt(novoDia, 10) || 1));
        setCartoes(cartoes.map(c =>
            c.id === id ? { ...c, diaVencimento: limpo, tipoForma: limpo ? 'credito' : 'avista' } : c
        ));
    };

    // Helper para verificar se a despesa pertence ao cartão/forma
    const isCartaoMatch = (despesa, cartao) => {
        if (!despesa || !cartao) return false;
        if (despesa.cartaoId && cartao.id && String(despesa.cartaoId) === String(cartao.id)) {
            return true;
        }
        if (despesa.cartao && cartao.nome) {
            return despesa.cartao.trim().toLowerCase() === cartao.nome.trim().toLowerCase();
        }
        return false;
    };

    // Helper para obter o mês de referência (fatura para crédito, mês da compra para à vista)
    const getMesFatura = (despesa, cartao) => {
        const cartaoAlvo = cartao || cartoes.find(c => isCartaoMatch(despesa, c));
        const temDiaFixo = Boolean(cartaoAlvo && (cartaoAlvo.diaVencimento || cartaoAlvo.valores?._diaVencimento));

        if (!temDiaFixo) {
            const dataRef = despesa.dataLancamento || despesa.dataCompra || despesa.data;
            return dataRef ? dataRef.slice(0, 7) : '';
        }

        if (despesa.mesFatura) return despesa.mesFatura;
        if (despesa.dataVencimento) return despesa.dataVencimento.slice(0, 7);
        const dataRef = despesa.dataCompra || despesa.dataLancamento || despesa.data;
        if (!dataRef) return '';
        const [ano, mes] = dataRef.split('-');
        let a = parseInt(ano, 10);
        let m = parseInt(mes, 10) + 1;
        if (m > 12) {
            m = 1;
            a++;
        }
        return `${a}-${String(m).padStart(2, '0')}`;
    };

    const getDespesasDoCartaoNoMes = (cartao, mesIndex) => {
        const chaveMes = `${anoSelecionado}-${mesesChaves[mesIndex]}`;
        return despesas.filter(d => {
            if (!isCartaoMatch(d, cartao)) return false;
            const mf = getMesFatura(d, cartao);
            return mf === chaveMes;
        });
    };

    const getValorAutomaticoDespesas = (cartao, mesIndex) => {
        const compras = getDespesasDoCartaoNoMes(cartao, mesIndex);
        return compras.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
    };

    const getValorEfetivo = (cartao, mesIndex) => {
        const chaveMes = `${anoSelecionado}-${mesesChaves[mesIndex]}`;
        const temOverride = !!(cartao.manualOverrides?.[chaveMes]);
        const valorManual = cartao.valores?.[chaveMes];

        if (temOverride && valorManual !== undefined && valorManual !== null && valorManual !== '') {
            return parseFloat(valorManual) || 0;
        }

        const valorAuto = getValorAutomaticoDespesas(cartao, mesIndex);
        if (valorAuto > 0) {
            return valorAuto;
        }

        if (valorManual !== undefined && valorManual !== null && valorManual !== '') {
            return parseFloat(valorManual) || 0;
        }

        return 0;
    };

    const getValorInput = (cartao, mesIndex) => {
        const chaveMes = `${anoSelecionado}-${mesesChaves[mesIndex]}`;
        const temOverride = !!(cartao.manualOverrides?.[chaveMes]);
        const valorManual = cartao.valores?.[chaveMes];

        if (temOverride && valorManual !== undefined && valorManual !== null) {
            return valorManual === 0 ? '0' : valorManual;
        }

        const valorAuto = getValorAutomaticoDespesas(cartao, mesIndex);
        if (valorAuto > 0) {
            return valorAuto.toFixed(2);
        }

        if (valorManual !== undefined && valorManual !== null && valorManual !== '') {
            return valorManual;
        }

        return '';
    };

    const atualizarValor = (id, mesIndex, valor) => {
        const chaveMes = `${anoSelecionado}-${mesesChaves[mesIndex]}`;
        const valorNumerico = valor === '' ? '' : (parseFloat(valor) || 0);

        setCartoes(cartoes.map(c => {
            if (c.id === id) {
                return {
                    ...c,
                    manualOverrides: {
                        ...(c.manualOverrides || {}),
                        [chaveMes]: valor !== ''
                    },
                    valores: {
                        ...(c.valores || {}),
                        [chaveMes]: valorNumerico
                    }
                };
            }
            return c;
        }));
    };

    const resetarParaAutomatico = (id, mesIndex) => {
        const chaveMes = `${anoSelecionado}-${mesesChaves[mesIndex]}`;
        setCartoes(cartoes.map(c => {
            if (c.id === id) {
                const nextOverrides = { ...(c.manualOverrides || {}) };
                delete nextOverrides[chaveMes];
                const nextValores = { ...(c.valores || {}) };
                delete nextValores[chaveMes];
                return {
                    ...c,
                    manualOverrides: nextOverrides,
                    valores: nextValores
                };
            }
            return c;
        }));
    };

    // Separação em 2 grupos: Cartões de Crédito (com dia de vencimento) vs. Formas à Vista/Benefícios (sem dia fixo)
    const cartoesCredito = cartoes.filter(c => Boolean(c.diaVencimento));
    const formasAVista = cartoes.filter(c => !c.diaVencimento);

    const calcularTotalGrupoMes = (lista, mesIndex) => {
        return lista.reduce((acc, item) => acc + getValorEfetivo(item, mesIndex), 0);
    };

    const calcularTotalCartao = (cartao) => {
        return mesesChaves.reduce((acc, _, idx) => {
            return acc + getValorEfetivo(cartao, idx);
        }, 0);
    };

    const calcularTotalGrupoGeral = (lista) => {
        return lista.reduce((acc, item) => acc + calcularTotalCartao(item), 0);
    };

    const gerarListaAnos = () => {
        const anoAtual = new Date().getFullYear();
        const anos = [];
        for (let i = anoAtual - 2; i <= anoAtual + 2; i++) {
            anos.push(i.toString());
        }
        return anos;
    };

    const formatarData = (dataStr) => {
        if (!dataStr) return '';
        try {
            const partes = dataStr.split('T')[0].split('-');
            if (partes.length === 3) {
                return `${partes[2]}/${partes[1]}/${partes[0]}`;
            }
            return dataStr;
        } catch {
            return dataStr;
        }
    };

    const renderTabelaGrupo = ({
        titulo,
        subtitulo,
        icone: IconeGrupo,
        corBadge,
        lista,
        labelColuna,
        labelRodape,
        isCredito
    }) => (
        <div className="bg-custom-card rounded-custom shadow-custom border border-custom-color overflow-hidden transition-custom">
            {/* Cabeçalho do Bloco */}
            <div className="p-4 md:p-5 border-b border-custom-color flex flex-col md:flex-row md:items-center justify-between gap-3 bg-custom-primary/15 dark:bg-slate-800/30">
                <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border ${corBadge} flex-shrink-0 mt-0.5`}>
                        <IconeGrupo className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-bold text-custom-main">{titulo}</h2>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${corBadge}`}>
                                {isCredito ? 'Gera Fatura Futura (D+30)' : 'Saída Imediata do Caixa (D+0)'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {subtitulo}
                        </p>
                    </div>
                </div>

                {!isCredito && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-gray-500 dark:text-slate-400 mr-1">Adicionar rápido:</span>
                        {['PIX / DEBITO', 'TICKET', 'Cartão de Débito'].map(sugestao => (
                            <button
                                key={sugestao}
                                type="button"
                                onClick={() => adicionarFormaAVista(sugestao)}
                                className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 font-medium transition cursor-pointer"
                            >
                                + {sugestao}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {lista.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] md:min-w-0 md:table-fixed border-collapse">
                        <thead>
                            <tr className="bg-custom-primary/30 dark:bg-slate-800/40 border-b border-custom-color text-custom-main">
                                <th className="w-[175px] xl:w-[195px] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-custom-main sticky left-0 bg-custom-card dark:bg-slate-900 z-10 shadow-sm border-r border-custom-color">
                                    {labelColuna}
                                </th>
                                {meses.map((mes, idx) => {
                                    const isMesAtual = idx === mesAtualIndex;
                                    return (
                                        <th
                                            key={mes}
                                            data-no-field-help="true"
                                            title={t(mes)}
                                            className={`px-1 py-2.5 text-center text-[11px] font-bold whitespace-nowrap transition-colors ${
                                                isMesAtual
                                                    ? 'bg-custom-gold/15 text-custom-gold border-b-2 border-custom-gold'
                                                    : 'text-custom-main'
                                            }`}
                                        >
                                            {mesesCurto[idx]}
                                        </th>
                                    );
                                })}
                                <th
                                    data-no-field-help="true"
                                    className="w-[96px] xl:w-[112px] px-2 py-2.5 text-right text-[11px] font-bold text-custom-main bg-custom-primary/40 dark:bg-slate-800/60 border-l border-custom-color whitespace-nowrap"
                                >
                                    TOTAL ANUAL
                                </th>
                                <th className="w-[28px] px-1 py-2.5" data-no-field-help="true"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-custom-color bg-transparent">
                            {lista.map((cartao) => {
                                const isFixo = Boolean(cartao.fixo || String(cartao.nome || '').trim().toLowerCase() === 'dinheiro');
                                return (
                                <tr key={cartao.id} className="hover:bg-custom-primary/10 dark:hover:bg-slate-800/30 transition group text-custom-main">
                                    <td className="px-2.5 py-2 sticky left-0 bg-custom-card dark:bg-slate-900 z-10 shadow-sm border-r border-custom-color align-middle">
                                        {isFixo ? (
                                            <div className="space-y-1 px-1">
                                                <div className="flex items-center justify-between gap-1.5">
                                                    <span className="font-bold text-xs xl:text-sm text-custom-main truncate">
                                                        💵 Dinheiro
                                                    </span>
                                                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                                                        FIXO
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    <Zap className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">À Vista (Saída Imediata)</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <input
                                                    type="text"
                                                    value={cartao.nome}
                                                    onChange={(e) => atualizarNomeCartao(cartao.id, e.target.value)}
                                                    className="w-full min-w-0 px-1.5 py-0.5 border border-transparent hover:border-custom-color focus:border-blue-500 rounded font-bold text-xs xl:text-sm text-custom-main bg-transparent focus:bg-custom-card focus:outline-none transition-colors truncate"
                                                    placeholder={isCredito ? 'Nome do Cartão' : 'Ex: PIX, Débito, Ticket...'}
                                                    title={cartao.nome}
                                                />
                                                <div className="flex items-center gap-1 px-1 text-[10px] text-custom-main/80">
                                                    <Calendar className="w-3 h-3 text-custom-gold flex-shrink-0" />
                                                    <select
                                                        value={cartao.diaVencimento || ''}
                                                        onChange={(e) => atualizarDiaVencimentoCartao(cartao.id, e.target.value)}
                                                        className="w-full min-w-0 px-1 py-0.5 rounded border border-custom-color bg-custom-card dark:bg-slate-800 text-custom-main text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer truncate"
                                                        title="Cartões com dia fixo geram fatura futura. Formas 'Sem dia fixo' são tratadas como pagamento à vista (PIX/Débito/Ticket)."
                                                    >
                                                        <option value="">⚡ À Vista (Sem Fatura)</option>
                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                                                            <option key={dia} value={dia}>
                                                                💳 Fatura Dia {String(dia).padStart(2, '0')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    {meses.map((_, index) => {
                                        const chaveMes = `${anoSelecionado}-${mesesChaves[index]}`;
                                        const comprasNoMes = getDespesasDoCartaoNoMes(cartao, index);
                                        const valorAuto = getValorAutomaticoDespesas(cartao, index);
                                        const temOverride = !!(cartao.manualOverrides?.[chaveMes]);
                                        const valorMostrado = getValorInput(cartao, index);
                                        const isMesAtual = index === mesAtualIndex;

                                        return (
                                            <td
                                                key={index}
                                                className={`px-1 py-1.5 align-middle ${
                                                    isMesAtual ? 'bg-custom-gold/5' : ''
                                                }`}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={valorMostrado}
                                                        onChange={(e) => atualizarValor(cartao.id, index, e.target.value)}
                                                        className={`w-full min-w-0 px-1 py-1 text-center border rounded text-[11px] xl:text-xs tabular-nums transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                                            temOverride
                                                                ? 'border-amber-400 bg-amber-50/30 text-amber-900 dark:text-amber-300 font-semibold'
                                                                : valorAuto > 0
                                                                    ? isCredito
                                                                        ? 'border-blue-300 bg-blue-50/30 text-blue-900 dark:text-blue-300 font-bold'
                                                                        : 'border-emerald-300 bg-emerald-50/30 text-emerald-900 dark:text-emerald-300 font-bold'
                                                                    : 'border-custom-color/60 hover:border-custom-color bg-transparent text-custom-main/80 focus:bg-custom-card'
                                                        }`}
                                                        placeholder="0"
                                                    />

                                                    {comprasNoMes.length > 0 && (
                                                        <div className="flex items-center justify-center gap-1 mt-0.5 flex-wrap">
                                                            <button
                                                                type="button"
                                                                onClick={() => setModalDetalhes({ cartao, mesIndex: index, compras: comprasNoMes, isCredito })}
                                                                className={`inline-flex items-center gap-0.5 text-[9px] leading-tight hover:underline font-semibold cursor-pointer ${
                                                                    isCredito ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
                                                                }`}
                                                                title={isCredito ? 'Ver compras desta fatura' : 'Ver pagamentos realizados'}
                                                            >
                                                                <span>{comprasNoMes.length} {comprasNoMes.length === 1 ? 'item' : 'itens'}</span>
                                                            </button>
                                                            {temOverride && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => resetarParaAutomatico(cartao.id, index)}
                                                                    className="text-[8px] text-amber-700 dark:text-amber-300 hover:text-amber-900 bg-amber-100 dark:bg-amber-900/40 px-1 rounded flex items-center gap-0.5"
                                                                    title="Restaurar soma automática das despesas"
                                                                >
                                                                    <RotateCcw className="w-2 h-2" /> Auto
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td className="px-2 py-2 text-right font-bold text-[11px] xl:text-xs tabular-nums whitespace-nowrap text-custom-main bg-custom-primary/20 dark:bg-slate-800/35 border-l border-r border-custom-color align-middle">
                                        {formatCurrency(calcularTotalCartao(cartao))}
                                    </td>
                                    <td className="px-1 py-2 text-center align-middle">
                                        {!isFixo && (
                                            <button
                                                onClick={() => removerCartao(cartao.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition opacity-60 group-hover:opacity-100 cursor-pointer"
                                                title="Remover item"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}

                            {/* Linha de Totais Exclusiva do Grupo */}
                            <tr className="bg-custom-primary/40 dark:bg-slate-800/50 font-bold border-t-2 border-custom-color text-custom-main">
                                <td className="px-2.5 py-2.5 text-[10px] xl:text-[11px] font-extrabold uppercase tracking-tight text-custom-main sticky left-0 bg-custom-card dark:bg-slate-900 z-10 shadow-sm border-r border-custom-color leading-tight">
                                    {labelRodape}
                                </td>
                                {meses.map((_, index) => {
                                    const totalMes = calcularTotalGrupoMes(lista, index);
                                    const isMesAtual = index === mesAtualIndex;
                                    return (
                                        <td
                                            key={index}
                                            className={`px-0.5 py-2.5 text-center text-[10px] xl:text-[11px] font-bold tabular-nums whitespace-nowrap ${
                                                isMesAtual ? 'bg-custom-gold/10 text-custom-main' : 'text-custom-main'
                                            }`}
                                        >
                                            {formatCurrency(totalMes)}
                                        </td>
                                    );
                                })}
                                <td className={`px-2 py-2.5 text-right text-xs xl:text-sm font-extrabold tabular-nums whitespace-nowrap border-l border-custom-color ${isCredito ? 'text-custom-gold' : 'text-emerald-500'}`}>
                                    {formatCurrency(calcularTotalGrupoGeral(lista))}
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-8 text-center text-gray-500 dark:text-slate-400 text-sm">
                    {isCredito
                        ? 'Nenhum cartão de crédito com vencimento fixo cadastrado.'
                        : 'Nenhuma forma de pagamento à vista (PIX, Débito, Ticket) cadastrada ainda.'}
                </div>
            )}
        </div>
    );

    const totalFaturasMesAtual = calcularTotalGrupoMes(cartoesCredito, mesAtualIndex);
    const totalAVistaMesAtual = calcularTotalGrupoMes(formasAVista, mesAtualIndex);

    return (
        <div className="w-full max-w-[1600px] mx-auto p-3 md:p-5 space-y-5">
            {/* Header Principal */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-custom text-custom-main">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-custom-primary/50 dark:bg-amber-900/20 rounded-xl">
                        <CreditCard className="w-6 h-6 text-custom-gold" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-custom-main">Formas de Pagamento & Cartões</h1>
                        <p className="text-custom-main opacity-80 text-sm">
                            Separe suas <strong>Faturas de Crédito (a pagar)</strong> dos <strong>Pagamentos à Vista (PIX, Débito e Vales)</strong> sem misturar saldos
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <CurrencySelector />
                    <div className="h-11 flex items-center gap-2 bg-custom-card text-custom-main px-4 rounded-full border border-custom-color shadow-custom transition-custom">
                        <Calendar className="w-4 h-4 text-custom-gold flex-shrink-0" />
                        <select
                            value={anoSelecionado}
                            onChange={(e) => setAnoSelecionado(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-custom-main font-medium cursor-pointer dark:bg-slate-900"
                        >
                            {gerarListaAnos().map(ano => (
                                <option key={ano} value={ano} className="dark:bg-slate-900">{ano}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={adicionarCartaoCredito}
                        className="h-11 flex items-center gap-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm font-semibold text-xs md:text-sm cursor-pointer"
                    >
                        <CreditCard className="w-4 h-4" />
                        + Cartão de Crédito
                    </button>

                    <button
                        type="button"
                        onClick={() => adicionarFormaAVista('Nova Forma à Vista')}
                        className="h-11 flex items-center gap-2 px-4 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition shadow-sm font-semibold text-xs md:text-sm cursor-pointer"
                    >
                        <Zap className="w-4 h-4" />
                        + PIX / Débito / Vale
                    </button>

                    <button
                        type="button"
                        onClick={salvarDados}
                        disabled={salvando}
                        className="h-11 flex items-center gap-2 px-5 bg-custom-gold text-black rounded-full hover:opacity-90 transition shadow-sm disabled:opacity-50 font-bold text-xs md:text-sm cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        {salvando ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>

            {/* Resumo Rápido do Mês Atual (Sem Soma Dupla) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-custom-card p-4 rounded-custom border border-custom-color shadow-custom flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                            💳 Faturas a Pagar ({meses[mesAtualIndex]})
                        </span>
                        <p className="text-2xl font-bold text-custom-main mt-1">
                            {formatCurrency(totalFaturasMesAtual)}
                        </p>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">
                            Soma exclusiva dos cartões de crédito com vencimento
                        </span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                        <CreditCard className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-custom-card p-4 rounded-custom border border-custom-color shadow-custom flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                            ⚡ Já Pago à Vista / Vales ({meses[mesAtualIndex]})
                        </span>
                        <p className="text-2xl font-bold text-custom-main mt-1">
                            {formatCurrency(totalAVistaMesAtual)}
                        </p>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">
                            PIX, Débito e Ticket já descontados no ato (não é dívida futura)
                        </span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-custom-card p-4 rounded-custom border border-custom-color shadow-custom flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-custom-gold uppercase tracking-wider block">
                            📌 Por que separamos os totais?
                        </span>
                        <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">
                            O que você paga no <strong>PIX, Débito ou Ticket</strong> já saiu da conta na hora. Separar evita que você ache que ainda precisa pagar esse valor no fim do mês!
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-custom-gold/10 text-custom-gold flex-shrink-0">
                        <Info className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* BLOCO 1: CARTÕES DE CRÉDITO (FATURAS FUTURAS) */}
            {renderTabelaGrupo({
                titulo: '1. Cartões de Crédito (Faturas Futuras)',
                subtitulo: 'Cartões com data de vencimento fixa. O rodapé mostra exatamente quanto você terá que pagar de fatura em cada mês.',
                icone: CreditCard,
                corBadge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
                lista: cartoesCredito,
                labelColuna: 'CARTÃO DE CRÉDITO',
                labelRodape: 'TOTAL FATURAS A PAGAR',
                isCredito: true
            })}

            {/* BLOCO 2: À VISTA, DÉBITO E BENEFÍCIOS (SAÍDA IMEDIATA) */}
            {renderTabelaGrupo({
                titulo: '2. À Vista, Débito & Benefícios (Saída Imediata)',
                subtitulo: 'PIX, Cartão de Débito, Dinheiro e Vale Refeição/Alimentação. Apenas informativo de quanto foi movimentado — já descontado da conta no ato.',
                icone: Wallet,
                corBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
                lista: formasAVista,
                labelColuna: 'FORMA À VISTA / VALE',
                labelRodape: 'TOTAL PAGO À VISTA',
                isCredito: false
            })}

            {/* Modal de Detalhes */}
            {modalDetalhes && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in duration-150">
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-lg ${
                                    modalDetalhes.isCredito
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                }`}>
                                    {modalDetalhes.isCredito ? <CreditCard className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">
                                        {modalDetalhes.cartao.nome}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {modalDetalhes.isCredito ? 'Fatura de ' : 'Pagamentos à vista em '}
                                        {t(meses[modalDetalhes.mesIndex])} de {anoSelecionado}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setModalDetalhes(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
                                title="Fechar"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                            {modalDetalhes.compras.map((d, i) => (
                                <div
                                    key={d.id || i}
                                    className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 text-sm"
                                >
                                    <div>
                                        <p className="font-semibold">{d.descricao}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {d.dataCompra ? `Compra: ${formatarData(d.dataCompra)}` : (d.data ? `Data: ${formatarData(d.data)}` : '')}
                                            {d.categoria ? ` • ${d.categoria}` : ''}
                                            {d.parcelado ? ` • Parcelado (${d.numeroParcelas}x)` : ''}
                                        </p>
                                    </div>
                                    <div className="text-right font-bold text-red-600 dark:text-red-400">
                                        {formatCurrency(parseFloat(d.valor) || 0)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-200 dark:border-slate-800 pt-3 font-bold">
                            <span className="text-sm">
                                {modalDetalhes.isCredito ? 'Total Automático da Fatura:' : 'Total Pago à Vista no Mês:'}
                            </span>
                            <span className={`text-lg ${modalDetalhes.isCredito ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {formatCurrency(
                                    modalDetalhes.compras.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0)
                                )}
                            </span>
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                onClick={() => setModalDetalhes(null)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cartoes;
