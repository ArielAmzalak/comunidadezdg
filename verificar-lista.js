const { Client, LocalAuth } = require('whatsapp-web.js');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// ============================================
// 🔧 CONFIGURAÇÕES
// ============================================
const DELAY_MIN_MS = 3000;
const DELAY_MAX_MS = 6000;
const COLUNA_PADRAO = 'A';
const MAX_RETRIES = 3;
const TIMEOUT_QR_MINUTOS = 5; // Tempo máximo para escanear QR Code
// ============================================

const ARQUIVO_EXCEL = process.argv[2];

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║     📋 VERIFICADOR DE WHATSAPP - LISTA EXCEL     ║');
console.log('╚══════════════════════════════════════════════════╝\n');

const delay = (min, max) => {
    const ms = max ? Math.floor(Math.random() * (max - min + 1)) + min : min;
    return new Promise(resolve => setTimeout(resolve, ms));
};

function aguardarTecla() {
    console.log('\nPressione ENTER para sair...');
    process.stdin.resume();
    process.stdin.once('data', () => process.exit(0));
}

if (!ARQUIVO_EXCEL) {
    console.log('❌ Arraste um arquivo .xlsx para o verificar.bat\n');
    aguardarTecla();
} else if (!fs.existsSync(ARQUIVO_EXCEL)) {
    console.log(`❌ Arquivo não encontrado: ${ARQUIVO_EXCEL}\n`);
    aguardarTecla();
} else {
    iniciar();
}

async function iniciar() {
    console.log(`📂 Arquivo: ${path.basename(ARQUIVO_EXCEL)}`);
    console.log(`⏱️  Delay: ${DELAY_MIN_MS / 1000}s a ${DELAY_MAX_MS / 1000}s`);
    console.log(`⏰ Timeout QR: ${TIMEOUT_QR_MINUTOS} minutos\n`);
    console.log('🚀 Conectando...\n');

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: 'verificador-lista' }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        }
    });

    let conectado = false;
    let qrExibido = false;
    let autenticado = false;

    client.on('qr', (qr) => {
        qrExibido = true;
        console.log(`\n📱 Escaneie o QR Code (você tem ${TIMEOUT_QR_MINUTOS} minutos):\n`);
        require('qrcode-terminal').generate(qr, { small: true });
        console.log('\n⏳ Aguardando leitura do QR Code...');
    });

    client.on('loading_screen', (percent) => {
        process.stdout.write(`\r⏳ Carregando: ${percent}%   `);
    });

    client.on('authenticated', () => {
        autenticado = true;
        console.log('\n🔐 Autenticado!');
    });

    client.on('ready', async () => {
        if (conectado) return; // Evita executar duas vezes
        conectado = true;
        console.log('\n✅ Conectado!\n');
        await executarVerificacao(client);
    });

    client.on('disconnected', async (reason) => {
        console.log(`\n⚠️ Desconectado: ${reason}`);
    });

    try {
        await client.initialize();

        // Fallback: se autenticou mas o ready não disparou após 30s, tenta executar
        setTimeout(async () => {
            if (autenticado && !conectado) {
                console.log('\n⚠️ Evento ready não disparou, tentando executar...');
                conectado = true;
                await executarVerificacao(client);
            }
        }, 30000);

    } catch (err) {
        console.error('❌ Erro:', err.message);
        aguardarTecla();
    }

    // Timeout apenas para QR Code - dá tempo para escanear
    setTimeout(async () => {
        if (!conectado && qrExibido) {
            console.log(`\n⏰ Tempo esgotado (${TIMEOUT_QR_MINUTOS} minutos).`);
            console.log('   Reinicie o script para tentar novamente.');
            try { await client.destroy(); } catch (e) { }
            aguardarTecla();
        }
    }, TIMEOUT_QR_MINUTOS * 60 * 1000);
}

async function executarVerificacao(client) {
    try {
        await verificarLista(client);
    } catch (error) {
        console.error('\n❌ Erro:', error.message);
    }

    console.log('\n🔌 Encerrando...');
    try { await client.destroy(); } catch (e) { }
    console.log('✅ Concluído!');
    aguardarTecla();
}

