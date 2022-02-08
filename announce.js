// モジュール読み込み\
const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');


dotenv.config();

// クライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });


client.once('ready', async () => {

    const message = `
※このメッセージはマダミナリンクを利用しているサーバーの管理者に向けて送られています
マダミナリンクは現在、機能改善に向けて利用者アンケートを行っております
もしよければアンケートの回答にご協力下さい
https://forms.gle/ufRUC73RExPbM39v5
    `;

    const user = await client.users.fetch('295113815794647041');
    console.log(user);
    // user.send(message);


    const guilds = await client.guilds.fetch();

    console.log('オーナーの一覧を取得中です');
    const owners = await Promise.all(guilds.map(async guild => await client.users.fetch((await guild.fetch()).ownerId)));
    const owners_noduplicate = [...new Set(owners)];
    console.log(owners_noduplicate);

    await Promise.all(owners_noduplicate.map(async owner => {
        console.log(owner.username);
        await owner.send(message)
            .then(() => console.log(`${owner.username}にメッセージを送信しました`))
            .catch(console.error);
    }));

    console.log('アナウンスが完了しました。');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);