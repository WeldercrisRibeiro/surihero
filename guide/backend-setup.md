# Guia de Configuração: Banco de Dados e Autenticação

Este guia fornece o passo a passo para inicializar sua infraestrutura local utilizando o Docker, cadastrar os primeiros usuários, configurar o bot do Telegram para envio de códigos de segurança e o que adaptar para migrar do ambiente Docker para o Supabase.

---

## 1. Criando o Banco de Dados via Docker

O projeto já está preparado com um arquivo `docker-compose.yml` e um script de inicialização `init-db.sql`. Ao iniciar o contêiner do Postgres, o Docker automaticamente detecta o script SQL e cria todas as tabelas (Profiles, Sessões, Kanban).

**Passo a passo:**
1. Certifique-se de ter o [Docker](https://www.docker.com/) e o Docker Compose instalados na sua máquina.
2. Abra um terminal na pasta raiz do seu projeto (onde se encontra o arquivo `docker-compose.yml`).
3. Execute o seguinte comando para iniciar o banco em segundo plano:
   ```bash
   docker-compose up -d db
   ```
4. *Opcional*: Se quiser rodar a API local do PostgREST junto, basta rodar `docker-compose up -d`.

**O que acontece por baixo dos panos?**
O Postgres será iniciado na porta `5432` com o usuário e senha padrão (ou o que você configurou no `.env`). O script `database/init-db.sql` criará as tabelas e também inserirá o usuário inicial do sistema.

---

## 2. Como Criar o Primeiro Usuário

O banco de dados é inicializado automaticamente com os seguintes usuários de teste (presentes no final do arquivo `init-db.sql`):
- **Admin**: Telefone `11999999999`
- **User**: Telefone `11888888888`

Se você quiser **adicionar um usuário real** para si mesmo via banco de dados:

1. Acesse seu banco local. Você pode usar uma ferramenta como DBeaver, TablePlus, ou o próprio terminal do Docker:
   ```bash
   docker exec -it <id_do_container_db> psql -U postgres -d tools
   ```
2. Execute o comando SQL para registrar seu usuário:
   ```sql
   INSERT INTO profiles (name, phone, role) 
   VALUES ('Seu Nome', '11900000000', 'admin');
   ```
*(Substitua pelos seus dados. Lembre-se que o Auth atual é baseado no número de telefone).*

---

## 3. Configurando o Bot do Telegram (Produção)

Para que o envio do código de 6 dígitos passe a ser real no seu ambiente de produção, precisamos criar um robô oficial no Telegram.

**Passo a passo para criar o Bot:**
1. Abra o aplicativo do **Telegram**.
2. Na barra de busca, procure por `@BotFather` (conta oficial com selo de verificação azul).
3. Inicie a conversa e digite o comando: `/newbot`
4. Escolha um nome legível para o bot (ex: *Suri Tools Auth*).
5. Escolha um *username* (obrigatório terminar em `bot`, ex: `suri_auth_bot`).
6. O BotFather enviará uma mensagem de sucesso contendo um **HTTP API Token** (uma string longa parecida com `123456789:ABCdefGhIJKlmNoPQRstUVwxYz`).

**Implementação no Código:**
1. Salve este token nas variáveis de ambiente do seu backend: `TELEGRAM_BOT_TOKEN=8889709065:AAHdS0E58-LKvAiErfaG1_YBUDZg01rX9AI`.
2. Para enviar mensagens, o backend fará uma requisição HTTP `POST` para a API do Telegram:
   ```
   https://api.telegram.org/bot8889709065:AAHdS0E58-LKvAiErfaG1_YBUDZg01rX9AI/sendMessage
   ```
   Com o corpo (JSON):
   ```json
   {
      "chat_id": "ID_DO_USUARIO",
      "text": "Seu código de acesso Suri Tools é: 123456"
   }
   ```
   *(Nota: Para enviar a mensagem, você precisará pedir que o usuário mande um "/start" para o seu bot pelo menos uma vez para o Telegram liberar e expor o `chat_id` do usuário, que deve ser salvo na coluna `telegram_token` no banco).*

---

## 4. O que mudar para rodar com o Supabase?

O projeto está arquitetado para aceitar o Postgres cru do Docker. Para migrar para a nuvem gerenciada do **Supabase**, você precisa fazer as seguintes adaptações:

### A. Executando o Script Inicial
No painel do Supabase, vá até o menu **SQL Editor**, cole todo o conteúdo do arquivo `database/init-db.sql` e execute (Run). Isso criará todas as estruturas e as políticas (RLS) se necessárias.

### B. Variáveis de Ambiente no Frontend
No seu arquivo `.env` do frontend (React/Vite), conecte o cliente oficial do Supabase:
```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key-publica>
```

### C. Bypass de Auth do Supabase (Autenticação Customizada)
Como a autenticação requisitada foi **Nome e Telefone com código Telegram**, você **NÃO** usará o módulo padrão de Auth (Login por E-mail/Senha) nativo do Supabase. 
- Em vez disso, o seu Frontend enviará uma requisição diretamente inserindo a sessão na sua tabela `login_sessions` (ou, no futuro, passando por uma Serverless Edge Function do Supabase que faz essa checagem e envia o código pro Telegram de forma segura).
- As requisições de dados (`select`, `insert` no Kanban, etc.) do frontend devem carregar esse "token de sessão customizado" criado e as verificações de RLS devem validar cruzando com o `login_sessions` em vez de usar `auth.uid()` nativo (caso faça conexões diretas via PostgREST sem Edge Functions).

### D. Webhooks e Edge Functions
A melhor forma de hospedar a lógica de gerar os 6 dígitos e disparar o Bot no Telegram é utilizando as **Edge Functions** do próprio Supabase (escritas em TypeScript/Deno). O React chama a Edge Function enviando o telefone, a função gera o código e faz a chamada HTTP para o Telegram, evitando expor seu token secreto de bot no código React do cliente.
