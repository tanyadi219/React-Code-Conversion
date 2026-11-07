require('dotenv').config();
const express = require('express');
const ComponentRouter = require('./router/ComponentRouter');
const UserRouter = require('./router/UserRouter');
const GeminiRouter = require('./router/GeminiRouter');
require('./connection');
const cors = require('cors');

const app = express();
const port = 5500;

// middleware
app.use(cors({
    origin: ['http://localhost:3000']
}));
app.use(express.json());

// routes
app.use('/user', UserRouter);
app.use('/component', ComponentRouter);
app.use('/gemini', GeminiRouter);

// test endpoint
app.get("/", (req, res) => {
  res.send("response from express");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});