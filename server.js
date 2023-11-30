
const express = require('express');
const fs = require('fs');
const { createServer } = require('http');
const cryptoV = require('crypto');
const path  = require('path');
const redisClient = require('redis');
const nodemailer = require('nodemailer');
const rediStore = require('connect-redis');
const  Userfront = require('@userfront/core')
const mysql = require('mysql');
const mysql2 = require('mysql2');
const { Http2ServerRequest } = require("http2");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const { Server } = require('socket.io');
const { data } = require('jquery');
const exp = require('constants');
const axios = require('axios');
const session = require('express-session');
const { reset } = require('nodemon');
const { CLIENT_RENEG_LIMIT } = require('tls');
const { time } = require('console');
const bcrypt = require('bcryptjs');
require('dotenv').config();

//for bcryptjs
const saltRounds = 10;

//json files
const prodata = require('./data.json');
const prodata2 = require('./datanb.json');
const { unescape } = require('querystring');
const { callbackPromise } = require('nodemailer/lib/shared');

//main const
const app = express();
const server = createServer(app);
const io = new Server(server , {
    cors: {
        origin : ['*'],
        methods : ['GET' , 'POST'],
        credentials: true
    }
})


// const db = new mysql.createConnection({
//     host : 'localhost',
//     user: 'root',
//     password: '',
//     database: 'master_quiz',

// });



/// database connection
const db = new mysql.createConnection({
    host : process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: true,
      },
    
});





db.connect(function (err) {
    if(err) throw err;
    console.log('-------------------')
    console.log("Database connected");
    console.log("-------------------");
})



//session middleware
var tsec = 1000;
var tmin = 60000; //1 min
const sessionMiddleware = session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 5*tmin,
        sameSite: 'lax'
    }
});



app.use(sessionMiddleware , function(req,res, next) {

    // if(req.session.log == true) { 
    //     if(req.session.once!=true) req.session.h = req.session.cookie.expires.getTime();
    //     req.session.once = true;
        
    // }

    
    //     console.log(">> " , req.session.h)
    //     console.log('-- ' ,  (Date.now() - 5000))
    //     if( req.session.h < new Date(Date.now())) console.log("c presque fini mgl")
    

    next();
});


//middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser())
io.engine.use(sessionMiddleware);


//folder handler
app.use(express.static(__dirname + "/script/"));
app.use(express.static(__dirname + "/style/"));
app.use(express.static(__dirname + "/sound/"));
app.use(express.static(__dirname + "/img/"));


//global var
var rooms = [];
var current_hostusers = [];
var current_players = [];
var mapgame = new Map();
var mapprogress = new Map();
var maptimeplayerleft = new Map();
var mapassociate = new Map();
var mapdataquiz = new Map();
var mappassed = new Map();
var firstcounter = 16;
var mapquestionb = new Map();
var maproomplayer = new Map();
var mapendgame = new Map();
var mapprelife = new Map();
var mappostlife = new Map();
var mapregainlife = new Map();
var mapgamestart = new Map();
var mapfastest = new Map();
var mapcollectquestion = new Map();
var mapspeedtime = new Map();


//path handle
app.get('/' , function(req,res) {
    
    if(req.session.log) res.redirect('/home');
    else res.sendFile(__dirname + "/index.html");

    if(req.session.didCreate == true) {
        req.session.didCreate = false;

        io.once('connection' , (socket) => {
            socket.emit('successRegisterEvent');
        }); 

    } 
});
 


