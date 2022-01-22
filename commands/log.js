module.exports = {
    data: {
        name: 'log',
        description: 'カテゴリをログとして保存します',
        options: [{
            type: 'CHANNEL',
            name: 'category',
            channelTypes: ['GUILD_CATEGORY'],
            description: '保存するカテゴリ',
            required: true,
        }, {
            type: 'ROLE',
            name: 'spectator',
            description: '観戦者ロール',
            required: true,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        // 応答時間の制限を15分に
        await interaction.deferReply({ ephemeral: true });

        // カテゴリーを取得
        const category = interaction.options.getChannel('category');

        // 日付を取得
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const date = today.getDate();

        // カテゴリー名を変更
        await category.setName(`(ログ ${year}/${month}/${date}) ${category.name}`);

        const perm = {};

        // everyoneから見えなくする
        perm.create([{
            id: interaction.guild.roles.everyone.id,
            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        }]);

        // 観戦ロールが指定されていたら見えるようにする
        const spectator = interaction.options.getRole('spectator');
        if (spectator) {
            await perm.create(spectator, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: false,
            });
        }

        await category.permissionOverwrites.set(perm.cache);

        await category.children.forEach(async (channel) => {
            if (channel.type === 'GUILD_TEXT') {
                await channel.permissionOverwrites.set(perm.cache);
            }
            else {
                channel.delete();
            }
        });

        await interaction.followUp('完了しました');
    },
};