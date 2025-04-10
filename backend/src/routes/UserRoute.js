const addUserController = require('../controllers/addUser.controller');
const updateUserController = require('../controllers/updateUser.controller');

const UserRouter = require('express').Router();



UserRouter.post('/add', addUserController);
UserRouter.post('/update', updateUserController);

module.exports = UserRouter;






