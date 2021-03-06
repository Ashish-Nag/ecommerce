require('dotenv').config();

// dependencies
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors')

// todo Delete this
let { expressjwt: jwt } = require('express-jwt');

// route dependencies
const prodRoute = require('./routes/products');
const orderRoute = require('./routes/orders');
const categoryRoute = require('./routes/categories');
const userRoute = require('./routes/users');

// auth dependency
const authJwt = require('./helpers/jwt');
// error handler dependency
const errorHandler = require('./helpers/errorHandler');

// invoking Express
const app = express();


// environment variables
const port = process.env.PORT || 300;
const apiUrl = process.env.API_URL;

// middlewares
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

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