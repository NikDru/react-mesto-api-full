const mongoose = require('mongoose');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator: (v) => {
        const urlRegex = /^https?:\/\/(www.){0,1}([0-9a-zA-Z_-]+\.){1,3}[a-zA-Z]+[A-Za-z0-9-._~:/?#[\]@!$&'()*+,;=]+#?$/gm;
        return urlRegex.test(v);
      },
      message: 'Аватар не является корректной ссылкой!',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: [],
  }],
});

cardSchema.statics.findByIdAndCheckCardOwner = function findByIdAndCheckCardOwner(cardId, userId) {
  return this.findOne({ _id: cardId })
    .then((card) => {
      if (!card) {
        return Promise.reject(new NotFoundError('Карточка не найдена!'));
      }
      if (card.owner.toString() !== userId) {
        return Promise.reject(new ForbiddenError('Вы не имеет прав на редактирование этой карточки'));
      }
      return card;
    });
};

module.exports = mongoose.model('card', cardSchema);
