// モジュール読み込み\
const { Client, Intents } = require('discord.js');
// configを読み込み
const { prefix, token } = require('./config.json');
// クライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
    const data = [{
        name: 'copy',
        description: 'チャンネルをメッセージや添付ファイルを含めて複製します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT', 'GUILD_CATEGORY'],
            name: 'target',
            description: 'コピーするチャンネル/カテゴリー',
            required: true,
        }],
    }];
    client.application.commands.set(data, '926052259069059102');
    console.log('準備完了！');
});

client.on('messageCreate', message => {
    // prefixのないメッセージやbotからのメッセージは無視
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // const args = message.content.slice(prefix.length).trim().split(' ');
    // const command = args.shift().toLowerCase();
});


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    if (interaction.commandName === 'copy') {
        // 応答時間が長くなる場合
        await interaction.deferReply();

        const original = interaction.options.getChannel('target');
        if (original.type === 'GUILD_TEXT') {
            console.log(original);
            await copyChannel(original, original.parent).then(() => {
                interaction.followUp({ content: 'コピーは正常に完了しました', ephemeral: true });
            }).catch(() => {
                interaction.followUp({ content: 'コピー中にエラーが発生しました\n処理を中断します', ephemeral: true });
            });
        }
        else if (original.type === 'GUILD_CATEGORY') {
            console.log(original.children);
            original.guild.channels.create('copy ' + original.name, {
                type: 'GUILD_CATEGORY',
                permissionOverwrites: original.permissionOverwrites.cache,
            }).then(async (new_category) => {
                for await (const ch of original.children) {
                    copyChannel(ch[1], new_category);
                }
            });
            interaction.followUp({ content: 'コピーは正常に完了しました', ephemeral: true });
        }
    }
});

// チャンネルを複製して内容をコピー
const copyChannel = (original, category) => {
    return new Promise((resolve, reject) => {
        // チャンネルを作る
        original.guild.channels.create('copy ' + original.name, {
            // カテゴリー設定
            parent: category,
            // 権限をコピー
            permissionOverwrites: original.permissionOverwrites.cache,
        }).then((new_channel) => {
            // メッセージをすべて取得
            original.messages.fetch().then(async (messages) => {
                try {
                    for await (const msg of messages.reverse()) {
                        if (msg[1].content === '') continue;
                        await new_channel.send(msg[1].content);
                        if (msg[1].attachments.size > 0) {
                            const files = await msg[1].attachments.map(attachment => attachment.url);
                            await new_channel.send({ files });
                        }
                    }
                }
                catch {
                    reject();
                }
                resolve();
            });
        });
    });
};


client.login(token);
