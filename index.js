const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_API_TOKEN);

const UP_BUTTON = { text: "🔼 Up", callback_data: "MainMenu:up:0" };
const DOWN_BUTTON = { text: "🔽 Down", callback_data: "MainMenu:down:0" };
const NEUTRAL_BUTTON = {
  text: "🟰 Neutral",
  callback_data: "MainMenu:neutral:0",
};

const ONE_DAY_BUTTON = {
  text: "1️⃣ Day",
  callback_data: "MainMenu:1:1",
};

const SEVEN_DAY_BUTTON = {
  text: "7️⃣ Days",
  callback_data: "MainMenu:7:1",
};

const THIRTY_DAY_BUTTON = {
  text: "3️⃣0️⃣  Days",
  callback_data: "MainMenu:30:1",
};

const GUESS_BUTTON = {
  text: "Guess",
  callback_data: "MainMenu:Guess:2",
};

const MODERATE_BUTTON = {
  text: "Moderate",
  callback_data: "MainMenu:Moderate:2",
};

const CONFIDENT_BUTTON = {
  text: "Confident",
  callback_data: "MainMenu:Confident:2",
};

const MENU_BUTTONS=[

[const UP_BUTTON = { text: "🔼 Up", callback_data: "MainMenu:up:0" };
const DOWN_BUTTON = { text: "🔽 Down", callback_data: "MainMenu:down:0" };
const NEUTRAL_BUTTON = {
  text: "🟰 Neutral",
  callback_data: "MainMenu:neutral:0",
};
],
const ONE_DAY_BUTTON = {
  text: "1️⃣ Day",
  callback_data: "MainMenu:1:1",
};

const SEVEN_DAY_BUTTON = {
  text: "7️⃣ Days",
  callback_data: "MainMenu:7:1",
};

const THIRTY_DAY_BUTTON = {
  text: "3️⃣0️⃣  Days",
  callback_data: "MainMenu:30:1",
};

const GUESS_BUTTON = {
  text: "Guess",
  callback_data: "MainMenu:Guess:2",
};

const MODERATE_BUTTON = {
  text: "Moderate",
  callback_data: "MainMenu:Moderate:2",
};

const CONFIDENT_BUTTON = {
  text: "Confident",
  callback_data: "MainMenu:Confident:2",
};
]

const handleActions = async (ctx) => {
  const actionData = ctx.data.split(":");
  if (actionData[2] === "0") {
    return bot.sendMessage(ctx.chatId, `In how many days❔`, {
      reply_markup: {
        inline_keyboard: [
          [ONE_DAY_BUTTON, SEVEN_DAY_BUTTON, THIRTY_DAY_BUTTON],
        ],
      },
    });
  } else if (actionData[2] === "1") {
    return bot.sendMessage(ctx.chatId, `What is your confidence level❔ `, {
      reply_markup: {
        inline_keyboard: [[GUESS_BUTTON, MODERATE_BUTTON, CONFIDENT_BUTTON]],
      },
    });
  } else if (actionData[2] === "2") {
    return bot.sendMessage(ctx.chatId, `Thanks for participating❗️`);
  }
};

const handleCommands = async (ctx) => {
  const command = ctx.text.split(" ")[0].toLowerCase();
  if (command === "/start") {
    return bot.sendMessage(ctx.chatId, `What is your NVDA prediction❔ `, {
      reply_markup: {
        inline_keyboard: [[UP_BUTTON, DOWN_BUTTON, NEUTRAL_BUTTON]],
      },
    });
  }
};

exports.TelegramBotWebHook = async (req, res) => {
  let ctx = req.body.callback_query || req.body.message;
  ctx.chatId = ctx.id ? ctx.message.chat.id : ctx.chat.id;
  ctx.msgId = ctx.id ? ctx.message.message_id : ctx.message_id;

  try {
    if (ctx.id) {
      await handleActions(ctx);
    } else if (ctx.entities && ctx.entities[0].type === "bot_command") {
      await handleCommands(ctx);
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(ctx.chatId, `Sorry! Something went wrong ${error.message}`);
  }
  res.status(200).end();
};
