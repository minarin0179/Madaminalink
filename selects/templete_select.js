module.exports = {
    customId: 'customIdを入力',

    async execute(interaction) {
        const values = interaction.values;

        interaction.reply({ content: '', ephemeral: true });
    },
};