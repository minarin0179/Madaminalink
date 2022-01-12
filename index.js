// モジュール読み込み\
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

// クライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });

// コマンドを取得
const commands = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// ボタンの処理を取得
const buttons = {};
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

// リマインドの処理を取得
const remind = require('./remind.js');

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands[command.data.name] = command;
}

for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    buttons[button.customId] = button;
}

client.once('ready', async () => {

    // スラッシュコマンドをサーバーに登録
    const data = [];
    for (const commandName in commands) {
        data.push(commands[commandName].data);
    }

    await client.application.commands.set(data);
    console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {

    if (interaction.isButton()) {
        const button = buttons[interaction.customId];

        try {
            await button.execute(interaction);
        } catch (err) {
            console.log(err);
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
    } catch (error) {
        console.log(error);
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