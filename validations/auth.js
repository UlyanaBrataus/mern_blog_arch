import { body } from "express-validator";

export const registerValidation = [
  body("email", "Неверный формат почты").isEmail(), // if value is email it passes further
  body("password", "Пароль должен быть минимум 5 символов").isLength({
    min: 5,
  }), // to check password length
  body("fullName", "Укажите имя").isLength({ min: 3 }),
  body("avatarUrl", "Неверная ссылка на аватар").optional().isURL(), // if avatar info comes - check it
];
