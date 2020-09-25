import * as Discord from 'discord.js';
import * as mongoose from 'mongoose';

import { handleCommand } from './command';
import { parseCommand } from './parse';

import { dbUrl, dbToken } from '../secrets.json';

import UserController from './controllers/user.controller';
import { Emojis, EMOJI_IDENTIFIER_MAP } from './types';
import memeController from './controllers/meme.controller';

export const _STATS = {
    startTime: new Date(),
};

const client = new Discord.Client();
client.login(dbToken);

let isDbConnected = false;

mongoose
    .connect(dbUrl, { useNewUrlParser: true })
    .then(() => {
        isDbConnected = true;
        return console.info(`Successfully connected to ${dbUrl}`);
    })
    .catch((error) => {
        console.error('Error connecting to database: ', error);
        return process.exit(1);
    });

console.info('WELCOME TO JANULE .. BOT.. HI');
console.info(client.user);
client.on('messageReactionAdd', async (reaction: Discord.MessageReaction, user: Discord.User) => {
    const reactionUser = user.username + '#' + user.discriminator;
    const botUser = client.user.username + '#' + user.discriminator;
    const identifier = reaction.emoji.identifier;
    const messageContent = reaction.message.content;
    if (reactionUser !== botUser && identifier in EMOJI_IDENTIFIER_MAP) {
        switch (EMOJI_IDENTIFIER_MAP[identifier]) {
            case Emojis.Approve:
                console.info(`${reactionUser} approves of ${messageContent}`);
                const meme = await memeController.CreateMeme({
                    name: messageContent,
                    creator: reactionUser,
                    edges: [],
                });
                reaction.message.channel.send(`Successfully added meme: "${meme.name}"`);
                break;
            case Emojis.Reject:
                console.info(`${reactionUser} rejects of ${messageContent}`);
                break;
        }
    }
});

client.on('message', async (message: Discord.Message) => {
    if (!isDbConnected) {
        return;
    }

    const username = message.author.username + '#' + message.author.discriminator;

    let uid = await UserController.getUIDForDiscordName(username);
    if (uid == null) {
        await UserController.CreateUser({ name: username });
        uid = await UserController.getUIDForDiscordName(username);
    }

    console.info('Message received from %s, UID: %s.', username, uid);

    const { command, args } = parseCommand(message.content);

    handleCommand(command, args, username, message);
});
