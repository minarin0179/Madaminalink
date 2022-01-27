const { connection } = require('../sql.js');

module.exports = {
    customId: 'del_remind',

    async execute(interaction) {

        const customId = interaction.customId;
        const option = customId.substr(customId.indexOf(';') + 1);

        connection.query(`DELETE FROM reminds WHERE id = ${option}`);

        // ボタンを削除
        interaction.message.delete();
        interaction.reply({ content: 'リマインドを削除しました', ephemeral: true });
    },
};