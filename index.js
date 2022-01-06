// モジュール読み込み\
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
// configを読み込み
const { prefix, token } = require('./config.json');
// クライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });

// コマンドを取得
const commands = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands[command.data.name] = command;
}

client.once('ready', async () => {
    // コマンドを取得
    const data = [];
    for (const commandName in commands) {
        data.push(commands[commandName].data);
    }

    // スラッシュコマンドをサーバーに登録
    await client.application.commands.set(data);
    console.log('Ready!');
});

client.on('messageCreate', message => {
    // prefixのないメッセージやbotからのメッセージは無視
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // コマンド部分を取得
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    // ダイスコマンドを処理
    if (command.split('d').length != 2) return;
    console.log(command.split('d'));
    if (isNaN(command.split('d')[0]) || isNaN(command.split('d')[1])) return;

    message.channel.send('<@' + message.member.id + '> ' + DiceRole(command));

});


client.on('interactionCreate', async (interaction) => {

    // 全員実行可能なコマンド
    if (interaction.customId === 'dicerole') {
        await interaction.reply('ダイスロールを実行中');
        await interaction.channel.send(`<@${interaction.member.id}> 🎲 ${DiceRole(interaction.component.label)}`);
        await interaction.deleteReply();
        return;
    }

    // コマンドやボタン以外は無視
    if (!interaction.isCommand()) return;

    // コマンドを取得
    const command = commands[(interaction.isCommand) ? interaction.commandName : interaction.customId];

    if (command === undefined) {
        await interaction.reply({
            content: 'このコマンドは存在しません',
            ephemeral: true,
        });
        return;
    }

    // 管理者権限が必要なコマンドか判断
    if (command.need_admin && !interaction.member.permissions.has('ADMINISTRATOR')) {
        await interaction.reply({
            content: 'このコマンドを実行する権限がありません',
            ephemeral: true,
        });
        return;
    }

    // コマンドを実行
    try {
        await command.execute(interaction);
    } catch (error) {
        interaction.replied || interaction.deferred
            ? await interaction.followUp({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true })
            : await interaction.reply({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true });
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
    return `${figure} → [${result}] → ${sum(result)}`;
};

// 配列の合計
const sum = (args) => args.reduce(function (a, b) { return a + b; }, 0);

// 整数の乱数発生機
const getRandomInt = (max) => {
    return Math.floor(Math.random() * max + 1);
};

cron.schedule('* * * * *', () => {

    // 日付を取得
    const today = new Date();
    // remindチャンネルを取得
    client.channels.cache.filter(channel => channel.type === 'GUILD_TEXT' && channel.name === 'remind').forEach(async (channel) => {

        // remindチャンネルのメッセージを取得
        const messages = await channel.messages.fetch();

        messages.forEach(async (message) => {
            if (message.embeds.length < 1) {
                message.delete();
                return;
            }
            // リマインドのデータを取得
            const fields = message.embeds[0].fields;
            // リマインド時刻を取得
            const time = new Date(fields[0].value);

            // まだその時ではない
            if (time > today) return;

            // 送信先を取得
            const channelid = fields[1].value.slice(2, -1);
            const text = fields[2].value;

            // リマインドを送信
            const target = await channel.guild.channels.fetch(channelid);
            await target.send(text).catch(err => console.log(err));

            // リマインドを削除
            message.delete();
        });
    });
});

client.login(token);