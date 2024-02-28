const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const config = require("env-yaml").config();
const result = dotenv.config();

const YES_BUTTON = {
  text: "✅ Yes",
  callback_data: "MainMenu:yes",
};

const NO_BUTTON = {
  text: "❎ No",
  callback_data: "MainMenu:no;",
};

const NEUTRAL_BUTTON = {
  text: "🟰 Neutral",
  callback_data: "MainMenu:neutral",
};

const UP_BUTTON = {
  text: "🔺 Up",
  callback_data: "MainMenu:up",
};

const DOWN_BUTTON = {
  text: "🔻 Down",
  callback_data: "MainMenu:down;",
};

const onMessage = async (ctx, bot) => {
  console.log("9", ctx.from);
  try {
    // return bot.sendMessage(ctx.chatId, `What is your NVDA prediction? `, {
    //   reply_markup: {
    //     force_reply: true,
    //     resize_keyboard: true,
    //     one_time_keyboard: false,
    //     keyboard: [[YES_BUTTON, NO_BUTTON]],
    //   },
    // });
    return bot.sendMessage(ctx.chatId, `What is your NVDA prediction? `, {
      reply_markup: {
        inline_keyboard: [[UP_BUTTON, DOWN_BUTTON, NEUTRAL_BUTTON]],
      },
    });
  } catch (error) {
    return bot.sendMessage(
      ctx.chatId,
      `Sorry! Something went wrong ${error.message}`
    );
  }
};

exports.TelegramBotWebHook = async (req, res) => {
  let ctx = req.body.callback_query || req.body.message;
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_API_TOKEN);
  console.log("Bot Token ", process.env.TELEGRAM_BOT_API_TOKEN);
  let message = "Hi from Nvidia Stock Predictor!!!";

  try {
    //ctx.message.message_id => means the message we sent
    //ctx.message_id => means message user sent
    ctx.chatId = ctx.id ? ctx.message.chat.id : ctx.chat.id;
    ctx.msgId = ctx.id ? ctx.message.message_id : ctx.message_id;
    ctx.first_name = ctx.id ? ctx.message.from.first_name : ctx.from.first_name;
    ctx.last_name = ctx.id ? ctx.message.from.last_name : ctx.from.last_name;
    console.log(
      `===================== Message Id: ${JSON.stringify(
        ctx
      )} ====================`
    );
    if (ctx.id) {
      const actionData = ctx.data.split(":");
      console.log("actionData", actionData);
      // Handle the callback data
      if (actionData[0] === "MainMenu") {
        console.log("User clicked:", actionData[1]);
        // Log the answer
        console.log("User answer:", actionData[1] === "yes" ? "Yes" : "No");
      }
      return await handleActions(ctx, bot, actions);
    } else if (ctx.entities && ctx.entities[0].type === "bot_command") {
      console.log("Handle the command: ");
      //update the spreadsheet data
      console.log("------ handleCommands----", ctx.entities[0].length);
      const command = ctx.text.slice(0, ctx.entities[0].length).toLowerCase();
      const param = ctx.text.slice(ctx.entities[0].length).toLowerCase();

      return res.status(200).send(message);
    }
  } catch (error) {
    console.log(error);
    console.error(error);
    message = error.message;
    return bot.sendMessage(ctx.chatId, message);
  }
  return onMessage(ctx, bot);
  bot.sendMessage(ctx.chatId, message);
  return res.status(200).send(message);
};
