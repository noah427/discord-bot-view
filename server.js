const express = require('express')
var app = express()
var bot = require('./client')
var io = require('socket.io')(8080);

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/index.html")
})

app.get('/login', function (req, res) {
    bot.login(req.query.token)
    res.sendFile(__dirname + "/public/interface.html")
})


io.on('connection', function (socket) {
    console.log("connected")

    var guilds = bot.init()


    socket.emit('guilds', guilds)
    socket.on('serverChannels', (serverName, serverNumber) => {
        var channels = bot.fetchChannels(serverName)
        socket.emit('sendChannels', channels, serverNumber)
    });
    socket.on('fetchChannelMessages', function (serverNum, channelName) {
        var fetched = bot.fetchMsgs(guilds[serverNum], channelName)
        var displayed = []
        var msgCount = 0
        fetched.then(function (messages) {
            messages.forEach(function (message) {
                msgCount++
                displayed.push(`${message.author.tag}: Said : ${message.content}`)
                if (msgCount === 10) {
                    displayed.reverse()
                    socket.emit('displayMessages', displayed)
                }
            });
        })
    })
})


app.listen('3000', function () {
    console.log('listning on localhost:3000')
})