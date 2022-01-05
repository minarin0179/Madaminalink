module.exports = {
    data: {
        name: 'ping',
        description: 'マダミナリンクが動いてるか確認する用',
    },
    need_admin: false,
    async execute(interaction) {
        await interaction.reply({ content: `マダミナリンクは現在稼働中です！(${Date.now() - interaction.createdTimestamp}ms)`, ephemeral: true });
    },
};