require('dotenv').config();

const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');

const bannerRoutes = require('./routes/banner');
const packageRoutes = require('./routes/package');
const destinationRoutes = require('./routes/destination');
const galleryRoutes = require('./routes/gallery');
const productRoutes = require('./routes/products');
const productsdetailsRoutes = require('./routes/productsdetails');
const testimonialsRoutes = require('./routes/testimonial')
const packageDetailsRoutes = require('./routes/package-details')

const app = express();

const port = process.env.PORT || 3000;
mongoose
  .connect(
    "mongodb+srv://usoft59:jvnYgObqDH5UegVt@cluster0.vfcjq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log(port, 'Usoft')
    app.listen(port);
  })
  .catch((err) => console.log(`Could not connect to database server`, err));

app.use(bodyParser.json());
app.use(cors());
app.get("/", (req, res) => res.send('Usoft'))
app.use('/api/user', userRoutes);
app.use('/banner', express.static(path.join('asset/banner')));
app.use('/packages', express.static(path.join('asset/packages')));
app.use('/destination', express.static(path.join('asset/destination')));
app.use('/gallery', express.static(path.join('asset/gallery')));

app.use('/api/banner', bannerRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/destination', destinationRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/productsingle', productsdetailsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/packagedetails', packageDetailsRoutes);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

module.exports = app;