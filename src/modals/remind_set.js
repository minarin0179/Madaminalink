const { set } = require('../commands/remind.js');

module.exports = {
    customId: 'remind_set',

    async execute(interaction) {
        // 各種データを取得
        const time = interaction.getTextInputValue('date');
        const message = interaction.getTextInputValue('content');
        const destination = interaction.channel;

        set(interaction, time, message, destination);
    },
};