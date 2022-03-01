const data = require('./help_detail.json');

module.exports = {
    customId: 'help_detail',

    async execute(interaction) {
        const value = interaction.values[0];
        console.log(value);
        interaction.reply({ content: data[value].content || data.undefined.content, ephemeral: true });
    },
};