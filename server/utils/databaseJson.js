const fs = require('fs').promises;
const path = require('path');

// Simple UUID generator since 'uuid' package is missing
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const DATA_FILE = path.join(__dirname, '../data/database.json');
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
const ensureDataDir = async () => {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
};

const readData = async () => {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const parsed = JSON.parse(data);

        // MIGRATION/COMPATIBILITY FIX:
        // If file uses 'users' (old) or 'usuarios' (new), normalize to 'usuarios'
        if (parsed.users && !parsed.usuarios) {
            parsed.usuarios = parsed.users;
            delete parsed.users;
            // Optionally write back immediately, but writeData will handle it on next save
        }

        if (!parsed.usuarios) parsed.usuarios = [];
        return parsed;
    } catch (error) {
        if (error.code === 'ENOENT') {
            const initialData = { usuarios: [] };
            await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        throw error;
    }
};

const writeData = async (data) => {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
};

const inicializarDB = async () => {
    console.log('✅ Conectado ao sistema de arquivos (JSON)');
    await readData();
};

const getUsuarios = async () => {
    const data = await readData();
    return (data.usuarios || []).map(u => ({ ...u, ativo: true }));
};

const adicionarUsuario = async (usuario) => {
    const data = await readData();
    if (!data.usuarios) data.usuarios = [];
    data.usuarios.push(usuario);
    await writeData(data);
    return true;
};

const atualizarUsuario = async (usuario) => {
    const data = await readData();
    if (!data.usuarios) return false;
    const index = data.usuarios.findIndex(u => u.id === usuario.id);
    if (index !== -1) {
        data.usuarios[index] = { ...data.usuarios[index], ...usuario };
        await writeData(data);
        return true;
    }
    return false;
};

const deletarUsuario = async (userId) => {
    const data = await readData();
    if (!data.usuarios) return false;
    const initialLength = data.usuarios.length;
    data.usuarios = data.usuarios.filter(u => u.id !== userId);

    // Also delete user specific data file if exists
    const userFile = path.join(DATA_DIR, `USER_DATA_${userId}.json`);
    try {
        await fs.unlink(userFile);
    } catch (e) {
        // Ignore if file doesn't exist
    }

    await writeData(data);
    return data.usuarios.length < initialLength;
};

// USER DATA SPECIFIC FUNCTIONS
const getUserDataFile = (userId) => path.join(DATA_DIR, `USER_DATA_${userId}.json`);

const buscarDadosUsuario = async (userId) => {
    try {
        const filePath = getUserDataFile(userId);
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        // Return empty structure if no data found
        return {
            receitas: [],
            despesas: [],
            categorias: [],
            orcamentos: [],
            cartoes: []
        };
    }
};

