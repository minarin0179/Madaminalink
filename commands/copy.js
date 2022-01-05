module.exports = {
    data: {
        name: 'copy',
        description: 'チャンネルをメッセージや添付ファイルを含めて複製します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT', 'GUILD_CATEGORY'],
            name: 'テキストチャンネルまたはカテゴリー',
            description: 'コピーするチャンネル/カテゴリー',
            required: true,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        // 応答時間の制限を15分に
        await interaction.deferReply({ ephemeral: true });

        // コピー元を取得
        const original = interaction.options.getChannel('テキストチャンネルまたはカテゴリー');

        // テキストチャンネルの場合
        if (original.type === 'GUILD_TEXT') {
            await this.copyChannel(original, original.parent);
            await interaction.followUp({ content: `「${original.name}」は正常にコピーされました`, ephemeral: true });
        }

        // カテゴリーの場合
        else if (original.type === 'GUILD_CATEGORY') {
            const new_category = await original.guild.channels.create(`(copy) ${original.name}`, {
                type: 'GUILD_CATEGORY',
                permissionOverwrites: original.permissionOverwrites.cache,
            });

            for await (const channel of original.children.sort((chA, chB) => chA.rawPosition - chB.rawPosition)) {
                await this.copyChannel(channel[1], new_category);
            }
            await interaction.followUp({ content: `「${original.name}」は正常にコピーされました`, ephemeral: true });
        }
    },


    // チャンネルを複製
    async copyChannel(original, category) {

        const name = (original.parent == category) ? `(copy)${original.name}` : original.name;
        const new_channel =
            await original.guild.channels.create(name, {
                // チャンネルの種類
                type: original.type,
                // カテゴリー設定
                parent: category,
                // 権限をコピー
                permissionOverwrites: original.permissionOverwrites.cache,
            });

        // テキストチャンネルだったらメッセージもコピー
        if (original.type != 'GUILD_TEXT') return;

        await original.messages.fetch().then(async (messages) => {
            for await (const message of messages.reverse()) {
                const content = message[1].content;
                const files = await message[1].attachments.map(attachment => attachment.url);

                // 予期せぬパターンをはじいておく
                if (content == '' && files.size == 0) continue;

                // 添付ファイルだけの時
                if (content == '') {
                    await new_channel.send({ files });
                    continue;
                }

                await new_channel.send({
                    content: content,
                    files: files,
                });
            }
        });
    },
};