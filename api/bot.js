import TelegramBot from 'node-telegram-bot-api';

const token = process.env.VITE_TELEGRAM_BOT_TOKEN;

export default async function handler(req, res) {
  // Telegram webhooks always send POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!token) {
    console.error("❌ Erro: VITE_TELEGRAM_BOT_TOKEN não está definido nas variáveis de ambiente da Vercel.");
    return res.status(500).json({ error: "Bot token not configured on server." });
  }

  try {
    const { body } = req;

    // Verifica se a atualização recebida contém uma mensagem válida do Telegram
    if (body && body.message) {
      const msg = body.message;
      const chatId = msg.chat.id;
      const text = msg.text;

      // Responde ao comando /token ou /start
      if (text && /\/(token|start)/.test(text)) {
        const bot = new TelegramBot(token);
        await bot.sendMessage(chatId, `Seu token é: ${chatId}`);
      }
    }

    // Sempre responda 200 OK para o Telegram confirmar o recebimento
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Erro no handler de webhook:", error);
    // Retorna 500 para podermos rastrear possíveis erros nos logs da Vercel
    return res.status(500).json({ error: error.message });
  }
}
