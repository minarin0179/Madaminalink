// モジュール読み込み\
const { Client, Intents } = require('discord.js');
const cron = require('node-cron');
const dotenv = require('dotenv');

// 環境変数を読み込み
dotenv.config();

// クライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });

// その他の処理を取得
const remind = require('./send_remind.js');
const welcome = require('./welcome.js');
const buttons = require('./buttons.js');
const commands = require('./commands.js');
const selects = require('./selects.js');

// サーバー参加時の処理
client.on('guildCreate', async (new_guild) => {
    welcome.execute(client, new_guild).catch(console.log);
});

client.once('ready', async () => {
    await commands.set(client).catch(console.log);
    console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        buttons.pressed(interaction).catch(console.log);
    }
    else if (interaction.isCommand()) {
        commands.entered(interaction).catch(console.log);
    }
    else if (interaction.isSelectMenu()) {
        selects.selected(interaction).catch(console.log);
    }
});

cron.schedule('* * * * *', () => {
    remind.execute(client).catch(console.log);
});

client.login(process.env.DISCORD_TOKEN);