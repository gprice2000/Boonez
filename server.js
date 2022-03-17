const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const { getSystemErrorMap } = require("util");
const favicon = require("serve-favicon");

//connect to database
const db = mongodb.MongoClient.connect(
  "mongodb+srv://mazzaresejv:B00nze2022@cluster0.awpng.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
);

//set one day time for cookies to expire
const oneDay = 1000 * 60 * 60 * 24;
//setting up express-sessions
app.use(
  sessions({
    secret: "skeyfhrgfgrfrty96tqfh828",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

//set up cookie parser
app.use(cookieParser());
// let session = { userid: null };

//serving favicon
app.use(favicon(__dirname + "/favicon.ico"));
let date_ob = new Date(); //used for keeping track of messages

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(
//   express.static(path.join(__dirname + "/New_capstone/Boonez-landing_pages"))
// );
let messageRecipient;
async function socketIOConnection() {
  let userId = await session.userid;
  io.on("connection", (socket) => {
    //maybe send all messages in database when connected
    socket.on("chat message", (msg) => {
      //display message in client and send message to database

      //TODO need to keep track of message recipient
      //TODO need to encrypt messages using bcrypt
      io.emit("chat message", msg);
      console.log(`${userId} sent a message: ${msg}`);
      db.then((dbc) => {
        dbc
          .db("Boonez")
          .collection("messages")
          .insertOne({
            userFrom: userId,
            userTo: "gp2",
            messageContent: msg,
            timeSent: `${date_ob.getHours()}:${date_ob.getMinutes()}`,
            date: `${
              date_ob.getMonth() + 1
            }-${date_ob.getDate()}-${date_ob.getFullYear()}`,
          });
      });
      // console.log("message: " + msg);
    });
  });
}
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

                session = req.session;
                session.userid = req.body.username;
                console.log(session);
                res.redirect("/dashboard");
              }
            }
          );
        }
      });
  });
});

//socket.io implementation

//TODO: add a logout page
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
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
app.get("/favicon.ico", (req, res) => {
  res.sendFile("favicon.ico", {
    root: __dirname,
  });
});

app.get("/", (req, res) => {
  session = req.session;

  res.sendFile("index.html", {
    root: __dirname,
  });
});
app.get("/dashboard", (req, res) => {
  res.sendFile("/pages/main-app/dashboard.html", {
    root: "./",
  });
});
app.get("/styles/dashboard.css", (req, res) => {
  res.sendFile("/styles/dashboard.css", {
    root: "./",
  });
});
app.get("/styles/messages.css", (req, res) => {
  res.sendFile(__dirname + "/styles/messages.css");
});

app.get("/messages", (req, res) => {
  res.sendFile(__dirname + "/pages/main-app/messages.html");
  socketIOConnection();
});
server.listen(3000, () => {
  console.log("listening on *:3000");
});
