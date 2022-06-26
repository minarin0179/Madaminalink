const fs = require('fs');

// コマンドを取得
const commands = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
commandFiles.forEach(file => {
    const command = require(`../commands/${file}`);
    commands[command.data.name] = command;
});

module.exports = {
    async set(client) {
        // スラッシュコマンドをサーバーに登録
        const datas = Object.keys(commands).map(key => commands[key].data);
        await client.application.commands.set(datas);
    },
    async entered(interaction) {
        // コマンドを取得
        const command = commands[interaction.commandName];

        if (command === undefined) {
            await interaction.reply({ content: 'このコマンドは存在しません', ephemeral: true });
            return;
        }

        // 管理者権限が必要なコマンドか判断
        if (command.need_admin && !interaction.member.permissions.has('ADMINISTRATOR')) {
            await interaction.reply({ content: 'このコマンドを実行する権限がありません', ephemeral: true });
            return;
        }

        // コマンドを実行
        try {
            await command.execute(interaction);
        }
        catch (error) {
            console.log(error);
            interaction.replied || interaction.deferred
                ? await interaction.followUp({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true })
                : await interaction.reply({ content: '予期せぬエラーが発生しました。処理を中断します', ephemeral: true });

            await interaction.followUp({
                content: 'エラーを報告する際は以下のエラーメッセージも送っていただけると助かります',
                embeds: [{
                    color: 'RED',
                    description: error.stack,
                }],
                ephemeral: true,
            });
        }
    },
};