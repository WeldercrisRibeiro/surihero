import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const token = process.env.VITE_TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ Erro: VITE_TELEGRAM_BOT_TOKEN não está definido no arquivo .env");
  process.exit(1);
}

// Cria o bot que usa polling para buscar novas atualizações
const bot = new TelegramBot(token, { polling: true });

console.log("🤖 Bot do Telegram rodando e aguardando comandos...");
console.log("👉 Tente enviar /token ou /start para o bot no Telegram.");

// Ouve por comandos /token ou /start
bot.onText(/\/(token|start)/, (msg) => {
  const chatId = msg.chat.id;
  
  // Responde exatamente como pedido na imagem
  bot.sendMessage(chatId, `Seu token é: ${chatId}`);
});

// Tratamento de erros
bot.on("polling_error", (error) => {
  console.log("⚠️ Erro de polling:", error.code, error.message);
});
