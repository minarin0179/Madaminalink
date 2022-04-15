module.exports = {
    data: {
        name: 'disarchive',
        description: 'カテゴリ内のチャンネルの権限を同期します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT'],
            name: 'target',
            description: 'アーカイブを解除するチャンネル',
            required: false,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        const target = interaction.options.getChannel('target') || interaction.channel;
        const threads = (await target.threads.fetchArchived()).threads;
        await Promise.all(threads.map(async thread => {
            console.log(thread);
            await thread.setArchived(false);
        }));

        await interaction.reply({ content: 'アーカイブを解除しました', ephemeral: true });
    },
};