module.exports = {
    customId: 'set_role',

    async execute(interaction) {
        const customId = interaction.customId;
        const option = customId.substr(customId.indexOf(';') + 1);

        interaction.guild.roles.fetch(option).then(async (role) => {
            // ロールが存在しない場合
            if (role == null) {
                interaction.reply({
                    content: 'このロールはすでに削除されています',
                    ephemeral: true,
                });
                return;
            }
            // ロールを付与
            interaction.member.roles.add(role)
                .then(() => {
                    interaction.reply({ content: `「<@&${role.id}>」を付与しました`, ephemeral: true });
                })
                .catch(() => {
                    interaction.reply({ content: `「<@&${role.id}>」を付与できませんでした。\nマダミナリンクより上位のロールは付与できません`, ephemeral: true });
                });
        });
    },

};