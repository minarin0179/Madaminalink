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
        }, {
            type: 'BOOLEAN',
            name: 'ロールの削除',
            description: 'Trueの場合はカテゴリーに付与されているロールも一緒に削除します',
            required: false,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        const everyoneRole = interaction.guild.roles.everyone;

        // 削除するカテゴリーを取得
        const category = interaction.options.getChannel('category');
        const delete_role_ids = new Set();

        /*
        // 子チャンネルを削除
        await category.children.forEach(async (channel) => {
            await channel.permissionOverwrites.cache.forEach(perm => delete_role_ids.add(perm.id));
            // await channel.delete();
        });*/

        await Promise.all(category.children.map(async channel => {
            await channel.permissionOverwrites.cache.forEach(perm => delete_role_ids.add(perm.id));
            await channel.delete();
        }));

        await category.delete();

        if (interaction.options.getBoolean('ロールの削除')) {
            delete_role_ids.forEach(async delete_role_id => {
                const delete_role = await interaction.guild.roles.fetch(delete_role_id);
                if (delete_role == everyoneRole) return;
                delete_role.delete().catch(console.log);
            });
        }

        await interaction.reply({ content: `「${category.name}」を削除しました`, ephemeral: true });
    },
};