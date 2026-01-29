const { Client, LocalAuth } = require('whatsapp-web.js');

// Número a verificar (formato: código do país + DDD + número)
const numeroParaVerificar = process.argv[2] || '5592981786455';

console.log('\n🔍 Verificador de Número WhatsApp');
console.log('================================\n');

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'verificador-zdg' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--disable-gpu'
        ]
    }
});

client.on('ready', async () => {
    console.log('✅ Cliente conectado!\n');

    try {
        // Formata o número para o padrão do WhatsApp
        const numeroFormatado = numeroParaVerificar.replace(/\D/g, '');
        const chatId = numeroFormatado + '@c.us';

        console.log(`📱 Verificando número: ${numeroFormatado}`);
        console.log('⏳ Aguarde...\n');

        // Método 1: getNumberId - verifica se o número está registrado
        const numberId = await client.getNumberId(numeroFormatado);

        if (numberId) {
            console.log('✅ NÚMERO EXISTE NO WHATSAPP!');
            console.log(`   ID: ${numberId._serialized}`);
            console.log(`   Número: ${numberId.user}`);
            console.log(`   Servidor: ${numberId.server}`);

            // Tenta obter mais informações do contato
            try {
                const contact = await client.getContactById(numberId._serialized);
                if (contact) {
                    console.log(`\n📋 Informações do Contato:`);
                    console.log(`   Nome: ${contact.pushname || contact.name || 'Não disponível'}`);
                    console.log(`   É Business: ${contact.isBusiness ? 'Sim' : 'Não'}`);
                    console.log(`   É Empresa: ${contact.isEnterprise ? 'Sim' : 'Não'}`);
                }
            } catch (e) {
                // Ignora erro de contato
            }
        } else {
            console.log('❌ NÚMERO NÃO EXISTE NO WHATSAPP');
            console.log('   O número informado não está registrado no WhatsApp.');
        }

    } catch (error) {
        console.error('❌ Erro ao verificar número:', error.message);
    }

    console.log('\n================================');
    console.log('Verificação concluída. Encerrando...\n');

    // Encerra o cliente após a verificação
    await client.destroy();
    process.exit(0);
});

client.on('qr', (qr) => {
    console.log('⚠️  QR Code recebido. Por favor, escaneie no WhatsApp Web.');
    console.log('   Acesse http://localhost:8000 se o bot principal estiver rodando.\n');
});

client.on('authenticated', () => {
    console.log('🔐 Autenticado com sucesso!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
    process.exit(1);
});

console.log('🚀 Iniciando cliente WhatsApp...');
console.log('   (Usando sessão existente do bot-zdg)\n');

client.initialize();
