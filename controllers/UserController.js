import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import UserModel from "../models/User.js";

/* -------------- REGISTER --------------- */

export const register = async (req, res) => {
  try {
    const errors = validationResult(req); // takes data from request
    if (!errors.isEmpty()) {
      // if there is an error
      return res.status(400).json(errors.array());
    }
    // when we get auth request function validates it, if validation is passed (if email is email, password has min length, etc.) collback function will work and it checks user register data

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
};
/* -------------- LOGIN --------------- */
export const login = async (req, res) => {
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
};

/* -------------- LOGIN (AUTHORIZATION) CHECK --------------- */

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId); // we need to find user by id in DB
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }
    const { passwordHash, ...userData } = user._doc;

    res.json({ userData });
    // decrypt user token using middleware function checkAuth to check user info and his access, if check is successfull req and res will run
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};
