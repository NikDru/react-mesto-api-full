const router = require('express').Router();
const {
  getUsers, getUserByID, getUserInfo, changeUserInfo, changeUserAvatar,
} = require('../controllers/users');
const { ValidateUserID, ValidateUserBodyForTextFields, ValidateUserBodyForAvatar } = require('../utils/JoiValidators');

router.get('/', getUsers);

router.get('/me', getUserInfo);

router.get('/:userId', ValidateUserID, getUserByID);

router.patch('/me', ValidateUserBodyForTextFields, changeUserInfo);

router.patch('/me/avatar', ValidateUserBodyForAvatar, changeUserAvatar);

module.exports = router;
