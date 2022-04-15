const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: {
        name: 'bcdice',
        description: 'bcdiceを実行します',
        options: [
            {
                type: 'STRING',
                name: '入力',
                description: '実行するダイスを入力',
                required: true,
            },
        ],
    },
    need_admin: false,

    async execute(interaction) {

        const button = new MessageButton()
            .setCustomId('bcdiceroll;')
            .setStyle('PRIMARY')
            .setLabel(interaction.options.getString('入力'));

        await interaction.channel.send({
            content: 'ボタンをクリックしてダイスロール🎲!',
            components: [new MessageActionRow().addComponents(button)],
        });

        interaction.reply({ content: 'ダイスを作成しました', ephemeral: true });
    },
};