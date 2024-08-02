import cors, { CorsOptions } from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import express, { Express } from "express";
import { CONFIGS } from "@/configs";

const configurePreRouteMiddleware = (app: Express): Express => {
    // Set Proxy
    app.set("trust proxy", true);

    const corsOptions: CorsOptions = {
        origin: CONFIGS.URL.LANDING_BASE_URL,
        credentials: true, //access-control-allow-credentials:true
        optionsSuccessStatus: 200,
    };

    // enable CORS
    app.use(cors(corsOptions));

    // Secure the app by setting various HTTP headers off.
    app.use(helmet({ contentSecurityPolicy: false }));

    // Enable HTTP request logging
    app.use(morgan("common"));

    // Tell express to recognize the incoming Request Object as a JSON Object
    app.use(express.json());

    // Serve Public Folder
    app.use("/", express.static(path.join(__dirname, "..", "..", "public")));

    // Express body parser
    app.use(express.urlencoded({ extended: true }));

    return app;
};

export { configurePreRouteMiddleware };
