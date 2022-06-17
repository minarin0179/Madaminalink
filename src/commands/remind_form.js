const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');

module.exports = {
    data: {
        name: 'remind_form',
        description: '指定日時にメッセージを送信します',
    },
    need_admin: false,
    async execute(interaction) {
        const modal = new Modal()
            .setCustomId('remind_set')
            .setTitle('リマインダーを登録')
            .setComponents(
                new MessageActionRow().setComponents(
                    new TextInputComponent()
                        .setCustomId('date')
                        .setLabel('日時')
                        .setStyle('SHORT')
                        .setPlaceholder('yyyy/mm/dd hh:mm')
                        .setRequired(true),
                ),

                new MessageActionRow().setComponents(
                    new TextInputComponent()
                        .setCustomId('content')
                        .setLabel('本文')
                        .setStyle('PARAGRAPH')
                        .setPlaceholder('メッセージを入力')
                        .setRequired(true),
                ),
            );

        await interaction.showModal(modal);
    },
};