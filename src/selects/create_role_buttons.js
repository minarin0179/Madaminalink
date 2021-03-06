const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
    customId: 'create_role_buttons',

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });
        const values = interaction.values;

        await Promise.all(values.map(async role_id => {
            const role = await interaction.guild.roles.fetch(role_id);
            if (role == null) return;

            // ボタンを送信
            await interaction.channel.send({
                content: `@${role.name}`,
                components: [build_buttons(role)],
            });
        }));

        interaction.followUp({ content: 'ボタンを作成しました', ephemeral: true });
    },
};

function build_buttons(role) {

    // 付与ボタン
    const set = new MessageButton()
        .setCustomId(`set_role;${role.id}`)
        .setStyle('SUCCESS')
        .setLabel('取得');

    // 解除ボタン
    const remove = new MessageButton()
        .setCustomId(`remove_role;${role.id}`)
        .setStyle('DANGER')
        .setLabel('解除');

    return new MessageActionRow().addComponents(set).addComponents(remove);
}