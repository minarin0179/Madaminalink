const { DynamicLoader } = require('bcdice');
const loader = new DynamicLoader();

module.exports = {
    customId: 'bcdiceroll',

    async execute(interaction) {
        const GameSystem = await loader.dynamicLoad('Cthulhu');

        const input = interaction.component.label;
        const result = GameSystem.eval(input);
        let text = `${interaction.member} `;

        if (result.success || result.failure) {
            if (result.failure) {
                text = `${interaction.member} \`\`\`diff\n${input} \n- ${result.text}\`\`\``;
            }
            else {
                text = `${interaction.member} \`\`\`md\n${input} \n# ${result.text}\`\`\``;
            }
        } else {
            text = `${interaction.member} ${result.text}`;
        }

        if (result.secret) {
            await interaction.reply({
                content: text,
                ephemeral: true,
            });
        } else {
            interaction.reply('ダイスロールを実行中');
            interaction.channel.send(text);
            interaction.deleteReply();
        }
    },
};