const userController = require("../controllers/userController");
const route = require("express").Router();

route.post("/signup", userController.signup);

route.post("/login", userController.login);

module.exports = route;