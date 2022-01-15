module.exports = {
    execute(client) {

        // 日付を取得
        const today = new Date();
        // remindチャンネルを取得
        client.channels.cache.filter(channel => channel.type === 'GUILD_TEXT' && channel.name === 'remind').forEach(async (channel) => {

            // remindチャンネルのメッセージを取得
            const messages = await channel.messages.fetch();

            messages.forEach((message) => {
                if (message.embeds.length < 1) {
                    message.delete();
                    return;
                }

                // リマインドのデータを取得
                const fields = message.embeds[0].fields;

                if (fields.length < 1) {
                    message.delete();
                    return;
                }

                // リマインド時刻を取得
                const time = new Date(fields[0].value);

                // まだその時ではない
                if (time > today) return;

                // 送信先を取得
                const channelid = fields[1].value.slice(2, -1);
                const text = fields[2].value;

                // リマインド先のチャンネルを取得
                const target = channel.guild.channels.cache.get((channelid));

                // リマインドを削除
                message.delete();

                // リマインド先が見つからなかったら
                if (target === undefined) {
                    channel.send(`@everyone\nリマインドが正しく送信されませんでした\nチャンネルが削除されていた可能性があります\nこのメッセージは一分後に削除されます\n送信されなかったメッセージ\n「${text}」`);
                    return;
                }

                // リマインドを送信
                target.send(text);
            });
        });
    },
};