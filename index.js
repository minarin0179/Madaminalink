const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
	console.log('準備完了！');
});

client.login('OTI2MDUxODkzNzI4NDAzNDg2.Yc2DCA.yy5an1kAKWvMIT0BFjqJPeolakU');

// console.log('準備完了！');