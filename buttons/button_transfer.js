module.exports = {
    customId: 'transfer',

    async execute(interaction) {

        const customId = interaction.customId;
        const target_ch_id = customId.substr(customId.indexOf(';') + 1);
        const target_ch = interaction.guild.channels.cache.get(target_ch_id);


        // もしチャンネルが見つからない or 削除済み
        if (target_ch == undefined) {
            interaction.reply({ content: 'メッセージを送信できませんでした。\nチャンネルが削除済みの可能性があります', ephemeral: true });
            return;
        }

        interaction.message.reactions.cache.clear();

        // メッセージにつけられたリアクションを取得
        const command_msg = await interaction.message.fetch();
        const reactions = command_msg.reactions.cache;

        interaction.channel.messages.cache.clear();
        const messages = (await interaction.channel.messages.fetch()).reverse();
        messages.delete(interaction.message.id);

        await Promise.all(messages.map(msg => {
            const keys = msg.reactions.cache.keys();
            if (Array.from(keys).some(key => reactions.has(key))) {
                this.send_message(target_ch, msg);
            }
        }));

        await interaction.reply({ content: 'メッセージの転送が完了しました', ephemeral: true });

    },
    send_message(target_ch, message) {

        const content = message.content;

        const new_msg = {
            files: message.attachments.map(attachment => attachment.url),
            components: message.components,
            embeds: message.embeds,
        };

        if (content.length > 0) {
            new_msg.content = message.content;
        }

        target_ch.send(new_msg);
    },
};