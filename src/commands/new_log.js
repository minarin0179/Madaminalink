const { Util: { discordSort }, Collection } = require('discord.js');

module.exports = {
    data: {
        name: 'new_log',
        description: 'カテゴリをログとして保存します',
        options: [{
            type: 'CHANNEL',
            name: 'ログにするカテゴリ',
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

        const category = interaction.options.getChannel('ログにするカテゴリ');

        const log_ch = interaction.options.getChannel('保存先のテキストチャンネル') || await category.guild.channels.create(`(ログ) ${category.name}`, {
            type: 'GUILD_TEXT',
            permissionOverwrites: category.permissionOverwrites.cache,
        });

        const childrens = discordSort(category.children.filter(ch => ch.isText()));

        let description = '';

        await Promise.all(childrens.map(async children => {

            const thread = await log_ch.threads.create({
                name: children.name,
                autoArchiveDuration: 60,
            });

            description += `[# ${children.name}](https://discord.com/channels/${interaction.guild.id}/${thread.id})\n`;

            await log_ch.sendTyping();

            const messages = (await fetch_all_messages(children)).reverse();

            for await (const message of messages.values()) {
                const date = new Date(message.createdAt);
                const time_formated = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;

                await thread.sendTyping();

                await thread.send({
                    embeds: [{
                        author: {
                            name: message.author.username,
                            icon_url: message.author.avatarURL(),
                        },
                        color: [47, 49, 54],
                        description: message.content,
                        footer: {
                            text: time_formated,
                        },
                    }],
                    files: message.attachments.map(attachment => attachment.url),
                });
            }

            await thread.setArchived(true);
        }));

        await log_ch.bulkDelete(childrens.size);

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

