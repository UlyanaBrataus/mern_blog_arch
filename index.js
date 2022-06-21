import express from "express";
import jwt from "jsonwebtoken";

// ctrl + c to stop server, node index.js to launch it
// "type": "module" in package.json allows us to import modules
//  "start: dev": "nodemon index.js"  -  npm run start:dev  - to launch server with nodemon (name is optional)
// "npm install nodemon" installs nodemon to relaunch the server on change

const app = express(); // creates express application, full logic of express is now in "app"

app.use(express.json()); // to let express understand json format

app.get("/", (req, res) => {
  res.send("Hello World!");
}); // in "req" we get info from a client, in "res" our response to a client. Here we respond with console.log when we get req from the main adress (route)

// Simplest authorisation without database:
app.post("/auth/login", (req, res) => {
  console.log("request body", req.body);

  const token = jwt.sign(
    {
      email: req.body.email, // email that we get from client
      fullName: "Jane Dou",
    },
    "secretcode123"
  ); // passing into token info that will be encrypted(ciphered)

  res.json({
    success: true,
    token,
  });
}); // when we get post req from client to /auth/login, we catch it and return response in json

/* ------------- */

app.listen(4444, err => {
  if (err) {
    return console.log(err);
  }
  console.log("Server OK");
}); // launches web-server on port 4444, if server cannot launch show this error, else show "ok"
