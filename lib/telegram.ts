import { supabase } from './supabase';

interface TelegramSettings {
  botToken?: string;
  chatId?: string;
}

/**
 * Ambil konfigurasi Telegram Bot dari Supabase site_settings atau Environment Variables
 */
export async function getTelegramConfig(): Promise<TelegramSettings> {
  const envToken = process.env.TELEGRAM_BOT_TOKEN;
  const envChatId = process.env.TELEGRAM_CHAT_ID;

  if (envToken && envChatId) {
    return { botToken: envToken, chatId: envChatId };
  }

  try {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();

    const botToken =
      (data?.telegram_bot_token as string) ||
      ((data?.sosmed as any)?.telegram_bot_token as string) ||
      envToken ||
      '';
    const chatId =
      (data?.telegram_chat_id as string) ||
      ((data?.sosmed as any)?.telegram_chat_id as string) ||
      envChatId ||
      '';

    return { botToken, chatId };
  } catch (error) {
    console.warn('Gagal membaca konfigurasi Telegram:', error);
    return { botToken: envToken, chatId: envChatId };
  }
}

/**
 * Kirim pesan notifikasi real-time ke Telegram Bot pengurus yayasan
 */
export async function sendTelegramNotification(
  text: string,
  overrideToken?: string,
  overrideChatId?: string
): Promise<boolean> {
  try {
    let botToken = overrideToken;
    let chatId = overrideChatId;

    if (!botToken || !chatId) {
      const config = await getTelegramConfig();
      botToken = botToken || config.botToken;
      chatId = chatId || config.chatId;
    }

    if (!botToken || !chatId) {
      return false;
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const result = await res.json();
    return !!result.ok;
  } catch (error) {
    console.warn('Telegram notification error:', error);
    return false;
  }
}
