const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// Multer stocke le fichier en mémoire (buffer) avant traitement par Sharp
const upload = multer({ storage: multer.memoryStorage() });

// Optimise et redimensionne l'image à 400px en format webp (Green Code)
const optimizeImage = async (req, res, next) => {
    if (!req.file) return next();

    const name = req.file.originalname.split(' ').join('_').split('.')[0];
    const filename = name + Date.now() + '.webp';

    await sharp(req.file.buffer)
        .resize(400)
        .webp({ quality: 80 })
        .toFile(path.join(__dirname, '..', 'images', filename));

    req.file.filename = filename;
    next();
};

module.exports = [upload.single('image'), optimizeImage];
