module.exports = {
    data: {
        name: 'cleanup',
        description: 'チャンネルに送信されたメッセージをすべて削除します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT', 'GUILD_CATEGORY'],
            name: 'テキストチャンネルまたはカテゴリー',
            description: 'メッセージを削除するチャンネル/カテゴリー',
            required: false,
        }],
    },
    need_admin: true,

    async execute(interaction) {

        const target_ch = await interaction.options.getChannel('テキストチャンネルまたはカテゴリー') || interaction.channel;

        if (target_ch.type === 'GUILD_TEXT') {
            await target_ch.clone();
            await target_ch.delete();
            await interaction.reply({ content: `テキストチャンネル「${target_ch.name}」のメッセージを削除しました`, ephemeral: true });
            return;
        }

        else if (target_ch.type === 'GUILD_CATEGORY') {
            // childrenで取得すると[key,value]の形になる
            for await (const channel of target_ch.children.values()) {
                await channel.clone();
                await channel.delete();
            }
            await interaction.reply({ content: `カテゴリ「${target_ch.name}」内のすべてのチャンネルのメッセージを削除しました`, ephemeral: true });
        }
    },
};