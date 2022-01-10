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

        interaction.guild.members.fetch();

        const before = interaction.options.getRole('before');
        const after = interaction.options.getRole('after');
        const myrole = interaction.guild.me.roles.highest;

        if (myrole.comparePositionTo(before) < 1 || myrole.comparePositionTo(after) < 1) {
            interaction.reply({ content: 'マダミナリンクより上位のロールにはアクセスできません', ephemeral: true });
            return;
        }

        interaction.options.getRole('before').members.forEach(member => {
            member.roles.remove(before);
            member.roles.add(after);
            interaction.reply({ content: 'ロールの移行が完了しました', ephemeral: true });
        });
    },
};