const { Util: { discordSort }, Collection } = require('discord.js');

module.exports = {
    data: {
        name: 'archive',
        description: 'チャンネルをスレッドとして保存します',
        options: [{
            type: 'CHANNEL',
            name: '保存するカテゴリ',
            channelTypes: ['GUILD_CATEGORY'],
            description: '保存するカテゴリ',
            required: true,
        }, {
            type: 'CHANNEL',
            name: '保存先のテキストチャンネル',
            channelTypes: ['GUILD_TEXT'],
            description: '指定しなかった場合は新たにチャンネルを作成します',
            required: false,
        }],
    },
    need_admin: true,

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const category = interaction.options.getChannel('保存するカテゴリ');

        const log_ch = interaction.options.getChannel('保存先のテキストチャンネル') || await category.guild.channels.create(`(ログ) ${category.name}`, {
            type: 'GUILD_TEXT',
            permissionOverwrites: category.permissionOverwrites.cache,
        });

        let description = '';

        const childrens = discordSort(category.children.filter(ch => ch.isText()));

        await Promise.all(childrens.map(async children => {

            const thread = await log_ch.threads.create({
                name: children.name,
                autoArchiveDuration: 60,
            });

            description += `[# ${children.name}](https://discord.com/channels/${interaction.guild.id}/${thread.id})\n`;

            await log_ch.sendTyping();

            const messages = [...(await fetch_all_messages(children)).reverse().values()];

            const msgs_sliced = slice_msgs(messages);

            for await (const msgs of msgs_sliced) {
                const date = new Date(msgs[0].createdAt);
                const time_formated = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;

                await thread.sendTyping();
                const embeds = msgs.filter(msg => msg.content != '').map(message => {
                    return {
                        author: {
                            name: message.member?.nickname || message.author.username,
                            icon_url: message.author.avatarURL(),
                        },
                        color: [47, 49, 54],
                        description: message.content,
                        footer: {
                            text: time_formated,
                        },
                    };
                });
                if (embeds.length > 0) {
                    await thread.send({ embeds: embeds });
                }

                // botが送れるファイルのサイズは8MBまで
                const files = msgs.slice(-1)[0].attachments.filter(attachment => attachment.size < 8388608).map(attachment => attachment.url);
                if (files.length > 0) {
                    await thread.send({ files: files });
                }
            }
            await thread.setArchived(true);
        }));

        const sys_msgs = log_ch.messages.cache.filter(msg => msg.type == 'THREAD_CREATED');
        log_ch.bulkDelete(sys_msgs);

        await log_ch.send({
            embeds: [{
                title: category.name,
                color: [47, 49, 54],
                description: description,
            }],
        });

        await interaction.followUp('ログの保存が完了しました');
    },
};

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

function slice_msgs(msgs) {
    const res = new Array();
    let tail = 0;

    msgs.forEach((msg, index) => {
        if (index - tail == 9 || msg.attachments.size > 0) {
            res.push(msgs.slice(tail, index + 1));
            tail = index + 1;
        }
    });
    if (tail < msgs.length) {
        res.push(msgs.slice(tail));
    }
    return res;
}