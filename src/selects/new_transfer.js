const { Util: { splitMessage } } = require('discord.js');

module.exports = {
    customId: 'new_transfer',

    async execute(interaction) {
        const target_id = interaction.customId.substr(interaction.customId.indexOf(';') + 1);
        const target_message = await interaction.channel.messages.fetch(target_id);

        await Promise.all(interaction.values.map(async ch_id => {
            const channel = await interaction.guild.channels.fetch(ch_id);
            if (channel == null) return;

            await send_message(channel, target_message);
        }));

        await interaction.reply({
            content: '転送が完了しました',
            ephemeral:true,
        });
    },

};


async function send_message(target_ch, message) {

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
}