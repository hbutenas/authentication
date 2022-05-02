require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

// requires
const authRouter = require("./routes/auth/auth.router");

// packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");

// middlewares
const errorMiddleware = require("./middlewares/errorMiddleware");
app.use(express.json());
app.use(cookieParser(process.env.ACCESS_TOKEN));
app.use(morgan("tiny"));
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 60,
    })
);
app.use(helmet());
// endpoints
app.use("/api/v1/auth", authRouter);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});