import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app";

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("mongodb connection succeed");
    const PORT = process.env.PORT ?? 3003;
    app.listen(PORT, function () {
      console.info(`server is running on port: ${PORT}`);
      console.info(`admin project on: https://localhost:${PORT}/admin \n`);
    });
  })
  .catch((err) => console.log("error on connection to mognodb ", err));
