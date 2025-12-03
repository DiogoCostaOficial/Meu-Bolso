const db = require('../utils/database');

async function verificarStatus() {
    try {
        const emailAlvo = 'diogo.grunge@gmail.com';
        console.log(`🔍 Verificando status do usuário: ${emailAlvo}...`);

        const usuarios = await db.getUsuarios();
        const usuario = usuarios.find(u => u.email === emailAlvo);

        if (!usuario) {
            console.error('❌ Usuário não encontrado no banco de dados!');
            return;
        }

        console.log('📋 Dados do usuário no banco:');
        console.log(`- ID: ${usuario.id}`);
        console.log(`- Nome: ${usuario.nome}`);
        console.log(`- Tipo: ${usuario.tipo}`); // Deve ser 'admin'
        console.log(`- Email: ${usuario.email}`);

        if (usuario.tipo !== 'admin') {
            console.log('⚠️ O usuário NÃO é admin. Tentando promover novamente...');
            usuario.tipo = 'admin';
            await db.atualizarUsuario(usuario);
            console.log('✅ Usuário promovido para admin novamente.');
        } else {
            console.log('✅ O usuário já consta como ADMIN no banco de dados.');
        }

    } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
    }
}

verificarStatus();
