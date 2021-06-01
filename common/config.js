const Config = {
    port:3000,
    mongodb: {
        dbName: 'chatDB',
        dbUrl: 'mongodb://localhost:27017',
        options:{
            useUnifiedTopology: true,
            useNewUrlParser: true
        }
    }
}

module.exports = Config;