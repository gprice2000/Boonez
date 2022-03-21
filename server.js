const express = require("express");
const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require('cookie-parser');
const { getSystemErrorMap } = require("util");

const app = express();
const db = mongodb.MongoClient.connect(
  "mongodb+srv://mazzaresejv:B00nze2022@cluster0.awpng.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  express.static(path.join(__dirname + "/New_capstone/Boonez-landing_pages"))
);

app.post("/signup", function (req, res) {
  db.then(function (dbc) {
    dbc
      .db("Boonez")
      .collection("profiles")
      .findOne({ username: req.body.username }, function (err, result) {
        if (result) {
          res.send("username already in use");
        } else {
          dbc
            .db("Boonez")
            .collection("profiles")
            .findOne({ email: req.body.email }, function (err, result) {
              if (result) {
                res.send("email already in use");
              } else {
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
                      dbc
                        .db("Boonez")
                        .collection("profiles")
                        .insertOne(req.body);
                      res.redirect("/login");
                    });
                  }
                });
              }
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
          res.send("Cannot find username");
        } else {
          bcrypt.compare(
            req.body.password,
            result.password,
            function (error, isMatch) {
              if (error) {
                throw error;
              } else if (!isMatch) {
                console.log("Password doesn't match!");
                res.send("Password incorrect");
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

//routing calendar.js to database
app.post("/calendar", function(req,res) {
  db.then(function(dbc) {
    let cur_user = req.cookies.userData;
    let cal_col = dbc.db("Boonez")
    .collection("UserCalendars");
    let event = req.body;
    try {
      const query = { "user": {"$eq": cur_user}};
      cal_col
      .findOne(query).then(doc => {
        if (doc == undefined) {
          cal_col.insertOne({user: cur_user, eventArray: [event]});
        }
        else {
          let tmp_array = doc.eventArray;
          tmp_array.push(event);
          cal_col.updateOne(query,
            {$set: {"eventArray": tmp_array}});
        }
      });
    } catch (err) {
        console.log(err);
    }
   })
});

app.get("/calendar", function(req,res) {
  db.then(function(dbc) {
    try {
      let cur_user = req.cookies.userData;
      const query = { "user": {"$eq": cur_user}};
      dbc.db("Boonez")
      .collection("UserCalendars")
      .findOne(query)
      .then( doc => {
        res.json(doc.eventArray);
      });
    } catch (err) {
        console.log(err);
    }
  })
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
/*
app.get("/view-feedbacks", function (req, res) {
  db.find({})
    .toArrary()
    .then(function (profiles) {
      res.status(200).json(feedbacks);
    });
});
*/
app.get("/images/word_logo.png", (req, res) => {
  res.sendFile("/images/word_logo.png", {
    root: "./",
  });
});

app.get("/images/blank-profile-pic.png", (req, res) => {
  res.sendFile("/images/blank-profile-pic.png", {
    root: "./",
  });
});

app.get("/dashboard", (req, res) => {
  res.sendFile("/pages/main-app/dashboard.html", {
    root: "./",
  });
});

/*routing to fullcalendar main.css */
app.get("/node_modules/fullcalendar/main.css", function (req, res) {
  res.sendFile("/node_modules/fullcalendar/main.css", {
    root: "../",
  });
});

/*routing to fullcalendar main.js */
app.get("/node_modules/fullcalendar/main.js", function (req, res) {
  res.sendFile("/node_modules/fullcalendar/main.js", {
    root: "../",
  });
});

/*routing to calendar.js*/
app.get("/Boonez-master/scripts/calendar.js", function (req, res) {
  res.sendFile("/Boonez-master/scripts/calendar.js", {
    root: "../",
  });
});

app.get("/", (req, res) => {
  res.sendFile("index.html", {
    root: "./",
  });
});


app.listen(3000);
