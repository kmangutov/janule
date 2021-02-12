import * as Discord from 'discord.js';
import * as getUrls from 'get-urls';

/**
 * Get all the messages from a channel. Discord's MessageManager API allows us to get 100
 * messages at a time.
 * @param messageManager
 */
async function getChannelMessages(messageManager: Discord.MessageManager) {
    let allMessages: Array<Discord.Message> = [];
    let messages = await messageManager.fetch({ limit: 100 });
    let messageArray = messages.array();
    allMessages = allMessages.concat(messageArray);
    let size = messageArray.length;
    let message = messageArray[size - 1];
    let idx = message.id;
    while (size > 0) {
        messages = await messageManager.fetch({ limit: 100, before: idx });
        messageArray = messages.array();
        size = messageArray.length;
        if (size > 0) {
            allMessages = allMessages.concat(messageArray);
            idx = messageArray[size - 1].id;
        }
    }
    return allMessages;
}

async function sendChannelUniqueUrlsSummary (message: Discord.Message) {
    const messages = await getChannelMessages(message.channel.messages);
    let urls: Set<string> = new Set();
    messages.map((message) => getUrls(message.content).forEach((url) => urls.add(url)));
    const urlStrings: Array<string> = [];
    urls.forEach((url) => urlStrings.push(url));
    message.channel.send('```' + urlStrings.join('\n') + '```');
}

async function sendChannelStats(incomingMessage: Discord.Message) {
    let messages = await getChannelMessages(incomingMessage.channel.messages);
    if (messages.length > 0) {
        messages.sort((messageA, messageB) => messageA.createdTimestamp - messageB.createdTimestamp);
        const firstMessageUser = `${messages[0].author.username}#${messages[0].author.discriminator} said : ${messages[0].content}`;
        let channelMessageStats: Map<string, number> = new Map();
        messages.map((message) => {
            const user = `${message.author.username}#${message.author.discriminator}`;
            const userStats = channelMessageStats.get(user) ?? 0;
            channelMessageStats.set(user, userStats + 1);
        });
        const channelMessageStatsArray = [];
        channelMessageStats.forEach((numMessages, user) => channelMessageStatsArray.push(`${user}: ${numMessages}`));

        const messageEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Channel Statistics:')
            .addFields([
                {
                    name: 'Number of messages sent by user:',
                    value: channelMessageStatsArray.join('\n'),
                },
                {
                    name: 'Number of messages:',
                    value: messages.length,
                },
                {
                    name: 'First Message sent by:',
                    value: firstMessageUser,
                },
            ]);
        incomingMessage.channel.send(messageEmbed);
    } else {
        incomingMessage.channel.send('Could not find messages for this channel');
    }
}

export default {
    sendChannelStats,
    sendChannelUniqueUrlsSummary ,
};
