const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT | 5000;

// Middleware
app.use(express.json());
app.use(cors());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }

  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w00ka8a.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // All Collections
    const usersCollection = client.db("fdTeach").collection("users");
    const classesCollection = client.db("fdTeach").collection("classes");
    const instructorsCollection = client
      .db("fdTeach")
      .collection("instructors");

    // student collections
    const selectedClassesCollection = client
      .db("fdTeach")
      .collection("selectedClasses");

    /**------------Users Collection Apis-----------**/
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const body = req.body;
      const result = await usersCollection.insertOne(body);
      res.send(result);
    });
    /**------------Users Collection Apis-----------**/
    app.get("/classes", async (req, res) => {
      const query = {};
      const options = {
        sort: { number_of_students: -1 },
      };
      const result = await classesCollection.find(query, options).toArray();
      res.send(result);
    });
    /**------------ Classes Collection APis--------**/

    /**------------ Instructors Collection Apis----**/
    app.get("/instructors", async (req, res) => {
      const query = {};
      const options = {
        sort: {
          number_of_students: -1,
        },
      };
      const result = await instructorsCollection.find(query, options).toArray();
      res.send(result);
    });
    /**------------ Instructors Collection Apis----**/

    /**------------ Selected Classes Collection Apis -----**/
    app.get("/get-all-selected-classes", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = {
          student_email: email,
        };
      } else {
        const allResult = await selectedClassesCollection.find(query).toArray();
        return res.send(allResult);
      }

      const result = await selectedClassesCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/selected-classes", async (req, res) => {
      const mySelectedClasses = req.body;
      const result = await selectedClassesCollection.insertOne(
        mySelectedClasses
      );
      res.send(result);
    });

    app.delete("/selected-classes/:id", async (req, res) => {
      const result = await selectedClassesCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });
    /**------------ Selected Classes Collection Apis -----**/

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server running");
});

app.listen(port, () => {
  console.log(`server running on port: ${port}`);
});
