const { MessageActionRow, MessageSelectMenu, Util: { discordSort } } = require('discord.js');

module.exports = {
    data: {
        name: 'メッセージを転送',
        type: 'MESSAGE',
    },
    need_admin: true,

    async execute(interaction) {

        const category = interaction.channel.parent?.children || interaction.guild.channels.cache.filter(ch => !ch.parent);
        const channels = [...discordSort(category).filter(child => child.isText()).values()].map(e => [e, false]);

        await interaction.reply({
            content: '転送先を指定してください',
            components: buildComponents(channels, `new_transfer;${interaction.targetMessage.id}`),
            ephemeral: true,
        });
    },
};

function buildComponents(channels, customId) {
    return [
        new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(customId)
                .setMinValues(0)
                .setMaxValues(channels.length)
                .addOptions(
                    channels.map(([channel, selected]) => ({
                        label: channel.name,
                        value: channel.id,
                        default: selected,
                    }),
                    ),
                ),
        ),
    ];
}