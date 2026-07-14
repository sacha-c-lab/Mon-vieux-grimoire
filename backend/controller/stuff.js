const Livre = require('../models/Livre');
const fs = require('fs');

// Ajoute une note au livre (0-5), recalcule la moyenne, un utilisateur ne peut noter qu'une fois
exports.rateBook = (req, res, next) => {
     Livre.findOne({ _id: req.params.id })
      .then(livre => {
        const dejaNotes = livre.ratings.find(rating => rating.userId === req.auth.userId);
        if(dejaNotes) {
          return res.status(400).json({ message: 'Livre deja noté' });
        }
        else {
          if (req.body.rating < 0 || req.body.rating > 5) {
            return res.status(400).json({ message: 'Note invalide. La note doit être comprise entre 0 et 5.' });
          }
          else {
            livre.ratings.push({ userId: req.auth.userId, grade: req.body.rating });
            const sumRatings = livre.ratings.reduce((sum, rating) => sum + rating.grade, 0);
            livre.averageRating = sumRatings / livre.ratings.length;
            livre.save()
              .then(() => res.status(200).json(livre))
              .catch(error => res.status(400).json({ error }));
          }
        }
      })
      .catch(error => res.status(500).json({ error }));
};

// Retourne les 3 livres avec la meilleure note moyenne
exports.getBestRating = (req, res, next) => {
    Livre.find()
        .then(livres => {
            const sortedLivres = livres.sort((a, b) => b.averageRating - a.averageRating).slice(0, 3);
            res.status(200).json(sortedLivres);
        })
        .catch(error => res.status(400).json({ error }));
};

// Crée un nouveau livre avec son image (données envoyées en FormData)
exports.createLivre = (req, res, next) => {
      const livreObject = JSON.parse(req.body.book); // le frontend envoie les données book en JSON string
      delete livreObject._id;
      delete livreObject._userId;
      const livre = new Livre({
        ...livreObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      });
      livre.save()
        .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
        .catch(error => { res.status(400).json( { error })})
    };

// Modifie un livre (avec ou sans nouvelle image), vérifie que c'est le propriétaire
exports.modifyLivre = (req, res, next) => { const livreObject = req.file ? {
       ...JSON.parse(req.body.book),
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body };
 
   delete livreObject._userId;
   Livre.findOne({_id: req.params.id})
       .then((livre) => {
           if (livre.userId != req.auth.userId) {
               res.status(401).json({ message : 'Not authorized'});
           } else {
               if (req.file) {
                   const filename = livre.imageUrl.split('/images/')[1];
                   fs.unlink(`images/${filename}`, () => {});
               }
               Livre.updateOne({ _id: req.params.id}, { ...livreObject, _id: req.params.id})
               .then(() => res.status(200).json({message : 'Livre modifié!'}))
               .catch(error => res.status(401).json({ error }));
           }
       })
       .catch((error) => {
           res.status(400).json({ error });
       });

};

// Supprime un livre et son image du serveur, vérifie que c'est le propriétaire
exports.deleteLivre = (req, res, next) => {
    Livre.findOne({ _id: req.params.id })
        .then(livre => {
            if (livre.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = livre.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Livre.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
};

// Récupere un livre
exports.getOneLivre = (req, res, next) => {
    Livre.findOne({_id: req.params.id})
    .then((livre) => res.status(200).json(livre))
    .catch((error) => res.status(404).json({ error }));
};

// Récupere tous les livres
exports.getAllLivres = (req, res, next) => {
    Livre.find()
    .then((livres) => res.status(200).json(livres))
    .catch((error) => res.status(400).json({ error }));
};