//also first time clicking on create/join 
app.post('/play' , function(req,res) {
    
    if(req.body.val == 'create') {

        if(!current_hostusers.includes(req.session.user)) {
            
            // if room is already created during the user session
            if(req.session.host == false) {
                req.session.host = true;
                req.session.firstLaunchEnd = 0;
                req.session.life = 3;
                req.session.ingame = true;
                maptimeplayerleft.set(req.session.user , firstcounter);
                mapprogress.set(req.session.user , false);
                req.session.endgame = false;
                mapgame.set(req.session.user , 'false');
                var roomID;
                roomID = generateRoomID(7);

                while(roomID == null || rooms.includes(roomID)) {
                    roomID = generateRoomID(7);
                }
                
                db.query(`insert into hostroom (host,roomid) values (?,?)`, [req.session.user , roomID]);
                req.session.rid = roomID;
                mapquestionb.set(req.session.rid , 1);
                retrieveData("order" , req);               
                rooms.push(roomID);
                current_hostusers.push(req.session.user);
                mappassed.set(req.session.rid , "ip0");
                maproomplayer.set(req.session.user  , req.session.rid);
                mapendgame.set(req.session.rid , false);
                mapprelife.set(req.session.user , 3);
                mappostlife.set(req.session.user , 3);
                mapgamestart.set(req.session.rid , false);
            } 

            console.log("hotes : " , current_hostusers)
            console.log("rooms : " , rooms);
            res.end();
            

        } else {
            //TODO : handle situation when session is over but same host tries to create game again (and he didnt clicked on start game first time he created)
            req.session.host = true;
            req.session.ingame = true;
            db.query(`select roomid as nbc from hostroom where host = ?`, req.session.user , function (err,result,fields) {
                if(err) throw err;
                console.log('room still exists : ' , result[0].nbc)
            });  
            res.redirect('/play');
        }


    } else if(req.body.val == 'join') {
        
        var u_rid = req.body.roomchoice;

            if(mapgamestart.get(u_rid) == true) {
                res.end();
            } else {

                if(rooms.includes(u_rid) && !current_hostusers.includes(req.session.user)) {

                    req.session.ingame = true;
                    req.session.rid = u_rid;
                    req.session.life = 3;
                    maproomplayer.set(req.session.user , u_rid);
                    mapprelife.set(req.session.user , 3);
                    mappostlife.set(req.session.user , 3);
                    
                    db.query(`insert into joinroom (userjoin,roomid) values (?,?)`, [req.session.user , u_rid]);
                    mapgame.set(req.session.user , 'false');
                    associate_ph(req.session.user ,  u_rid);
                    res.send(req.session.user);

                } else {
                    //room not found
                    res.end();
                }

            }
        
        } else {
            res.redirect('/');
        }




});



app.get('/play' , function(req,res) {
    if(req.session.host_playing == true || current_players.includes(req.session.user)) {
        res.redirect('/quiz');
    } else {
        if(req.session.ingame == true) {
            res.sendFile(__dirname + '/play.html');
        } else {
            res.redirect('/');
        }
    }
});


app.post('/quiz' , function(req,res) {
    req.session.host_playing = true;
    pushPlayers(req);
    mapgamestart.set(req.session.rid , true);
    res.end();
});


app.get('/quiz' , function(req,res) {


    //force remove life when player reload at last second and glitch
    if(req.session.hasToBeRemove == true) {

        if(req.session.host == true ) {

            if(maptimeplayerleft.get(req.session.user) <= 0) {
                req.session.life --;
                req.session.hasToBeRemove = false;
                console.log("glitch toggled")
            }

            //for players
        } else {

            var myhost = mapassociate.get(req.session.user);

            if(maptimeplayerleft.get(myhost) <= 0) {
                req.session.life --;
                req.session.hasToBeRemove = false;
                console.log("glitch toggled")
            }


        }

    }


    
    //add life to player who had 0 lives when game is over when everyone else have 0 lives too 
    if(mapregainlife.has(req.session.user) == true) {
       req.session.life+=1;
       mapregainlife.delete(req.session.user);
       mapprelife.set(req.session.user , 1);
       maproomplayer.set(req.session.user , req.session.rid);
    }

    if(req.session.endgame == true) {

        res.redirect('/endGame');

    } else {

        //when users except hosts try to go to quiz route
            if(req.session.host != true) {
                
                //if players are in the current_player array
                if(current_players.includes(req.session.user))  {
                    res.sendFile(__dirname + "/quiz.html");

                    if(mapgame.has(req.session.user) == true) {
                        if(mapgame.get(req.session.user) == true) req.session.pregamedone = true; 
                    } 

                    setTimeout(() => {
                        if(mapgame.has(req.session.user) == true) mapgame.set(req.session.user , true );
                    }, 3000);

                } else {
                    res.redirect('/');
                } 
                
            } else {

                    //host tries to go to quiz route
                    if(req.session.host_playing == true) {

                        if(mappassed.get(req.session.rid) == 'ip1') {
                            res.redirect('/result');
                        } else {

                            res.sendFile(__dirname + "/quiz.html");
                            req.session.firstlaunch += 1;

                            if(mapgame.has(req.session.user) == true) {
                                if(mapgame.get(req.session.user) == true) req.session.pregamedone = true; 
                            } 

                            if(req.session.pregamedone != true) {
                                setTimeout(() => {
                                    if(mapgame.has(req.session.user) == true) mapgame.set(req.session.user , true );
                                }, 3000);
                            }

                        }

                    } else {
                        res.redirect('/');
                    }

            }
            

    // end else endgame
    }


    

});


