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
//const { join } = require("path/posix");
const favicon = require("serve-favicon");
const querystring = require("querystring");
const url = require("url");
const res = require("express/lib/response");
const CryptoJS = require("crypto-js");

let session = { userid: "" };

//load favicon
app.use(favicon(__dirname + "/favicon.ico"));

const db = mongodb.MongoClient.connect(
  "mongodb+srv://mazzaresejv:B00nze2022@cluster0.awpng.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
);

const oneDay = 1000 * 60 * 60 * 24;
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

//used for keeping track of messages
let date_ob = new Date();

let chatters = [];
function socketIOConnection(from, to) {
  let userId = from;
  let recipient = to;

  io.once("connection", (socket) => {
    chatters.push({ username: from, usersocket: socket.id });
    io.emit("userConnected", socket.id); // let user = url.parse(req.url, true).query.userFrom;

    //remove user from array of current users when disconnected
    socket.on("disconnect", () => {
      chatters = chatters.filter((x) => x.usersocket != socket.id);
    });

    socket.on("private message", (msgData) => {
      let recipient = chatters.find((x) => x.username == msgData.recipient);
      let recipientSocket = recipient ? recipient.usersocket : 0;

      //send message only to the right sender and reciever
      io.to(recipientSocket).emit("private message", msgData);
      io.to(msgData.usersocket).emit("private message", msgData);

      let encryptedMsg = CryptoJS.AES.encrypt(
        msgData.msg,
        "secret key 123"
      ).toString();

      var ts = Math.round(date_ob.getTime() / 1000);
      db.then((dbc) => {
        dbc
          .db("Boonez")
          .collection("messages")
          .insertOne({
            userFrom: msgData.user,
            userTo: msgData.recipient,
            read: false,
            messageContent: encryptedMsg,
            unixTime: ts,
            timeSent: Number(`${date_ob.getHours()}${date_ob.getMinutes()}`),
            daySent: Number(
              `${
                date_ob.getMonth() + 1
              }${date_ob.getDate()}${date_ob.getFullYear()}`
            ),
            timeDateString: `${date_ob.toLocaleDateString()} at ${date_ob.toLocaleTimeString()}`,
          });
      });
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
                      let input = req.body;
                      input.friends = [];
                      console.log(input);
                      let dash = {
                        username: input.username,
                        friends: input.friends,
                        classes: [],
                        aboutme: null
                      }
                      dbc
                        .db("Boonez")
                        .collection("UserDashboard")
                        .insertOne(dash)

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
                res.send("Password incorrect");
              } else {
                session = req.session;
                session.userid = req.body.username;
                console.log("SESSION USER ID: " + session.userid)
                res.redirect(`/dashboard/?user=${session.userid}`);
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

//routing calendar.js to database
app.post("/Pub_calendar", function (req, res) {
  db.then(function (dbc) {
    let cur_user = session.userid;
    let cal_col = dbc.db("Boonez").collection("UserCalendars");
    let event = req.body;
    try {
      const query = { user: { $eq: cur_user } };
      cal_col.findOne(query).then((doc) => {
        if (doc == undefined) {
          cal_col.insertOne({
            user: cur_user,
            PubEventArray: [event],
            PriEventArray: [],
          });
        } else {
          let tmp_array = doc.PubEventArray;
          tmp_array.push(event);
          cal_col.updateOne(query, { $set: { PubEventArray: tmp_array } });
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
});

app.get("/Pub_calendar", function (req, res) {
  db.then(function (dbc) {
    try {
      let cur_user = session.userid;
      const query = { user: { $eq: cur_user } };
      dbc
        .db("Boonez")
        .collection("UserCalendars")
        .findOne(query)
        .then((doc) => {
          if (doc != null) res.json(doc.PubEventArray);
        });
    } catch (err) {
      console.log(err);
    }
  });
});

app.post("/Priv_calendar", function (req, res) {
  db.then(function (dbc) {
    let cur_user = session.userid;
    let cal_col = dbc.db("Boonez").collection("UserCalendars");
    let event = req.body;
    try {
      const query = { user: { $eq: cur_user } };
      cal_col.findOne(query).then((doc) => {
        if (doc == undefined) {
          cal_col.insertOne({
            user: cur_user,
            PubEventArray: [],
            PriEventArray: [event],
          });
        } else {
          let tmp_array = doc.PriEventArray;
          tmp_array.push(event);
          cal_col.updateOne(query, { $set: { PriEventArray: tmp_array } });
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
});

app.get("/Priv_calendar", function (req, res) {
  db.then(function (dbc) {
    try {
      let cur_user = session.userid;
      const query = { user: { $eq: cur_user } };
      dbc
        .db("Boonez")
        .collection("UserCalendars")
        .findOne(query)
        .then((doc) => {
          if (doc != null) {
            res.json(doc.PriEventArray);
          }
        });
    } catch (err) {
      console.log(err);
    }
  });
});

app.post("/editEvent", function (req, res) {
  db.then(function (dbc) {
    try {
      let calDb = dbc.db("Boonez").collection("UserCalendars");
      let cur_user = session.userid;
      let eventData = req.body.data;
      let cal_type = eventData.cal_type;
      const query = { user: { $eq: cur_user } };
      delete eventData.cal_type;
      console.log(eventData);
      if (cal_type == "pri") {
        calDb.findOne(query).then((doc) => {
          let ind = doc.PriEventArray.findIndex(
            (ele) => ele.id == eventData.id
          );
          doc.PriEventArray[ind] = eventData;
          calDb.replaceOne(query, doc);
        });
      } else {
        calDb.findOne(query).then((doc) => {
          let ind = doc.PubEventArray.findIndex(
            (ele) => ele.id == eventData.id
          );
          doc.PubEventArray[ind] = eventData;
          calDb.replaceOne(query, doc);
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
});

app.delete("/deleteEvent", function (req, res) {
  db.then(function (dbc) {
    try {
      let calDb = dbc.db("Boonez").collection("UserCalendars");

      let cur_user = session.userid;
      const query = { user: { $eq: cur_user } };
      let eventData = req.body.data.info;
      console.log("Event to Delete: " + eventData);
      calDb.findOne(query).then((doc) => {
        var cal =
          req.body.data.cal_type == "pri"
            ? doc.PriEventArray
            : doc.PubEventArray;
        var fil = cal.filter(function (val, ind, ar) {
          if (val.id != eventData.id) return true;
        });
        console.log(fil);
        if (req.body.data.cal_type == "pri") {
          calDb.findOneAndUpdate(query, { $set: { PriEventArray: fil } });
        } else {
          calDb.findOneAndUpdate(query, { $set: { PubEventArray: fil } });
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
});

app.post("/profilePicture", function (req, res) {
  db.then(function (dbc) {
    let cur_user = session.userid;
    const query = { user: { $eq: cur_user } };
    console.log(req.body);
    let profdb = dbc.db("Boonez").collection("UserDashboard");
    profdb.updateOne(
      query,
      {
        $set: { profilePic: req.body.PicLink },
      },
      { upsert: true }
    );
  });
});

app.get("/userDashboard", function (req, res) {
  db.then(function (dbc) {
    let cur_user = session.userid;
    const query = { user: { $eq: cur_user } };
    let doc = dbc
      .db("Boonez")
      .collection("UserDashboard")
      .findOne(query)
      .then((doc) => {
        if (doc != null) {
          console.log(doc);
          res.json(doc);
        } else {
          res.json(null);
        }
      });
  });
});

app.get("/styles/landingPage.css", function (req, res) {
  res.sendFile("/styles/landingPage.css", {
    root: __dirname,
  });
});

app.get("/styles/signup.css", function (req, res) {
  res.sendFile("/styles/signup.css", {
    root: __dirname,
  });
});
app.get("/styles/index.css", function (req, res) {
  res.sendFile("/styles/index.css", {
    root: __dirname,
  });
});

app.get("/signup", function (req, res) {
  res.sendFile("/pages/landing/signup.html", {
    root: __dirname,
  });
});

app.get("/signuptype", (req, res) => {
  res.sendFile("/pages/landing/signuptype.html", {
    root: __dirname,
  });
});

app.get("/styles/signuptype.css", (req, res) => {
  res.sendFile("/styles/signuptype.css", {
    root: __dirname,
  });
});
app.get("/businessSignup", (req, res) => {
  res.sendFile("/pages/landing/businessSignup.html", {
    root: __dirname,
  });
});
app.post("/businessSignup", function (req, res) {
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

                      const businessProfile = {
                        name: req.body.businessName,
                        username: req.body.username,
                        password: hash,
                        email: req.body.email,
                        followers: [],
                        accountType: "business",
                      };
                      dbc
                        .db("Boonez")
                        .collection("profiles")
                        .insertOne(businessProfile);
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

app.get("/styles/businessSignup.css", (req, res) => {
  res.sendFile("/styles/businessSignup.css", {
    root: __dirname,
  });
});
app.get("/login", function (req, res) {
  res.sendFile("/pages/landing/login.html", {
    root: __dirname,
  });
});

app.get("/images/word_logo.png", (req, res) => {
  res.sendFile("/images/word_logo.png", {
    root: __dirname,
  });
});

app.get("/", (req, res) => {
  session = req.session;

  res.sendFile("index.html", {
    root: __dirname,
  });
});

app.get("/images/blank-profile-pic.png", (req, res) => {
  res.sendFile("/images/blank-profile-pic.png", {
    root: __dirname,
  });
});

app.get("/dashboard", (req, res) => {
  res.sendFile("/pages/main-app/dashboard.html", {
    root: __dirname,
  });
});

app.get("/styles/dashboard.css", (req, res) => {
  res.sendFile("/styles/dashboard.css", {
    root: __dirname,
  });
});

app.get("/styles/messages.css", (req, res) => {
  res.sendFile(__dirname + "/styles/messages.css");
});

app.get("/messages", (req, res) => {
  res.sendFile(__dirname + "/pages/main-app/messages.html");
  //parse query string and send recipient name
  let from = url.parse(req.url, true).query.userFrom;
  let recipient = url.parse(req.url, true).query.userTo;
  socketIOConnection(from, recipient);
});

app.get("/messages/getMessages", (req, res) => {
  //parse query string and send recipient name
  recipient = url.parse(req.url, true).query.userTo;
  let user = url.parse(req.url, true).query.userFrom;

  db.then((dbc) => {
    dbc
      .db("Boonez")
      .collection("messages")
      .find({
        $or: [
          { userFrom: user, userTo: recipient },
          { userFrom: recipient, userTo: user },
        ],
      })
      .toArray((err, result) => {
        if (result) {
          for (item of result) {
            var bytes = CryptoJS.AES.decrypt(
              item.messageContent,
              "secret key 123"
            );
            var originalText = bytes.toString(CryptoJS.enc.Utf8);
            item.messageContent = originalText;
          }
          res.json(result);
        } else {
          // console.log(session);
          res.send(500, "something went wrong");
        }
      });
  });
});
app.get("/scripts/messages.js", (req, res) => {
  req.sendFile("/scripts/messages.js", {
    root: __dirname,
  });
});
/*routing to fullcalendar main.css */
app.get("/node_modules/fullcalendar/main.css", function (req, res) {
  res.sendFile("/node_modules/fullcalendar/main.css", {
    root: __dirname,
  });
});
/*routing to fullcalendar main.js */
app.get("/node_modules/fullcalendar/main.js", function (req, res) {
  res.sendFile("/node_modules/fullcalendar/main.js", {
    root: __dirname,
  });
});

/*routing to calendar.js*/
app.get("/scripts/calendar.js", function (req, res) {
  res.sendFile("/scripts/calendar.js", {
    root: __dirname,
  });
});

app.get("/styles/calendar.css", function (req, res) {
  res.sendFile("/styles/calendar.css", {
    root: __dirname,
  });
});

app.get("/scripts/dashboard.js", function (req, res) {
  res.sendFile("/scripts/dashboard.js", {
    root: __dirname,
  });
});

app.get("/", (req, res) => {
  res.sendFile("index.html", {
    root: __dirname,
  });
});

//Message overview page
app.get("/scripts/messagesOverview.js", (req, res) => {
  res.sendFile("/scripts/messagesOverview.js", {
    root: __dirname,
  });
});
app.get("/styles/messagesOverview.css", (req, res) => {
  res.sendFile("/styles/messagesOverview.css", {
    root: __dirname,
  });
});
app.get("/messagesOverviewPage", (req, res) => {
  res.sendFile(__dirname + "/pages/main-app/messagesOverview.html");
});
app.get("/scripts/messagesOverview.js", (req, res) => {
  res.sendFile(__dirname + "/scripts/messagesOverview.js");
});
app.get("/messagesOverview", (req, res) => {
  db.then((dbc) => {
    dbc
      .db("Boonez")
      .collection("profiles")
      .findOne({ username: session.userid }, (err, result) => {
        if (result) {
          res.json(result);
        } else {
          // console.log(session);
          res.status(500).send("something went wrong");
        }
      });
  });
});
app.get("/messages/getFriends", async (req, res) => {
  let curUser = url.parse(req.url, true).query.userFrom;
  //find friends list
  //get all friend objects of current users friends
  db.then((dbc) => {
    dbc
      .db("Boonez")
      .collection("profiles")
      .find({ friends: { $in: [curUser] } })
      .toArray((err, result) => {
        if (result) {
          res.json(result);
        } else {
          res.status(500).send("something went wrong");
        }
      });
  });
});

server.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
