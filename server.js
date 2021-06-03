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

  socket.on('join', ({user, room})=>{
    
    addActiveUser(socket.id, user, room);
    //joining the correct room
    socket.join(room)

    //notify all clients in the room except current client
    let welcomeMessage = createMessage('ChatBot',`${user} joined chat`);
    socket.broadcast.to(room).emit('chatMessage',welcomeMessage);
    //saving chat login info (welcome message)
    saveMessage(welcomeMessage,room);
    

    //Now Get limited amount of messages from db and emit that to current user
    getMessages(room, 20) //limit(20)
    .then((response)=>{
      console.log(response)
      //emit all messages to client, check for userData and send its details also 
      response.forEach(msg => {
        socket.emit('chatMessage',createMessage(msg.chatHistory.user, msg.chatHistory.message, msg.chatHistory.date)); 
      });
      
      
    })

    //just throw welcome message for current client
    socket.emit('chatMessage', createMessage('ChatBot',`Welcome back ${user}`));
  })

//=================================== Socket Listeners

  socket.on('chatMessage', (msgText)=>{
    //getting this current active user Name and Room 
    getActiveUser(socket.id).then(user=>{
      //$$##BUG user is undefined
      //getting data about user, image, achivements, vipStatus ...
      getUserData(user.name).then(userDetails =>{

        io.to(user.room).emit('chatMessage', createMessage(user.name, msgText,null, userDetails));
        //saving only necessary message information
        saveMessage(createMessage(user.name,msgText), user.room);

      })
    }) 
  })

  socket.on('disconnect', ()=>{
      getActiveUser(socket.id).then(user=>{
        let leaveMessage = createMessage('ChatBot',`${user.name} left the chat`);

        socket.broadcast.to(user.room).emit('chatMessage', leaveMessage )
        // saveMessage(leaveMessage);
        removeActiveUser(socket.id)
      })
  })

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
  
  let user = await collection.update({},
    {
      $pull: {
        activeUsers: {
          id: id
        }
      }
    },
    {
      multi: true
    })
}

let getActiveUser = async (id)=>{
  let collection = Connection.get().collection('chatRooms');
  //find and return //$$## returns whole document
  let user = await collection.find({
    "activeUsers.id": id
  },
  {
    activeUsers: 1,
    _id: 0
  })
  let converted = await user.toArray();
  console.log(converted);
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
    "$limit": limit
  }) //you should find last 5 messages in room chatHistory   
  let data = await cursor.toArray();
  return data;      
}

let getUserData = async (name)=>{
  const searchCursor = await Connection.get().collection('users').find({name:name});
  const foundUser = await searchCursor.toArray();
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


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/app/main/main.html');
})

app.get('/chat', (req, res) => {
  //if queryParams.pin === db.findUser.pin
  //send client to the chat.html and pass userName
  //else dont give access to chat.html

  var queryParams = req.query;

  // res.sendFile(__dirname + '/app/chat/chat.html');
  res.redirect('/chat/chat.html')
  
})

app.post('/login', (req,res)=>{
  //if req.pin == db.findUser.pin 
  //send back user stats
  //and login:true, to freeze userName field, and other styles for loggedIn state
})


