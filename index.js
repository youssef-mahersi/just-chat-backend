const Express = require("express");
const app = Express(); 
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth/auth");
const allRoutes = require("./routes/all/all");
const dbConnection = require("./dbConnection");
require('dotenv').config()

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });


app.use(authRoutes);
app.use(allRoutes);
//error handler
app.use((error, req, res, next) => {
  
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });
const server = app.listen(process.env.PORT, () => {
    console.log('Server listening on port:', process.env.PORT);
    dbConnection(server);
  });  



