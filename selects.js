const fs = require('fs');

// ボタンを取得
const selects = {};
const selectFiles = fs.readdirSync('./selects').filter(file => file.endsWith('.js'));
selectFiles.forEach(file => {
    const select = require(`./selects/${file}`);
    selects[select.customId] = select;
});

module.exports = {
    async selected(interaction) {

        const id = interaction.customId;
        const button = selects[(id.indexOf(';') == -1) ? id : id.substring(0, id.indexOf(';'))];
        // アプデ後はこちらに移行 const button = buttons[id.substring(0, id.indexOf(';'))];

        try {
            await button.execute(interaction);
        }
        catch (err) {
            console.log(id.substring(0, id.indexOf(';')));
            interaction.replied || interaction.deferred
                ? await interaction.followUp({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true })
                : await interaction.reply({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true });
        }
    },
};