app.post('/resetAnswerPlayer' , function(req,res) {
    req.session.hasToBeRemove = false;
    req.session.answer = null;
    req.session.answernb = null;
    res.redirect('/quiz');
    res.end();
});


app.post('/validateAnswer' , function(req,res) {
    req.session.answer = req.body.val;
    req.session.answernb = req.body.valnb;

    if(req.session.host == true) {
        var qdata = mapdataquiz.get(req.session.user);
        var c_answer = qdata[2];  
        if(c_answer == req.session.answernb) {
            if(mapfastest.has(req.session.rid) != true) {
                mapfastest.set(req.session.rid , req.session.user);
                var ftime = 11 - maptimeplayerleft.get(req.session.user);
                mapspeedtime.set(req.session.rid , ftime)
            }
        } else {
            req.session.hasToBeRemove = true;
        }

    } else {
        var myhost = mapassociate.get(req.session.user);
        var qdata = mapdataquiz.get(myhost);
        var c_answer = qdata[2];  

        if(c_answer == req.session.answernb) {
            if(mapfastest.has(req.session.rid) != true) {
                mapfastest.set(req.session.rid , req.session.user);
                var ftime = 11 - maptimeplayerleft.get(myhost);
                mapspeedtime.set(req.session.rid , ftime)
            }
        } else {
            req.session.hasToBeRemove = true;
        }
    }
     
    res.redirect('/quiz');
});


//first time pressing passed (go to result);
app.post('/passQroute' , function(req,res) {

    req.session.answer = null;
    req.session.answernb = null;
    mappassed.set(req.session.rid , "ip1");

    res.end();

});


//second time pressing passed (after result)
app.post('/passResult' , function(req,res) {

    var ptmp = [];
    mapfastest.delete(req.session.rid);
    mapspeedtime.delete(req.session.rid);

    maproomplayer.forEach((roomid,player) => {
        if(roomid == req.session.rid) ptmp.push(player);
    });


    if(ptmp.length == 1 || ptmp.length == 0) {

        //last player alive
        if(ptmp.length == 1) {
            
            io.once('connection' , (socket) => {
                socket.to(req.session.rid).emit('endForPlayer');
            });  

            var lastplayer;
            
            maproomplayer.forEach((roomid,player) => {
                if(roomid == req.session.rid) lastplayer = player;
            });

            db.query(`update user set userwin = userwin + 1 where username = ? `, lastplayer);

            req.session.winnergame = lastplayer;
            req.session.endgame = true;
            mapendgame.set(req.session.rid , true);
            reset_room(req.session.user)
            res.send('endGame');

            mapcollectquestion.forEach((roomid,question) => {
                if(req.session.rid == roomid) {
                    db.query(`update data set used = false where question = ?` , question);
                }
            });


        // no more player
        } else {

            mapprelife.forEach((life , user) => {
                if(life == 1) mapregainlife.set(user , 'true');
            });

            retrieveData("order" , req); 
            mappassed.set(req.session.rid , "ip0");
            maptimeplayerleft.set(req.session.user , 11);
            mapprogress.set(req.session.user , false);
            var ccc = mapquestionb.get(req.session.rid);
            var ddd = ccc+=1;
            mapquestionb.set(req.session.rid , ddd);

        
            io.once('connection' , (socket) => {
                socket.to(req.session.rid).emit('refreshQ');
            });

            res.redirect('/quiz');

        }

    } else {

        retrieveData("order" , req); 
        mappassed.set(req.session.rid , "ip0");
        maptimeplayerleft.set(req.session.user , 11);
        mapprogress.set(req.session.user , false);
        var ccc = mapquestionb.get(req.session.rid);
        var ddd = ccc+=1;
        mapquestionb.set(req.session.rid , ddd);

        
        io.once('connection' , (socket) => {
            socket.to(req.session.rid).emit('refreshQ');
        });

        res.redirect('/quiz');


    }

    

});


