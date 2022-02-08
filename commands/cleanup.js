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
        }
        else if (target_ch.type === 'GUILD_CATEGORY') {

            Promise.all(target_ch.children.map(async channel => {
                await channel.clone();
                await channel.delete();
            }));

            await interaction.reply({ content: `カテゴリ「${target_ch.name}」内のすべてのチャンネルのメッセージを削除しました`, ephemeral: true });
        }
    },
};