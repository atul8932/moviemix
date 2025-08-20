import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.post("/create-payment", async (req, res) => {
  try {
    const response = await fetch("https://sandbox.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01"
      },
      body: JSON.stringify({
        order_amount: 5.00,
        order_currency: "INR",
        order_id: "order_" + Date.now(),
        customer_details: {
          customer_id: "cust_" + Date.now(),
          customer_email: "test@example.com",
          customer_phone: "9999999999"
        },
        order_meta: {
          return_url: "https://moviess.info/success"
        }
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment creation failed" });
  }
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
