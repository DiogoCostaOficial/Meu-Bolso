const db = require('../utils/database');

async function promoverParaAdmin() {
    try {
        const emailAlvo = 'diogo.grunge@gmail.com';
        console.log(`🔍 Buscando usuário: ${emailAlvo}...`);

        const usuarios = await db.getUsuarios();
        const usuario = usuarios.find(u => u.email === emailAlvo);

        if (!usuario) {
            console.error('❌ Usuário não encontrado! Faça login com o Google primeiro para criar a conta.');
            return;
        }

        if (usuario.tipo === 'admin') {
            console.log('✅ Este usuário JÁ É um administrador.');
            return;
        }

        // Promove para admin
        usuario.tipo = 'admin';
        await db.atualizarUsuario(usuario);

        console.log('🎉 SUCESSO! O usuário agora é um ADMINISTRADOR.');
        console.log('👉 Ele terá acesso ao Painel Admin no próximo login.');

    } catch (error) {
        console.error('❌ Erro ao promover usuário:', error);
    }
}

promoverParaAdmin();
