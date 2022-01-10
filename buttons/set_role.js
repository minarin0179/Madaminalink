module.exports = {
    customId: 'set_role',

    async execute(interaction) {
        const id = interaction.message.content.slice(3, -1);
        interaction.guild.roles.fetch(id).then(async (role) => {
            if (role == null) {
                interaction.reply({ content: 'このロールはすでに削除されています', ephemeral: true });
                return;
            }
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