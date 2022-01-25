const Discord = require('discord.js');
const mysql = require('mysql');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Meikoudai2021!',
    database: 'Madaminalink',
});


connection.connect((err) => {
    if (err) {
        console.log('error connecting: ' + err.stack);
        return;
    }
    console.log('success');
});

module.exports = {
    async execute(client) {
        connection.query('SELECT * FROM reminds WHERE datetime < now()', function (error, results, fields) {
            if (error) throw error;
            results.forEach(async res => {
                const destination_ch = await client.channels.fetch(res.destination_id).catch();
                const author = await client.users.fetch(res.author_id).catch();
                const remind_ch = await client.channels.fetch(res.channel_id).catch();
                const remind_msg = await remind_ch.messages.fetch(res.message_id).catch();

                connection.query(`DELETE FROM reminds WHERE id = ${res.id}`);

                if (author == undefined) return;
                if (destination_ch == undefined) {
                    author.send(`
リマインドが正しく送信されませんでした。チャンネルが削除されていた可能性があります。
送信されなかったメッセージ「${res.message}」`);
                    return;
                }
                await destination_ch.send(res.message);
                if (remind_msg) {
                    remind_msg.delete();
                }
            });
        });
    },
};