const salvarDadosUsuario = async (userId, dados) => {
    try {
        const filePath = getUserDataFile(userId);

        // Read existing data to merge if needed
        let currentData = {
            receitas: [],
            despesas: [],
            categorias: [],
            orcamentos: [],
            cartoes: []
        };
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            currentData = JSON.parse(fileContent);
        } catch (e) {
            // New file
        }

        // Merge logic for orcamentos
        let finalOrcamentos = currentData.orcamentos || [];
        if (dados.orcamentos && Array.isArray(dados.orcamentos)) {
            const incomingMonths = new Set(dados.orcamentos.map(o => o.mes));
            // Remove existing budgets for the same months
            finalOrcamentos = finalOrcamentos.filter(o => !incomingMonths.has(o.mes));
            // Add new budgets
            finalOrcamentos = [...finalOrcamentos, ...dados.orcamentos];
        }

        const newData = {
            receitas: dados.receitas || currentData.receitas || [],
            despesas: dados.despesas || currentData.despesas || [],
            categorias: dados.categorias || currentData.categorias || [],
            orcamentos: finalOrcamentos,
            cartoes: dados.cartoes || currentData.cartoes || []
        };

        await fs.writeFile(filePath, JSON.stringify(newData, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar JSON:', error);
        return false;
    }
};


const adicionarTransacao = async (userId, transacao) => {
    try {
        const dados = await buscarDadosUsuario(userId);
        
        const novaTransacao = {
            id: transacao.id,
            descricao: transacao.descricao,
            valor: parseFloat(transacao.valor),
            data: transacao.data,
            categoria: transacao.categoria,
            subcategoria: transacao.subcategoria || null,
            status: transacao.status || null,
            statusPagamento: transacao.statusPagamento || transacao.status_pagamento || null,
            parcelado: transacao.parcelado || false,
            parcelas: transacao.parcelas || transacao.parcelas_total || null,
            parcelaAtual: transacao.parcelaAtual || transacao.parcela_atual || null,
            observacao: transacao.observacao || transacao.observacoes || null
        };

        if (transacao.tipo === 'receita') {
            if (!dados.receitas) dados.receitas = [];
            dados.receitas.push(novaTransacao);
        } else if (transacao.tipo === 'despesa') {
            if (!dados.despesas) dados.despesas = [];
            dados.despesas.push(novaTransacao);
        } else {
            throw new Error(`Tipo de transação inválido: ${transacao.tipo}`);
        }

        await salvarDadosUsuario(userId, dados);
        return true;
    } catch (err) {
        console.error('Erro ao adicionar transação no JSON:', err);
        return false;
    }
};

const atualizarTransacao = async (userId, transacaoId, transacao) => {
    try {
        const dados = await buscarDadosUsuario(userId);
        
        let atualizado = false;
        
        const mapTransacao = (existing) => ({
            ...existing,
            descricao: transacao.descricao !== undefined ? transacao.descricao : existing.descricao,
            valor: transacao.valor !== undefined ? parseFloat(transacao.valor) : existing.valor,
            data: transacao.data !== undefined ? transacao.data : existing.data,
            categoria: transacao.categoria !== undefined ? transacao.categoria : existing.categoria,
            subcategoria: transacao.subcategoria !== undefined ? transacao.subcategoria : existing.subcategoria,
            status: transacao.status !== undefined ? transacao.status : existing.status,
            statusPagamento: transacao.statusPagamento !== undefined ? transacao.statusPagamento : (transacao.status_pagamento !== undefined ? transacao.status_pagamento : existing.statusPagamento),
            parcelado: transacao.parcelado !== undefined ? transacao.parcelado : existing.parcelado,
            parcelas: transacao.parcelas !== undefined ? transacao.parcelas : (transacao.parcelas_total !== undefined ? transacao.parcelas_total : existing.parcelas),
            parcelaAtual: transacao.parcelaAtual !== undefined ? transacao.parcelaAtual : (transacao.parcela_atual !== undefined ? transacao.parcela_atual : existing.parcelaAtual),
            observacao: transacao.observacao !== undefined ? transacao.observacao : (transacao.observacoes !== undefined ? transacao.observacoes : existing.observacao)
        });

        if (dados.receitas) {
            const index = dados.receitas.findIndex(r => r.id === transacaoId);
            if (index !== -1) {
                dados.receitas[index] = mapTransacao(dados.receitas[index]);
                atualizado = true;
            }
        }
        
        if (!atualizado && dados.despesas) {
            const index = dados.despesas.findIndex(d => d.id === transacaoId);
            if (index !== -1) {
                dados.despesas[index] = mapTransacao(dados.despesas[index]);
                atualizado = true;
            }
        }

        if (atualizado) {
            await salvarDadosUsuario(userId, dados);
            return true;
        }
        return false;
    } catch (err) {
        console.error('Erro ao atualizar transação no JSON:', err);
        return false;
    }
};

const deletarTransacao = async (userId, transacaoId) => {
    try {
        const dados = await buscarDadosUsuario(userId);
        let deletado = false;

        if (dados.receitas) {
            const initialLength = dados.receitas.length;
            dados.receitas = dados.receitas.filter(r => r.id !== transacaoId);
            if (dados.receitas.length < initialLength) deletado = true;
        }

        if (!deletado && dados.despesas) {
            const initialLength = dados.despesas.length;
            dados.despesas = dados.despesas.filter(d => d.id !== transacaoId);
            if (dados.despesas.length < initialLength) deletado = true;
        }

        if (deletado) {
            await salvarDadosUsuario(userId, dados);
            return true;
        }
        return false;
    } catch (err) {
        console.error('Erro ao deletar transação no JSON:', err);
        return false;
    }
};

module.exports = {
    inicializarDB,
    getUsuarios,
    adicionarUsuario,
    atualizarUsuario,
    deletarUsuario,
    buscarDadosUsuario,
    salvarDadosUsuario,
    adicionarTransacao,
    atualizarTransacao,
    deletarTransacao
};
