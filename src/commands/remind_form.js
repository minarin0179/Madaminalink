const { Modal, TextInputComponent, showModal } = require('discord-modals');

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
            .addComponents(
                new TextInputComponent()
                    .setCustomId('date')
                    .setLabel('日時')
                    .setStyle('SHORT')
                    .setPlaceholder('yyyy/mm/dd hh:mm')
                    .setRequired(true),
                new TextInputComponent()
                    .setCustomId('content')
                    .setLabel('本文')
                    .setStyle('LONG')
                    .setPlaceholder('メッセージを入力')
                    .setRequired(true),
            );

        showModal(modal, {
            client: interaction.client,
            interaction: interaction,
        });


    },
};