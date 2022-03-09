module.exports = {
    data: {
        name: 'cleanup',
        description: 'チャンネルに送信されたメッセージをすべて削除します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT', 'GUILD_CATEGORY'],
            name: '対象',
            description: '指定しなかった場合はコマンドが送信されたチャンネルが対象になります',
            required: false,
        }, {
            type: 'BOOLEAN',
            name: '高速モード',
            description: '高速モードをtrueにすることで処理にかかる時間を短縮できます(/transferでの参照は解除されます)',
            required: false,
        }],
    },
    need_admin: true,

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const target_ch = await interaction.options.getChannel('対象') || interaction.channel;

        const quick_mode = await interaction.options.getBoolean('高速モード') || false;

        if (target_ch.type === 'GUILD_TEXT') {
            await delete_all_messages(target_ch, quick_mode);
            await interaction.followUp({ content: `テキストチャンネル「${target_ch.name}」のメッセージを削除しました`, ephemeral: true }).catch();
        }
        else if (target_ch.type === 'GUILD_CATEGORY') {

            Promise.all(target_ch.children.map(async channel => {
                await delete_all_messages(channel);
            }));

            await interaction.followUp({ content: `カテゴリ「${target_ch.name}」内のすべてのチャンネルのメッセージを削除しました`, ephemeral: true });
        }
    },
};

async function delete_all_messages(channel, quick_mode) {

    if (quick_mode) {
        await channel.clone();
        await channel.delete();
        return;
    }

    // 2週間いないのメッセージはbulkDelete()で100個ずつまとめて削除できる
    while ((await channel.bulkDelete(100, true)).size > 0);

    // 2週間以上前のメッセージは一つずつ取り出して削除する
    // API制限のため遅い
    while (true) {
        const messages = await channel.messages.fetch({ limit: 100 });

        Promise.all(messages.map(async message => {
            await message.delete();
        }));

        if (messages.size != 100) {
            break;
        }
    }
}