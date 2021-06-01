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
//=================================== Socket Emits
  console.log('user connnected :'+socket.id);
  socket.emit('chatMessage', createMessage('ChatBot','hello there'));

  //to all clients except current client
  socket.broadcast.emit('chatMessage',createMessage('ChatBot','another user joined chat'))

//=================================== Socket Listeners

  socket.on('disconnect', ()=>{
    io.emit('chatMessage',createMessage('ChatBot','some user left the chat'))
  })

  socket.on('chatMessage', (msg)=>{
    //update message records asyncronously
    //find image of msg.user in db, and send it also
    io.emit('chatMessage', createMessage(msg.userName, msg.text));
  })

})

//=================================== Routes
app.get('/chat', (req, res) => {
    //if req.pin = db.findUser pin
    res.sendFile(__dirname + '/app/chat/chat.html');
  })

app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/app/main/main.html');
})

//=================================== helper js
var currentDate = new Date();

let createMessage = (username, text)=>{
  return{
    username: username,
    text: text,
    date: Date().slice(16,21)
  }
}