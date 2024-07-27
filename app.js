import express from 'express'
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';
import fs from 'fs'
import morgan from 'morgan';
import { dbConnect } from './utils/dbConnect';
import { configDotenv } from 'dotenv';

// import routes
import adminRouter from './Routes/admin.route.js';
import companyRouter from './Routes/company.route.js';

// Import error handlers
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

configDotenv()

const PORT = process.env.PORT

//App Logs
app.use(morgan("dev", { stream: fs.createWriteStream("./app.log") }))

// Body Parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(cors());

app.use("/api/vi", adminRouter, companyRouter)

// testing api
app.get("/test", (req, res, next) => {
	res.status(200).json({
		success: true,
		message: "API is working",
	});
});

// unknown route
app.all("*", (req, res, next) => {
	const err = new Error(`Route ${req.originalUrl} not found`);
	err.statusCode = 404;
	next(err);
});

// error handling
app.use(notFound)
app.use(errorHandler)


app.listen(PORT, (err) => {
	if (err) throw new Error(err.message)
	console.log(`App is running on ${PORT}`)
})