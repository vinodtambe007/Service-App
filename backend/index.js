import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import userRoute from "./routes/userRoute.js";
import orderRoute from "./routes/orderRoute.js";
import providerOrderRoute from "./routes/providerOrderRoute.js";
import cartRoute from "./routes/cartRoute.js";
import adminRoute from "./routes/adminRoute.js";
import providerRoute from "./routes/providerRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import adminOrderRoute from "./routes/adminOrderRoute.js";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import { createServer } from "http";

// Create a new express application instance
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // console.log("whats socket", socket);
  // console.log("socket is active");

  socket.on("new-order", (payload) => {
    // console.log("whats the order ------>", payload);
    io.emit("new-order", payload);
  });

  // Listen for 'update-order-status' events
  socket.on("update-order-status", (payload) => {
    // console.log("Order status updated---->", payload);
    io.emit("order-status-updated", payload);
  });

  // Listen for 'payment-details' events
  socket.on("payment-details", (payload) => {
    // console.log("Payment details---->", payload);
    io.emit("payment-details", payload);
  });
});

const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// Increase the limit to 10mb (adjust as needed)
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ limit: "2mb", extended: true }));

//connect frontend with backend
app.use(cors());

//json file
app.use(express.json());

// Connect to MongoDB
connectDB(DATABASE_URL);

//routes
app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use("/provider", providerRoute);
app.use("/cart", cartRoute);
app.use("/user/order", orderRoute);
app.use("/provider/order", providerOrderRoute);
app.use("/admin/order", adminOrderRoute);
app.use("/order", paymentRoute);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
