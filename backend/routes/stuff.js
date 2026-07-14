const express = require('express');
const router = express.Router();
const stuffCtrl = require('../controller/stuff');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Routes publiques (pas besoin d'être connecté)
router.get('/', stuffCtrl.getAllLivres);
router.get('/bestrating', stuffCtrl.getBestRating); // doit être avant /:id
router.get('/:id', stuffCtrl.getOneLivre);

// Routes protégées (auth vérifie le token JWT)
router.post('/', auth, multer, stuffCtrl.createLivre);
router.post('/:id/rating', auth, stuffCtrl.rateBook);
router.put('/:id', auth, multer, stuffCtrl.modifyLivre);
router.delete('/:id', auth, stuffCtrl.deleteLivre);


module.exports = router;