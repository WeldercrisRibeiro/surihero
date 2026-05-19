# [F-001] Autenticação via Telegram (OTP Flow)

## 📋 Descrição Geral
Esta funcionalidade implementa um fluxo de autenticação robusto e moderno para a plataforma **Suri Tools** baseado na verificação dinâmica do usuário via aplicativo oficial do Telegram. O objetivo é eliminar senhas tradicionais complexas e fluxos de cadastro cansativos, substituindo-os pelo envio imediato de um código temporário de verificação (OTP) de 6 dígitos diretamente no chat privado do usuário com o bot da plataforma. Uma vez logado, o acesso permanece ativo em cache por até 7 dias corridos.

## 🛠️ Detalhes da Implementação
*   **Módulo Afetado**: Core/Auth, Layout do Hub, Serviços de API.
*   **Arquivos Criados/Alterados**:
    *   `src/pages/Login.tsx` (Página de login responsiva com glassmorphism)
    *   `telegram-bot.js` (Bot local em modo de polling)
    *   `api/bot.js` (Webhook em modo serverless na Vercel para produção)
    *   `src/lib/telegram-avatar.tsx` (Componente e utilitários para exibir imagem de perfil real-time)
    *   `src/App.tsx` (Rotas protegidas com base na sessão ativa)
    *   `src/layouts/HubLayout.tsx` (Header atualizado com avatar, nome e role)
    *   `database/init-db.sql` (Estruturação das tabelas de login e perfis no Postgres)
*   **Data de Implementação**: 2026-05-19

## ⚙️ Regras de Negócio Associadas
*   **Cadastro Automatizado**: O login inicial exige Nome e Telefone. Se o telefone não for reconhecido, o sistema faz o cadastro automático com papel default (`user`).
*   **Identificação via Token**: O bot de Telegram fornece o Chat ID do usuário através dos comandos `/start` ou `/token` para vincular a conta de forma imediata e única.
*   **Tempo de Resfriamento (Cooldown)**: Reenvios de código OTP possuem cooldown estrito de **60 segundos** com cronômetro na tela para evitar chamadas excessivas.
*   **Validade de Sessão**: O token gerado expira em **7 dias**. A sessão é limpa automaticamente na expiração ou na ação explícita de logout.

## 🗄️ Estrutura de Banco de Dados (se aplicável)
*   **Tabela `profiles`**:
    *   Adicionadas colunas `name` (TEXT) e `phone` (TEXT, UNIQUE) para identificação dos usuários.
    *   Adicionada coluna `telegram_token` (TEXT) que guarda o Chat ID do usuário.
*   **Tabela `login_sessions`**:
    *   Criada especificamente para associar sessões aos perfis, controlando chaves de segurança e tempos de expiração.