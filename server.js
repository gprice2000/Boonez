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
const { redirect } = require("express/lib/response");
// create an array of strings of user id , parse
// urls to get current user, if theyre logging off
// pop their name from array and redirect them to 
// main page
let session = [];

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

//get username through session id
function getCurUser(req) {
  let user;
  session.find( ele => {
    user = ele.username;
    return ele.id == req.session.id;
  })
  return user;
}

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
    let input = req.body;
    //deleted white space and converted to lowercase for certain entries
    input.username = input.username.replace(/\s+/g,'');
    input.fname = input.fname.replace(/\s+/g, '').toLowerCase();
    input.lname = input.lname.replace(/\s+/g, '').toLowerCase();
    input.email = input.email.replace(/\s+/g,'');
    console.log(input);
    let dash = {
      username: input.username,
      fname: input.fname,
      lname: input.lname,
      friends: [],
      classes: [],
      aboutme: null,
      profilePic: null,
      accountType:"personal"
    }
    dbc
      .db("Boonez")
      .collection("profiles")
      .findOne({ username: input.username}, function (err, result) {
        if (result) {
          res.send("username already in use");
        } else {
          dbc
            .db("Boonez")
            .collection("profiles")
            .findOne({ email: input.email }, function (err, result) {
              if (result) {
                res.send("email already in use");
              } else {
                let pass = input.password;
                bcrypt.genSalt(10, function (saltError, salt) {
                  if (saltError) {
                    throw saltError;
                  } else {
                    bcrypt.hash(pass, salt, function (hashError, hash) {
                      if (hashError) {
                        throw hashError;
                      }
                      input.password = hash;
                      dbc
                        .db("Boonez")
                        .collection("UserDashboard")
                        .insertOne(dash)

                      dbc
                        .db("Boonez")
                        .collection("profiles")
                        .insertOne(input);
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
    let input = req.body;
    //search current session array to determine if user is logged in already
    if (session.find(ele => ele.id == req.session.id) != undefined) {
      //res.redirect(`/dashboard/?user=${ele.username}`);
      res.redirect('/dashboard');
    }
    else {
      dbc
        .db("Boonez")
        .collection("profiles")
        .findOne({ username: input.username }, function (err, result) {
          if (!result) {
            console.log("Unable to locate account");
            res.send("Cannot find username");
          } else {
            bcrypt.compare(
              input.password,
              result.password,
              function (error, isMatch) {
                if (error) {
                  throw error;
                } else if (!isMatch) {
                  res.send("Password incorrect");
                } else {
                  //get current session with username and push to session array
                  let sn = req.session;
                  sn.username = input.username;
                  session.push(sn);
                  if (result.accountType == "business") {
                    res.redirect(`/BusinessDashboard/?user=${input.username}`)
                  } else {
                    res.redirect(`/dashboard/?user=${input.username}`);
                  }
                }
              }
            );
          }
        });
      }
  });
});

//socket.io implementation

//TODO: add a logout page
app.get("/logout", (req, res) => {
  console.log("all users in session: " + session)
  //let cur_user = url.parse(req.url, true).query.user;
  // destroy session and remove from session array 
  req.session.destroy();
  session.splice(session.indexOf(req.session.id),1);
  res.redirect("/");
});

//routing calendar.js to database
app.post("/Pub_calendar", function (req, res) {
  db.then(function (dbc) {
    //let cur_user = url.parse(req.url, true).query.user;
    let cur_user = getCurUser(req);
    console.log("CUR USER: " + cur_user)
    let cal_col = dbc.db("Boonez").collection("UserCalendars");
    let event = req.body;
    try {
      const query = { username: { $eq: cur_user } };
      cal_col.findOne(query).then((doc) => {
        if (doc == undefined) {
          cal_col.insertOne({
            username: cur_user,
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
      //let cur_user = url.parse(req.url, true).query.user;//session.userid;
      let cur_user = getCurUser(req);
      const query = { username: { $eq: cur_user } };
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
    //let cur_user = url.parse(req.url, true).query.user;//session.userid;
    let cur_user = getCurUser(req);
    let cal_col = dbc.db("Boonez").collection("UserCalendars");
    let event = req.body;
    try {
      const query = { username: { $eq: cur_user } };
      cal_col.findOne(query).then((doc) => {
        if (doc == undefined) {
          cal_col.insertOne({
            username: cur_user,
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
      //let cur_user = url.parse(req.url, true).query.user;//session.userid;
      let cur_user = getCurUser(req);

      const query = { username: { $eq: cur_user } };
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
      //let cur_user = url.parse(req.url, true).query.user;//session.userid;
      let cur_user = getCurUser(req);
      let eventData = req.body.data;
      let cal_type = eventData.cal_type;
      const query = { username: { $eq: cur_user } };
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
      let cur_user = getCurUser(req);

      //let cur_user = url.parse(req.url, true).query.user;//session.userid;
      console.log("cur user for delete : " + cur_user)
      const query = { username: { $eq: cur_user } };
      let eventData = req.body.info;

      console.log("Event to Delete: " + eventData);
      calDb.findOne(query).then((doc) => {
        var cal =
          req.body.cal_type == "pri"
            ? doc.PriEventArray
            : doc.PubEventArray;
        var fil = cal.filter(function (val, ind, ar) {
          if (val.id != eventData.id) return true;
        });
        console.log(fil);
        if (req.body.cal_type == "pri") {
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
    //let cur_user = url.parse(req.url, true).query.user;//session.userid;
    let cur_user = getCurUser(req);

    console.log("curuser : " + cur_user)
    const query = { username: { $eq: cur_user } };
    let acttyp = "";
    let col = "";
    dbc
      .db("Boonez")
      .collection("profiles")
      .findOne(query)
      .then(doc => {
        
        console.log("doc.acctype: " + doc.accountType)
        acttyp = doc.accountType;
    });
    console.log("actype; " + acttyp)
    acttyp == "personal" ?  col = "BusinessDashboard" : col = "UserDashboard" ;
    console.log("piclink: " + req.body.PicLink )
    console.log('col: ' + col)
    let profdb = dbc.db("Boonez").collection(col);
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
    //let cur_user = url.parse(req.url, true).query.user;//session.userid;
    let cur_user = getCurUser(req);

    if (session.find(ele => {
      cur_user = ele.username;
      return ele.id == req.session.id;}) == undefined) {
        res.json("nsi") //not signed in flag is returned
    } else {
        const query = { username: { $eq: cur_user } };
        dbc
          .db("Boonez")
          .collection("UserDashboard")
          .findOne(query)
          .then((doc) => {
            if (doc != null) {
              console.log("doc : " + doc.profilePic)
              res.json(doc);
            } else {
              res.json(null);
            }
          });
      }
  });
});

app.get("/businessDashboard", function (req, res) {
  db.then(function (dbc) {
    //let cur_user = url.parse(req.url, true).query.user;//session.userid;
    let cur_user = getCurUser(req);

    const query = { username: { $eq: cur_user } };
    dbc
      .db("Boonez")
      .collection("BusinessDashboard")
      .findOne(query)
      .then((doc) => {
        if (doc != null) {
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
    let input = req.body;
    const businessProfile = {
      name: input.businessName,
      username: input.username.replace(/\s+/g,''),
      password: undefined,
      email: input.email.replace(/\s+/g,''),
      followers: [],
      accountType: "business",
    };

    const businessDash = {
      name: input.businessName,
      username: businessProfile.username,
      email: businessProfile.email,
      followers: [],
      profilePic: undefined
    }
    dbc
      .db("Boonez")
      .collection("profiles")
      .findOne({ username: businessProfile.username }, function (err, result) {
        if (result) {
          res.send("username already in use");
        } else {
          dbc
            .db("Boonez")
            .collection("profiles")
            .findOne({ email: businessProfile.email }, function (err, result) {
              if (result) {
                res.send("email already in use");
              } else {
                let pass = input.password;
                bcrypt.genSalt(10, function (saltError, salt) {
                  if (saltError) {
                    throw saltError;
                  } else {
                    bcrypt.hash(pass, salt, function (hashError, hash) {
                      if (hashError) {
                        throw hashError;
                      }
                      businessProfile.password = hash;
                      dbc
                        .db("Boonez")
                        .collection("profiles")
                        .insertOne(businessProfile);

                      dbc
                        .db("Boonez")
                        .collection("BusinessDashboard")
                        .insertOne(businessDash)
                      
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
  console.log("login session: " + session)
  let curuser;
  console.log(session.find(ele => ele.id == req.session.id) )
  if (session.find(ele => {

    curuser = ele.username;
    return (ele.id == req.session.id);

  }) != undefined) {
    console.log("user from session array: " + curuser)
    res.redirect(`/dashboard/?user=${curuser}`);
  }
  else {
    res.sendFile("/pages/landing/login.html", {
      root: __dirname,
    });
  }
});

app.get("/images/word_logo.png", (req, res) => {
  res.sendFile("/images/word_logo.png", {
    root: __dirname,
  });
});

app.get("/", (req, res) => {
  //session = req.session;
  res.sendFile("index.html", {
    root: __dirname,
  });
});

app.get("/images/blank-profile-pic.png", (req, res) => {
  res.sendFile("/images/blank-profile-pic.png", {
    root: __dirname,
  });
});

app.get("/images/add-user.png", (req, res) => {
  res.sendFile("/images/add-user.png", {
    root: __dirname,
  });
});

app.get("/dashboard", (req, res) => {
  console.log("/dashboard")
  res.sendFile(__dirname + "/pages/main-app/dashboard.html");
});

//route to business dashboard
app.get("/BusinessDashboard", (req,res) => {
  res.sendFile(__dirname + "/pages/main-app/busDashboard.html");
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
    let cur_user = getCurUser(req);

    dbc
      .db("Boonez")
      .collection("profiles")
      .findOne({ username: cur_user }, (err, result) => {
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

app.get("/findFriends", function (req, res) {
  console.log("get /findfriends")
  res.sendFile(__dirname + "/pages/main-app/findFriends.html");
});

app.get("/scripts/findFriends.js", function (req,res) {
  res.sendFile(__dirname + "/scripts/findFriends.js");
})

app.get("/styles/findFriends.css", function (req,res) {
  res.sendFile(__dirname + "/styles/findFriends.css");
})
//search for specific user in database
//TODO: add class search functionality
app.post("/findFriend", (req,res) => {
  db.then(function(dbc) {
    let input = req.body;
    let col = dbc
      .db("Boonez")
      .collection("UserDashboard");
    let findings;   
    if (input.fname != '' &&
        input.lname != '' &&
        input.username != ''){
          findings = col.find({$and: [{ fname: {$eq: req.body.fname}},
            { lname: {$eq: req.body.lname}},
            { username: {$eq: req.body.username}}]})
    }
    else {
      //search for fname + lname and username if provided
      //fname requires lname to search and vice-versa
      findings = col.find( {$or: [
          {$and: [{ fname: {$eq: req.body.fname}},
          { lname: {$eq: req.body.lname}}]},
          { username: {$eq: req.body.username}} ]})
    }
    findings.toArray((err,result) => {
        console.log("db search output: " + result)
        res.json(result);
      })
  })
})

//adds specific friend to friends list using user
app.post("/addFriend", (req,res) => {
  db.then(function(dbc) {
    let cur_user = getCurUser(req);
    const query = { username: { $eq: cur_user} };
    dbc
      .db("Boonez")
      .collection("UserDashboard")
      .findOne({ username: {$eq: req.body.username}})
      .then(doc => {
        let friend = {
          username: doc.username,
          fullname: doc.fname + ' ' + doc.lname,
          profilePic: doc.profilePic
        }
        dbc
          .db("Boonez")
          .collection("UserDashboard")
          .updateOne(query, 
            {$push: {"friends": friend}})
      });

  })
})

//get all user friends
app.get("/getFriends", (req,res) => {
  db.then(function(dbc) {
    //let cur_user = url.parse(req.url, true).query.user;
    let cur_user = getCurUser(req);
    if (session.find(ele => ele.id == req.session.id) == undefined) {
      res.json("nsi") //not signed in flag is returned
    } else {
      const query = { username: { $eq: cur_user} };
      dbc
        .db("Boonez")
        .collection("UserDashboard")
        .findOne(query)
        .then(doc => {
          res.json(doc)
        })
    }
  })
})

app.get("/styles/busDashboard.css", (req,res) => {
  res.sendFile(__dirname + "/styles/busDashboard.css");
});

app.get("/scripts/busDashboard.js", (req,res) => {
  res.sendFile(__dirname + "/scripts/busDashboard.js")
})

server.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
