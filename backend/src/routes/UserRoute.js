const addUserController = require('../controllers/addUser.controller');
const updateUserController = require('../controllers/updateUser.controller');

const UserRouter = require('express').Router();



UserRouter.post('/add', addUserController);
UserRouter.post('/update', updateUserController);
UserRouter.get('/update', (req, res) => {
    return res.status(200).json({
        message: "GET request to update user"
    });
});

module.exports = UserRouter;






