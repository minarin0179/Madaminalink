const { MessageActionRow, MessageSelectMenu } = require('discord.js');
module.exports = {
    data: {
        name: 'beta_played',
        description: 'プレイヤーロールを観戦ロールに置換',
    },
    need_admin: true,
    async execute(interaction) {
        const guild = interaction.guild;
        await interaction.reply({
            content: '置換するロールを選択してください',
            components: buildComponents(guild, 'before'),
        });
    },
    async selected(interaction) {
        if (!interaction.isSelectMenu()) return;

        if (interaction.customId === 'select') {

        }
    },
};

function buildComponents(guild, customId) {

    const roles = [...guild.roles.cache.values()].slice(0, 25).map(e => [e, false]);
    return [
        new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(customId)
                .setPlaceholder('置換前のロール')
                .setMinValues(0)
                .setMaxValues(roles.length)
                .addOptions(
                    roles.map(([role, selected]) => ({
                        label: role.name,
                        value: role.id,
                        default: selected,
                    }),
                    ),
                ),
        ),
    ];
}