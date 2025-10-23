const express = require("express");
const amqp = require("amqplib");
const { connectionString } = require("./config");

const app = express();
app.use(express.json());

const EXCHANGE = "ecommerce";
let channel, connection;
let consumedMessages = [];

async function connectRabbit() {
  connection = await amqp.connect(connectionString);
  channel = await connection.createChannel();

  await channel.assertExchange("dead_letter_exchange", "fanout", {
    durable: true,
  });
  await channel.assertQueue("dead_letter_queue", { durable: true });
  await channel.bindQueue("dead_letter_queue", "dead_letter_exchange", "");

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  const q = await channel.assertQueue("admin_queue", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "dead_letter_exchange",
    },
  });
  const bindingKey = "order.#";
  await channel.bindQueue(q.queue, EXCHANGE, bindingKey);
  console.log(` Waiting for messages with pattern '${bindingKey}'`);

  channel.consume(
    q.queue,
    (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        if (msg.fields.routingKey === "order.created") {
          console.log(`📥 Consumed [${msg.fields.routingKey}]:`, content);
          consumedMessages.push(content);
          channel.ack(msg);
        } else if (msg.fields.routingKey === "order.cancelled") {
          console.log(`📥 Consumed [${msg.fields.routingKey}]:`, content);
          consumedMessages = consumedMessages.filter(
            (order) => order.orderId !== content.orderId
          );
          channel.ack(msg);
        } else {
          console.log(
            `⚠️ Unhandled message type: ${msg.fields.routingKey}`,
            content
          );
          channel.reject(msg, false);
        }
      }
    },
    { noAck: false }
  );
}
(async () => await connectRabbit())()
  .then(console.log(`mq connected`))
  .catch(console.error);

app.get("/orders", (req, res) => {
  res.status(200).json({ status: "success", messages: consumedMessages });
});

app.listen(3001, () => {
  console.log("Admin running on http://localhost:3001");
});
