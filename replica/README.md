# 📋 Verificador de WhatsApp

Sistema para verificar se números de telefone existem no WhatsApp e gerar listas de números.

---

## 📦 Requisitos

- **Node.js** versão 18 ou superior
  - Download: https://nodejs.org/

---

## 🚀 Instalação

1. Abra o terminal (PowerShell ou CMD) na pasta do projeto

2. Execute o comando para instalar as dependências:
   ```
   npm install
   ```

3. Aguarde a instalação terminar

---

## 📱 Como Usar

### 1. Gerar Lista de Números

Cria uma planilha Excel com números em sequência (embaralhados aleatoriamente).

- **Clique duplo** em `gerar-lista.bat`
- Informe o número inicial (ex: `5592981780000`)
- Informe o número final (ex: `5592981789999`)
- Informe o nome do arquivo
- A lista será criada em ordem aleatória

---

### 2. Verificar Lista no WhatsApp

Verifica quais números da planilha existem no WhatsApp.

- **Arraste** o arquivo `.xlsx` para cima de `verificar.bat`
- Na primeira vez, escaneie o **QR Code** com seu WhatsApp
- Aguarde a verificação (3-6 segundos por número)
- O resultado será salvo em `nomedoarquivo_resultado.xlsx`

---

## ⚙️ Configurações

Edite o arquivo `verificar-lista.js` para ajustar:

```javascript
// Delay entre verificações (em milissegundos)
const DELAY_MIN_MS = 3000;   // Mínimo: 3 segundos
const DELAY_MAX_MS = 6000;   // Máximo: 6 segundos

// Coluna dos números no Excel
const COLUNA_PADRAO = 'A';
```

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `verificar-lista.js` | Script principal de verificação |
| `verificar.bat` | Atalho para arrastar Excel e verificar |
| `gerar-lista.js` | Gerador de lista de números |
| `gerar-lista.bat` | Atalho para gerar lista |
| `package.json` | Dependências do projeto |

---

## ⚠️ Observações

- A sessão do WhatsApp fica salva na pasta `.wwebjs_auth`
- Se precisar reconectar, delete essa pasta e escaneie o QR novamente
- Evite delays muito curtos (< 2 segundos) para não ser bloqueado
- O resultado é salvo após cada número verificado

---

## 🔧 Solução de Problemas

**Erro "Arquivo não encontrado"**
- Verifique se o caminho do arquivo está correto
- Use o caminho completo ou coloque o Excel na mesma pasta

**Erro de conexão**
- Delete a pasta `.wwebjs_auth` e tente novamente
- Verifique sua conexão com a internet

**Script trava após autenticar**
- Aguarde até 60 segundos, o script tem timeout automático
- Se persistir, feche e tente novamente

---

Desenvolvido para verificação de números WhatsApp.
