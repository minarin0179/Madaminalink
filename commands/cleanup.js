module.exports = {
    data: {
        name: 'cleanup',
        description: 'チャンネルに送信されたメッセージをすべて削除します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT', 'GUILD_CATEGORY'],
            name: 'テキストチャンネルまたはカテゴリー',
            description: 'メッセージを削除するチャンネル/カテゴリー',
        }],
    },
    need_admin: true,

    async execute(interaction) {
        const original = interaction.options.getChannel('テキストチャンネルまたはカテゴリー');

        // チャンネルの指定がなければ送信されたチャンネル
        if (original === null) {
            interaction.channel.clone();
            interaction.channel.delete();
            return;
        }

        const name = original.name;

        // テキストチャンネルの場合
        if (original.type === 'GUILD_TEXT') {
            original.clone();
            original.delete();
            await interaction.reply({ content: `テキストチャンネル「${name}」のメッセージを削除しました`, ephemeral: true });
            return;
        }

        // カテゴリーの場合
        else if (original.type === 'GUILD_CATEGORY') {
            for await (const channel of original.children) {
                channel[1].clone();
                channel[1].delete();
            }
            await interaction.reply({ content: `カテゴリ「${name}」内のすべてのチャンネルのメッセージを削除しました`, ephemeral: true });
        }
    },
};