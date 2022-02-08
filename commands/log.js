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

        const perm = category.permissionOverwrites;

        // everyoneから見えなくする
        await category.permissionOverwrites.set([
            {
                id: interaction.guild.roles.everyone.id,
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
            },
        ]);

        // 観戦ロールが指定されていたら見えるようにする
        const spectator = interaction.options.getRole('spectator');
        if (spectator) {
            await perm.create(spectator, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: false,
            });
        }

        let last_timestamp = 0;

        await Promise.all(category.children.map(async channel=>{
            if (channel.type === 'GUILD_TEXT') {
                await channel.permissionOverwrites.set(perm.cache);

                await channel.messages.fetch(channel.lastMessageId)
                    .then(msg => {
                        last_timestamp = Math.max(last_timestamp, msg.createdTimestamp);
                    }).catch();
            }
            else {
                await channel.delete();
            }
        }));

        // 日付を取得
        const today = new Date(last_timestamp);
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const date = today.getDate();

        // カテゴリー名を変更
        await category.setName(`(ログ ${year}/${month}/${date}) ${category.name}`);

        await interaction.followUp('完了しました');
    },
};