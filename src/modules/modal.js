const fs = require('fs');

// ボタンを取得
const modals = {};
const modalFiles = fs.readdirSync('./modals').filter(file => file.endsWith('.js'));

modalFiles.forEach(file => {
    const modal = require(`../modals/${file}`);
    modals[modal.customId] = modal;
});

module.exports = {
    async submit(interaction) {
        const id = interaction.customId;
        const modal = modals[(id.indexOf(';') == -1) ? id : id.substring(0, id.indexOf(';'))];

        try {
            await modal.execute(interaction);
        }
        catch (err) {
            console.log(err);
            interaction.replied || interaction.deferred
                ? await interaction.followUp({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true })
                : await interaction.reply({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true });
        }
    },
};