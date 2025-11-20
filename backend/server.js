import express, { urlencoded } from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import positionRoutes from "./routes/positionRoutes.js";
import fixtureRoutes from "./routes/fixtureRoutes.js";
import matchdayRoutes from "./routes/matchdayRoutes.js";
import pickRoutes from "./routes/pickRoutes.js";
import leagueRoutes from "./routes/leagueRoutes.js";
import managerInfoRoutes from "./routes/managerInfoRoutes.js";
import liveRoutes from "./routes/liveRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
dotenv.config();

connectDB();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = [
  "https://fantasy-ug.vercel.app",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/fixtures", fixtureRoutes);
app.use("/api/matchdays", matchdayRoutes);
app.use("/api/picks", pickRoutes);
app.use("/api/leagues", leagueRoutes);
app.use("/api/managerinfo", managerInfoRoutes);
app.use("/api/livepicks/manager", liveRoutes);
app.use("/api/transfers", transferRoutes);
//const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
//const __dirname = path.dirname(__filename); // get the name of the directory
// Serve the static files from the React app
//app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle requests by serving index.html for all routes
/*app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });*/

/*if (
  process.env.NODE_ENV === "Production" ||
  process.env.NODE_ENV === "production"
) {*/
/*const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '/frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
}) */

//const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
//const __dirname = path.dirname(__filename); // get the name of the directory
// Serve the static files from the React app
//app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Handle requests by serving index.html for all routes
/* app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => res.send("server ready"));
}*/

app.use(notFound);
app.use(errorHandler);
app.listen(port, () => console.log(`Server running on port ${port}`));
export default app;

/*
 POST /api/users = Register a user
 POST /api/users/auth - Authenticate a user and get atoken
 POST /api/users/logout - Logout user and clear cookie
 GET /api/users/profile - Get user profile
 PUT /api/users/profile - Update user profile
*/
