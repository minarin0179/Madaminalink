module.exports = {
    data: {
        name: 'rename',
        description: 'サーバー内のメンバーのニックネームをリセット',
        options: [{
            type: 'ROLE',
            name: 'role',
            description: '置換前のロール',
            required: true,
        }],
    },
    need_admin: true,
    async execute(interaction) {

        // 応答時間の制限を15分に
        await interaction.deferReply({ ephemeral: true });

        // メンバーのキャッシュを取得
        await interaction.guild.members.fetch();

        // 必要なデータを取得
        const role = await interaction.options.getRole('role');
        const members = await role.members;
        const myrole = interaction.guild.me.roles.highest;

        // 上位のロールに対してはスルー
        if (myrole.comparePositionTo(role) < 1) {
            await interaction.followUp({ content: 'マダミナリンクより上位のロールにはアクセスできません', ephemeral: true });
            return;
        }

        // ニックネームをリセット
        await Promise.all(members.map(async (member) => {
            // 管理者に対しては実行しない
            if (member.permissions.has('ADMINISTRATOR')) return;
            await member.setNickname(null).catch(() => console.log(member.user.username));
        }));

        await interaction.followUp({ content: 'ニックネームのリセットが完了しました', ephemeral: true });
    },
};