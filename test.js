const axios = require("axios");

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: "https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/NVDA/quote",
  headers: {},
};

axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data.latestPrice));
  })
  .catch((error) => {
    console.log(error);
  });
