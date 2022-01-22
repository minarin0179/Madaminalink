module.exports = {
    data: {
        name: 'copy',
        description: 'チャンネルをメッセージや添付ファイルを含めて複製します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT', 'GUILD_CATEGORY'],
            name: 'テキストチャンネルまたはカテゴリー',
            description: 'コピーするチャンネル/カテゴリー',
            required: false,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        // 応答時間の制限を15分に
        await interaction.deferReply({ ephemeral: true });

        const original_ch = interaction.options.getChannel('テキストチャンネルまたはカテゴリー') || interaction.channel;

        if (original_ch.type === 'GUILD_TEXT') {
            await this.duplicate_ch(original_ch, original_ch.parent);
        }

        else if (original_ch.type === 'GUILD_CATEGORY') {
            const new_category = await original_ch.guild.channels
                .create(`(copy) ${original_ch.name}`, {
                    type: 'GUILD_CATEGORY',
                    permissionOverwrites: original_ch.permissionOverwrites.cache,
                });

            const channels = original_ch.children.sort((chA, chB) => chA.position - chB.position);

            for await (const channel of channels.values()) {
                await this.duplicate_ch(channel, new_category);
            }
        }

        await interaction.followUp({ content: `「${original_ch.name}」は正常にコピーされました`, ephemeral: true });
    },


    // チャンネルを複製
    async duplicate_ch(original_ch, parent) {

        const new_ch =
            await original_ch.guild.channels.create(original_ch.name, {
                type: original_ch.type,
                parent: parent,
                permissionOverwrites: original_ch.permissionOverwrites.cache,
            });

        // ボイスチャンネル等はメッセージのコピーをしない
        if (original_ch.type != 'GUILD_TEXT') return;

        const messages = (await original_ch.messages.fetch()).reverse();
        for await (const message of messages.values()) {
            const content = message.content;

            const new_msg = {
                files: message.attachments.map(attachment => attachment.url),
                components: message.components,
                embeds: message.embeds,
            };

            if (content.length > 0) {
                new_msg.content = message.content;
            }

            await new_ch.send(new_msg);

        }

    },
};