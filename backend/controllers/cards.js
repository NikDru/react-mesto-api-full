const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const InvalidDataError = require('../errors/InvalidDataError');
const { SUCCESS_CODE } = require('../utils/httpCodes');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.status(SUCCESS_CODE).send(cards))
    .catch((error) => next(error));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => card.populate(['owner']).execPopulate())
    .then((card) => {
      res.send(card);
    })
    .catch((error) => {
      if (error._message === 'user validation failed' || error._message === 'Validation failed') {
        next(new InvalidDataError('Ошибка входных данных'));
      } else {
        next(error);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndCheckCardOwner(req.params.cardId, req.user._id)
    .then((card) => {
      Card.findByIdAndRemove(
        card._id,
        (err, deletedCard) => {
          if (!deletedCard) {
            next(new Error('Ошибка на сервере'));
          } else {
            res.status(SUCCESS_CODE).send({ message: 'Карточка удалена' });
          }
        },
      );
    })
    .catch(next);
};

module.exports.setLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена!');
      } else {
        res.status(SUCCESS_CODE).send(card);
      }
    })
    .catch((error) => next(error));
};

module.exports.deleteLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена!');
      } else {
        res.status(SUCCESS_CODE).send(card);
      }
    })
    .catch(next);
};
