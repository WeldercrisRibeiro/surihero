# Guia Completo de Deploy em Produção

Este guia descreve as melhores práticas e passos necessários para colocar o ecossistema **Suri Tools** online em um ambiente de produção seguro, escalável e de alta disponibilidade.

---

## 1. Arquitetura Recomendada para Produção

Para evitar dores de cabeça com gerenciamento de servidores, recomendamos a seguinte arquitetura descentralizada:
- **Frontend (React/Vite)**: Hospedado na **Vercel** (gratuito e otimizado).
- **Banco de Dados**: Hospedado no **Supabase** (Postgres gerenciado, backup automático).
- **Telegram Bot**: Hospedado em uma **VPS simples** (ex: Hostinger, DigitalOcean) usando PM2, ou migrado para **Webhooks** via Serverless.

---

## 2. Deploy do Frontend (Vercel)

A Vercel é a plataforma ideal para o seu projeto Vite.

**Passos:**
1. Suba todo o seu código para um repositório no **GitHub**.
2. Crie uma conta na [Vercel](https://vercel.com/) e clique em **"Add New Project"**.
3. Importe o repositório do seu GitHub.
4. **Variáveis de Ambiente (MUITO IMPORTANTE):** Na tela de configuração do projeto na Vercel, adicione as mesmas variáveis do seu `.env`:
   - `VITE_USE_LOCAL_API=false` (Para forçar o uso da nuvem)
   - `VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=<sua-chave-anon-do-supabase>`
   - `VITE_TELEGRAM_BOT_TOKEN=<seu-token-do-botfather>`
5. Clique em **Deploy**. A Vercel fará o `npm run build` automaticamente e te dará um link público com certificado SSL (HTTPS) grátis.

---

## 3. Deploy do Banco de Dados (Supabase)

Em produção, rodar o banco no Docker da sua própria máquina não é viável para o público acessar. O Supabase resolve isso.

**Passos:**
1. Crie um projeto no [Supabase](https://supabase.com/).
2. Vá até o menu **SQL Editor**.
3. Copie todo o conteúdo do arquivo `database/init-db.sql` e execute (Run). Isso recriará todas as suas tabelas (`profiles`, `login_sessions`, `kanban_columns`, etc) na nuvem.
4. Vá em **Project Settings > API** para pegar a sua URL e a sua Chave Pública (Anon Key) e insira-as no passo anterior da Vercel.

---

## 4. Deploy do Bot do Telegram

Atualmente, o arquivo `telegram-bot.js` usa o método de `polling` (ele fica rodando continuamente perguntando ao Telegram se há novas mensagens). **Isso não funciona na Vercel**, pois a Vercel "desliga" a função após alguns segundos (Serverless).

Você tem duas opções para produção:

### Opção A: VPS Tradicional (Mais Fácil)
Se você tem uma máquina virtual (VPS) na Hostinger, AWS ou DigitalOcean:
1. Acesse sua VPS por SSH.
2. Instale o Node.js e faça um clone do seu projeto.
3. Instale o pacote PM2 globalmente: `npm install -g pm2`
4. Inicie o bot em segundo plano:
   ```bash
   pm2 start telegram-bot.js --name "suri-bot"
   ```
5. O PM2 vai garantir que se o bot der erro ou o servidor reiniciar, o script ligue sozinho novamente.

### Opção B: Webhooks em Serverless (Mais Moderno, Custo Zero) ✅ **Já Configurado!**
Em vez de deixar um script rodando 24 horas por dia, você avisa o Telegram para mandar um "POST" para uma URL sua sempre que alguém enviar uma mensagem.

**O que já foi feito para você:**
1. A pasta `api/` foi criada na raiz do projeto.
2. O arquivo `api/bot.js` foi configurado como uma API Route serverless da Vercel que processa as mensagens recebidas do Telegram de forma rápida e gratuita.
3. O arquivo `vercel.json` foi atualizado para garantir que rotas que iniciam com `/api/` não sejam interceptadas pelas rotas SPA do React, garantindo que as chamadas ao bot funcionem perfeitamente.

**Como ativar o seu Webhook em Produção:**
1. Faça o deploy do projeto na Vercel (garantindo que `VITE_TELEGRAM_BOT_TOKEN` esteja nas variáveis de ambiente do painel da Vercel).
2. Obtenha a URL do seu site na Vercel (ex: `https://seu-site.vercel.app`).
3. Abra o seu navegador e acesse a seguinte URL, substituindo `<SEU_TOKEN>` pelo token do seu bot do Telegram e `https://seu-site.vercel.app` pelo seu domínio real da Vercel:
   ```text
   https://api.telegram.org/bot<SEU_TOKEN>/setWebhook?url=https://seu-site.vercel.app/api/bot
   ```
4. O Telegram deverá retornar uma resposta em JSON como esta:
   ```json
   {
     "ok": true,
     "result": true,
     "description": "Webhook was set"
   }
   ```
5. Pronto! Agora, sempre que um usuário enviar `/start` ou `/token` ao bot, a Vercel executará instantaneamente a função serverless em milissegundos sem cobrar nada.

*(Recomendamos a Opção B caso não queira pagar por um servidor apenas para rodar o bot).*

---

## 5. Cuidados Adicionais de Segurança

- **NUNCA** faça *commit* do seu arquivo `.env` para o GitHub (ele já deve estar listado no seu `.gitignore`).
- Quando migrar 100% para o Supabase, configure o **RLS (Row Level Security)** nas tabelas via painel do Supabase, garantindo que o "User A" não consiga ler via API o Kanban do "User B".
- Para envios reais em produção, seu React não deve disparar o token direto do navegador chamando a API do Telegram. O ideal é que o React chame uma API sua (na Vercel ou Supabase Edge Functions), e essa API (escondida do usuário) faz a requisição pro Telegram.
