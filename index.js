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
  callback_data: "MainMenu:neutral:0",
};

const UP_BUTTON = {
  text: "🔼 Up",
  callback_data: "MainMenu:up:0",
};

const DOWN_BUTTON = {
  text: "🔽 Down",
  callback_data: "MainMenu:down:0",
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

const onMessage = async (ctx, bot) => {
  // console.log("9", ctx.from);
  try {
    // return bot.sendMessage(ctx.chatId, `What is your NVDA prediction? `, {
    //   reply_markup: {
    //     force_reply: true,
    //     resize_keyboard: true,
    //     one_time_keyboard: false,
    //     keyboard: [[YES_BUTTON, NO_BUTTON]],
    //   },
    // });
    return bot.sendMessage(ctx.chatId, "Chose /start from the menu to begin");
  } catch (error) {
    return bot.sendMessage(
      ctx.chatId,
      `Sorry! Something went wrong ${error.message}`
    );
  }
};

const handleActions = async (ctx, bot) => {
  console.log("------ handle actions----");
  const actionData = ctx.data.split(":");
  console.log("actionData", actionData, actionData[2], actionData[2] === "0");
  //ask the next question and save the answer to first
  if (actionData[2] === "0") {
    const prediction = actionData[1];
    return bot.sendMessage(ctx.chatId, `In how many days?`, {
      reply_markup: {
        inline_keyboard: [
          [ONE_DAY_BUTTON, SEVEN_DAY_BUTTON, THIRTY_DAY_BUTTON],
        ],
      },
    });
  } else if (actionData[2] === "1") {
    const horizon = actionData[1];
    return bot.sendMessage(ctx.chatId, `What is your confidence level? `, {
      reply_markup: {
        inline_keyboard: [[GUESS_BUTTON, MODERATE_BUTTON, CONFIDENT_BUTTON]],
      },
    });
  } else if (actionData[2] === "2") {
    const confidence = actionData[1];
    return bot.sendMessage(ctx.chatId, `Thanks for participating!`);
  }
  // return bot.sendMessage(ctx.chatId, "Chose /start from menu to begin");
};

// @NVDA_tradebot
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
    console.log("Command / message type ", ctx.entities, ctx.entities);
    // console.log(
    //   `===================== Message Id: ${JSON.stringify(
    //     ctx
    //   )} ====================`
    // );
    if (ctx.id) {
      const actionData = ctx.data.split(":");
      console.log("actionData", actionData);
      // Handle the callback data
      // if (actionData[0] === "MainMenu") {
      //   console.log("User clicked:", actionData[1]);
      //   // Log the answer
      //   console.log("User answer:", actionData[1] === "yes" ? "Yes" : "No");
      // }
      res.sendStatus(403);
      return await handleActions(ctx, bot);
      return res.status(200);
    } else if (ctx.entities && ctx.entities[0].type === "bot_command") {
      console.log("Handle the command: ");
      //update the spreadsheet data
      console.log("------ handleCommands----", ctx.entities[0].length);
      const command = ctx.text.slice(0, ctx.entities[0].length).toLowerCase();
      const param = ctx.text.slice(ctx.entities[0].length).toLowerCase();
      console.log(command, param);
      if (command === "/start") {
        console.log("Ask first question");

        res.sendStatus(403);
        return bot.sendMessage(ctx.chatId, `What is your NVDA prediction? `, {
          reply_markup: {
            inline_keyboard: [[UP_BUTTON, DOWN_BUTTON, NEUTRAL_BUTTON]],
          },
        });
      }
      // return res.status(200).send(message);
      return res.sendStatus(403);
    }
  } catch (error) {
    console.log(error);
    console.error(error);
    message = error.message;
    return bot.sendMessage(ctx.chatId, message);
  }
  return res.status(200).send(message);
  return onMessage(ctx, bot);
  bot.sendMessage(ctx.chatId, message);
  return res.status(200).send(message);
};
