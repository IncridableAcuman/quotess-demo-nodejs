const express = require("express");
const axios = require("axios");
const redis = require("redis");
require("dotenv").config();

const app = express();
const client = redis.createClient();

app.use(express.json());

client.on("error", (error) => {
  console.log(error);
});

(async () => {
  await client.connect();
  console.log("Redis connected");
})();

app.get("/", (req, res) => {
  return res.send(`<h1>Home Page</h1>
    `);
});

app.get("/api/quote/:id", async (req, res) => {
  const { id } = req.params;
  const url = process.env.QUOTES_URL + `/${id}`;
  const cachedKey = `quote:${id};`;
  try {
    const cached = await client.get(cachedKey);
    if (cached) {
      const data = JSON.parse(cached);
      return res.send(`
        <h1>${data.quote}</h1>
        <p>Author: ${data.author}</p>
        `);
    }
    const { data } = await axios.get(url);
    await client.setEx(cachedKey, 3600, JSON.stringify(data));
    return res.send(`
    <h1>${data.quote}</h1>
        <p>Author: ${data.author}</p>
    `);
  } catch (error) {
    throw new Error(error);
  }
});

const port = process.env.PORT || "5000";

app.listen(port, () => {
  console.log("server is running on " + port + "...");
});
