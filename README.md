# マダミナリンク
マーダーミステリーをDiscord上で行う際にGMを支援するために作られた多機能botです

# 機能一覧
- /ping : マダミナリンクが稼働しているかを確認できます
- /help : マダミナリンクのコマンド一覧を表示します
- /dice : ダイスが振れるボタンを表示します
(↓---------以下は管理者権限が必要---------↓)
- /setup : プレイ用のチャンネル、ロールを自動で作成します
- /copy : 既存のチャンネルやカテゴリーをメッセージや添付ファイルも含めて複製します
- /played : メンバーについているロールをすべて置換できます
- /log : カテゴリーの権限をリセットして書き込みができないようにします
- /cleanup : チャンネルに送信されたメッセージをすべて削除します
- /delete : カテゴリー内のチャンネルをすべて削除します
- /remind : リマインダーを設定します
- /role : ロールの付け外しができるボタンを表示します
- /transfer : メッセージを別のチャンネルに向けて転送できます

詳しい使い方が知りたい方は以下のnoteを参照してください

https://note.com/minarin0179/n/nc45141d0e1f3 

# 利用に関する注意点
- このbotはあくまで個人によって運営されているものであり、常に動作を保証するわけではないことをご了承下さい
- 運営しているサーバーにも処理能力に限界があります、コマンドの濫用はお控えください
- コマンドの実行には一部管理者権限の必要なものがあります
- マダミナリンクの動作そのものにも管理者権限を要します
- 不具合が発生した際はTwitter([@minarin0179](https://twitter.com/minarin0179))、もしくはサポートサーバーの#不具合・バグ報告へお願いします。

# 招待URL
https://discord.com/api/oauth2/authorize?client_id=926051893728403486&permissions=8&scope=bot%20applications.commands

上記のURLが上限に引っかかって呼べない場合はサブをご利用下さい
https://discord.com/api/oauth2/authorize?client_id=928305605062590485&permissions=8&scope=applications.commands%20bot

# サポートサーバー
https://discord.gg/JMqcQstFSK

# 投げ銭
noteの記事に無理のない程度で援助していただけると助かります
https://note.com/minarin0179/n/nc45141d0e1f3 


# Requirement
- Node.js@v17.3.0
- discord.js@13.5.1
- dotenv@11.0.0
- eslint@8.6.0
- node-cron@3.0.0
