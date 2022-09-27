const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { SUCCESS_CODE } = require('../utils/httpCodes');
const NotFoundError = require('../errors/NotFoundError');
const InvalidDataError = require('../errors/InvalidDataError');
const AlreadyExistError = require('../errors/AlreadyExistError');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      let secretKey = '';
      if (NODE_ENV !== 'production') {
        secretKey = 'myUnicPassword';
      } else {
        secretKey = JWT_SECRET;
      }
      const token = jwt.sign(
        { _id: user._id },
        secretKey,
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(SUCCESS_CODE).send(users))
    .catch(() => next(new Error('Ошибка на сервере')));
};

module.exports.getUserInfo = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((users) => res.status(SUCCESS_CODE).send(users))
    .catch(() => next(new Error('Ошибка на сервере')));
};

module.exports.getUserByID = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      } else {
        res.status(SUCCESS_CODE).send(user);
      }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
    about,
    avatar,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((user) => {
      res.status(SUCCESS_CODE).send(user);
    })
    .catch((err) => {
      if (err._message === 'user validation failed' || err._message === 'Validation failed') {
        next(new InvalidDataError('Ошибка входных данных'));
      } else if (err.code === 11000) {
        next(new AlreadyExistError('Пользователь с таким email уже зарегистрирован!'));
      } else {
        next(err);
      }
    });
};

module.exports.changeUserInfo = (req, res, next) => {
  const { name: newName, about: newAbout } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name: newName, about: newAbout },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
    (err, user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        res.status(SUCCESS_CODE).send(user);
      }
    },
  );
};

module.exports.changeUserAvatar = (req, res, next) => {
  const { avatar: newAvatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar: newAvatar },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
    (err, user) => {
      if (err && err._message === 'Validation failed') {
        next(new InvalidDataError(err));
      } else if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        res.status(SUCCESS_CODE).send(user);
      }
    },
  );
};
