import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { validationResult } from "express-validator";
import { registerValidation } from "./validations/auth.js";
import UserModel from "./models/User.js";

mongoose
  .connect(
    "mongodb+srv://admin:12345@cluster0.zcfcl.mongodb.net/blog?retryWrites=true&w=majority"
  ) // "blog" we add manually, it means that we connect not just to mongoDB server, but to our database
  .then(() => console.log("DB OK"))
  .catch(err => console.log("DB error", err));

// ctrl + c to stop server, node index.js to launch it
// "type": "module" in package.json allows us to import modules
//  "start: dev": "nodemon index.js"  -  npm run start:dev  - to launch server with nodemon (name is optional)
// "npm install nodemon" installs nodemon to relaunch the server on change

const app = express(); // creates express application, full logic of express is now in "app"

app.use(express.json()); // to let express understand json format

/* ------------ AUTHORISATION ------------- */
app.post("/auth/login", async (req, res) => {
  try {
    // making auth we should check does user exist in Data Base or not
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      // if there is no such user in DB
      return res.status(404).json({
        message: "Пользователь не найден", // in real app we should not give much info about data that is wrong (login or password) for better security
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    ); // check whether password is correct or not
    if (!isValidPass) {
      return res.status(400).json({
        message: "Неверный логин или пароль",
      });
    }

    const token = jwt.sign(
      // if user logs in correctly we create new token
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d", // how long the token will be valid
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData, //  to get not all of the user methods, but only values from UserModel without passwordHash
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизоваться",
    });
  }
});

/* ------------ REGISTRATION ------------- */
app.post("/auth/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req); // takes data from request
    if (!errors.isEmpty()) {
      // if there is an error
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10); // generates algo of salt
    const hash = await bcrypt.hash(password, salt); // encrypting pssword with salt

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    }); // takes everything from request body

    const user = await doc.save(); // save user in MongoDB

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d", // how long the token will be valid
      }
    ); // after user registered successfully and password was hashed we create jwt token

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData, //  to get not all of the user methods, but only values from UserModel without passwordHash
      token,
    }); // must be only one response!!!
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось зарегистрироваться",
    });
  }
}); // when we get auth request validates it, if validation is passed (if email is email, password has min length, etc.) collback function will work and it checks user register data

app.get("/auth/me", (req, res) => {
  try {
    // decrypt user token to check user info and check his rights
  } catch (err) {}
});

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// }); // in "req" we get info from a client, in "res" our response to a client. Here we respond with console.log when we get req from the main adress (route)

// Simplest authorisation without database:
// app.post("/auth/login", (req, res) => {
// console.log("request body", req.body);
// const token = jwt.sign(
//   {
//     email: req.body.email, // email that we get from client
//     fullName: "Jane Dou",
//   },
//   "secretcode123" // our token secret key (can be any)
// ); // passing into token info that will be encrypted(ciphered)
// res.json({
//   success: true,
//   token, // we return this token to client
// });
// }); // when we get post req from client to /auth/login, we catch it and return response in json

/* ------------- */

app.listen(4444, err => {
  if (err) {
    return console.log(err);
  }
  console.log("Server OK");
}); // launches web-server on port 4444, if server cannot launch show this error, else show "ok". We need to type http://localhost:4444/ in browser to see the page
