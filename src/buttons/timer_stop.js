module.exports = {
    customId: 'timer_stop',

    async execute(interaction) {
        const author = interaction.customId.substr(interaction.customId.indexOf(';') + 1);

        if (!interaction.member.permissions.has('ADMINISTRATOR') && interaction.member.id != author) {
            await interaction.reply({
                content: 'タイマーの停止は管理者及びタイマーを開始したユーザーのみ可能です',
                ephemeral: true,
            });
            return;
        }

        interaction.message.delete();
        await interaction.channel.send('```タイマーが終了しました```').catch(console.log);

    },
};