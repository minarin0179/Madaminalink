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
        // メンバーを取得
        await interaction.guild.members.fetch();
        await interaction.options.getRole('before').members.forEach(async (member) => {
            // ロールを置換
            await member.roles.add(interaction.options.getRole('after')).catch();
            await member.roles.remove(interaction.options.getRole('before')).catch((error) => {
                console.log(error);
                if (!interaction.replied) {
                    interaction.reply({ content: 'ロールの削除に失敗しました。マダミナリンクより上位のロールにはアクセスできません', ephemeral: true });
                }
            });
        });


        interaction.guild.members.fetch().then(() => {
            interaction.options.getRole('before').members.forEach(member => {
                member.roles.remove(interaction.options.getRole('before'));
                member.roles.add(interaction.options.getRole('after'));
            });
        }).then(() => {
            interaction.followUp('ロールの移行が完了しました');
        });

        await interaction.reply({ content: 'ロールの移行が完了しました', ephemeral: true });
    },
};