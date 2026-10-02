import os
import threading
from flask import Flask
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

BOT_TOKEN = os.environ.get("TELEGRAM_TOKEN")
CHANNEL_USERNAME = "@RoobaStudio"

SOURCES = {
    "post1": "https://youtu.be/z-Xl9tGqH14",
    "post2": "https://youtube.com/playlist?list=PLA2v3WkONvF4",
    "post3": "https://youtu.be/imbIsNAvUpM",
}

bot = telebot.TeleBot(BOT_TOKEN)
app = Flask(__name__)

@app.route('/')
def index():
    return "Bot is running"

@app.route('/health')
def health():
    return "OK"

def run_flask():
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)

def is_member(user_id):
    try:
        member = bot.get_chat_member(CHANNEL_USERNAME, user_id)
        return member.status in ["creator", "administrator", "member"]
    except Exception:
        return False

@bot.message_handler(commands=["start"])
def start(message):
    user_id = message.from_user.id
    args = message.text.split()
    source_key = args[1] if len(args) > 1 else None

    if not is_member(user_id):
        markup = InlineKeyboardMarkup()
        btn = InlineKeyboardButton(
            "📣 Join Our Channel",
            url=f"https://t.me/{CHANNEL_USERNAME.replace('@', '')}"
        )
        markup.add(btn)
        bot.send_message(
            message.chat.id,
            "❌ To get the source, please join our channel first.",
            reply_markup=markup
        )
        return

    if source_key and source_key in SOURCES:
        bot.send_message(message.chat.id, f"🔗 Source:\n{SOURCES[source_key]}")
    elif source_key:
        bot.send_message(message.chat.id, "❌ Source not found.")
    else:
        bot.send_message(
            message.chat.id,
            "✅ You are a member!\nTo get the source, use the link inside the channel post."
        )

if __name__ == "__main__":
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()
    bot.polling(none_stop=True)
