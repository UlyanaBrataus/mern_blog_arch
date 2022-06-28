import express from "express";
import mongoose from "mongoose";
import { registerValidation } from "./validations/auth.js";
import checkAuth from "./middleware/utils/checkAuth.js";

import * as UserController from "./controllers/UserController.js"; // * means we get all methods from UserController

mongoose
  .connect(
    "mongodb+srv://admin:12345@cluster0.zcfcl.mongodb.net/blog?retryWrites=true&w=majority"
  ) // "blog" we add manually, it means that we connect not just to mongoDB server, but to our database
  .then(() => console.log("DB OK"))
  .catch(err => console.log("DB error", err));

// ctrl + c to stop server, node index.js to launch it. Type in http://127.0.0.1:4444/ browser
// "type": "module" in package.json allows us to import modules
//  "start: dev": "nodemon index.js"  -  npm run start:dev  - to launch server with nodemon (name is optional)
// "npm install nodemon" installs nodemon to relaunch the server on change

const app = express(); // creates express application, full logic of express is now in "app"

app.use(express.json()); // to let express understand json format

/* ------------ AUTHORIZATION ------------- */
app.post("/auth/login", UserController.login);

/* ------------ REGISTRATION ------------- */
app.post("/auth/register", registerValidation, UserController.register);

/* ----------- USER AUTHORIZATION CHECK  ----------- */

app.get("/auth/me", checkAuth, UserController.getMe);

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
}); // launches web-server on port 4444, if server cannot launch show this error, else show "ok". We need to type http://localhost:4444/ or better http://127.0.0.1:4444/ in browser to see the page
