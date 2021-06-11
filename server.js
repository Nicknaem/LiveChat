//================================== Express server
const express = require('express')
const http = require('http');
const socketio = require('socket.io');


const app = express()
const server = http.createServer(app);
const io = socketio(server);

const Connection = require('./common/connection.js')
const Config = require('./common/config.js');
const Services = require('./modules/services.js');

//=================================== Middleware
app.use(express.json());                        
app.use(express.static(__dirname + '/app'));   

//================================== MongoDb connection
const MongoClient = require('mongodb').MongoClient;
const { config } = require('process');
const { create } = require('domain');

MongoClient.connect( Config.mongodb.dbUrl , Config.mongodb.options, (err,client)=>{
  if(err){
    return console.log(err);
  } 
  Connection.set(client.db(Config.mongodb.dbName));
  console.log("connected to database");

  server.listen(Config.port, () => {
    console.log(`Server started on port: ${Config.port}`)
  })
})


io.on('connection',(socket)=>{
//=================================== Socket Listeners

  socket.on('join', ({user, room})=>{
      //check if autentificated here

      Services.getRecordsCount("chatHistory",room)
      .then((recordsCount)=>{
          Services.addActiveUser(socket.id, user, room, recordsCount)
          .then(()=>{
            Services.getRecordsCount("activeUsers",room)
            .then((recordsCount)=>{
              socket.broadcast.emit('playersCount',{room:room, count:recordsCount});
            })
          })
      
          socket.join(room)

          Services.getMessages(room,10,recordsCount) //limit(5)
          .then((data)=>{
            
            data.forEach((obj,index)=>{
              //$$! find all unique names in data to get all user images and assign them to messages onLoad
              
              //extracting nested "message" object 
              data[index] = obj.message;
            })


            socket.emit('chatMessage', {messages:data, msgType:"upFirstLoad"} )
            //----------------------------------------------------------------------

            let msgWelcome = createMessage('ChatBot',`Welcome back ${user}`)
            socket.emit('chatMessage', {messages:[msgWelcome], msgType:"down"});

            let msgJoined = createMessage('ChatBot',`${user} joined chat`)
            socket.broadcast.to(room).emit('chatMessage', {messages:[msgJoined], msgType:"down"});

            Services.saveMessage(msgJoined,room);
          })
      })
  })

  socket.on('chatMessage', (msgText)=>{
    //getting this current active user Name and Room 
    Services.getActiveUser(socket.id).then((data)=>{

      //$$! SHORTER VERSION NEEDED WRAP IT UP ---------
      let user;
      try{
        user = data.activeUsers;
      }catch(e){
        console.log('cannot find user by socket.id');
        return;
      }
      //------------------------------------

      //getting data about user, image, achivements, vipStatus ...
      Services.getUserData(user.userName).then(userDetails =>{

        io.to(user.room).emit('chatMessage', {messages:[createMessage(user.userName, msgText, null, userDetails)], msgType:"down"});
        //saving only necessary message information
        Services.saveMessage(createMessage(user.userName, msgText), user.room);

      })
    }) 
  })

  socket.on('loadMore', (timesBack)=>{
    Services.getActiveUser(socket.id).then((data)=>{
        //$$! SHORTER VERSION NEEDED WRAP IT UP ---------
        let user;
        try{
          user = data.activeUsers;
        }catch(e){
          console.log('cannot find user by socket.id');
          return;
        }
        //------------------------------------
        
        Services.getMessages(user.room,5, user.recordsCount,timesBack) 
        .then((data)=>{
            data.forEach((obj,index)=>{
              //$$! find all unique names in data
              
              data[index] = obj.message;
            })
          
            socket.emit('chatMessage', {messages:data, msgType:"up"})
        })

    })
  })

  socket.on('playersCount',(room)=>{
    Services.getRecordsCount('activeUsers',room)
    .then((recordsCount)=>{
      socket.emit('playersCount',{room:room, count:recordsCount});
    })
  })

  socket.on('disconnect', ()=>{
    leaveChat()
  })
  socket.on('leave', ()=>{
    leaveChat()
  })

  const leaveChat = () => {
    Services.getActiveUser(socket.id).then(data=>{
      //$$! SHORTER VERSION NEEDED WRAP IT UP ---------
      let user;
      try{
        user = data.activeUsers;
      }catch(e){
        console.log('cannot find user by socket.id');
        return;
      }
      //------------------------------------

      let leaveMessage = createMessage('ChatBot',`${user.userName} left the chat`);

      socket.broadcast.to(user.room).emit('chatMessage', {messages:[leaveMessage], msgType:"down"});
      socket.leave(user.room)
      Services.saveMessage(leaveMessage,user.room);
      Services.removeActiveUser(socket.id)

      Services.getRecordsCount("activeUsers",user.room)
      .then((recordsCount)=>{
        socket.broadcast.emit('playersCount',{room:user.room, count:recordsCount});
      })
    })
  }

})

//============================================================ Helper function

let createMessage = (username, text, date, userDetails)=>{
  let msgData ={
    userName: username,
    text: text,
    date: Date().slice(16,21)
  }
  msgData.date = date ? date : Date().slice(16,21)
  if(userDetails){msgData.details = userDetails}

  return msgData;
}

//============================================================ Routes

app.post('/login', (req,res)=>{
  //if req.pin == db.findUser.pin 
  //send back user stats
  //and login:true, to freeze userName field, and other styles for loggedIn state
})

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/app/app.html');
})


