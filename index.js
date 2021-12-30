// モジュール読み込み
const { Client, Intents } = require('discord.js');
// configを読み込み
const { prefix, token } = require('./config.json');
// クライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
    const data = [{
        name: 'ping',
        description: 'ピンしたらポンするのが礼儀',
    }];
    client.application.commands.set(data, '926052259069059102');
    console.log('準備完了！');
});

client.on('message', message => {
    // prefixのないメッセージやbotからのメッセージは無視
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        // message.channel.send('pong');
    }
    else if (command === 'copy') {
        message.guild.channels.create('copy ' + message.channel.name, { parent: message.channel.parent }).then((new_channel) => {
            message.channel.messages.fetch({ before: message.id }).then(messages => {
                messages.reverse().forEach(msg => {
                    if (msg.attachments.size > 0) {
                        const files = msg.attachments.map(attachment => attachment.url);
                        new_channel.send({ files });
                    }
                    new_channel.send(msg.content);
                });
            });
        });
    }

    // message.guild.channels.create('test');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong！');
    }
});


client.login(token);
