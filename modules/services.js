const Connection = require('../common/connection.js')

class Services {
//===================================================================== Message Services

    static async saveMessage(msg,room){
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

    static async getMessages(room,limit,recordsCount,timesBack=1){
      
        let loadPos=recordsCount-(limit*timesBack);

        if(loadPos<0){
          limit = limit + loadPos
          if(limit<=0){
            return [];
          }
          loadPos = 0; 
        }
      
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
                
                },
                _id: 0
                }
            },
            {
                "$unwind": "$message"
            }
        ]) 
        let data = await cursor.toArray();
        return data;      
    }

//===================================================================== Active_User services
    //$$! update users could also remove user from activeUsers
    static async addActiveUser(id, userName, room, recordsCount){
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

    static async removeActiveUser(id){
        let collection = Connection.get().collection('chatRooms');
       
        let user = await collection.updateMany({},
            {
                $pull: {
                activeUsers: {
                    id: id
                }
                }
            },
        )
    }

    static async getActiveUser(id){
        let collection = Connection.get().collection('chatRooms');
        
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
        return converted
    }
//---------------------------------------------------------------------- Active_User services END

    static async getRecordsCount(targetArray,room){
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

          return 0;
        }
        return data[0].recordsCount;
    }

    static async getUserData(name){
        let collection = Connection.get().collection('users');
        const searchCursor = await collection.find({name:name});
        const foundUser = await searchCursor.next(); 
        console.log("getting user details from users collection:",!foundUser?`User ${name} isn't created yet`:foundUser);
        return foundUser;
    }
      


}

module.exports = Services;