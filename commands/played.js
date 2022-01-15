module.exports = {
    data: {
        name: 'played',
        description: 'プレイヤーロールを観戦ロールに置換',
        options: [{
            type: 'ROLE',
            name: 'before',
            description: '置換前のロール',
            required: true,
        }, {
            type: 'ROLE',
            name: 'after',
            description: '置換後のロール',
            required: true,
        }],
    },
    need_admin: true,
    async execute(interaction) {
        // 応答時間の制限を15分に
        await interaction.deferReply({ ephemeral: true });

        // メンバーのキャッシュを取得
        await interaction.guild.members.fetch();

        // 各種データを取得
        const before = await interaction.options.getRole('before');
        const after = await interaction.options.getRole('after');
        const myrole = interaction.guild.me.roles.highest;

        // 権限の確認
        if (myrole.comparePositionTo(before) < 1 || myrole.comparePositionTo(after) < 1) {
            await interaction.followUp({ content: 'マダミナリンクより上位のロールにはアクセスできません', ephemeral: true });
            return;
        }

        // ロールを置換
        await Promise.all(interaction.options.getRole('before').members.map(async member => {
            await member.roles.remove(before);
            await member.roles.add(after);
        }));

        await interaction.followUp({ content: 'ロールの移行が完了しました', ephemeral: true });
    },
};