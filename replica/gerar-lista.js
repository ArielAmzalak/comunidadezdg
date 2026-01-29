const xlsx = require('xlsx');
const readline = require('readline');
const path = require('path');

console.log('\n');
console.log('╔══════════════════════════════════════════════════╗');
console.log('║       📱 GERADOR DE LISTA DE NÚMEROS             ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function perguntar(pergunta) {
    return new Promise(resolve => rl.question(pergunta, resolve));
}

async function main() {
    console.log('Este programa gera uma lista Excel com todos os números');
    console.log('entre dois números que você informar.\n');
    console.log('Exemplo: De 5592981780000 até 5592981789999\n');
    console.log('─'.repeat(50) + '\n');

    const numeroInicio = await perguntar('📍 Número INICIAL (com DDD): ');
    const numeroFim = await perguntar('📍 Número FINAL (com DDD):   ');
    const nomeArquivo = await perguntar('💾 Nome do arquivo (sem .xlsx): ') || 'numeros_gerados';

    // Remove caracteres não numéricos
    const inicio = BigInt(numeroInicio.replace(/\D/g, ''));
    const fim = BigInt(numeroFim.replace(/\D/g, ''));

    if (inicio > fim) {
        console.log('\n❌ Erro: O número inicial deve ser menor que o final!');
        rl.close();
        return;
    }

    const quantidade = Number(fim - inicio) + 1;
    console.log(`\n📊 Serão gerados ${quantidade.toLocaleString()} números...`);

    if (quantidade > 1000000) {
        console.log('\n⚠️  ATENÇÃO: Mais de 1 milhão de números pode demorar muito e');
        console.log('    consumir muita memória. Considere dividir em partes menores.');
        const confirma = await perguntar('\nDeseja continuar? (s/n): ');
        if (confirma.toLowerCase() !== 's') {
            console.log('\n❌ Operação cancelada.');
            rl.close();
            return;
        }
    }

    console.log('\n⏳ Gerando lista...');

    // Gera os números
    const numeros = [];
    let atual = inicio;
    let contador = 0;

    while (atual <= fim) {
        numeros.push([atual.toString()]);
        atual++;
        contador++;

        // Mostra progresso a cada 10000 números
        if (contador % 10000 === 0) {
            process.stdout.write(`\r   Gerados: ${contador.toLocaleString()} números...`);
        }
    }

    console.log(`\r   ✅ Gerados: ${contador.toLocaleString()} números!     `);

    // Embaralha a lista (Fisher-Yates shuffle)
    console.log('\n🔀 Embaralhando números (ordem aleatória)...');
    for (let i = numeros.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
    }
    console.log('   ✅ Lista embaralhada!');

    // Cria o arquivo Excel
    console.log('\n💾 Salvando arquivo Excel...');

    const wsData = [['Número'], ...numeros];
    const ws = xlsx.utils.aoa_to_sheet(wsData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Números');

    const caminhoArquivo = `${nomeArquivo}.xlsx`;
    xlsx.writeFile(wb, caminhoArquivo);

    console.log('\n╔══════════════════════════════════════╗');
    console.log('║            ✅ CONCLUÍDO!             ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  📁 Arquivo: ${nomeArquivo}.xlsx`);
    console.log(`║  📱 Total:   ${quantidade.toLocaleString()} números`);
    console.log(`║  📍 De:      ${inicio}`);
    console.log(`║  📍 Até:     ${fim}`);
    console.log('╚══════════════════════════════════════╝');

    rl.close();

    console.log('\nPressione qualquer tecla para sair...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => process.exit(0));
}

main();
