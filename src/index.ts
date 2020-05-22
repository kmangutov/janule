import * as Discord from 'discord.js';
import * as mongoose from 'mongoose';

import { dbUrl, dbToken } from '../secrets.json';

const client = new Discord.Client();
const mlab = dbUrl;
client.login(dbToken);

mongoose.connect(mlab);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.info('WELCOME TO JANULE .. BOT.. HI');

    let MemeScheme = new mongoose.Schema({
        name: String,
    });
    let Meme = mongoose.model('Meme', MemeScheme, 'memes');
    const memes = Meme.collection.find();
    memes.forEach((meme: any) => {
        console.info(meme);
    });

    client.on('message', (message: any) => {
        const username = message.author.username + '#' + message.author.discriminator;

        const command = parseCommand(message.content);
        if (!command) {
            // If there is no parsed message, the message was not a valid command.
            return;
        }

        switch (command.type) {
            case CommandType.AddMeme:
                Meme.collection.insert([
                    {
                        name: command.args[0],
                        creator: username,
                    },
                ]);
                break;
            case CommandType.GetMeme:
                const memes = Meme.collection.find();
                memes.toArray().then((documents) => {
                    const results = documents.map((value, index) => {
                        const creator = value.creator != undefined ? value.creator : 'Unknown';
                        return index + ': ' + value.name + ' \n Created By: ' + creator;
                    });
                    message.channel.send('Current Memes: \n' + results.join('\n'));
                });
                break;
        }
    });
});

enum CommandType {
    AddMeme,
    GetMeme,
}

type Command = {
    type: CommandType;
    args: (string | number)[];
};

// Returns `ParseCommand` if successful, null otherwise.
const parseCommand = (message: string): Command | null => {
    const [command, ...args] = message.split(' ');

    if (command === '!addmeme') {
        return {
            type: CommandType.AddMeme,
            args: args,
        };
    }

    if (command === '!getmemes') {
        return {
            type: CommandType.GetMeme,
            args: args,
        };
    }

    return null;
};
