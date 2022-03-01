const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const commands = ['dice', 'setup', 'copy', 'cleanup', 'delete', 'played', 'roles', 'log', 'open', 'transfer', 'rename', 'remind'];
const row = new MessageActionRow()
    .addComponents(
        new MessageSelectMenu()
            .setCustomId('help_detail')
            .setPlaceholder('コマンドごとの詳しい使い方を表示')
            .addOptions(
                commands.map((cmd_name) => ({
                    label: `/${cmd_name}`,
                    value: cmd_name,
                }),
                ),
            ),
    );

module.exports = {
    data: {
        name: 'help',
        description: '使い方を表示します',
    },
    need_admin: false,

    async execute(interaction) {

        // 本文を送信
        await interaction.reply({
            ephemeral: true,
            content: `
マダミナリンクの使い方
https://note.com/minarin0179/n/n3f86accd8fea#f4f3c549-9ffa-4554-9d9d-8961508b8054

コマンド一覧
 /ping : マダミナリンクが稼働しているかを確認できます
 /help : マダミナリンクのコマンド一覧を表示します
 /dice : ダイスを振るを表示します
(↓---------以下は管理者権限が必要---------↓)
 /setup : プレイ用のチャンネル、ロールを作成します
 /copy : チャンネルやカテゴリーをメッセージや添付ファイルも含めて複製します
 /cleanup : チャンネルに送信されたメッセージをすべて削除します
 /delete : カテゴリーとカテゴリー内のチャンネルをすべて削除します
 /played : メンバーについているロールを置換します
 /roles : ロールの付け外しができるボタンを表示します
 /log : カテゴリーの権限をリセットして書き込みができないようにします
 /open : チャンネルを公開するボタンを表示します
 /transfer : メッセージを別のチャンネルに向けて転送できます
 /rename : ニックネームをリセットします
 /remind : リマインダーを設定します
            `,
            components: [row],
        });
    },
};