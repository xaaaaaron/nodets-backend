import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import router from "./router";

require("dotenv").config();

const PORT = 8080;

const app = express();

app.use(
  cors({
    credentials: true,
  })
),
  app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`🚀 Running in port: ${PORT} `);
});

const MONGO_URL = process.env.MONGO_URL;

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on("Error", (error: Error) => console.log(error));

app.use("/", router());
