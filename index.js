const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
  const menuCollection = client.db("petChukti").collection("menu");
  const reviewCollection = client.db("petChukti").collection("review");
  app.get("/menu", async (req, res) => {
    let query = {};
    let menuItems = [];
    //get all menu or limit menu if limit is sent as number
    if (req.query.number) {
      const number = parseInt(req.query.number);
      const cursor = menuCollection
        .find(query)
        .sort([["_id", -1]])
        .limit(number);
      menuItems = await cursor.toArray();
    } else {
      const cursor = menuCollection.find(query);
      menuItems = await cursor.toArray();
    }
    res.send(menuItems);
  });
  //get a particular menu for a particular id
  app.get("/menu/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const menu = await menuCollection.findOne(query);
    res.send(menu);
  });

  //post a menu
  app.post("/menu", async (req, res) => {
    const review = req.body;
    const result = await menuCollection.insertOne(review);
    res.send(result);
  });

  //post review
  app.post("/review", async (req, res) => {
    const review = req.body;
    const result = await reviewCollection.insertOne(review);
    res.send(result);
  });

  //get all review
  app.get("/review", async (req, res) => {
    let query = {};
    const cursor = reviewCollection.find(query);
    const reviews = await cursor.toArray();
    res.send(reviews);
  });
  //get reviews for particular menu
  app.get("/review/:id", async (req, res) => {
    const id = req.params.id;
    const query = { menu: id };
    const cursor = reviewCollection.find(query).sort({ timeReviewed: -1 });
    const reviews = await cursor.toArray();
    res.send(reviews);
  });

  //get reviews for particular user
  app.get("/review/userReview/:email", async (req, res) => {
    const email = req.params.email;
    const query = {
      email: email,
    };
    const cursor = reviewCollection.find(query);
    const reviews = await cursor.toArray();
    res.send(reviews);
  });

  //update a particular menu after user submits a rating
  app.patch("/menu/:id", async (req, res) => {
    const id = req.params.id;
    const status = req.body.status;
    const query = { _id: ObjectId(id) };
    const updatedDoc = {
      $set: {
        status: status,
      },
    };
    const result = await orderCollection.updateOne(query, updatedDoc);
    res.send(result);
  });

  // delete a review
  app.delete("/review/:id",async(req,res)=>{
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await reviewCollection.deleteOne(query);
    res.send(result);
  });
}

run().catch(err=>console.log(err));



app.get("/", (req, res) => {
  res.send("Pet Chukti server is running now");
});

app.listen(port, () => {
  console.log(`Pet Chukti server running on ${port}`);
});
