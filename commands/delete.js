module.exports = {
    data: {
        name: 'delete',
        description: 'カテゴリを削除します(カテゴリーに含まれるチャンネルも削除されます)',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_CATEGORY'],
            name: 'category',
            description: '削除するカテゴリ',
            required: true,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        const category = interaction.options.getChannel('category');

        await category.children.forEach(async (channel) => { await channel.delete(); });

        await category.delete();

        await interaction.reply({ content: '完了しました', ephemeral: true });
    },
};