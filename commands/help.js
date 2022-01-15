module.exports = {
    data: {
        name: 'help',
        description: '使い方を表示します',
    },
    need_admin: false,

    async execute(interaction) {

        // 本文を送信
        await interaction.reply({
            ephemeral:true,
            content: `
/ping : マダミナリンクが稼働しているかを確認できます
/help : マダミナリンクのコマンド一覧を表示します
/dice : ダイスが振れるボタンを表示します
(↓---------以下は管理者権限が必要---------↓)
/setup : プレイ用のチャンネル、ロールを自動で作成します
/copy : 既存のチャンネルやカテゴリーをメッセージや添付ファイルも含めて複製します
/played : メンバーについているロールをすべて置換できます
/log : カテゴリーの権限をリセットして書き込みができないようにします
/cleanup : チャンネルに送信されたメッセージをすべて削除します
/delete : カテゴリー内のチャンネルをすべて削除します
/remind : リマインダーを設定します
/role : ロールの付け外しができるボタンを表示します
/transfer : メッセージを別のチャンネルに向けて転送できます
詳しい使い方が知りたい方は以下のnoteを参照してください
https://note.com/minarin0179/n/nc45141d0e1f3
            `,
        });
    },
};