const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: {
        name: 'beta_timer',
        description: 'タイマーを作成します',
        options: [{
            type: 'NUMBER',
            name: '時間',
            description: 'タイマーの設定時間(分)',
            required: true,
        }],
    },
    need_admin: false,

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const rest = interaction.options.getNumber('時間');

        const set = new MessageButton()
            .setCustomId(`timer_start;${rest * 60}`)
            .setStyle('PRIMARY')
            .setLabel('スタート');

        await interaction.followUp({
            content: `:timer:タイマー${rest}分`,
            components: [new MessageActionRow().addComponents(set)],
            ephemeral: true,
        });
    },
};