const fs = require('fs');

console.log(fs.readdirSync('./buttons'));


// ボタンを取得
const buttons = {};
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

buttonFiles.forEach(file => {
    const button = require(`./buttons/${file}`);
    buttons[button.customId] = button;
});

module.exports = {
    async pressed(interaction) {

        const id = interaction.customId;
        const button = buttons[(id.indexOf(';') == -1) ? id : id.substring(0, id.indexOf(';'))];
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