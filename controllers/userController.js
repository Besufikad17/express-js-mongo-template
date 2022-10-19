const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userController = {};

require("dotenv").config();

userController.signup = async (req, res) => {
  const { username, email, password } = req.body;

  //simple validation
  if (!username || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  //checking for existing user
  User.findOne({ email }).then((user) => {
    if (user) {
      return res.status(400).json({ msg: "User already exists!!" });
    } else {
      const newAcccount = new User({
        username,
        email,
        password,
      });

      //create salt and hash
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newAcccount.password, salt, (err, hash) => {
          if (err) throw err;
          newAcccount.password = hash;
          newAcccount.save().then((user) => {
            jwt.sign(
              { id: user.id },
              process.env.JWT_SECRET,
              { expiresIn: 3600 },
              (err, token) => {
                if (err) throw err;
                res.json({
                  token,
                  user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                  },
                });
              }
            );
          });
        });
      });
    }
  });
};

userController.login = async (req, res) => {
  const { username, password } = req.body;

  User.findOne({
    username,
  })
    .then((user) => {
      if (bcrypt.compareSync(password, user.password)) {
        jwt.sign({ user }, process.env.JWT_SECRET, (err, token) => {
          let userInfo = {
            user: user,
            token: token,
          };
          res.json(userInfo);
        });
      } else {
        res.status(400).send({ message: err });
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err });
      res.status(500).send({ message: err });
      return;
    });
};

module.exports = userController;
