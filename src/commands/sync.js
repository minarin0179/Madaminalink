module.exports = {
    data: {
        name: 'sync',
        description: 'カテゴリ内のチャンネルの権限を同期します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_CATEGORY'],
            name: 'category',
            description: '同期するカテゴリ',
            required: true,
        }, {
            type: 'BOOLEAN',
            name: 'ロールの削除',
            description: 'Trueの場合はカテゴリーに付与されているロールも一緒に削除します',
            required: false,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        const category = interaction.options.getChannel('category');

        await Promise.all(category.children.map(async channel => {
            await channel.lockPermissions();
        }));

        await interaction.reply({ content: `「${category.name}」内のチャンネルの権限を同期しました`, ephemeral: true });
    },
};