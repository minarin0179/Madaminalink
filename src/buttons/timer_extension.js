const timer_start = require('../buttons/timer_start');

module.exports = {
    customId: 'timer_extension',

    async execute(interaction) {

        const author = interaction.customId.substr(interaction.customId.indexOf(';') + 1);
        if (!interaction.member.permissions.has('ADMINISTRATOR') && interaction.member.id != author) {
            await interaction.reply({
                content: 'タイマーの延長は管理者及びタイマーを開始したユーザーのみ可能です',
                ephemeral: true,
            });
            return;
        }

        interaction.reply({
            content: '延長する時間を入力して下さい(分)',
            ephemeral: true,
        });
        const time_entered = (await interaction.channel.awaitMessages({ max: 1, time: 180000 })).first();
        const rests = await interaction.message.content.split('分').map(tex => Number(tex.replace(/[^0-9]/g, '')));
        const rest = rests[0] * 60 + rests[1] + Number(time_entered.content.replace(/[^0-9]/g, '')) * 60;

        interaction.message.delete();
        time_entered.delete();

        timer_start.start(rest, interaction.channel, interaction.member.id);

        await interaction.followUp({ content: 'タイマーを延長しました', ephemeral: true });
    },
};