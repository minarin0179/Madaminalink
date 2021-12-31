// モジュール読み込み\
const { Client, Intents } = require('discord.js');
const Discord = require('discord.js');
// configを読み込み
const { prefix, token } = require('./config.json');
// クライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
client.once('ready', () => {
    const commands = [{
        name: 'copy',
        description: 'チャンネルをメッセージや添付ファイルを含めて複製します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT', 'GUILD_CATEGORY'],
            name: 'target',
            description: 'コピーするチャンネル/カテゴリー',
            required: true,
        }],
    }, {
        name: 'dice',
        description: 'ダイスを作成します(?d?)',
        options: [{
            type: 'NUMBER',
            name: 'ダイスの数',
            description: '何回ダイスを振るか',
            required: true,
        }, {
            type: 'NUMBER',
            name: 'ダイスの面数',
            description: '何面ダイスを振るか',
            required: true,
        }],

    },
    {
        name: 'played',
        description: 'プレイヤーロールを観戦ロールに置換',
        options: [{
            type: 'ROLE',
            name: 'before',
            description: '置換前のロール',
            required: true,
        }, {
            type: 'ROLE',
            name: 'after',
            description: '置換後のロール',
            required: true,
        }],
    }];
    client.application.commands.set(commands, '847518637933199420');
    console.log('準備完了！');
});

client.on('messageCreate', message => {
    // prefixのないメッセージやbotからのメッセージは無視
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (command.split('d').length == 2) {
        message.channel.send('<@' + message.member.id + '> ' + DiceRole(command));
    }
});


client.on('interactionCreate', async (interaction) => {

    await interaction.deferReply({ ephemeral: true });

    if (!interaction.isCommand() && !interaction.isButton()) {
        return;
    }

    if (interaction.customId === 'dicerole') {
        await interaction.reply('Please waiting');
        await interaction.channel.send('<@' + interaction.member.id + '> ' + DiceRole(interaction.component.label));
        await interaction.deleteReply();
        return;
    }

    // これ以降のコマンドは管理者専用
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        await interaction.followUp('このコマンドを実行する権限がありません');
        return;
    }


    if (interaction.commandName === 'copy') {
        const original = interaction.options.getChannel('target');

        if (original.type === 'GUILD_TEXT') {
            await copyChannel(original, original.parent).then(() => {
                interaction.followUp({ content: 'コピーは正常に完了しました', ephemeral: true });
            }).catch(() => {
                interaction.followUp({ content: 'コピー中にエラーが発生しました\n処理を中断します', ephemeral: true });
            });
        }
        else if (original.type === 'GUILD_CATEGORY') {
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
    else if (interaction.commandName === 'dice') {
        const button = new Discord.MessageButton()
            .setCustomId('dicerole')
            .setStyle('PRIMARY')
            .setLabel(interaction.options.getNumber('ダイスの数') + '    d    ' + interaction.options.getNumber('ダイスの面数'));
        await interaction.channel.send({
            content: 'ボタンをクリックしてダイスロール!',
            components: [new Discord.MessageActionRow().addComponents(button)],
        });
        interaction.reply({ content: 'ダイスを作成しました', ephemeral: true });
    }
    if (interaction.commandName === 'played') {

        interaction.guild.members.fetch().then(() => {
            console.log(interaction.options.getRole('before').members);
            interaction.options.getRole('before').members.forEach(member => {
                member.roles.remove(interaction.options.getRole('before'));
                member.roles.add(interaction.options.getRole('after'));
            });
        }).then(() => {
            interaction.reply('ロールの移行が完了しました');
        });
    }
});

// ダイスロールを行う 入力 〇d〇
const DiceRole = (str) => {
    const figure = str.replace(/ /g, '');
    const args = figure.split('d');

    if (args[0] == 1) {
        return figure + ' → ' + getRandomInt(args[1]);
    }
    const result = [];
    for (let i = 0; i < args[0]; i++) {
        result.push(getRandomInt(args[1]));
    }
    return figure + ' → [' + result + '] → ' + sum(result);
};

//配列の合計
const sum = (args) => args.reduce(function (a, b) { return a + b; }, 0);

//整数の乱数発生機
const getRandomInt = (max) => {
    return Math.floor(Math.random() * max + 1);
};

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
