// モジュール読み込み\
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const dotenv = require('dotenv');

// 環境変数を読み込み
dotenv.config();

// クライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });

// コマンドを取得
const commands = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
commandFiles.forEach(file => {
    const command = require(`./commands/${file}`);
    commands[command.data.name] = command;
});

// ボタンを取得
const buttons = {};
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
buttonFiles.forEach(file => {
    const button = require(`./buttons/${file}`);
    buttons[button.customId] = button;
});

// その他の処理を取得
const remind = require('./remind.js');
const welcome = require('./welcome.js');

// サーバー参加時の処理
client.on('guildCreate', async (new_guild) => {
    welcome.execute(client, new_guild).catch(console.log);
});

client.once('ready', async () => {
    // スラッシュコマンドをサーバーに登録
    const datas = Object.keys(commands).map(key => commands[key].data);
    await client.application.commands.set(datas);
    console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
    // ボタンの処理
    if (interaction.isButton()) {
        const id = interaction.customId;
        const button = buttons[(id.indexOf(';') == -1) ? id : id.substring(0, id.indexOf(';'))];
        // アプデ後はこちらに移行 const button = buttons[id.substring(0, id.indexOf(';'))];

        try {
            await button.execute(interaction);
        }
        catch (err) {
            console.log(id, err);
            interaction.replied || interaction.deferred
                ? await interaction.followUp({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true })
                : await interaction.reply({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true });
        }
        return;
    }

    // コマンドやボタン以外は無視
    if (!interaction.isCommand()) return;

    // コマンドを取得
    const command = commands[interaction.commandName];

    if (command === undefined) {
        await interaction.reply({ content: 'このコマンドは存在しません', ephemeral: true });
        return;
    }

    // 管理者権限が必要なコマンドか判断
    if (command.need_admin && !interaction.member.permissions.has('ADMINISTRATOR')) {
        await interaction.reply({ content: 'このコマンドを実行する権限がありません', ephemeral: true });
        return;
    }

    // コマンドを実行
    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.log(interaction.commandName, error);
        interaction.replied || interaction.deferred
            ? await interaction.followUp({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true })
            : await interaction.reply({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true });
    }
});

cron.schedule('* * * * *', () => {
    // リマインダーの確認と送信
    remind.execute(client);
});

client.login(process.env.DISCORD_TOKEN);