app.post('/updatePlayerEndgame' , function(req,res) {
  
    req.session.endgame = true;

    var lastplayer;
    maproomplayer.forEach((roomid,player) => {
        if(roomid == req.session.rid) lastplayer = player;
    });

    req.session.winnergame = lastplayer;

    res.end();
});



app.post('/endGame' , function(req,res) {

     res.redirect('/endGame')
});


app.get('/endGame' , function(req,res) {

    if(req.session.host == true && req.session.firstLaunchEnd <= 2 ) req.session.firstLaunchEnd +=1;

    if(mapendgame.get(req.session.rid) == true) res.sendFile(__dirname + '/endGame.html');
    else res.redirect('/quiz');
});



app.get('/result' , function(req,res) {

    if(req.session.host == true && mappassed.get(req.session.rid) == 'ip1') {
        res.sendFile(__dirname + '/result.html');
    } else {
        res.redirect('/quiz');
    }

});


app.post('/lifeRemove' , function(req,res) {
    
    if(req.session.life > 0) req.session.life--;
    mappostlife.set(req.session.user , req.session.life);
    if(req.session.life <= 0) maproomplayer.delete(req.session.user);
    req.session.hasToBeRemove = false;
          
    res.redirect('/quiz');

    res.end();
});



app.get('/mention' , function(req,res) {
    if(req.session.user) {
        res.sendFile(__dirname + '/mention2.html');
    } else {
        res.sendFile(__dirname + '/mention1.html');
    }
});



app.post('/login' , function(req,res) {
    
    var username = req.body.username;
    var password = req.body.password;

    db.query(`select usermdp from user where username = ?`, [username , password] , function (err,result,fields) {
        if(err) throw err;

        

        if(result.length > 0) {

            bcrypt.compare(password, result[0].usermdp).then(function(result) {
                if(result == true) {
                    req.session.log = true;
                    req.session.user = username;
                    req.session.host = false;
                    req.session.firstlaunch = 0;
                    req.session.ingame = false;
                    req.session.host_playing = false;
                    req.session.pregamedone = false;
                    res.status(202);
                    res.end();
                } else {
                    res.send('Identifiants Incorrects')
                }

            });

        } else {
            res.send("Identifiants Incorrects");
        }
  

        
            
    });   
                 
}); 



app.post('/register' , function(req,res) {
    
    var username = req.body.username;
    var mail = req.body.mail;
    var password = req.body.password;

    var finalCheck = checkSign(username, mail,  password);
    if(!finalCheck) {

        db.query(`select username,usermail from user where username = ? or usermail = ? `, [username , mail] , function (err,result,fields) {
            if(err) throw err;

            //username or mail already in the bdd
            if(result.length>0) {
                if(username == result[0].username) {
                    res.send('Pseudo déjà utilisé')
                } else {
                    if(mail == result[0].usermail) res.send('Mail déjà utilisé');
                }
                
            } else {
                //insert user in bdd
                bcrypt.hash(password, saltRounds).then(function(hash) {
                    db.query(`insert into user (username,usermail,usermdp) values (?,?,?)`, [username , mail , hash]);
                });

                req.session.didCreate = true;
                res.sendStatus(202);
            }
                
        })
        

    } else {
        //sign failed
        res.send(finalCheck);
    }

});


//after click on return button (=> reset game player data)
app.post('/resetGame' , function(req,res) {
    
    if(req.session.host == true) {
        req.session.host = false;
        req.session.host_playing = false;
        current_hostusers = current_hostusers.filter(item => item!=req.session.user);
        mapgamestart.delete(req.session.rid);
    } else {
        current_players = current_players.filter(item => item!=req.session.user);
        mapassociate.delete(req.session.user);

    }


    req.session.endgame = false;
    req.session.ingame = false;
    req.session.pregamedone = false;
    req.session.answer = null;
    req.session.answernb = null;
    req.session.firstlaunch = 0;
    req.session.winnergame = null;

    mapregainlife.delete(req.session.user);
    mappostlife.delete(req.session.user);
    mapprelife.delete(req.session.user);
    maproomplayer.delete(req.session.user);

    res.end();
});


