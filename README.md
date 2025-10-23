# 🐇 RabbitMQ E-Commerce Mini – Publisher & Consumer

A simple **Node.js microservice example** using **RabbitMQ** for event-driven communication.
Includes:

* **Dashboard Service (Publisher)** – publishes order events
* **Admin Service (Consumer)** – consumes messages and maintains active orders with **Dead Letter Queue (DLQ)** support.

## ⚙️ Setup & Run

### 🧩 1. Start RabbitMQ

Run locally or with Docker:

```
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

> Management UI: [http://localhost:15672](http://localhost:15672)

### 🧾 2. Configure RabbitMQ Connection

```js
module.exports = {
  connectionString: "amqp://localhost" // or your RabbitMQ URL
};
```

### 🚀 3. Install & Run Services

**Admin (Consumer)**
npm install

```
cd admin
npm run start
```
> Runs on: [http://localhost:3001](http://localhost:3001)

**Dashboard (Publisher)**

```
cd dashboard
npm run start
```
> Runs on: [http://localhost:3002](http://localhost:3002)

## 📡 API Endpoints

### 🟢 Create Order

**POST** `http://localhost:3002/order`
**Body:**

```json
{ "product": "Laptop", "orderId": "12345" }
```

Publishes to `order.created`.

### 🔴 Cancel Order

**POST** `http://localhost:3002/order/cancel/12345`
Publishes to `order.cancelled`.

### 📋 View Orders (Consumer)

**GET** `http://localhost:3001/orders`
Returns in-memory list of active orders.

## 🧰 Tech Stack

* Node.js (Express)
* RabbitMQ (Topic Exchange)
* amqplib (AMQP client)

## 💡 Notes

* Exchange: `ecommerce` (type `topic`)
* Admin queue uses: `order.#`
* Unhandled messages → `dead_letter_exchange` → `dead_letter_queue`
* Orders stored in memory (demo only)

## 👨‍💻 Author

**Abhay Mankari**
📧 [mankari.abhay@gmail.com](mailto:mankari.abhay@gmail.com)
🐙 [GitHub](https://github.com/MkAbhay)
💼 [LinkedIn](https://www.linkedin.com/in/abhaymankari)
