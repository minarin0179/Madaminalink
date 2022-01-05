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
        const name = original.name;

        // チャンネルの指定がなければ送信されたチャンネル
        if (original === null) {
            interaction.channel.clone();
            interaction.channel.delete();
        }

        // テキストチャンネルの場合
        else if (original.type === 'GUILD_TEXT') {
            original.clone();
            original.delete();
            await interaction.reply({ content: `テキストチャンネル「${name}」のメッセージを削除しました`, ephemeral: true });
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