app.post('/resetPassword' , function(req,res) {

    var rmail = req.body.val;

    db.query(`select * from user where usermail = ?` , rmail , function(err,result,fields) {
        if(err) throw err;

        if(result.length > 0) {
            res.send('good');

            //TODO SEND MAIL TO RMAIL HERE  

        } else {
            res.send('bad');   
        } 
    
    });

  
});


app.get('/home' , function(req,res) {
    if(req.session.log) {
        if(req.session.ingame == true) res.redirect('/play');
        else res.sendFile(__dirname + '/home.html'); 
    } else {
        res.redirect('/');
    }
});


app.post('/profil' , function(req,res) {
    if(req.session.log) {
        res.sendFile(__dirname + '/profil.html');
    } else {
        res.redirect('/');
    }
});



app.post('/logout' , function(req,res) {
    if(req.session.user) reset_room(req.session.user);
    req.cookies = null;
    req.session.destroy((err) => {
        res.redirect('/');
      })

});


  

app.get('*' , function(req,res) {
    res.sendFile(__dirname + '/error.html');
});




//sockets handle
io.on('connection' , (socket) => {

    console.log("connexion acceptée : " , socket.id);
    console.log("-------------------");

    socket.on('disconnect' , () => {
        console.log("déconnexion acceptée : " , socket.id);
        console.log("-------------------");
    })


    const iosession = socket.request.session.user;
    const iosessionhost = socket.request.session.host;
    const iosessioningame = socket.request.session.ingame;
    const ioroomsession = socket.request.session.rid;
    const iohostplaying = socket.request.session.host_playing;
    const ioplayerpregame = socket.request.session.pregamedone;
    const ioplayeranswer = socket.request.session.answer;
    const ioplayeranswernb = socket.request.session.answernb;
    const iohostfirstlaunch = socket.request.session.firstlaunch;
    const ioplayerlife = socket.request.session.life;
    const ioendgame = socket.request.session.endgame;
    const iofirstend = socket.request.session.firstLaunchEnd;
    const iowinnergame = socket.request.session.winnergame;


    //display log user data in client side
    if(iosession) {
        socket.emit('sessionEvent' , iosession );
    } else {
        
        //todo when session is expired but room has been created > issue : can't create new room with same host after login without reseting server
        
          
    }

    //pass and display room,host and joined users data on client side
    if(iosession && ioroomsession && iosessioningame == true) {

         socket.join(ioroomsession)

        //get current hostroom
        db.query(`select host from hostroom where roomid = ?`, ioroomsession , function (err,result,fields) {
            if(err) throw err;

            var chost;
            if(result.length > 0) {
                chost = result[0].host;
            } else {
                //TODO : when host session is over but users still in host
                
            }
               
            //get current room players and display them 
            db.query(`select userjoin as nbc from joinroom where roomid = ?` , ioroomsession , function(err,result,fields) {
                if(err) throw err;

                var cusers = [];
                result.forEach(user => {
                    cusers.push(user.nbc);
                });
                
                io.to(ioroomsession).emit('displayRoomDataEvent' , chost , cusers , ioroomsession);
                

            });
                
        }); 

        

    }


    if(iosession && iohostplaying == true && iohostfirstlaunch <= 1) {
        socket.to(ioroomsession).emit('gameStartEvent');
    }


    //display prequiz and quiz to host
    if(iosession && iohostplaying == true) {

        if(ioendgame == true && iofirstend <= 1) {

            socket.to(ioroomsession).emit('showEndGame');

        } else {

            if(mappassed.get(ioroomsession) == "ip0") {

                mapprelife.set(iosession , ioplayerlife);

                var qnb = mapquestionb.get(ioroomsession);
                var qdata = mapdataquiz.get(iosession);
                var question = qdata[0];
                var answers = qdata[1];
                var c_answer = qdata[2];
                var q_difficulty = qdata[3];

                // allow host to go to next question after countdown
                if(mapprogress.get(iosession) == false) {
                    
                    if(maptimeplayerleft.get(iosession) > 0) io.to(ioroomsession).emit('startTimerEvent' , maptimeplayerleft.get(iosession) , c_answer , ioplayeranswernb , ioplayerlife);
                    
                    mapprogress.set(iosession , true);

                    var progress_interval = setInterval(() => {
                        var timeleft = maptimeplayerleft.get(iosession);
                        if(timeleft <= 0 ) {
                            clearInterval(progress_interval);
                            var rmill = generateMillisecond(mapspeedtime.get(ioroomsession));
                            if(mapfastest.has(ioroomsession)) io.to(ioroomsession).emit('showFastest' , mapfastest.get(ioroomsession) , rmill);
                        }
                        if(timeleft > 0) maptimeplayerleft.set(iosession , timeleft-=1)
                    }, 1000);


                } else {
                    if(socket.rooms.has(ioroomsession)) {
                        if(maptimeplayerleft.get(iosession) <=0) socket.emit('allowNextQuestion' , c_answer , ioplayeranswernb);
                        if(maptimeplayerleft.get(iosession) > 0) socket.emit('startTimerEvent' , maptimeplayerleft.get(iosession) , c_answer , ioplayeranswernb , ioplayerlife);
                    }
                }

                // display pregame or not
                if(ioplayerpregame == false) {
                    if(socket.rooms.has(ioroomsession)) {
                        socket.emit("displayPreGame" , 'host' , question ,  answers , q_difficulty , ioplayerlife);
                    }
                } else {
                    if(socket.rooms.has(ioroomsession)) {
                        socket.emit('showQuestion' , qnb , 'host' , question ,  answers , q_difficulty ,  ioplayerlife);
                        socket.emit('finalTimeDisplay' , maptimeplayerleft.get(iosession));
                    }
                }

                //display player answer if already clicked on answer
                if(ioplayeranswer!=null) {
                    if(socket.rooms.has(ioroomsession)) {
                        socket.emit('updateAnswer' , ioplayeranswernb , c_answer);
                    }
                }


            //after click on pass button once  
            } else {}


    
        } 

    
    }

    //animation pre quiz then quiz display to players 
    if(current_players.includes(iosession)) {

        if(ioendgame != true) {

            mapprelife.set(iosession , ioplayerlife);

            var qnb = mapquestionb.get(ioroomsession);
            var myhost = mapassociate.get(iosession);
            var qdata = mapdataquiz.get(myhost);
            var question = qdata[0];
            var answers = qdata[1];
            var c_answer = qdata[2];
            var q_difficulty = qdata[3];
            
            //display pregame or not
            if(ioplayerpregame == false) {
                if(socket.rooms.has(ioroomsession)) {
                    socket.emit('startTimerEvent' , maptimeplayerleft.get(myhost) , c_answer , ioplayeranswernb , ioplayerlife);
                    socket.emit("displayPreGame" , 'player' , question ,  answers , q_difficulty , ioplayerlife);
                }
            } else {
                if(socket.rooms.has(ioroomsession)) {
                    socket.emit('startTimerEvent' , maptimeplayerleft.get(myhost) , c_answer , ioplayeranswernb , ioplayerlife);
                    socket.emit('showQuestion' , qnb , 'player' , question ,  answers , q_difficulty , ioplayerlife);
                    socket.emit('finalTimeDisplay' , maptimeplayerleft.get(myhost));
                }
            }

            //display player answer if already clicked on answer
            if(ioplayeranswer!=null) {

                if(socket.rooms.has(ioroomsession)) {

                    if(maptimeplayerleft.get(myhost) > 0) {
                        socket.emit('updateAnswer' , ioplayeranswernb , c_answer);
                    } else {
                        socket.emit('updateFinalAnswer' , ioplayeranswernb , c_answer);
                    }
                }
                
            } else {
                
            if(maptimeplayerleft.get(myhost) <= 0) socket.emit('updateFinalAnswer' , ioplayeranswernb , c_answer);
            
            }


        // game is over for players
        } else {

            

        }


    }



    if(ioendgame == true) {

        if(socket.rooms.has(ioroomsession)) {

            socket.emit('showFinalData' , iowinnergame);

        }

    }
    


    

})


