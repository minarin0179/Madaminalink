const { connection, key } = require('./sql.js');
const crypto = require('crypto-js');


module.exports = {
    async execute(client) {
        connection.query('SELECT * FROM reminds WHERE datetime < now()', function (error, results) {
            if (error) throw error;
            results.forEach(async res => {

                const bytes = crypto.AES.decrypt(res.message, key);
                const message = bytes.toString(crypto.enc.Utf8);
                // remindの送信
                client.channels.fetch(res.destination_id).then(destination_ch => {
                    destination_ch.send(message);
                }).catch(async () => {
                    client.users.fetch(res.author_id).then(author => {
                        author.send(`リマインドが正しく送信されませんでした。チャンネルが削除されていた可能性があります。\n送信されなかったメッセージ「${message}」`);
                    }).catch();
                });

                // remindメッセージの削除
                client.channels.fetch(res.channel_id).then(remind_ch => {
                    remind_ch?.messages.fetch(res.message_id).then(msg => msg.delete()).catch(console.log);
                }).catch();

                connection.query(`DELETE FROM reminds WHERE id = ${res.id}`);
            });
        });
    },
};