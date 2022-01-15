// モジュール読み込み\
const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');


dotenv.config();

// クライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });


client.once('ready', async () => {

    const message = `
マダミナリンクは現在利用者アンケートを行っております
もしよければ回答にご協力下さい
https://forms.gle/ufRUC73RExPbM39v5
    `;

    const user = await client.users.fetch('295113815794647041');
    user.send(message);


    const guilds = await client.guilds.fetch();

    await Promise.all(guilds.map(async guild => {
        const owner = await client.users.fetch((await guild.fetch()).ownerId);
        // owner.send(message); ※送信厳重注意よく確認してから
        console.log(owner.username);
    }));
    console.log('アナウンスが完了しました。');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);