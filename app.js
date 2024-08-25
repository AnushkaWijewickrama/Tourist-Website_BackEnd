require('dotenv').config();

const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');

const bannerRoutes = require('./routes/banner');
const packageRoutes = require('./routes/package');


const app = express();

const port = process.env.PORT || 3000;
mongoose
  .connect(
    "mongodb+srv://kushananushka6060:eIQlOhbW31pu93xs@cluster0.hedhj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log(port, 'Tourist')
    app.listen(port);
  })
  .catch((err) => console.log(`Could not connect to database server`, err));

app.use(bodyParser.json());
app.use(cors());
app.get("/", (req, res) => res.send('Gem'))
app.use('/api/user', userRoutes);
app.use('/banner', express.static(path.join('asset/banner')));
app.use('/packages', express.static(path.join('asset/packages')));

app.use('/api/banner', bannerRoutes);
app.use('/api/packages', packageRoutes);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

module.exports = app;