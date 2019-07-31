const express = require("express");
var expressApp = express();
var bot = require("./client");
var io = require("socket.io")(8080);
require("dotenv").config();

const { app, BrowserWindow } = require("electron");

bot.login(process.env.TOKEN);

expressApp.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/interface.html");
});

io.on("connection", function(socket) {
  var guilds = bot.init();
  socket.emit("guilds", guilds);
  socket.on("serverChannels", (serverName, serverNumber) => {
    var channels = bot.fetchChannels(serverName);
    socket.emit("sendChannels", channels, serverNumber);
  });
  socket.on("fetchChannelMessages", function(serverNum, channelName) {
    var fetched = bot.fetchMsgs(guilds[serverNum], channelName);
    var displayed = [];
    var messageIDs = [];
    var msgCount = 0;
    fetched.then(function(messages) {
      messages.forEach(function(message) {
        msgCount++;
        displayed.push(`${message.author.tag}: Said : ${message.content}`);
        messageIDs.push(message.id);
        if (msgCount === 25) {
          displayed.reverse();
          messageIDs.reverse();
          socket.emit("displayMessages", displayed, messageIDs);
        }
      });
    });
  });
  socket.on("sendChannelMessage", function(serverNum, channelName, message) {
    bot.sendChannelMessage(guilds[serverNum], channelName, message);
  });
});

expressApp.listen("3000", function() {
});

app.on("ready", function() {
  setTimeout(function(){
    let win = new BrowserWindow({ width: 800, height: 600 });
    win.on("closed", () => {
      win = null;
    });
  
    win.loadURL("http://localhost:3000");
  }, 3000)
});