async function verificarNumero(client, numero, tentativa = 1) {
    try {
        const numberId = await client.getNumberId(numero);

        if (numberId) {
            let nome = '';
            try {
                const contact = await client.getContactById(numberId._serialized);
                nome = contact.pushname || contact.name || '';
            } catch (e) { }
            return { existe: true, nome };
        }
        return { existe: false, nome: '' };
    } catch (error) {
        if (tentativa < MAX_RETRIES) {
            await delay(2000);
            return verificarNumero(client, numero, tentativa + 1);
        }
        return { existe: null, nome: '', erro: error.message };
    }
}

async function verificarLista(client) {
    const workbook = xlsx.readFile(ARQUIVO_EXCEL);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const dados = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const colunaIndex = COLUNA_PADRAO.charCodeAt(0) - 65;

    const numeros = dados
        .map(row => row[colunaIndex])
        .filter(num => num != null && num.toString().trim() !== '')
        .map(num => num.toString().replace(/\D/g, ''));

    console.log(`📱 Total: ${numeros.length} números\n`);
    console.log('─'.repeat(50));

    const resultados = [];
    let existem = 0, naoExistem = 0, erros = 0;

    for (let i = 0; i < numeros.length; i++) {
        const numero = numeros[i];
        const prog = `[${String(i + 1).padStart(5)}/${numeros.length}]`;

        try {
            const resultado = await verificarNumero(client, numero);

            if (resultado.existe === true) {
                existem++;
                console.log(`${prog} ✅ ${numero}${resultado.nome ? ' (' + resultado.nome + ')' : ''}`);
                resultados.push({ numero, existe: 'SIM', nome: resultado.nome });
            } else if (resultado.existe === false) {
                naoExistem++;
                console.log(`${prog} ❌ ${numero}`);
                resultados.push({ numero, existe: 'NÃO', nome: '' });
            } else {
                erros++;
                console.log(`${prog} ⚠️  ${numero}`);
                resultados.push({ numero, existe: 'ERRO', nome: '' });
            }
        } catch (error) {
            // Captura erro de binding ou outros erros críticos
            if (error.message && error.message.includes('already exists')) {
                console.log(`\n⚠️  Erro de sessão no número ${i + 1}. Salvando progresso...`);
                salvarResultado(resultados, '_resultado');
                console.log(`💾 Progresso salvo! Reinicie o script para continuar.`);
                console.log(`   Os números já verificados estão no arquivo _resultado.xlsx`);
                throw error; // Re-lança para encerrar
            }
            erros++;
            console.log(`${prog} ⚠️  ${numero} (erro)`);
            resultados.push({ numero, existe: 'ERRO', nome: '' });
        }

        // Salva progresso após cada número (durante o delay)
        salvarResultado(resultados, '_resultado');

        if (i < numeros.length - 1) {
            await delay(DELAY_MIN_MS, DELAY_MAX_MS);
        }
    }

    console.log('─'.repeat(50));
    console.log(`\n📊 RESULTADO: ✅${existem} ❌${naoExistem} ⚠️${erros} | Total: ${numeros.length}`);

    salvarResultado(resultados, '_verificado');
}

function salvarResultado(resultados, sufixo) {
    const nomeBase = path.basename(ARQUIVO_EXCEL, '.xlsx');
    const diretorio = path.dirname(ARQUIVO_EXCEL);
    const arquivo = path.join(diretorio, `${nomeBase}${sufixo}.xlsx`);

    const wsData = [['Número', 'Existe', 'Nome']];
    resultados.forEach(r => wsData.push([r.numero, r.existe, r.nome]));

    const ws = xlsx.utils.aoa_to_sheet(wsData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Resultado');
    xlsx.writeFile(wb, arquivo);

    if (sufixo === '_verificado') {
        console.log(`\n💾 Salvo: ${arquivo}`);
    }
}
