import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, CreditCard, Calendar, GraduationCap } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useEdu } from '../contexts/EduContext';
import EduHelpButton from '../components/EduHelpButton';
import CurrencySelector from '../components/CurrencySelector';

const Cartoes = () => {
    const { userData, updateUserData } = useAuth();
    const { formatCurrency } = useCurrency();
    const { showLesson } = useEdu();
    const [cartoes, setCartoes] = useState([]);
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);

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
            const userData = response.data.dados || {};

            if (Array.isArray(userData.cartoes)) {
                setCartoes(userData.cartoes);
            } else {
                setCartoes([]);
            }
        } catch (error) {
            console.error('Erro ao carregar cartões:', error);
            toast.error('Erro ao carregar dados dos cartões');
        } finally {
            setLoading(false);
        }
    };

    const salvarDados = async () => {
        try {
            setSalvando(true);
            const response = await api.get('/user/dados');
            const userData = response.data.dados || {};

            const updatedData = {
                ...userData,
                cartoes: cartoes
            };

            await api.post('/user/dados', { dados: updatedData });
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
            valores: {}
        };
        setCartoes([...cartoes, novoCartao]);
    };

    const removerCartao = (id) => {
        if (confirm('Tem certeza que deseja remover este cartão?')) {
            setCartoes(cartoes.filter(c => c.id !== id));
        }
    };

    const atualizarNomeCartao = (id, novoNome) => {
        setCartoes(cartoes.map(c =>
            c.id === id ? { ...c, nome: novoNome } : c
        ));
    };

    const atualizarValor = (id, mesIndex, valor) => {
        const chaveMes = `${anoSelecionado}-${mesesChaves[mesIndex]}`;
        const valorNumerico = parseFloat(valor) || 0;

        setCartoes(cartoes.map(c => {
            if (c.id === id) {
                return {
                    ...c,
                    valores: {
                        ...c.valores,
                        [chaveMes]: valorNumerico
                    }
                };
            }
            return c;
        }));
    };

    const getValor = (cartao, mesIndex) => {
        const chaveMes = `${anoSelecionado}-${mesesChaves[mesIndex]}`;
        return cartao.valores?.[chaveMes] || '';
    };

    const calcularTotalMes = (mesIndex) => {
        const chaveMes = `${anoSelecionado}-${mesesChaves[mesIndex]}`;
        return cartoes.reduce((acc, cartao) => {
            return acc + (cartao.valores?.[chaveMes] || 0);
        }, 0);
    };

    const calcularTotalCartao = (cartao) => {
        return mesesChaves.reduce((acc, mesChave) => {
            const chave = `${anoSelecionado}-${mesChave}`;
            return acc + (cartao.valores?.[chave] || 0);
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
                        <p className="text-custom-main opacity-80 text-sm">Acompanhe suas faturas mensais</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <CurrencySelector />
                    <EduHelpButton topic="cartoes" />
                    <div className="flex items-center gap-2 bg-custom-primary/30 dark:bg-slate-800/40 px-3 py-2 rounded-lg border border-custom-color">
                        <Calendar className="w-4 h-4 text-custom-gold" />
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
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Cartão
                    </button>

                    <button
                        onClick={salvarDados}
                        disabled={salvando}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
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
                                    <td className="px-4 py-2 sticky left-0 bg-custom-card dark:bg-slate-900 group-hover:bg-custom-primary/20 dark:group-hover:bg-slate-800/40 z-10 shadow-sm border-r border-custom-color">
                                        <input
                                            type="text"
                                            value={cartao.nome}
                                            onChange={(e) => atualizarNomeCartao(cartao.id, e.target.value)}
                                            className="w-full px-2 py-1 border border-transparent hover:border-custom-color focus:border-blue-500 rounded font-medium text-custom-main bg-transparent focus:bg-custom-card focus:outline-none transition-colors"
                                            placeholder="Nome do Cartão"
                                        />
                                    </td>
                                    {meses.map((_, index) => (
                                        <td key={index} className="px-2 py-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={getValor(cartao, index)}
                                                onChange={(e) => atualizarValor(cartao.id, index, e.target.value)}
                                                className="w-full px-2 py-1 text-right border border-transparent hover:border-custom-color focus:border-blue-500 rounded text-custom-main/80 focus:text-custom-main bg-transparent focus:bg-custom-card focus:outline-none transition-colors text-sm"
                                                placeholder="0,00"
                                            />
                                        </td>
                                    ))}
                                    <td className="px-4 py-2 text-right font-bold text-custom-main bg-custom-primary/20 dark:bg-slate-800/35 border-l border-r border-custom-color">
                                        {formatCurrency(calcularTotalCartao(cartao))}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <button
                                            onClick={() => removerCartao(cartao.id)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
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
