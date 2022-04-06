const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
    customId: 'timer_pause',

    async execute(interaction) {
        const author = interaction.customId.substr(interaction.customId.indexOf(';') + 1);

        if (!interaction.member.permissions.has('ADMINISTRATOR') && interaction.member.id != author) {
            await interaction.reply({
                content: 'タイマーの一時停止は管理者及びタイマーを開始したユーザーのみ可能です',
                ephemeral: true,
            });
            return;
        }

        const rests = interaction.message.content.split('分').map(tex => Number(tex.replace(/[^0-9]/g, '')));

        const restart = new MessageButton()
            .setCustomId(`timer_restart;${interaction.member.id}`)
            .setStyle('PRIMARY')
            .setLabel('再開');

        const stop = new MessageButton()
            .setCustomId(`timer_stop;${interaction.member.id}`)
            .setStyle('DANGER')
            .setLabel('終了');

        interaction.message.delete();
        await interaction.channel.send({
            content: `\`\`\`css\nタイマーは一時停止中です\n残り時間 ${rests[0]}分${rests[1]}秒 \`\`\``,
            components: [new MessageActionRow().addComponents(restart).addComponents(stop)],
        }).catch(console.log);
    },
};