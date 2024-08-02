import "express-async-errors";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";

// import { CONFIGS } from "@/configs";
import routes from "@/routes";
import Mailer from "@/libraries/mailer";
import { connectMongoDB } from "@/libraries/mongo";
import { configureErrorMiddleware } from "@/middlewares/error.middleware";
import { configurePreRouteMiddleware } from "@/middlewares/pre-route.middleware";
import SchedulerService from "./services/scheduler.service";

const app: Express = express();

process.env.TZ = "UTC"; // Set the timezone to UTC

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        // origin: [CONFIGS.URL.LANDING_BASE_URL],
    },
});

app.use(bodyParser.raw({ type: "application/json", limit: "3gb" }));

// Pre Route Middlewares
configurePreRouteMiddleware(app);

// Uncomment to add 5 seconds delay to routes // For Testing Only
// app.use((_req, _res, next) => setTimeout(next, 5000));

// Routes
app.use(routes);

// Error middlewares
configureErrorMiddleware(app);

const PORT: number | string = process.env.PORT || 4000;

// Listen to server port
httpServer.listen(PORT, async () => {
    // Initialize MongoDB connection
    await connectMongoDB();

    // Initialize mailer connection
    await Mailer.verifyConnection();

    console.log(`:::> This server is listening on port ${PORT} @ http://localhost:${PORT}`);
});

// restart and continue the scheduling services
SchedulerService.continue();

// On server error
app.on("error", (error) => {
    console.error(`<::: An error occurred on the server: \n ${error}`);
});

export { io };
export default app;
