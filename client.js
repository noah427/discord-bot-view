var discord = require('discord.js')
var client = new discord.Client
var exports = module.exports = {}

client.on('ready', () => console.log("logged in as: " + client.user.tag))

exports.login = function (token) {
    client.login(token)
}

exports.init = function () {
    let guilds = []
    client.guilds.forEach(guild => guilds.push(guild.name))
    return guilds
}

exports.fetchChannels = function (serverName) {
    let channels = []
    client.guilds.find(server => server.name === serverName).channels.forEach(channel => {
        if (channel.type === "text") {
            channels.push(channel.name)
        }
    })
    return channels
}

exports.fetchMsgs = async function (serverName, channelName) {
    fetched = await client.guilds.find(guild => guild.name === serverName).channels.find(channel => channel.name === channelName).fetchMessages({ limit: 25 })
    return fetched
}

exports.deleteMessage = async function (serverName, channelName, messageID){
    fetched = await client.guilds.find(guild => guild.name === serverName).channels.find(channel => channel.name === channelName).fetchMessages({ limit: 25 })
    fetched.then(messages => {
        messages.forEach(message => {
            if(message.id == messageID){
                if(message.deletable){
                    message.delete()

                } else console.log("don't have perms to delete message")             
            }
        })
    })
}

exports.sendChannelMessage = function(serverName, channelName, message){
    var server = client.guilds.find(guild => guild.name === serverName)
    var channelID = server.channels.find(channel => channel.name === channelName).id
    server.channels.get(channelID).send(message)
}

