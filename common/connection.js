class Connection{
    static set(db){
        Connection._db = db;
    } 
    static get(){
        return Connection._db;
    }
}

module.exports = Connection;