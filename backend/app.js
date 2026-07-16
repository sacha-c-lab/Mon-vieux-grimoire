// Charge les variables d'environnement depuis le fichier .env
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const bookRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');

const path = require('path');

// Connexion à la base de données MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

// Middleware CORS : autorise le frontend à communiquer avec le backend
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());
// Routes de l'API
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
// Sert les images statiques depuis le dossier images/
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;