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
        // console.log('limit:',limit,'recordsCount:',recordsCount,'timesBack:',timesBack);
      
        let loadPos=recordsCount-(limit*timesBack);
        // if(loadPos === 0){
        //   return [];
        // }
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
        //this Update query searches user in all active rooms, well this is not good solution.  
        //Update doesnot return removed object
        //findOneAndUpdate returns original removed object, but show all the document,couldnot project the only removed object from nested array
        //@@ can I get removed user?
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
          // console.log('couldnot get records count returning 0')
          return 0;
        }
        return data[0].recordsCount;
    }

    static async getUserData(name){
        let collection = Connection.get().collection('users');
        const searchCursor = await collection.find({name:name});
        const foundUser = await searchCursor.next(); //$$ toArray doesnot work when one document is returned nor next
        console.log("searched user in users collection",foundUser);
        return foundUser;
    }
      


}

module.exports = Services;