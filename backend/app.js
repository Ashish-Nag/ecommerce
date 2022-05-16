require('dotenv').config();

// dependencies
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

// route dependencies
const prodRoute = require('./routes/products');
const orderRoute = require('./routes/orders');
const categoryRoute = require('./routes/categories');
const userRoute = require('./routes/users');

const app = express();


// environment variables
const port = process.env.PORT || 300;
const apiUrl = process.env.API_URL;

// middlewares
app.use(express.json());
app.use(morgan('tiny'));

// routers
app.use(`${apiUrl}/products`, prodRoute);
app.use(`${apiUrl}/categories`, categoryRoute);
app.use(`${apiUrl}/users`, userRoute);
app.use(`${apiUrl}/orders`, orderRoute);

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("connection to database established"))
    .catch((e) => console.error(e))
// server Start
app.listen(port, () => console.log(`The server is running on Port ${port}`));