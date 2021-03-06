const { Util: { splitMessage }, Collection } = require('discord.js');

module.exports = {
    customId: 'transfer',

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const customId = interaction.customId;
        const target_ch_id = customId.substr(customId.indexOf(';') + 1);
        const target_ch = interaction.guild.channels.cache.get(target_ch_id);


        // もしチャンネルが見つからない or 削除済み
        if (target_ch == undefined) {
            interaction.followUp({ content: 'メッセージを送信できませんでした。\nチャンネルが削除済みの可能性があります', ephemeral: true });
            return;
        }

        interaction.message.reactions.cache.clear();

        // メッセージにつけられたリアクションを取得
        const command_msg = await interaction.message.fetch();
        const reactions = command_msg.reactions.cache;
        let error = false;

        interaction.channel.messages.cache.clear();
        const messages = (await fetch_all_messages(interaction.channel)).reverse();

        messages.delete(interaction.message.id);

        for await (const msg of messages.values()) {
            const keys = msg.reactions.cache.keys();
            if (reactions.hasAny(...keys)) {
                await this.send_message(target_ch, msg).catch(() => error = true);
            }
        }

        if (error) {
            await interaction.followUp({ content: 'メッセージの転送に失敗しました', ephemeral: true });
        }
        else {
            await interaction.followUp({ content: 'メッセージの転送が完了しました', ephemeral: true });
        }

    },
    async send_message(target_ch, message) {

        const content = message.content;

        const new_msg = {
            files: message.attachments.map(attachment => attachment.url),
            components: message.components,
            embeds: message.embeds,
        };

        if (content.length > 2000) {
            for await (const m of splitMessage(content)) {
                await target_ch.send(m).catch(() => { throw new Error(); });
            }
            if (new_msg.files.length > 0) {
                await target_ch.send(new_msg).catch();
            }
        }
        else {
            if (content.length > 0) {
                new_msg.content = content;
            }

            await target_ch.send(new_msg).catch(() => {
                target_ch.send('```diff\n- メッセージの転送に失敗しました\n- ファイルサイズの上限は8MBまでです\n```');
                throw new Error();
            });
        }
    },
};

async function fetch_all_messages(channel) {
    let sum_messages = new Collection();
    let last_id;

    while (true) {
        const options = { limit: 100 };
        if (last_id) {
            options.before = last_id;
        }

        const messages = await channel.messages.fetch(options);
        sum_messages = sum_messages.concat(messages);

        if (messages.size != 100) {
            break;
        }

        last_id = messages.last().id;
    }

    return sum_messages;
}