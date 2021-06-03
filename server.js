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
    saveMessage(welcomeMessage);
    

    //Now Get limited amount of messages from db and emit that to current user
    getMessages(room, 20) //limit(20)
    .then((response)=>{
      console.log(response)
      //I think theres no need to convert response.json()
      //emit should happen somwere here
    })

    //just throw welcome message for current client
    socket.emit('chatMessage', createMessage('ChatBot',`Welcome back ${user}`));
  })

//=================================== Socket Listeners

  socket.on('chatMessage', (msgText)=>{
    //getting this current active user Name and Room 
    const user = getActiveUser(socket.id); //$$? can it be async, everything should happen after .then
    //getting data about user, image, achivements, vipStatus ...
    const userDetails = getUserData(user.name);

    io.to(user.room).emit('chatMessage', createMessage(user.name, msgText, userDetails));

    //saving only necessary message information
    saveMessage(createMessage(user.name,msgText));
  })

  socket.on('disconnect', ()=>{
    const user = removeActiveUser(socket.id); //$$? can it be async, everything should happen after .then
    let leaveMessage = createMessage('ChatBot',`${user.name} left the chat`);

    socket.broadcast.to(user.room).emit('chatMessage', leaveMessage )
    saveMessage(leaveMessage);
  })

})

//=================================== Mongo queries

let saveMessage = async (params)=>{
  let collection = Connection.get().collection('chatRooms');
  await collection.updateOne({room: params.room}, 
    { 
        $push: {
          chatHistory: {
            user: params.user,
            message: params.text,
            date: params.date
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

let removeActiveUser = (id)=>{
  let collection = Connection.get().collection('chatRooms');
  //search user in all active rooms, well this is not good solution.  
  //find remove user and return
  return collection.find()
}

let getActiveUser = (id)=>{
  let collection = Connection.get().collection('chatRooms');
  //find and return
  return collection.find()
}

let getMessages = async (room,limit)=>{
  let collection = Connection.get().collection('chatRooms');
  let cursor = await collection.find({room:room}, {chatHistory: 1}) //you should find last 20 messages in room chatHistory   
  let data = await cursor.toArray();
  return data;      
}

let createMessage = (username, text, userDetails)=>{
  let msgData ={
    username: username,
    text: text,
    date: Date().slice(16,21)
  }
  if(image){msgData.details = userDetails;}

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
  console.log(queryParams)
  // res.sendFile(__dirname + '/app/chat/chat.html');
  res.redirect('/chat/chat.html')
  
})

app.post('/login', (req,res)=>{
  //if req.pin == db.findUser.pin 
  //send back user stats
  //and login:true, to freeze userName field, and other styles for loggedIn state
})


