const mysql = require('mysql');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Meikoudai2021!',
    database: 'Madaminalink',
});


connection.connect((err) => {
    if (err) {
        console.log('error connecting: ' + err.stack);
        return;
    }
    console.log('success');
});

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