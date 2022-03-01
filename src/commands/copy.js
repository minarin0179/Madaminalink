const { Util: { splitMessage }, Collection } = require('discord.js');

module.exports = {
    data: {
        name: 'copy',
        description: 'チャンネルをメッセージや添付ファイルを含めて複製します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT', 'GUILD_CATEGORY'],
            name: '対象',
            description: 'コピーするチャンネル または カテゴリー',
            required: false,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        // 応答時間の制限を15分に
        await interaction.deferReply({ ephemeral: true });

        let error = false;
        const original_ch = interaction.options.getChannel('対象') || interaction.channel;

        if (original_ch.type === 'GUILD_TEXT') {
            await duplicate_ch(original_ch, original_ch.parent).catch(() => { error = true; });
        }

        else if (original_ch.type === 'GUILD_CATEGORY') {
            const new_category = await original_ch.guild.channels
                .create(`(copy) ${original_ch.name}`, {
                    type: 'GUILD_CATEGORY',
                    permissionOverwrites: original_ch.permissionOverwrites.cache,
                });

            const channels = original_ch.children.sort((chA, chB) => chA.position - chB.position);

            /*
            for await (const channel of channels) {
                await this.duplicate_ch(channel, new_category).catch(() => { error = true; });
            }*/

            await Promise.all(channels.map(async channel => {
                await duplicate_ch(channel, new_category).catch(() => { error = true; });
            }));
        }
        if (error) {
            await interaction.followUp({ content: `「${original_ch.name}」のコピーに失敗しました`, ephemeral: true });
        }
        else {
            await interaction.followUp({ content: `「${original_ch.name}」のコピーは正常に完了しました`, ephemeral: true });
        }
    },
};


// チャンネルを複製
async function duplicate_ch(original_ch, parent) {

    const guild = original_ch.guild;

    const new_ch = await original_ch.guild.channels.create(original_ch.name, {
        type: original_ch.type,
        parent: parent,
        permissionOverwrites: [{
            id: guild.roles.everyone.id,
            deny: ['VIEW_CHANNEL'],
        }, {
            id: guild.me.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        }],
    });

    // ボイスチャンネル等はメッセージのコピーをしない
    if (original_ch.type != 'GUILD_TEXT') return;

    original_ch.messages.cache.clear();

    const messages = (await fetch_all_messages(original_ch)).reverse();

    for await (const message of messages.values()) {

        new_ch.sendTyping();

        const content = message.content;

        const msg_temp = {
            files: await message.attachments.map(attachment => attachment.url),
            components: message.components,
            embeds: await message.embeds,
        };

        if (content.length > 2000) {
            for await (const m of splitMessage(content)) {
                await new_ch.send(m).catch(() => { throw new Error(); });
            }
            if (msg_temp.files.length > 0) {
                await new_ch.send(msg_temp).catch();
            }
            continue;
        }

        else if (content.length > 0) {
            msg_temp.content = content;
        }

        const new_msg = await new_ch.send(msg_temp).catch(() => {
            new_ch.send('```diff\n- メッセージのコピーに失敗しました\n- ファイルサイズの上限は8MBまでです\n```');
            throw new Error();
        });

        const reactions = message.reactions.cache.keys();

        for await (const reaction of reactions) {
            new_msg.react(reaction);
        }
    }
    await new_ch.permissionOverwrites.set(original_ch.permissionOverwrites.cache);
}

async function fetch_all_messages(channel) {
    let sum_messages = new Collection();
    let last_id;

    while (true) {
        const options = { limit: 100 };
        if (last_id) {
            options.before = last_id;
        }

        const messages = await channel.messages.fetch(options);
        sum_messages = sum_messages.concat(messages);

        if (messages.size != 100) {
            break;
        }

        last_id = messages.last().id;
    }

    return sum_messages;
}