const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());


// require("crypto").randomBytes(64).toString("hex");

// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: "unauthorized access" });
//   }
//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
//     if (error) {
//       return res.status(401).send({ message: "unauthorized access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// }



app.get("/", (req, res) => {
  res.send("Pet Chukti server is running now");
});

app.listen(port, () => {
  console.log(`Pet Chukti server running on ${port}`);
});
