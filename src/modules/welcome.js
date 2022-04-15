module.exports = {
    async execute(client, new_guild) {
        const guilds = await client.guilds.fetch();
        const owner = await client.users.fetch(new_guild.ownerId);

        const owner_guilds = await Promise.all(guilds.map(async guild => (await guild.fetch()).ownerId == new_guild.ownerId))
            .then(bits => guilds.filter(() => bits.shift()));
        if (owner_guilds.size <= 1) {
            owner.send(`
この度はマダミナリンクをご利用いただきありがとうございます。
利用方法については以下のnoteを参照する または /helpをご利用下さい。
note : https://note.com/minarin0179/n/n3f86accd8fea
新機能やアップデートについての情報はサポートサーバーにてご案内しております。
もしよろしければこちらにもご参加下さい。
招待URL : https://discord.gg/6by68EJ3e7
                `).catch(console.log);
        }
        else {
            owner.send(`
あなたは現在${owner_guilds.size}個のサーバーにてマダミナリンクをご利用中です。
${owner_guilds.map(guild => `「${guild.name}」`)}
                `).catch(console.log);
        }
    },
};