//JS FUNCTIONS
function checkSign(username , mail ,  password) {

    var u_size = username.length;
    var p_size = password.length;
    var m_size = mail.length;

    if(u_size == 0 || p_size == 0 || m_size == 0) return "Remplissez tous les champs";

    if(u_size <= 3) return "Pseudo trop court (4/15)";
    if(u_size > 15) return "Pseudo trop long (4/15)";

    if(p_size < 6) return "Mot de passe trop court (6/15)";
    if(p_size > 15) return "Mot de passe trop long (6/15)";

    if(username.indexOf(' ') >= 0) return "Format de pseudo invalide";

    return null;
}


function generateRoomID(code_length) {
    var res = '';
    const all_char = 'ABCDEFGHIJKLMONPQRSTUVWXYZ01234567890123456789';
    var counter = 0;

    while(counter < code_length) {
        res += all_char[Math.floor(Math.random() * all_char.length)];
        counter+=1;
    }

    return res;
}



// prodata2.forEach(manga => {
//     if(Object.getOwnPropertyNames(manga) == "Naruto") console.log(manga.Naruto)
// });
// console.log(Object.getOwnPropertyNames(prodata.veryeasy[1][0]))


function generateQuestionAllOrder(req) {

    var current_nbq = mapquestionb.get(req.session.rid);
    var cho_question;
    var cho_answer = [];
    var cho_correct;


    //difficulty : very easy 
    if(current_nbq <= 5) {

        return new Promise((resolve , reject) => {
            
            db.query(`select * from data where difficulty = 'veryeasy' && used = false ORDER BY RAND() LIMIT 1` , function(err,result,fields) {

                if(err) {
                    reject(err);
                } else {
        
                    cho_question = result[0].question;
                    cho_answer.push(result[0].answerd1)
                    cho_answer.push(result[0].answerd2)
                    cho_answer.push(result[0].answerd3)
                    cho_answer.push(result[0].answerd4)
                    cho_correct = result[0].answerdx;

                    mapcollectquestion.set(cho_question , req.session.rid);
                    db.query(`UPDATE data SET used = true WHERE question = ?` , cho_question);

                    resolve([cho_question , cho_answer , cho_correct , "Very easy"]);

                }
               
            });

        })
    
    
    }


    if(current_nbq > 5 && current_nbq <= 15) {

        return new Promise((resolve , reject) => {
            
            db.query(`select * from data where difficulty = 'easy' && used = false ORDER BY RAND() LIMIT 1` , function(err,result,fields) {

                if(err) {
                    reject(err);
                } else {
        
                    cho_question = result[0].question;
                    cho_answer.push(result[0].answerd1)
                    cho_answer.push(result[0].answerd2)
                    cho_answer.push(result[0].answerd3)
                    cho_answer.push(result[0].answerd4)
                    cho_correct = result[0].answerdx;

                    mapcollectquestion.set(cho_question , req.session.rid);
                    db.query(`UPDATE data SET used = true WHERE question = ?` , cho_question);

                    resolve([cho_question , cho_answer , cho_correct , "Easy"]);

                }
               
            });

        })
    
    }


    if(current_nbq > 15 && current_nbq <= 27) {

        return new Promise((resolve , reject) => {
            
            db.query(`select * from data where difficulty = 'medium' && used = false ORDER BY RAND() LIMIT 1` , function(err,result,fields) {

                if(err) {
                    reject(err);
                } else {
        
                    cho_question = result[0].question;
                    cho_answer.push(result[0].answerd1)
                    cho_answer.push(result[0].answerd2)
                    cho_answer.push(result[0].answerd3)
                    cho_answer.push(result[0].answerd4)
                    cho_correct = result[0].answerdx;

                    mapcollectquestion.set(cho_question , req.session.rid);
                    db.query(`UPDATE data SET used = true WHERE question = ?` , cho_question);

                    resolve([cho_question , cho_answer , cho_correct , "Medium"]);

                }
               
            });

        })
    
    
    }


    if(current_nbq > 27 && current_nbq <= 35) {

        return new Promise((resolve , reject) => {
            
            db.query(`select * from data where difficulty = 'hard' && used = false ORDER BY RAND() LIMIT 1` , function(err,result,fields) {

                if(err) {
                    reject(err);
                } else {
        
                    cho_question = result[0].question;
                    cho_answer.push(result[0].answerd1)
                    cho_answer.push(result[0].answerd2)
                    cho_answer.push(result[0].answerd3)
                    cho_answer.push(result[0].answerd4)
                    cho_correct = result[0].answerdx;

                    mapcollectquestion.set(cho_question , req.session.rid);
                    db.query(`UPDATE data SET used = true WHERE question = ?` , cho_question);

                    resolve([cho_question , cho_answer , cho_correct , "Hard"]);

                }
               
            });

        })
    
    
    }



    if(current_nbq > 35 && current_nbq <= 45) {

        return new Promise((resolve , reject) => {
            
            db.query(`select * from data where difficulty = 'veryhard' && used = false ORDER BY RAND() LIMIT 1` , function(err,result,fields) {

                if(err) {
                    reject(err);
                } else {
        
                    cho_question = result[0].question;
                    cho_answer.push(result[0].answerd1)
                    cho_answer.push(result[0].answerd2)
                    cho_answer.push(result[0].answerd3)
                    cho_answer.push(result[0].answerd4)
                    cho_correct = result[0].answerdx;

                    mapcollectquestion.set(cho_question , req.session.rid);                    
                    db.query(`UPDATE data SET used = true WHERE question = ?` , cho_question);

                    resolve([cho_question , cho_answer , cho_correct , "Very Hard"]);

                }
               
            });

        })
    
    
    } else {

        return new Promise((resolve , reject) => {
            
            db.query(`select * from data where difficulty = 'extreme' && used = false ORDER BY RAND() LIMIT 1` , function(err,result,fields) {

                if(err) {
                    reject(err);
                } else {
        
                    cho_question = result[0].question;
                    cho_answer.push(result[0].answerd1)
                    cho_answer.push(result[0].answerd2)
                    cho_answer.push(result[0].answerd3)
                    cho_answer.push(result[0].answerd4)
                    cho_correct = result[0].answerdx;

                    mapcollectquestion.set(cho_question , req.session.rid);
                    db.query(`UPDATE data SET used = true WHERE question = ?` , cho_question);

                    resolve([cho_question , cho_answer , cho_correct , "Extreme"]);

                }
               
            });

        })

    }



    //prodata.splice(2,1) delete 1 pair question/answers at position 2
}



