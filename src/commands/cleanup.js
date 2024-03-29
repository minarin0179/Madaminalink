const { Collection } = require('discord.js')

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
            await interaction.followUp({ content: `テキストチャンネル「${target_ch.name}」のメッセージを削除しました`, ephemeral: true }).catch(() => {
                // 高速モードでコマンド実行チャンネルが消えていると失敗する
            });
        }
        else if (target_ch.type === 'GUILD_CATEGORY') {

            Promise.all(target_ch.children.map(async channel => {
                await delete_all_messages(channel, quick_mode);
            }));

            await interaction.followUp({ content: `カテゴリ「${target_ch.name}」内のすべてのチャンネルのメッセージを削除しました`, ephemeral: true }).catch(() => {
                // 高速モードでコマンド実行チャンネルが消えていると失敗する
            });
        }
    },
};


const delete_all_messages = async (channel, isQuickMode) => {
    if (isQuickMode && "clone" in channel) {
        await channel.clone()
        await channel.delete()
        return
    }

    const allMessages = await fetchAllMessages(channel)

    const [messages, oldMessages] = allMessages.partition(message => (Date.now() - message.createdTimestamp) < 1_209_600_000);

    await Promise.all(arraySplit(Array.from(messages.values()), 100).map(async messagesSliced => {
        await channel.bulkDelete(messagesSliced)
    }))

    //２週間以上前のメッセージを順番に削除(遅い)
    await Promise.all(oldMessages.map(async message => {
        await message.delete();
    }));
}


const fetchAllMessages = async (channel) => {

    let messages = new Collection()
    let lastID

    while (true) {
        const fetchedMessages = await channel.messages.fetch({
            limit: 100,
            ...(lastID && { before: lastID })
        })

        messages = messages.concat(fetchedMessages)
        lastID = fetchedMessages.lastKey()

        if (fetchedMessages.size < 100) return messages
    }

}
const arraySplit = (array, n) =>
    array.reduce((acc, c, i) => (i % n ? acc : [...acc, ...[array.slice(i, i + n)]]), [])