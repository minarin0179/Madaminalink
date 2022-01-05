module.exports = {
    data: {
        name: 'log',
        description: 'カテゴリをログとして保存します',
        options: [{
            type: 'CHANNEL',
            name: 'channel',
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
        const ch = interaction.options.getChannel('channel');
        if (ch.name.startsWith('(ログ')) {
            interaction.followUp('このチャンネルはすでにログ化されています');
            return;
        }

        // 日付を取得
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const date = today.getDate();

        // カテゴリー名を変更
        await ch.setName(`(ログ ${year}/${month}/${date}) ${ch.name}`);

        // ロールを取得
        const spectator = interaction.options.getRole('spectator');
        const everyoneRole = interaction.guild.roles.everyone;

        // everyoneから見えなくする
        await ch.permissionOverwrites.set([
            {
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
            },
        ]);

        // 観戦ロールが指定されていたら見えるようにする
        if (spectator != null) {
            await ch.permissionOverwrites.create(spectator, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: false,
            });
        }

        // ボイスチャンネルは削除
        await ch.children.forEach(async (channel) => {
            if (channel.type != 'GUILD_TEXT') {
                channel.delete();
                return;
            }
            await channel.permissionOverwrites.set(ch.permissionOverwrites.cache);
        });

        await interaction.followUp('完了しました');
    },
};