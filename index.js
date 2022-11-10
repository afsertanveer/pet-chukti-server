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


function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
      return res.status(401).send({message:'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
        if(err){
          res.status(403).send({message:'forbidden access'})
        }
        req.decoded = decoded;
        next();
    });

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gt8bmu9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run(){
  const menuCollection = client.db("petChukti").collection("menu");
  const reviewCollection = client.db("petChukti").collection("review");

    app.post('/jwt',(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.send({token});
    })
  //get all menu or limit menu if limit is sent as number
  app.get("/menu", async (req, res) => {
    let query = {};
    let menuItems = [];
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
  app.get("/review/userReview/:email", verifyJWT, async (req, res) => {
    const decoded = req.decoded;
    const email = req.params.email;
    if(decoded.email!==email){
      res.status(403).send({message:'unauthorized acces'})
    }
    const query = {
      email: email,
    };
    const cursor = reviewCollection.find(query);
    const reviews = await cursor.toArray();
    res.send(reviews);
  });

  //get review for particular id
  app.get("/review/reviewDetails/:id", async (req, res) => {
    const id = req.params.id;
    const query = {
      _id: ObjectId(id),
    };
    const result = await reviewCollection.findOne(query);
    res.send(result);
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

  //edit a review
  app.patch("/review/:id", async(req, res) => {
    const id = req.params.id;
    const details = req.body.details;
    const query = { _id: ObjectId(id) };
    const updatedDoc = {
      $set: {
        details: details,
      },
    };
    const result = await reviewCollection.updateOne(query, updatedDoc);
    res.send(result);
  });

  // delete a review
  app.delete("/review/:id", async (req, res) => {
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
