const { Modal, TextInputComponent, showModal } = require('discord-modals');

module.exports = {
    data: {
        name: 'modal',
        description: 'マダミナリンクが動いてるか確認する用',
    },
    need_admin: false,
    async execute(interaction, client) {
        const modal = new Modal()
            .setCustomId('regist_remind')
            .setTitle('リマインダーを登録')
            .addComponents(
                new TextInputComponent()
                    .setCustomId('date')
                    .setLabel('日時')
                    .setStyle('SHORT')
                    .setPlaceholder('yyyy/mm/dd hh:mm')
                    .setRequired(true),
                new TextInputComponent()
                    .setCustomId('main')
                    .setLabel('本文')
                    .setStyle('LONG')
                    .setPlaceholder('メッセージを入力')
                    .setRequired(true),
            );

        showModal(modal, {
            client: client,
            interaction: interaction,
        });


    },
};