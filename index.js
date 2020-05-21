// TODO: use typescript

const Discord = require('discord.js')
const client = new Discord.Client()
const config = require("./config.json");


var mongoose = require('mongoose');
const mlab = config.db
client.login(config.token);
mongoose.connect(mlab)


const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
    console.log('helo')

    var MemeScheme = mongoose.Schema({
        name: String
    });
    var Meme = mongoose.model('Meme', MemeScheme, 'memes')
    const memes = Meme.collection.find()
    memes.forEach(function(meme) {
        console.log(meme)
    })

    ///////////////////////////
    const CMD_ADD = '!addmeme'
    const CMD_GET = '!getmemes'
    client.on('message', (message) => {
        if (!message.content.startsWith('!')) return;
        else if (message.content.startsWith(CMD_ADD)) {
            const param = message.content.substring(CMD_ADD.length)
            Meme.collection.insert([{name: param}])
        } else if (message.content === CMD_GET) {
            const memes = Meme.collection.find()
            memes.forEach((meme) => {
                message.channel.send(meme.name)
            })
        }
    })
})
