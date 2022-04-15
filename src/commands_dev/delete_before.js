const { MessageActionRow, MessageSelectMenu, Util: { discordSort } } = require('discord.js');

module.exports = {
    data: {
        name: 'これ以前のメッセージを削除',
        type: 'MESSAGE',
    },
    need_admin: true,

    async execute(interaction) {

        const category = interaction.channel.parent?.children || interaction.guild.channels.cache.filter(ch => !ch.parent);
        const channels = [...discordSort(category).filter(child => child.isText()).values()].map(e => [e, false]);

        await interaction.reply({
            content: '転送先を指定してください',
            components: buildComponents(channels, `new_transfer;${interaction.targetMessage.id}`),
            ephemeral: true,
        });
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

