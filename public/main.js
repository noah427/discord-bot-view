$(function() {
  var socket = io.connect("http://localhost:8080");

  var storage = {
    currentChannel: "",
    currentServer: 0,
    extraInfo: [/*wtf*/]
  };

  setInterval(function() {
    if (storage.currentChannel != "") {
      var currentChannel = storage.currentChannel;
      var currentServer = storage.currentServer;
      socket.emit("fetchChannelMessages", currentServer, currentChannel);
    }
  }, 5000);

  $("#sendMessage").click(function(event) {
    if ($("#writeMessage").val() != "") {
      var currentChannel = storage.currentChannel;
      var currentServer = storage.currentServer;
      var message = $("#writeMessage").val();
      socket.emit("sendChannelMessage", currentServer, currentChannel, message);
      $("#messageViewer").append(
        `<span class="message">you said : ${message}</span><br>`
      );
      $("#writeMessage").val("");
    }
  });

  $("#playSound").click(function(event) {
    socket.emit("playSound", $("#soundFile").val());
  });

  $("#changeStatus").click(function(event) {
    let status = $("#status").val();

    let presence = {
      name: $("#customPresence").val(),
      type: $("#typeOP").val().toUpperCase(),
      url: ""
    };

    console.log(status, presence)

    socket.emit("changeStatus", status, presence);
  });

  $("body").keypress(function(event) {
    if ($("#writeMessage").val() != "" && event.key == "Enter") {
      var currentChannel = storage.currentChannel;
      var currentServer = storage.currentServer;
      var message = $("#writeMessage").val();
      socket.emit("sendChannelMessage", currentServer, currentChannel, message);
      $("#messageViewer").append(
        `<span class="message">you said : ${message}</span><br>`
      );
      $("#writeMessage").val("");
    }
  });

  socket.on("guilds", function(guilds) {
    for (let i = 0; i < guilds.length; i++) {
      $("#navigator").append(
        `<div class="server" id="serverContainer${i}"><br><h4 class="serverName" id="server${i}">${guilds[i]}</h4></div><br>`
      );
      $(`#server${i}`).click(function(event) {
        $(`#server${i}`).off("click");
        socket.emit("serverChannels", guilds[i], i);
      });
    }
  });

  
  socket.on("sendChannels", function(channels, serverNumber) {
    for (let i = 0; i < channels.length; i++) {
      $(`#serverContainer${serverNumber}`).append(
        `<button class="channel" id="server${serverNumber}channel${i}">${channels[i]}</button><br>`
      );
      $(`#server${serverNumber}channel${i}`).click(function(event) {
        socket.emit("fetchChannelMessages", serverNumber, channels[i]);
        storage.currentChannel = channels[i];
        storage.currentServer = serverNumber;
      });
    }
  });

  socket.on("displayMessages", function(messages, extraInfo) {
    $("#messageViewer").html("");

    localStorage.setItem("extra-info", extraInfo);

    for (let i = 0; i < messages.length; i++) {
      $("#messageViewer").append(
        `<span class="message" id="message${i}">${messages[i]}</span><br>`
      );
    }
  });
});
