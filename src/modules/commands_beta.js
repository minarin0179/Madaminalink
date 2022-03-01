const fs = require('fs');

// コマンドを取得
const commands = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
commandFiles.forEach(file => {
    const command = require(`../commands/${file}`);
    commands[command.data.name] = command;
});


const command_dev_Files = fs.readdirSync('./commands_dev').filter(file => file.endsWith('.js'));
command_dev_Files.forEach(file => {
    const command = require(`../commands_dev/${file}`);
    commands[command.data.name] = command;
});

module.exports = {
    async set(client) {
        // スラッシュコマンドをサーバーに登録
        const datas = Object.keys(commands).map(key => commands[key].data);
        await client.application.commands.set(datas);
        // 製作委員会
        await client.application.commands.set(datas, '929332317518983178');
        // 検証用
        await client.application.commands.set(datas, '946046708587036702');
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
            if (error.code == 50001) {
                return_err_msg(interaction, 'マダミナリンクにはこのカテゴリまたはチャンネルの閲覧権限がありません');
            }
            else if (error.code == 50013) {
                return_err_msg(interaction, 'マダミナリンクに十分な権限がありません');
            }
            else {
                return_err_msg(interaction, '予期せぬエラーが発生しました。管理者に報告してください。');
            }
        }
    },
};

const return_err_msg = async (interaction, err_msg) => {
    interaction.replied || interaction.deferred
        ? await interaction.followUp({ content: err_msg, ephemeral: true })
        : await interaction.reply({ content: err_msg, ephemeral: true });
};