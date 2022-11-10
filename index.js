const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
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


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gt8bmu9.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run(){
   const menuCollection = client.db("petChukti").collection('menu');
  app.get('/menu',async(req,res)=>{
   
    let query={};
    let menuItems = [];
    console.log(req.query.number);
    if(req.query.number){
      const number = parseInt(req.query.number);
      const cursor = menuCollection.find(query).sort( [['_id', -1]] ).limit(number);
     menuItems = await cursor.toArray();
      
    }
    else{
      const cursor = menuCollection.find(query);
       menuItems = await cursor.toArray();
    }
    res.send(menuItems);
    
  })
}

run().catch(err=>console.log(err));



app.get("/", (req, res) => {
  res.send("Pet Chukti server is running now");
});

app.listen(port, () => {
  console.log(`Pet Chukti server running on ${port}`);
});
