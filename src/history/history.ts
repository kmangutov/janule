import * as Discord from 'discord.js';
import * as getUrls from 'get-urls';
import * as immutable from 'immutable';
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

    while (size < 100) {
        messages = await messageManager.fetch({ limit: 100, before: idx });
        messageArray = messages.array();
        allMessages = allMessages.concat(messageArray);
        size = messageArray.length;
        idx = messageArray[size - 1].id;
    }
    return allMessages;
}

async function getChannelURLs(message: Discord.Message) {
    const messages = await getChannelMessages(message.channel.messages);
    let urls: Set<string> = new Set();
    messages.map((message) => getUrls(message.content).forEach((url) => urls.add(url)));
    const urlStrings: Array<string> = [];
    urls.forEach((url) => urlStrings.push(url));
    message.channel.send('```' + urlStrings.join('\n') + '```');
}

async function getChannelStats(incomingMessage: Discord.Message) {
    let messages = await getChannelMessages(incomingMessage.channel.messages);
    if (messages.length > 0) {
        messages.sort((messageA, messageB) => messageA.createdTimestamp - messageB.createdTimestamp);
        const firstMessageUser = `${messages[0].author.username}#${messages[0].author.discriminator} said : ${messages[0].content}`;
        let channelMessageStats = immutable.Map<string, number>();
        messages.map((message) => {
            const user = `${message.author.username}#${message.author.discriminator}`;
            const userStats = channelMessageStats.get(user) ?? 0;
            channelMessageStats.set(user, userStats + 1);
        });
        channelMessageStats = channelMessageStats.sort();
        console.log(channelMessageStats);
        const channelMessageStatsArray = [];
        channelMessageStats.reduce((numMessages, user) => channelMessageStatsArray.push(`${user}: ${numMessages}`));
        incomingMessage.channel.send(`
        Channel Statistics:\n
        Number of messages sent by user:\n
        ${channelMessageStatsArray.join('\n')}\n
        First Message sent by: ${firstMessageUser}`);
    } else {
        incomingMessage.channel.send('Could not find messages for this channel');
    }
}

export default {
    getChannelStats,
    getChannelURLs,
};
