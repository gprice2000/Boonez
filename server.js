const express = require("express");
const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const path = require("path");
const { getSystemErrorMap } = require("util");

const app = express();
const db = mongodb.MongoClient.connect(
  "mongodb+srv://mazzaresejv:B00nze2022@cluster0.awpng.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  express.static(path.join(__dirname + "/New_capstone/Boonez-landing_pages"))
);

app.post("/signup", function (req, res) {
  db.then(function (dbc) {
    let pass = req.body.password;
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        throw saltError;
      } else {
        bcrypt.hash(pass, salt, function (hashError, hash) {
          if (hashError) {
            throw hashError;
          }
          req.body.password = hash;
          dbc.db("Boonez").collection("profiles").insertOne(req.body);
          res.redirect("/login");
        });
      }
    });
  });
});

app.post("/login", function (req, res) {
  db.then(function (dbc) {
    dbc
      .db("Boonez")
      .collection("profiles")
      .findOne({ username: req.body.username }, function (err, result) {
        if (!result) {
          console.log("Unable to locate account");
          res.send("<script>alert('Incorrect username or password');</script>");
          // res.redirect("back");
        } else {
          bcrypt.compare(
            req.body.password,
            result.password,
            function (error, isMatch) {
              if (error) {
                throw error;
              } else if (!isMatch) {
                console.log("Password doesn't match!");
              } else {
                console.log("Password matches!");

                res.redirect("/dashboard");
              }
            }
          );
        }
      });
  });
});

app.get("/styles/landingPage.css", function (req, res) {
  res.sendFile("/styles/landingPage.css", {
    root: "./",
  });
});

app.get("/styles/signup.css", function (req, res) {
  res.sendFile("/styles/signup.css", {
    root: "./",
  });
});
app.get("/styles/index.css", function (req, res) {
  res.sendFile("/styles/index.css", {
    root: "./",
  });
});

app.get("/signup", function (req, res) {
  res.sendFile("/pages/landing/signup.html", {
    root: "./",
  });
});
app.get("/login", function (req, res) {
  res.sendFile("/pages/landing/login.html", {
    root: "./",
  });
});
app.get("/view-feedbacks", function (req, res) {
  db.find({})
    .toArrary()
    .then(function (profiles) {
      res.status(200).json(feedbacks);
    });
});
app.get("/images/word_logo.png", (req, res) => {
  res.sendFile("/images/word_logo.png", {
    root: "./",
  });
});

app.get("/", (req, res) => {
  res.sendFile("index.html", {
    root: "./",
  });
});
app.get("/dashboard", (req, res) => {
  res.sendFile("/pages/main-app/dashboard.html", {
    root: "./",
  });
});

app.listen(3000);
