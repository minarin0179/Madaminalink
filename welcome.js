module.exports = {
    async execute(client, new_guild) {
        const guilds = await client.guilds.fetch();
        const owner = await client.users.fetch(new_guild.ownerId);

        // 新たに参加したサーバーのオーナーが所持するサーバーを取得
        Promise.all(guilds.map(async guild => (await guild.fetch()).ownerId == new_guild.ownerId))
            .then(bits => guilds.filter(() => bits.shift()))
            .then(owner_guilds => {
                if (owner_guilds.size == 1) {
                    owner.send(`
この度はマダミナリンクをご利用いただきありがとうございます。
利用方法は以下のnoteにてご案内させていただいています。
https://note.com/minarin0179/n/nc45141d0e1f3
またマダミナリンクを利用しているサーバーの管理者に向けてDMにてアップデートやメンテナンスの情報を配信を行っています。
メッセージの受け取りを希望されない場合はマダミナリンクからのメッセージをミュートしていただければ幸いです。
その他のご意見ご要望や不具合の報告等がありましたら製作者の「みなりん#0471」までご連絡下さい。
                `);
                }
                else if (owner_guilds.size >= 5) {
                    owner.send(`
あなたは現在${owner_guilds.size}個のサーバーにてマダミナリンクをご利用中です。
${owner_guilds.map(guild => `「${guild.name}」`)}
平素より多くのサーバーにてマダミナリンクをご利用いただきありがとうございます。
もしあまり利用していないサーバーがありましたら負荷軽減のためキックしていただけると幸いです。
                `);
                }
                else {
                    owner.send(`
あなたは現在${owner_guilds.size}個のサーバーにてマダミナリンクをご利用中です。
${owner_guilds.map(guild => `「${guild.name}」`)}
                `);
                }
            });
    },
};