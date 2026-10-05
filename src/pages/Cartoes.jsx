import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, CreditCard, Calendar, GraduationCap, X, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useEdu } from '../contexts/EduContext';
import CurrencySelector from '../components/CurrencySelector';

const Cartoes = () => {
    const { userData, updateUserData } = useAuth();
    const { formatCurrency } = useCurrency();
    const { showLesson } = useEdu();
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

    const mesesChaves = [
        '01', '02', '03', '04', '05', '06',
        '07', '08', '09', '10', '11', '12'
    ];

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const response = await api.get('/user/dados');
            const data = response.data.dados || {};

            if (Array.isArray(data.cartoes)) {
                const cartoesFormatados = data.cartoes.map(c => {
                    const valores = c.valores || {};
                    const overrides = valores._manualOverrides || c.manualOverrides || {};
                    return {
                        ...c,
                        valores,
                        manualOverrides: overrides
                    };
                });
                setCartoes(cartoesFormatados);
            } else {
                setCartoes([]);
            }

            if (Array.isArray(data.despesas)) {
                setDespesas(data.despesas);
            } else {
                setDespesas([]);
            }
        } catch (error) {
            console.error('Erro ao carregar cartões e despesas:', error);
            toast.error('Erro ao carregar dados dos cartões');
        } finally {
            setLoading(false);
        }
    };

    const salvarDados = async () => {
        try {
            setSalvando(true);

            // Sincronizar cartões com valores efetivos e guardar manual overrides
            const cartoesAtualizados = cartoes.map(c => {
                const cardId = c.id || crypto.randomUUID();
                const novosValores = { ...(c.valores || {}) };
                mesesChaves.forEach((mesChave, idx) => {
                    const chave = `${anoSelecionado}-${mesChave}`;
                    novosValores[chave] = getValorEfetivo(c, idx);
                });
                novosValores._manualOverrides = c.manualOverrides || {};

                return {
                    ...c,
                    id: cardId,
                    valores: novosValores
                };
            });

            await api.post('/user/dados', { cartoes: cartoesAtualizados });
            setCartoes(cartoesAtualizados);
            toast.success('Dados salvos com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar cartões:', error);
            toast.error('Erro ao salvar dados');
        } finally {
            setSalvando(false);
        }
    };

    const adicionarCartao = () => {
        const novoCartao = {
            id: crypto.randomUUID(),
            nome: 'Novo Cartão',
            valores: {},
            manualOverrides: {}
        };
        setCartoes([...cartoes, novoCartao]);
        toast.info('Novo cartão adicionado. Digite o nome e clique em "Salvar Alterações" para gravar.');
    };

    const removerCartao = async (id) => {
        const cartaoParaRemover = cartoes.find(c => c.id === id);
        const nomeCartao = cartaoParaRemover?.nome || 'este cartão';
        const despesasVinculadas = despesas.filter(d => isCartaoMatch(d, cartaoParaRemover));

        let mensagemConfirm = `Tem certeza que deseja remover o cartão "${nomeCartao}"?`;
        if (despesasVinculadas.length > 0) {
            mensagemConfirm += `\n\nAtenção: Existem ${despesasVinculadas.length} despesa(s) associada(s) a este cartão. A exclusão será definitiva no banco de dados.`;
        }

        if (!window.confirm(mensagemConfirm)) {
            return;
        }

        const novosCartoes = cartoes.filter(c => c.id !== id);
        setCartoes(novosCartoes);

        try {
            setSalvando(true);

            // Sincronizar os cartões restantes com valores efetivos e manual overrides
            const cartoesAtualizados = novosCartoes.map(c => {
                const cardId = c.id || crypto.randomUUID();
                const novosValores = { ...(c.valores || {}) };
                mesesChaves.forEach((mesChave, idx) => {
                    const chave = `${anoSelecionado}-${mesChave}`;
                    novosValores[chave] = getValorEfetivo(c, idx);
                });
                novosValores._manualOverrides = c.manualOverrides || {};

                return {
                    ...c,
                    id: cardId,
                    valores: novosValores
                };
            });

            await api.post('/user/dados', { cartoes: cartoesAtualizados });
            setCartoes(cartoesAtualizados);
            toast.success(`Cartão "${nomeCartao}" excluído em definitivo!`);
        } catch (error) {
            console.error('Erro ao excluir cartão no servidor:', error);
            toast.error('Erro ao salvar exclusão no servidor. As alterações foram revertidas.');
            setCartoes(cartoes); // Reverte o estado em caso de falha
        } finally {
            setSalvando(false);
        }
    };

    const atualizarNomeCartao = (id, novoNome) => {
        setCartoes(cartoes.map(c =>
            c.id === id ? { ...c, nome: novoNome } : c
        ));
    };

    // Helper para verificar se a despesa pertence ao cartão
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

    // Helper para obter o mês da fatura (formato AAAA-MM)
    const getMesFatura = (despesa) => {
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

    // Retorna as despesas vinculadas ao cartão no mês selecionado
    const getDespesasDoCartaoNoMes = (cartao, mesIndex) => {
        const chaveMes = `${anoSelecionado}-${mesesChaves[mesIndex]}`;
        return despesas.filter(d => {
            if (!isCartaoMatch(d, cartao)) return false;
            const mf = getMesFatura(d);
            return mf === chaveMes;
        });
    };

    // Retorna a soma automática das despesas vinculadas
    const getValorAutomaticoDespesas = (cartao, mesIndex) => {
        const compras = getDespesasDoCartaoNoMes(cartao, mesIndex);
        return compras.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
    };

    // Retorna o valor efetivo (soma automática ou valor manual se alterado)
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

    // Retorna o valor a ser exibido no input do mês
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

    // Atualiza manualmente o valor na célula
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

    // Restaura o valor para o cálculo automático
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

    const calcularTotalMes = (mesIndex) => {
        return cartoes.reduce((acc, cartao) => {
            return acc + getValorEfetivo(cartao, mesIndex);
        }, 0);
    };

    const calcularTotalCartao = (cartao) => {
        return mesesChaves.reduce((acc, _, idx) => {
            return acc + getValorEfetivo(cartao, idx);
        }, 0);
    };

    const calcularTotalGeral = () => {
        return cartoes.reduce((acc, cartao) => acc + calcularTotalCartao(cartao), 0);
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

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-custom text-custom-main">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-custom-primary/50 dark:bg-amber-900/20 rounded-lg">
                        <CreditCard className="w-6 h-6 text-custom-gold" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-custom-main">Gerenciamento de Cartões</h1>
                        <p className="text-custom-main opacity-80 text-sm">Acompanhe suas faturas mensais e compras vinculadas automaticamente</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-start gap-3">
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
                        onClick={adicionarCartao}
                        className="h-11 flex items-center gap-2 px-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition shadow-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Cartão
                    </button>

                    <button
                        onClick={salvarDados}
                        disabled={salvando}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50 font-medium"
                    >
                        <Save className="w-4 h-4" />
                        {salvando ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>

            {/* Tabela Editável */}
            <div className="bg-custom-card rounded-custom shadow-custom border border-custom-color overflow-hidden transition-custom">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px]">
                        <thead>
                            <tr className="bg-custom-primary/30 dark:bg-slate-800/40 border-b border-custom-color text-custom-main">
                                <th className="px-4 py-3 text-left text-sm font-bold text-custom-main min-w-[250px] sticky left-0 bg-custom-card dark:bg-slate-900 z-10 shadow-sm border-r border-custom-color">
                                    CARTÕES
                                </th>
                                {meses.map(mes => (
                                    <th key={mes} className="px-2 py-3 text-center text-sm font-bold text-custom-main min-w-[100px]">
                                        {mes.toUpperCase()}
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-right text-sm font-bold text-custom-main min-w-[120px] bg-custom-primary/40 dark:bg-slate-800/60">
                                    TOTAL
                                </th>
                                <th className="px-2 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-custom-color bg-transparent">
                            {cartoes.map((cartao) => (
                                <tr key={cartao.id} className="hover:bg-custom-primary/10 dark:hover:bg-slate-800/30 transition group text-custom-main">
                                    <td className="px-4 py-2 sticky left-0 bg-custom-card dark:bg-slate-900 group-hover:bg-custom-primary/20 dark:group-hover:bg-slate-800/40 z-10 shadow-sm border-r border-custom-color align-top">
                                        <input
                                            type="text"
                                            value={cartao.nome}
                                            onChange={(e) => atualizarNomeCartao(cartao.id, e.target.value)}
                                            className="w-full px-2 py-1 border border-transparent hover:border-custom-color focus:border-blue-500 rounded font-medium text-custom-main bg-transparent focus:bg-custom-card focus:outline-none transition-colors"
                                            placeholder="Nome do Cartão"
                                        />
                                    </td>
                                    {meses.map((_, index) => {
                                        const chaveMes = `${anoSelecionado}-${mesesChaves[index]}`;
                                        const comprasNoMes = getDespesasDoCartaoNoMes(cartao, index);
                                        const valorAuto = getValorAutomaticoDespesas(cartao, index);
                                        const temOverride = !!(cartao.manualOverrides?.[chaveMes]);
                                        const valorMostrado = getValorInput(cartao, index);

                                        return (
                                            <td key={index} className="px-2 py-2 align-top">
                                                <div className="flex flex-col">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={valorMostrado}
                                                        onChange={(e) => atualizarValor(cartao.id, index, e.target.value)}
                                                        className={`w-full px-2 py-1 text-right border rounded text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                            temOverride 
                                                                ? 'border-amber-400 bg-amber-50/30 text-amber-900 dark:text-amber-300' 
                                                                : valorAuto > 0 
                                                                    ? 'border-blue-200 bg-blue-50/20 text-blue-900 dark:text-blue-300 font-semibold' 
                                                                    : 'border-transparent hover:border-custom-color bg-transparent text-custom-main/80 focus:bg-custom-card'
                                                        }`}
                                                        placeholder="0,00"
                                                    />

                                                    {comprasNoMes.length > 0 && (
                                                        <div className="flex items-center justify-end gap-1 mt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => setModalDetalhes({ cartao, mesIndex: index, compras: comprasNoMes })}
                                                                className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                                                                title="Ver compras desta fatura"
                                                            >
                                                                <span>{comprasNoMes.length} {comprasNoMes.length === 1 ? 'compra' : 'compras'}</span>
                                                            </button>
                                                            {temOverride && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => resetarParaAutomatico(cartao.id, index)}
                                                                    className="text-[9px] text-amber-600 hover:text-amber-800 bg-amber-100 dark:bg-amber-900/40 px-1 rounded flex items-center gap-0.5"
                                                                    title="Restaurar soma automática das despesas"
                                                                >
                                                                    <RotateCcw className="w-2.5 h-2.5" /> Auto
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-2 text-right font-bold text-custom-main bg-custom-primary/20 dark:bg-slate-800/35 border-l border-r border-custom-color align-top">
                                        {formatCurrency(calcularTotalCartao(cartao))}
                                    </td>
                                    <td className="px-2 py-2 text-center align-top">
                                        <button
                                            onClick={() => removerCartao(cartao.id)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                                            title="Remover cartão"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* Linha de Totais */}
                            <tr className="bg-custom-primary/40 dark:bg-slate-800/50 font-bold border-t-2 border-custom-color text-custom-main">
                                <td className="px-4 py-3 text-custom-main sticky left-0 bg-custom-primary/40 dark:bg-slate-800/50 z-10 shadow-sm border-r border-custom-color">
                                    TOTAL
                                </td>
                                {meses.map((_, index) => (
                                    <td key={index} className="px-2 py-3 text-right text-custom-main text-sm">
                                        {formatCurrency(calcularTotalMes(index))}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-right text-custom-gold text-lg border-l border-custom-color">
                                    {formatCurrency(calcularTotalGeral())}
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Detalhes da Fatura */}
            {modalDetalhes && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in duration-150">
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">
                                        {modalDetalhes.cartao.nome}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Fatura de {meses[modalDetalhes.mesIndex]} de {anoSelecionado}
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
                            <span className="text-sm">Total Automático da Fatura:</span>
                            <span className="text-lg text-blue-600 dark:text-blue-400">
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

            {cartoes.length === 0 && !loading && (
                <div className="text-center py-12 bg-custom-card rounded-custom border border-dashed border-custom-color transition-custom text-custom-main">
                    <CreditCard className="w-12 h-12 text-custom-gold opacity-60 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-custom-main">Nenhum cartão cadastrado</h3>
                    <p className="text-custom-main opacity-80 mb-4">Adicione seus cartões para começar a controlar as faturas.</p>
                    <button
                        onClick={adicionarCartao}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-custom-gold text-black rounded-lg hover:opacity-90 transition font-bold"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Primeiro Cartão
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cartoes;
