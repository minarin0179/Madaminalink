const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    data: {
        name: 'beta_copy',
        description: 'チャンネルをメッセージや添付ファイルを含めて複製します',
    },
    need_admin: true,

    async execute(interaction) {
        const guild = interaction.guild;
        await interaction.reply({
            content: 'コピーするチャンネルを選択してください',
            components: buildComponents(guild, 'beta_copy'),
        });
    },
};

function buildComponents(guild, customId) {

    const channels = [...guild.channels.cache.filter(channel => ['GUILD_TEXT', 'GUILD_CATEGORY'].includes(channel.type)).values()].slice(0, 25).map(e => [e, false]);
    return [
        new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(customId)
                .setPlaceholder('コピーするチャンネル')
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
