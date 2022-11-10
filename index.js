require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const createError = require("http-errors");

const app = express();
const socketio = require("socket.io");
const http = require("http");

const UserRouter = require("./src/routes/users");

const host = process.env.DB_HOST;
const port = process.env.PORT;

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "*",
  },
});
io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    console.log("data Join ROOM = ", data);
    socket.join(data);
  });
  socket.on("send-message", (data) => {
    const message = {
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
      created_at: new Date(),
    };
    console.log("Cek New Message = ", message);
    socket.to(data.receiver).emit("new-message", message);
  });
});
server.listen(port, () => {
  console.log(`server running on http://${host}:${port}`);
});
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
//app.use(helmet());
app.use("/img", express.static("./upload"));

app.use("/users", UserRouter);

app.all("*", (req, res, next) => {
  next(new createError.NotFound());
});
app.use((err, req, res, next) => {
  const messageError = err.message || "internal server error";
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    message: messageError,
  });
});
