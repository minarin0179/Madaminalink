// モジュール読み込み\
const { Client, Intents } = require('discord.js');
const cron = require('node-cron');
const dotenv = require('dotenv');


// 環境変数を読み込み
dotenv.config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
    restRequestTimeout: 60000,
});

// その他の処理を取得
const remind = require('./modules/send_remind.js');
const welcome = require('./modules/welcome.js');
const buttons = require('./modules/buttons.js');
const commands = require('./modules/commands.js');
const selects = require('./modules/selects.js');
const modals = require('./modules/modal.js');

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
    else if (interaction.isCommand() || interaction.isContextMenu()) {
        commands.entered(interaction).catch(console.log);
    }
    else if (interaction.isSelectMenu()) {
        selects.selected(interaction).catch(console.log);
    }
    else if (interaction.isModalSubmit()) {
        modals.submit(interaction).catch(console.log);
    }
});

cron.schedule('5 * * * * *', () => {
    remind.execute(client).catch(console.log);
});

client.login(process.env.DISCORD_TOKEN);