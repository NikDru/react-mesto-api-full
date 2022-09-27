const router = require('express').Router();
const {
  getCards, createCard, deleteCard, setLike, deleteLike,
} = require('../controllers/cards');
const { ValidateCardID, ValidateCardBody } = require('../utils/JoiValidators');

router.get('/', getCards);

router.delete('/:cardId', ValidateCardID, deleteCard);

router.post('/', ValidateCardBody, createCard);

router.put('/:cardId/likes', ValidateCardID, setLike);

router.delete('/:cardId/likes', ValidateCardID, deleteLike);

module.exports = router;
