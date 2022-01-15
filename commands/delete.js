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

        // 削除するカテゴリーを取得
        const category = interaction.options.getChannel('category');

        // 子チャンネルを削除
        await category.children.forEach(async (channel) => { await channel.delete(); });

        // カテゴリーを削除
        await category.delete();

        await interaction.reply({ content: `「${category.name}」を削除しました`, ephemeral: true });
    },
};