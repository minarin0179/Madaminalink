module.exports = {
    data: {
        name: 'rename',
        description: 'サーバー内のメンバーのニックネームをリセット',
        options: [{
            type: 'ROLE',
            name: 'role',
            description: 'ニックネームをリセットするロール',
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
        const members = await role.members.filter(member => member.nickname);
        const myrole = interaction.guild.me.roles.highest;

        // 上位のロールに対してはスルー
        if (myrole.comparePositionTo(role) < 1) {
            await interaction.followUp({ content: 'マダミナリンクより上位のロールにはアクセスできません', ephemeral: true });
            return;
        }

        const admin_member = [];

        // ニックネームをリセット
        await Promise.all(members.map(async (member) => {
            await member.setNickname(null).catch(() => admin_member.push(member.nickname));
        }));

        await interaction.followUp({ content: 'ニックネームのリセットが完了しました', ephemeral: true });

        if (admin_member.length > 0) {
            await interaction.followUp({ content: `下記のユーザーのニックネームは変更できませんでした \n${admin_member}`, ephemeral: true });
        }
    },
};