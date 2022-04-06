const timer_start = require('../buttons/timer_start');

module.exports = {
    customId: 'timer_restart',

    async execute(interaction) {
        const author = interaction.customId.substr(interaction.customId.indexOf(';') + 1);
        if (!interaction.member.permissions.has('ADMINISTRATOR') && interaction.member.id != author) {
            await interaction.reply({
                content: 'タイマーの延長は管理者及びタイマーを開始したユーザーのみ可能です',
                ephemeral: true,
            });
            return;
        }

        const rests = interaction.message.content.split('分').map(tex => Number(tex.replace(/[^0-9]/g, '')));
        const rest = rests[0] * 60 + rests[1];

        interaction.message.delete();

        timer_start.start(rest, interaction.channel, interaction.member.id);

        await interaction.reply({ content: 'タイマーを再開しました', ephemeral: true });
    },
};