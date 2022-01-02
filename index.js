// モジュール読み込み\
const { Client, Intents } = require('discord.js');
const Discord = require('discord.js');
// configを読み込み
const { prefix, token } = require('./config.json');
// クライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });

client.once('ready', async () => {
    // コマンド一覧
    const commands = [{
        name: 'copy',
        description: 'チャンネルをメッセージや添付ファイルを含めて複製します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT', 'GUILD_CATEGORY'],
            name: 'テキストチャンネルまたはカテゴリー',
            description: 'コピーするチャンネル/カテゴリー',
            required: true,
        }],
    },
    /* copy_betaは削除済み
     {
        name: 'copy_beta',
        description: 'チャンネルをメッセージや添付ファイルを含めて複製します',
        options: [{
            type: 'SUB_COMMAND',
            name: 'text_channel',
            description: 'テキストチャンネルを複製',
            options: [{
                type: 'CHANNEL',
                channelTypes: ['GUILD_TEXT'],
                name: 'text_channel',
                description: '複製するテキストチャンネル',
                required: true,
            }],
        }, {
            type: 'SUB_COMMAND',
            name: 'category',
            description: 'カテゴリーを複製',
            options: [{
                type: 'CHANNEL',
                channelTypes: ['GUILD_CATEGORY'],
                name: 'category',
                description: '複製するカテゴリー',
                required: true,
            }],
        }],
    },
    */
    {
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

    }, {
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
    }, {
        name: 'log',
        description: 'カテゴリをログとして保存します',
        options: [{
            type: 'CHANNEL',
            name: 'channel',
            channelTypes: ['GUILD_CATEGORY'],
            description: '保存するカテゴリ',
            required: true,
        }, {
            type: 'ROLE',
            name: 'spectator',
            description: '観戦者ロール',
            required: true,
        }],
    }, {
        name: 'setup',
        description: '新規のプレイ用カテゴリーを作成',
        options: [{
            type: 'STRING',
            name: 'シナリオ名',
            description: 'シナリオ名',
            required: true,
        }, {
            type: 'NUMBER',
            name: 'プレイヤーの数',
            description: 'プレイヤーの数',
            required: true,
        }, {
            type: 'NUMBER',
            name: '密談チャンネル数',
            description: '密談チャンネルの数(不要な場合は0)',
            required: true,
        }],
    }, {
        name: 'cleanup',
        description: 'チャンネルに送信されたメッセージをすべて削除します',
    }, {
        name: 'delete',
        description: 'カテゴリを削除します(カテゴリーに含まれるチャンネルも削除されます)',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_CATEGORY'],
            name: 'category',
            description: '削除するカテゴリ',
            required: true,
        }],
    }];
    // スラッシュコマンドを登録
    await client.application.commands.set(commands);
    console.log('準備完了！');
});

client.on('messageCreate', message => {
    // prefixのないメッセージやbotからのメッセージは無視
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // コマンド部分を取得
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'cleanup') {
        message.channel.clone();
        message.channel.delete();
    }

    // ダイスコマンドを処理
    else if (command.split('d').length == 2) {
        message.channel.send('<@' + message.member.id + '> ' + DiceRole(command));
    }
});


