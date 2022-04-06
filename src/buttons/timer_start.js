const { MessageActionRow, MessageButton } = require('discord.js');

const interval = 5;

module.exports = {
    customId: 'timer_start',

    async execute(interaction) {

        const customId = interaction.customId;
        const time = Number(interaction.customId.substr(customId.indexOf(';') + 1));

        this.start(time, interaction.channel, interaction.member.id);

        await interaction.reply({ content: 'タイマーを開始しました', ephemeral: true });

    },
    async start(rest, ch, author_id) {
        const pause = new MessageButton()
            .setCustomId(`timer_pause;${author_id}`)
            .setStyle('PRIMARY')
            .setLabel('一時停止');

        const stop = new MessageButton()
            .setCustomId(`timer_stop;${author_id}`)
            .setStyle('DANGER')
            .setLabel('終了');

        const extension = new MessageButton()
            .setCustomId(`timer_extension;${author_id}`)
            .setStyle('SECONDARY')
            .setLabel('延長');

        const timer_msg = await ch.send({
            content: `\`\`\`css\n残り時間 ${Math.floor(rest / 60)}分${rest % 60}秒\`\`\``,
            components: [new MessageActionRow().addComponents(pause).addComponents(stop).addComponents(extension)],
        });

        const timer = setInterval(async () => {

            rest -= interval;

            if (timer_msg.deleted) {
                clearInterval(timer);
            }
            else if (rest <= 0) {
                clearInterval(timer);
                await timer_msg.delete();
                await ch.send('```タイマーが終了しました```').catch(console.log);
                return;
            }
            else {
                await timer_msg.edit(`\`\`\`css\n残り時間 ${Math.floor(rest / 60)}分${rest % 60}秒\`\`\``).catch(console.log);
            }
        }, interval * 1000);

    },
};