const express = require("express");
const amqp = require("amqplib");
const { connectionString } = require("./config");

const app = express();
app.use(express.json());

const EXCHANGE = "ecommerce";
let channel, connection;

async function connectRabbit() {
  connection = await amqp.connect(connectionString);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
}
(async () => await connectRabbit())()
  .then(console.log(`mq connected`))
  .catch(console.error);

app.post("/order", async (req, res) => {
  try {
    const { product, orderId } = req.body;

    if (!product || !orderId) {
      return res
        .status(400)
        .json({ status: "false", message: "Missing product or orderId" });
    }

    const msg = {
      product,
      orderId,
    };

    channel.publish(
      EXCHANGE,
      "order.created",
      Buffer.from(JSON.stringify(msg))
    );
    console.log(`Published to order.created:`, msg);

    res.json({ status: "true", routingKey: "order.created", message: msg });
  } catch (err) {
    res.status(500).json({ status: "false", message: err.message });
  }
});

app.post("/order/cancel/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const msg = {
      orderId,
    };

    channel.publish(
      EXCHANGE,
      "order.cancelled",
      Buffer.from(JSON.stringify(msg))
    );
    console.log(`Published to order.canceled:`, msg);

    res.json({ status: "true", routingKey: "order.canceled", message: msg });
  } catch (err) {
    res.status(500).json({ status: "false", message: err.message });
  }
});

app.listen(3002, () => {
  console.log("Dashboard running on http://localhost:3002");
});
