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
let recordsCount = 32;
io.on('connection',(socket)=>{

//=================================== Socket Listeners

  socket.on('join', ({user, room})=>{
      //check if autentificated?

      getRecordsCount("chatHistory",room)
      .then((recordsCount)=>{
        // console.log("recordsCount onJoin", recordsCount);
          addActiveUser(socket.id, user, room, recordsCount)
          .then(()=>{
            getRecordsCount("activeUsers",room)
            .then((recordsCount)=>{
              // console.log("sending out count to other players");
              socket.broadcast.emit('playersCount',{room:room, count:recordsCount});
            })
          })
      
          //joining the correct room
          socket.join(room)

          //Now Get limited amount of messages from db and emit that to current user
          getMessages(room,10,recordsCount) //limit(5)
          .then((data)=>{

            //Q: can welcome message arrive before messages data? should I put other function in callback?
            //$$!! there is not userdata ex: image of message, you should get images from somewhere else here else clinet side
            //populate data with "userDetails" => images
              //loop throught data, find all unique userNames, fetch userDetails data for this userNames from users collection
              //assign userDetails to data => messages respectively
            
            data.forEach((obj,index)=>{
              //$$! find all unique names in data
              
              //extracting nested "message" object 
              data[index] = obj.message;
            })
            //loop unique names and get all image sources
            //loop data and assign correct sources to usernames

            socket.emit('chatMessage', {messages:data, msgType:"upFirstLoad"} )
            //----------------------------------------------------------------------

            //just throw welcome message for current client
            let msgWelcome = createMessage('ChatBot',`Welcome back ${user}`)
            socket.emit('chatMessage', {messages:[msgWelcome], msgType:"down"});

            //create welcome message and notify all clients in the room except current client
            let msgJoined = createMessage('ChatBot',`${user} joined chat`)
            socket.broadcast.to(room).emit('chatMessage', {messages:[msgJoined], msgType:"down"});

            //saving chat login info (welcome message)
            saveMessage(msgJoined,room);
          })
      })
  })

  socket.on('chatMessage', (msgText)=>{
    //getting this current active user Name and Room 
    getActiveUser(socket.id).then((data)=>{

      //$$! SHORTER VERSION NEEDED ---------
      let user;
      try{
        user = data.activeUsers;
      }catch(e){
        console.log('cannot find user by socket.id');
        return;
      }
      //------------------------------------

      //getting data about user, image, achivements, vipStatus ...
      getUserData(user.userName).then(userDetails =>{

        io.to(user.room).emit('chatMessage', {messages:[createMessage(user.userName, msgText, null, userDetails)], msgType:"down"});
        //saving only necessary message information
        saveMessage(createMessage(user.userName, msgText), user.room);

      })
    }) 
  })

  socket.on('loadMore', (timesBack)=>{
    getActiveUser(socket.id).then((data)=>{
        //$$! SHORTER VERSION NEEDED ---------
        let user;
        try{
          user = data.activeUsers;
        }catch(e){
          console.log('cannot find user by socket.id');
          return;
        }
        //------------------------------------
        
        getMessages(user.room,5, user.recordsCount,timesBack) 
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
    getRecordsCount('activeUsers',room)
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
    getActiveUser(socket.id).then(data=>{
      //$$! SHORTER VERSION NEEDED ---------
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
      // saveMessage(leaveMessage);
      removeActiveUser(socket.id)

      getRecordsCount("activeUsers",user.room)
      .then((recordsCount)=>{
        // console.log("sending out count to other players");
        socket.broadcast.emit('playersCount',{room:user.room, count:recordsCount});
      })
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
            userName: msg.userName,
            text: msg.text,
            date: msg.date
          }
        }
    },{upsert:true})
    
}
//$$! update users could also remove user from activeUsers
let addActiveUser = async (id, userName, room, recordsCount)=>{
  let collection = Connection.get().collection('chatRooms');
  await collection.updateOne({room: room}, 
    { 
        $push: { 
          activeUsers: {
            id:id,
            userName:userName,
            room:room,
            recordsCount:recordsCount
          }
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
  //Q:user.toArray() didnot return user, tricky
  let converted = await user.next();
  return converted
}

let getRecordsCount = async (targetArray,room)=>{
  let collection = Connection.get().collection('chatRooms');
  let cursor = await collection.aggregate([
    {
      "$match": {
        room: room
      }
    },
    {
      $project: {
        recordsCount: {
          $size: `$${targetArray}`
        },
        _id: 0
      }
    }
  ])
  let data = await cursor.toArray();
  if(!data.length){
    // console.log('couldnot get records count returning 0')
    return 0;
  }
  return data[0].recordsCount;
}

let getMessages = async (room,limit,recordsCount,timesBack=1)=>{
  // console.log('limit:',limit,'recordsCount:',recordsCount,'timesBack:',timesBack);

  let loadPos=recordsCount-(limit*timesBack);
  if(loadPos === 0){
    return [];
  }
  if(loadPos<0){
    limit = limit + loadPos
    if(limit<=0){
      return [];
    }
    loadPos = 0;
    // console.log("loadpos is less than 0")
  }

  // console.log("calculated loadPos:",loadPos);
  // console.log("calculated limit:",limit);

  let collection = Connection.get().collection('chatRooms');
  let cursor = await collection.aggregate([
    {
      "$match": {
        room: room
      }
    },
    {
      "$project": {
        "message": {
          "$slice": ["$chatHistory",loadPos, limit ]
           //$$!! if position is more then array elements empty array is returned, we loose some starting messages
        },
        _id: 0
      }
    },
    {
      "$unwind": "$message"
    }
  ]) //you should find last N messages in room chatHistory   
  let data = await cursor.toArray();
  return data;      
}

let getUserData = async (name)=>{
  let collection = Connection.get().collection('users');
  const searchCursor = await collection.find({name:name});
  const foundUser = await searchCursor.next(); //$$ toArray doesnot work when one document is returned nor next
  console.log("searched user in users collection",foundUser);
  return foundUser;
}

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


//=================================== Routes

app.post('/login', (req,res)=>{
  //if req.pin == db.findUser.pin 
  //send back user stats
  //and login:true, to freeze userName field, and other styles for loggedIn state
})

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/app/app.html');
})


