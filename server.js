const express = require('express')
var app = express()
var bot = require('./client')
var io = require('socket.io')(8080);
require('dotenv').config()

bot.login(process.env.TOKEN)






app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/interface.html")
})




io.on('connection', function (socket) {

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
                if (msgCount === 25) {
                    displayed.reverse()
                    socket.emit('displayMessages', displayed)
                }
            });
        })
    })
    socket.on('sendChannelMessage', function (serverNum, channelName, message) {
        bot.sendChannelMessage(guilds[serverNum], channelName, message)
    })
})


app.listen('3000', function () {
    console.log('listning on localhost:3000')
})