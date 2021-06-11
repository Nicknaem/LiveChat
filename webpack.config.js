const path = require('path');

module.exports = {
    entry: './app/app.js',
    mode: "development",
    output: {
        filename: 'liveChat.js',
        path: path.resolve(__dirname,"build")
    },
}