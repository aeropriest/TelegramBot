const TelegramBot = require("node-telegram-bot-api");

exports.TelegramBotWebHook = async (req, res) => {
  let ctx = req.body.callback_query || req.body.message;
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_API_TOKEN);
  let message = "Hello from TelegramBotWebHook!";

  try {
    //ctx.message.message_id => means the message we sent
    //ctx.message_id => means message user sent
    ctx.chatId = ctx.id ? ctx.message.chat.id : ctx.chat.id;
    ctx.msgId = ctx.id ? ctx.message.message_id : ctx.message_id;
    ctx.first_name = ctx.id ? ctx.message.from.first_name : ctx.from.first_name;
    ctx.last_name = ctx.id ? ctx.message.from.last_name : ctx.from.last_name;
    console.log(
      `======================== ${ctx.msgId} =========================`
    );
  } catch (error) {
    console.log(error);
    console.error(error);
    message = error.message;
  }
  res.status(200).send(message);
};
