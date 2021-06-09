//================================== Express server
const express = require('express')
const http = require('http');
const socketio = require('socket.io');


const app = express()
const server = http.createServer(app);
const io = socketio(server);

var Connection = require('./common/connection.js')
var Config = require('./common/config.js');

//=================================== Middleware
app.use(express.json());                        //all coming requests will be converted to json for server
app.use(express.static(__dirname + '/app'));    //serve static files

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

//=================================== socketio

io.on('connection',(socket)=>{

//=================================== Socket Listeners

  socket.on('join', ({user, room})=>{

    //check if autentificated?
    
    addActiveUser(socket.id, user, room);
    //joining the correct room
    socket.join(room)

    //create welcome message
    let welcomeMessage = createMessage('ChatBot',`${user} joined chat`);

    //Now Get limited amount of messages from db and emit that to current user
    getMessages(room, 3) //limit(5)
    .then((response)=>{

      //emit all messages to client, check for userData and send its details also 
      response.forEach(msg => {
        socket.emit('chatMessage',createMessage(msg.chatHistory.user, msg.chatHistory.message, msg.chatHistory.date)); 
      });
      
      //just throw welcome message for current client
      socket.emit('chatMessage', createMessage('ChatBot',`Welcome back ${user}`));

      //notify all clients in the room except current client
      socket.broadcast.to(room).emit('chatMessage',welcomeMessage);

      //saving chat login info (welcome message)
      saveMessage(welcomeMessage,room);
    })
  })

  socket.on('chatMessage', (msgText)=>{
    //getting this current active user Name and Room 
    getActiveUser(socket.id).then(({activeUsers:userData}=activeUsers)=>{

      //getting data about user, image, achivements, vipStatus ...
      getUserData(userData.user).then(userDetails =>{

        io.to(userData.room).emit('chatMessage', createMessage(userData.user, msgText, null, userDetails));
        //saving only necessary message information
        saveMessage(createMessage(userData.user, msgText), userData.room);

      })
    }) 
  })

  socket.on('disconnect', ()=>{
    leaveChat()
  })
  socket.on('leave', ()=>{
    leaveChat()
  })

  const leaveChat = () => {
    getActiveUser(socket.id).then(({activeUsers:userData}=activeUsers)=>{

      let leaveMessage = createMessage('ChatBot',`${userData.user} left the chat`);

      socket.broadcast.to(userData.room).emit('chatMessage', leaveMessage );
      socket.leave(userData.room)
      // saveMessage(leaveMessage);
      removeActiveUser(socket.id)
    })
  }
})

//=================================== Mongo queries

let saveMessage = async (msg,room)=>{
  let collection = Connection.get().collection('chatRooms');
  await collection.updateOne({room: room}, 
    { 
        $push: {
          chatHistory: {
            user: msg.user,
            message: msg.text,
            date: msg.date
          }
        }
    },{upsert:true})
}
//$$! update users could also remove user from activeUsers
let addActiveUser = async (id, user, room)=>{
  let collection = Connection.get().collection('chatRooms');
  await collection.updateOne({room: room}, 
    { 
        $push: { 
          activeUsers: {id, user, room} //this is shorthand, it will make given variables as object field names
        }
    },{upsert:true})
}

let removeActiveUser = async (id)=>{
  let collection = Connection.get().collection('chatRooms');
  //this Update query searches user in all active rooms, well this is not good solution.  
  //Update doesnot return removed object
  //findOneAndUpdate returns original removed object, but show all the document,couldnot project the only removed object from nested array
  
  let user = await collection.updateMany({},
    {
      $pull: {
        activeUsers: {
          id: id
        }
      }
    },
)
/* 
    {
      multi: true
    }
*/
}

let getActiveUser = async (id)=>{
  let collection = Connection.get().collection('chatRooms');
  //find and return //$$## returns whole document
  let user = await collection.aggregate([
    {
      "$match": {
        "activeUsers.id": id
      }
    },
    {
      "$project": {
        _id: 0,
        activeUsers: 1
      }
    },
    {
      "$unwind": "$activeUsers"
    },
    {
      "$match": {
        "activeUsers.id": id
      }
    }
  ])
  let converted = await user.next();
  // console.log(converted);
  return converted
}



let getMessages = async (room,limit)=>{
  let collection = Connection.get().collection('chatRooms');
  let cursor = await collection.aggregate({
      "$match": {
        room: room
      }
    },
    {
      "$project": {
        chatHistory: 1,
        _id: 0
      }
    },
    {
      "$unwind": "$chatHistory"
    },
    {
      "$limit": 2
    }) //you should find last 5 messages in room chatHistory   
  let data = await cursor.toArray();
  console.log(data);
  return data;      
}

let getUserData = async (name)=>{
  let collection = Connection.get().collection('users');
  const searchCursor = await collection.find({name:name});
  const foundUser = await searchCursor.toArray();
  console.log(foundUser);
  return foundUser;
}

let createMessage = (username, text, date, userDetails)=>{
  let msgData ={
    user: username,
    text: text,
    date: Date().slice(16,21)
  }
  msgData.date = date ? date : Date().slice(16,21)
  if(userDetails){msgData.details = userDetails}

  return msgData;
}


//=================================== Routes

app.post('/login', (req,res)=>{
  //if req.pin == db.findUser.pin 
  //send back user stats
  //and login:true, to freeze userName field, and other styles for loggedIn state
})

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/app/app.html');
})


