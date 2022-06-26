const { make_transfer_msg } = require('../commands/transfer.js');

module.exports = {
    customId: 'transfers',

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });
        const values = interaction.values;

        await Promise.all(values.map(async ch_id => {
            const destination = await interaction.guild.channels.fetch(ch_id);
            if (destination == null) return;
            await interaction.channel.send(make_transfer_msg(destination));
        }));

        await interaction.followUp({ content: 'ボタンを作成しました', ephemeral: true });
    },
};