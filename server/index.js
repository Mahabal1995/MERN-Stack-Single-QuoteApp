const express = require("express");
const cors = require("cors");

const mongoose = require("mongoose");
const User = require("./models/user.model");

const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// mongoose.connect("mongodb://127.0.0.1:27017/mern-fullstack-register-app");

mongoose
  .connect("mongodb://127.0.0.1:27017/mern-fullstack-register-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.post("/api/register", async (req, res) => {
  console.log(req.body);

  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "Duplicate email" });
  }
});

app.post("/api/login", async (req, res) => {
  console.log(req.body.password);
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  console.log(user);

  if (user) {
    try {
      const token = jwt.sign(
        {
          name: user.name,
          email: user.email,
        },
        "secret123"
      );
      return res.json({ status: "ok", user: token });
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.json({ status: "ok", user: false });
  }
});

app.post("/api/quote", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "secret123");
    const email = decoded.email;
    await User.updateOneOne(
      { email: email },
      { $set: { quote: req.body.quote } }
    );

    return res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      error: "invalid token",
    });
  }
});

app.get("/api/quote", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "secret123");
    const email = decoded.email;
    const user = await User.findOne({ email: email });

    return res.json({ status: "ok", quote: user.quote });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      error: "invalid token",
    });
  }
});

app.listen(1337, () => {
  console.log("Server Started on 1337....");
});
