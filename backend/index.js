const express = require("express");
const connectDataBase = require("./database/db");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const commentRoute = require("./routes/comments");
const { errorHandler } = require("./middlewares/error");
const verifyToken = require("./middlewares/verifyToken");

dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoute);
app.use("/api/user", verifyToken, userRoute);
app.use("/api/post", verifyToken, postRoute);
app.use("/api/comment", verifyToken, commentRoute);

app.use(errorHandler);
app.listen(process.env.PORT, () => {
  connectDataBase();
  console.log(`Server is runing on port:${process.env.PORT}`);
});