async function asyncGenOverallOrder(req) {
    try {
        const resquery = await generateQuestionAllOrder(req);
        return resquery;

    } catch (error) {
        console.log("async query error" , error);

    } finally {
        // db.end();
    }
}




function retrieveData(val , req) {

    if(val == 'order') {
        
        asyncGenOverallOrder(req).then((res) => {
            
            mapdataquiz.set(req.session.user , res);

          }).catch((error) => {
             return error;
          });
        }
        
}


// gengen().then((message) => {
//     console.log(message); // Opération réussie
//   }).catch((erreur) => {
//     console.error(erreur.message); // Erreur lors de la requête
//   });


function generateMillisecond(timef) {

    var rmm = timef + 1;
    var rm = Math.random() * (rmm - timef) + timef;

    var res = rm.toFixed(3);
    
    return res;
    
}


function reset_room(dhost) {
    if(dhost) {
        var u = dhost;
        db.query(`delete from joinroom where userjoin = ?` , u);
        db.query(`select roomid as nbc from hostroom where host = ?` , u , function(err,result,fields) {
            result.forEach(res => {
                db.query(`delete from joinroom where roomid = ? or userjoin = ?` , [res.nbc,u]);
                rooms = rooms.filter(item => item!=res.nbc);
            });
            db.query(`delete from hostroom where host = ?` , u);

            current_hostusers = current_hostusers.filter(item => item!=dhost);
        });
        firstCreate = 0;
    }
}


function reset_db() {
    db.query(`delete from hostroom`);
    db.query(`delete from joinroom`);
}


function reset_data() {
    db.query(`update data set used = false`);
}


function pushPlayers(req) {

    db.query(`select roomid as nbc from hostroom where host = ?` , req.session.user , function(err,result,fields) {
        if(err) throw err;

        var current_room = result[0].nbc;

        db.query(`select userjoin as nbc2 from joinroom where roomid = ?` , current_room , function(err,result,fields) {
            if(err) throw err;
            
            result.forEach(user => {
                current_players.push(user.nbc2)
            });
            
        });

    });

}


function associate_ph(username , urid) { 

    var v_urid = urid;

    db.query(`select host as nbc from hostroom where roomid = ?` , v_urid , function(err,result,fields) {
        if(err) throw err;
        
        var res_h = result[0].nbc;
        mapassociate.set(username , res_h);
        
        
    });
}


































server.listen(process.env.PORT || 7000 , function(err) {
    if(err) throw err;
    reset_db();
    reset_data();
    console.log("-------------------");
    console.log("Server on " , server.address().port);

})