client.on('interactionCreate', async (interaction) => {
    // 応答時間の制限を15分に
    await interaction.deferReply({ ephemeral: true });

    // コマンドやボタン以外は無視
    if (!interaction.isCommand() && !interaction.isButton()) {
        return;
    }

    // 全員実行可能なコマンド
    if (interaction.customId === 'dicerole') {
        await interaction.followUp('ダイスロールを実行中');
        await interaction.channel.send('<@' + interaction.member.id + '> 🎲' + DiceRole(interaction.component.label));
        await interaction.editReply('ダイスロールを完了!');
        return;
    }

    // これ以降のコマンドは管理者専用
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        await interaction.followUp('このコマンドを実行する権限がありません');
        return;
    }

    // copyコマンドを処理
    else if (interaction.commandName === 'copy') {
        const original = interaction.options.getChannel('テキストチャンネルまたはカテゴリー');
        if (original.type === 'GUILD_TEXT') {
            await copyChannel(original, original.parent).then(() => {
                interaction.followUp({ content: 'コピーは正常に完了しました', ephemeral: true });
            });
        }
        else if (original.type === 'GUILD_CATEGORY') {
            original.guild.channels.create('copy ' + original.name, {
                type: 'GUILD_CATEGORY',
                permissionOverwrites: original.permissionOverwrites.cache,
            }).then(async (new_category) => {
                for await (const ch of original.children) {
                    await copyChannel(ch[1], new_category);
                }
            });
            interaction.followUp({ content: 'コピーは正常に完了しました', ephemeral: true });
        }
    }
    /*
    // copy_betaコマンドの処理
    else if (interaction.commandName === 'copy_beta') {
        // テキストチャンネルを複製
        if (interaction.options.getSubcommand() === 'text_channel') {
            const original = interaction.options.getChannel('text_channel');
            await copyChannel(original, original.parent).then(() => {
                interaction.followUp({ content: 'コピーは正常に完了しました', ephemeral: true });
            });
        }

        // カテゴリーを複製
        else {
            const original = interaction.options.getChannel('category');
            const new_category = await original.guild.channels.create('copy ' + original.name, {
                type: 'GUILD_CATEGORY',
                permissionOverwrites: original.permissionOverwrites.cache,
            });

            for await (const channel of original.children) {
                await copyChannel(channel[1], new_category);
            }
        }
        await interaction.followUp({ content: 'コピーは正常に完了しました', ephemeral: true });
    }
    */

    // diceコマンドを処理
    else if (interaction.commandName === 'dice') {
        const button = new Discord.MessageButton()
            .setCustomId('dicerole')
            .setStyle('PRIMARY')
            .setLabel(interaction.options.getNumber('ダイスの数') + '    d    ' + interaction.options.getNumber('ダイスの面数'));
        await interaction.channel.send({
            content: 'ボタンをクリックしてダイスロール🎲!',
            components: [new Discord.MessageActionRow().addComponents(button)],
        });
        interaction.followUp({ content: 'ダイスを作成しました', ephemeral: true });
    }
    else if (interaction.commandName === 'played') {
        interaction.guild.members.fetch().then(() => {
            interaction.options.getRole('before').members.forEach(member => {
                member.roles.remove(interaction.options.getRole('before'));
                member.roles.add(interaction.options.getRole('after'));
            });
        }).then(() => {
            interaction.followUp('ロールの移行が完了しました');
        });
    }

    // logコマンドを処理
    else if (interaction.commandName === 'log') {
        const ch = interaction.options.getChannel('channel');
        if (ch.name.startsWith('(ログ)')) {
            interaction.followUp('このチャンネルはすでにログ化されています');
            return;
        }

        const today = new Date();
        const month = today.getMonth() + 1;
        const date = today.getDate();

        await ch.setName('(ログ)' + month + '/' + date + ch.name);

        const spectator = interaction.options.getRole('spectator');
        const everyoneRole = interaction.guild.roles.everyone;

        await ch.permissionOverwrites.set([
            {
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
            },
        ]);

        if (spectator != null) {
            await ch.permissionOverwrites.create(spectator, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: false,
            });
        }

        await ch.children.forEach(async (channel) => {
            if (channel.type === 'GUILD_VOICE') {
                channel.delete();
                return;
            }
            await channel.permissionOverwrites.set(ch.permissionOverwrites.cache);
        });

        await interaction.followUp('完了しました');
    }

    else if (interaction.commandName === 'setup') {
        // シナリオ名を取得
        const title = interaction.options.getString('シナリオ名');
        // 送信するサーバーを取得
        const guild = interaction.guild;
        // everyoneロールを取得
        const everyoneRole = guild.roles.everyone;

        // PLロールを作成
        const role_PL = await guild.roles.create({ name: title + '_PL' });

        // 観戦ロールを作成
        const role_SP = await guild.roles.create({ name: '(観戦)' + title });

        // カテゴリーを作成
        const new_category = await guild.channels.create(title, {
            type: 'GUILD_CATEGORY',
            permissionOverwrites: [{
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_PL.id,
                allow: ['VIEW_CHANNEL'],
            }, {
                id: role_SP.id,
                allow: ['VIEW_CHANNEL'],
                deny: ['SEND_MESSAGES'],
            }],
        });

        // 一般チャンネル
        await guild.channels.create('一般', {
            type: 'GUILD_TEXT',
            parent: new_category,
            permissionOverwrites: [{
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_PL.id,
                allow: ['VIEW_CHANNEL'],
            }, {
                id: role_SP.id,
                allow: ['VIEW_CHANNEL'],
            }],
        });

        // 共通情報チャンネル
        await guild.channels.create('共通情報（書き込み不可）', {
            type: 'GUILD_TEXT',
            parent: new_category,
            permissionOverwrites: [{
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_PL.id,
                allow: ['VIEW_CHANNEL'],
                deny: ['SEND_MESSAGES'],
            }, {
                id: role_SP.id,
                allow: ['VIEW_CHANNEL'],
                deny: ['SEND_MESSAGES'],
            }],
        });

        // 観戦チャンネル
        await guild.channels.create('観戦者', {
            type: 'GUILD_TEXT',
            parent: new_category,
            permissionOverwrites: [{
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_PL.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_SP.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
            }],
        });

        // 通話チャンネル
        await guild.channels.create('全体会議', {
            type: 'GUILD_VOICE',
            parent: new_category,
            permissionOverwrites: [{
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_PL.id,
                allow: ['VIEW_CHANNEL'],
            }, {
                id: role_SP.id,
                allow: ['VIEW_CHANNEL'],
                deny: ['SPEAK'],
            }],
        });

        for (let i = 0; i < interaction.options.getNumber('プレイヤーの数'); i++) {
            const role_i = await guild.roles.create(
                {
                    name: title + '_PL' + (i + 1),
                },
            );

            await guild.channels.create('個別ch' + (i + 1), {
                type: 'GUILD_TEXT',
                parent: new_category,
                permissionOverwrites: [{
                    id: everyoneRole.id,
                    deny: ['VIEW_CHANNEL'],
                }, {
                    id: role_SP.id,
                    allow: ['VIEW_CHANNEL'],
                    deny: ['SEND_MESSAGES'],
                }, {
                    id: role_i.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                }],
            });
        }

        for (let i = 0; i < interaction.options.getNumber('密談チャンネル数'); i++) {
            await guild.channels.create('密談場所' + (i + 1), {
                type: 'GUILD_VOICE',
                parent: new_category,
                permissionOverwrites: [{
                    id: everyoneRole.id,
                    deny: ['VIEW_CHANNEL'],
                }, {
                    id: role_PL.id,
                    allow: ['VIEW_CHANNEL'],
                }, {
                    id: role_SP.id,
                    allow: ['VIEW_CHANNEL'],
                    deny: ['SPEAK'],
                }],
            });
        }
        await interaction.followUp('完了しました');
    }

    else if (interaction.commandName === 'cleanup') {
        interaction.channel.clone();
        interaction.channel.delete();
    }
    // deleteコマンドを処理
    else if (interaction.commandName === 'delete') {
        const category = interaction.options.getChannel('category');

        await category.children.forEach(async (channel) => { await channel.delete(); });

        await category.delete();

        await interaction.followUp('完了しました');
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

// 配列の合計
const sum = (args) => args.reduce(function (a, b) { return a + b; }, 0);

// 整数の乱数発生機
const getRandomInt = (max) => {
    return Math.floor(Math.random() * max + 1);
};

// チャンネルを複製する
const copyChannel = async (original, category) => {
    // テキストチャンネルじゃなかったら無視
    if (original.type != 'GUILD_TEXT') return;

    const name = (original.parent == category) ? 'copy ' + original.name : original.name;
    const new_channel =
        await original.guild.channels.create(name, {
            // カテゴリー設定
            parent: category,
            // 権限をコピー
            permissionOverwrites: original.permissionOverwrites.cache,
        });

    await original.messages.fetch().then(async (messages) => {
        for await (const message of messages.reverse()) {
            const content = message[1].content;
            const files = await message[1].attachments.map(attachment => attachment.url);
            // if (content == '' && files.size == 0) continue;

            if (content == '') {
                await new_channel.send({ files }).catch(err => console.log(err));
                continue;
            }

            await new_channel.send({
                content: content,
                files: files,
            }).catch(err => console.log(err));
        }
    }).catch(err => console.log(err));
};

client.login(token);