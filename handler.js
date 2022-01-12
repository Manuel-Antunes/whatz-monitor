const serverless = require("serverless-http");
const axios = require("axios");
const express = require("express");
const app = express();

app.get("/bots/:id", async (req, res, next) => {
  try {
    const { id: ids } = req.params;
    const options = {
      url: `https://api.painel.zapfacil.com/api/bots`,
      method: "GET",
      timeout: 15000,
      headers: { Authorization: req.headers.authorization },
    };

    const {
      data: { bots },
    } = await axios(options);
    const checkedBots = [];
    let existsError = false;

    for (const bot of bots) {
      if (ids.includes(bot.id)) {
        checkedBots.push({
          id: bot.id,
          name: bot.name,
          number: bot.number,
          online: bot.online,
          device: bot.deviceInfo.statusConnection,
        });
        if (!bot.online) {
          existsError = true;
        }
      }
    }

    if (existsError) {
      return res.status(503).json({
        bots: checkedBots,
        message: "Zuck derrubou alguém ai!",
        success: false,
      });
    }

    if (ids.split(",").length !== checkedBots.length) {
      return res.status(500).json({
        bots: checkedBots,
        message: `Erro na contagem de bots (${ids.split(",").length}/${
          checkedBots.length
        })`,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tudo online :)",
      bots: checkedBots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
