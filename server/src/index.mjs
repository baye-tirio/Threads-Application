import express from "express";
import path from "path";
import { connectDB } from "./utils/dbConnection.mjs";
import dotenv from "dotenv";
import AuthenticationRoutes from "./routes/authentication.routes.mjs";
import UserRoutes from "./routes/user.routes.mjs";
import PostRoutes from "./routes/post.routes.mjs";
import ChatRoutes from "./routes/chat.routes.mjs";
import cookieParser from "cookie-parser";
import { checkAuthToken } from "./utils/jwtAuthentication.mjs";
import { app, server } from "./socket/socket.mjs";
import { checkFrozenStatus } from "./middlewares/checkFrozenStatus.mjs";
import job from "./cron/cron.mjs";
dotenv.config();
//resolve the current working directory (or the index.mjs file)
const __dirname = path.resolve();
console.log("The __dirname value is : ", __dirname);
//connect to the database
connectDB();
//execute the cron job created
job.start();
//initialize the port number
const PORT = process.env.PORT;
//const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use("/api/authentication", AuthenticationRoutes);
app.use("/api/user", checkAuthToken, checkFrozenStatus, UserRoutes);
app.use("/api/post", checkAuthToken, checkFrozenStatus, PostRoutes);
app.use("/api/chat", checkAuthToken, checkFrozenStatus, ChatRoutes);
//error handling middleware
app.use((err, req, res, next) => {
  try {
    const errorMessage = err.message || "internal server error";
    const statusCode = err.statusCode || 500;
    const errorLine = err.stack.split("\n")[1].trim();
    console.log(errorMessage);
    console.log(errorLine);
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      stack: errorLine,
    });
  } catch (error) {
    const errorLine = err.stack.split("\n")[1].trim();
    res.status(500).json({
      success: false,
      error: error.message,
      stack: errorLine,
    });
  }
});
//let's configure some configurations so that we can serve them static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/dist")));
  // now serve the react application if we get a request to an endpoint we don't know about
  app.get("*", (req, res) => {
    try {
      // honestly I think apa ni next level kujihami .. like this
      // when you go to the url the browser doesn't request any file and so the request would not be satisfied as a request to a static file and thus it probably is a request to the landing page or our react application
      // so in other words if the request can't be served by any of the endpoints crateated and it is not a request to a static file then return the landing page of the react application typeshit.
      res.sendFile(path.join(__dirname, "/client/dist/index.html"));
    } catch (error) {
      console.log(
        "error sending the client html file from the express server :"
      );
      console.log(error);
    }
  });
}
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on port : ", PORT);
});
