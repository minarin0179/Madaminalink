module.exports = {
    customId: 'transfer',

    execute(interaction) {

        const fields = interaction.message.embeds[0].fields;
        const id = fields.find(field => field.name == '送信先').value.slice(2, -1);
        const target = interaction.guild.channels.cache.get(id);


        // もしチャンネルが見つからない or 削除済み
        if (target == undefined) {
            interaction.reply({ content: 'メッセージを送信できませんでした。\nチャンネルが削除済みの可能性があります', ephemeral: true });
            return;
        }

        interaction.message.fetch().then(message => {

            const reactions = message.reactions.cache;

            interaction.channel.messages.fetch().then(messages => {
                messages.reverse().forEach(mes => {

                    if (mes == interaction.message) return;
                    const keys = mes.reactions.cache;


                    for (const [key] of keys) {
                        if (reactions.has(key)) {
                            console.log(mes.content);
                            this.send_message(target, mes);
                        }
                    }
                });
            });

        });
        interaction.reply({ content: 'メッセージの転送が完了しました', ephemeral: true });

    },
    send_message(target, message) {

        const content = message.content;
        const files = message.attachments.map(attachment => attachment.url);
        const components = message.components;
        const embeds = message.embeds;

        // 予期せぬパターンをはじいておく
        if (content == '' && files.size == 0) return;

        // 添付ファイルだけの時
        if (content == '') {
            target.send({ files });
            return;
        }

        target.send({
            content: content,
            files: files,
            components: components,
            embeds: embeds,
        });
    },
};