// Force env var
process.env.USE_JSON_STORAGE = 'true';
const db = require('./utils/database');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    try {
        const email = 'diogo.grunge@gmail.com'; // Target email
        const newPass = '123456';

        console.log(`Resetting password for ${email}...`);

        const users = await db.getUsuarios();
        const user = users.find(u => u.email === email);

        if (!user) {
            console.log('User not found!');
            // Try finding by name just in case
            const userByName = users.find(u => u.nome.includes('Diogo'));
            if (userByName) {
                console.log(`Found by name: ${userByName.email}. Resetting...`);
                await doReset(userByName, newPass);
            }
            return;
        }

        await doReset(user, newPass);

    } catch (err) {
        console.error(err);
    }
}

async function doReset(user, newPass) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPass, salt);

    user.senha = hash;
    // Also ensure active/verified
    user.ativo = true;
    user.verificado = true;

    await db.atualizarUsuario(user);
    console.log(`✅ Password for ${user.email} reset to: ${newPass}`);
}

resetPassword();
