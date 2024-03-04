// https://www.youtube.com/watch?v=sRNQ-9DVsQU
const TelegramBot = require("node-telegram-bot-api");
const { google } = require("googleapis");
const keys = require("./gclient.json");
const yahooFinance = require("yahoo-finance");
const axios = require("axios");

const dotenv = require("dotenv");
dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_API_TOKEN);

// up = 1, down = -1, neutral = 0	day = 1, week = 5, month = 20	guess = 0.1 confident = 1 very confident = 2
const UP_BUTTON = { text: "🔼 Up", callback_data: "MainMenu:1:0" };
const DOWN_BUTTON = { text: "🔽 Down", callback_data: "MainMenu:-1:0" };
const NEUTRAL_BUTTON = {
  text: "🟰 Neutral",
  callback_data: "MainMenu:0:0",
};
const ONE_DAY_BUTTON = {
  text: "1️⃣ Day",
  callback_data: "MainMenu:1:1",
};
const SEVEN_DAY_BUTTON = {
  text: "7️⃣ Days",
  callback_data: "MainMenu:5:1",
};
const THIRTY_DAY_BUTTON = {
  text: "3️⃣0️⃣  Days",
  callback_data: "MainMenu:20:1",
};
const GUESS_BUTTON = {
  text: "Guess",
  callback_data: "MainMenu:0.1:2",
};
const MODERATE_BUTTON = {
  text: "Moderate",
  callback_data: "MainMenu:1:2",
};
const CONFIDENT_BUTTON = {
  text: "Confident",
  callback_data: "MainMenu:2:2",
};

let answers = [];

const handleActions = async (ctx) => {
  const actionData = ctx.data.split(":");
  if (actionData[2] === "0") {
    answers.push(actionData[1]);
    return bot.sendMessage(ctx.chatId, `In how many days❔`, {
      reply_markup: {
        inline_keyboard: [
          [ONE_DAY_BUTTON, SEVEN_DAY_BUTTON, THIRTY_DAY_BUTTON],
        ],
      },
    });
  } else if (actionData[2] === "1") {
    answers.push(actionData[1]);
    return bot.sendMessage(ctx.chatId, `What is your confidence level❔ `, {
      reply_markup: {
        inline_keyboard: [[GUESS_BUTTON, MODERATE_BUTTON, CONFIDENT_BUTTON]],
      },
    });
  } else if (actionData[2] === "2") {
    answers.push(actionData[1]);
    const ret = await updateSheet(answers, ctx.from.id);
    // console.log("Read from sheet", ret);
    answers = [];
    return bot.sendMessage(
      ctx.chatId,
      `Thanks for participating❗️ \n 🏁 /start to predict again!!`
    );
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

const getStockPrice = async (symbol) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`,
    headers: {},
  };

  try {
    const response = await axios.request(config);
    const price = JSON.stringify(response.data.latestPrice);
    return price;
  } catch (error) {
    console.error("Error fetching stock price:", error);
    return null;
  }
};

const updateSheet = async (answers, userId) => {
  try {
    const client = new google.auth.JWT(
      keys.client_email,
      null,
      keys.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    await client.authorize();
    const sheets = google.sheets({ version: "v4", auth: client });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Answers!A:Z",
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found.");
      return;
    }
    console.log("Name, Major:", rows);

    let newValues = res.data.values || [];
    const symbol = "NVDA";
    const price = await getStockPrice(symbol);
    newValues.push([new Date(), symbol, userId, ...answers, "", price]);

    const updateOptions = {
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Answers!A:Z",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: newValues,
      },
    };
    const response = await sheets.spreadsheets.values.update(updateOptions);
    // console.log(response.data);
    return true;
  } catch (err) {
    console.error(err);
  }
};
