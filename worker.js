export default {
  async fetch(request, env, ctx) {
    const BOT_TOKEN = "8997481639:AAHGAzctlqx4fmg5Bm3OKhck71w7MBIKPEw";
    const CHANNEL_USERNAME = "@RoobaStudio";

    const SOURCES = {
      "post1": "https://youtu.be/z-Xl9tGqH14",
      "post2": "https://youtube.com/playlist?list=PLA2v3WkONvF4",
      "post3": "https://youtu.be/imbIsNAvUpM",
    };

    if (request.method !== "POST") {
      return new Response("Bot is running", { status: 200 });
    }

    const update = await request.json();

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const text = update.message.text;
      const args = text.split(" ");
      const sourceKey = args[1] || null;

      const memberRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_USERNAME}&user_id=${userId}`
      );
      const memberData = await memberRes.json();
      const status = memberData.result ? memberData.result.status : null;
      const isMember = ["creator", "administrator", "member"].includes(status);

      let replyText = "";
      let replyMarkup = null;

      if (!isMember) {
        replyText = "❌ To get the source, please join our channel first.";
        replyMarkup = {
          inline_keyboard: [[
            { text: "📣 Join Our Channel", url: `https://t.me/${CHANNEL_USERNAME.replace("@", "")}` }
          ]]
        };
      } else if (sourceKey && SOURCES[sourceKey]) {
        replyText = `🔗 Source:\n${SOURCES[sourceKey]}`;
      } else if (sourceKey) {
        replyText = "❌ Source not found.";
      } else {
        replyText = "✅ You are a member!\nTo get the source, use the link inside the channel post.";
      }

      const payload = { chat_id: chatId, text: replyText };
      if (replyMarkup) payload.reply_markup = replyMarkup;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    return new Response("OK", { status: 200 });
  }
};
