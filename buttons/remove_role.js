module.exports = {
    customId: 'remove_role',

    execute(interaction) {
        const id = interaction.message.content.slice(3, -1);
        interaction.guild.roles.fetch(id).then(async (role) => {
            if (role == null) {
                interaction.reply({ content: 'このロールはすでに削除されています', ephemeral: true });
                return;
            }
            interaction.member.roles.remove(role)
                .then(() => {
                    interaction.reply({ content: `「<@&${role.id}>」を解除しました`, ephemeral: true });
                })
                .catch(() => {
                    interaction.reply({ content: `「<@&${role.id}>」を解除できませんでした。\nマダミナリンクより上位のロールは解除できません`, ephemeral: true });
                });
        });
    },

};