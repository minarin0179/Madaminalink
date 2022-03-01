module.exports = {
    data: {
        name: 'log',
        description: 'カテゴリをログとして保存します',
        options: [{
            type: 'CHANNEL',
            name: 'ログにするカテゴリ',
            channelTypes: ['GUILD_CATEGORY'],
            description: '保存するカテゴリ',
            required: true,
        }, {
            type: 'ROLE',
            name: '観戦ロール',
            description: '指定したロールからは閲覧可能になります(指定しなかった場合は管理者のみ閲覧可)',
            required: false,
        }],
    },
    need_admin: true,

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const category = interaction.options.getChannel('ログにするカテゴリ');
        const me = interaction.guild.me;
        const spectator = interaction.options.getRole('観戦ロール');
        let last_timestamp = 0;

        await category.permissionOverwrites.set([
            {
                id: interaction.guild.roles.everyone.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: me.id,
                allow: ['VIEW_CHANNEL'],
            },
        ]);

        if (spectator) {
            await category.permissionOverwrites.create(spectator, {
                VIEW_CHANNEL: true,
            });
        }


        await Promise.all(category.children.map(async channel => {
            if (channel.type === 'GUILD_TEXT') {
                await channel.lockPermissions();

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
        // const today = new Date(last_timestamp) || new Date();
        const today = Number.isNaN(new Date(last_timestamp)) ? new Date(last_timestamp) : new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const date = today.getDate();

        // カテゴリー名を変更
        await category.setName(`(ログ ${year}/${month}/${date}) ${category.name}`);

        await interaction.followUp('ログの保存が完了しました');
    },
};