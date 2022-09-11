module.exports = {
    data: {
        name: 'server_info',
        description: 'サーバー情報を閲覧できます',
    },
    need_admin: false,
    async execute(interaction) {
        const { guild } = interaction;
        const members = await guild.members.fetch();
        const [bot, user] = members.partition(member => member.user.bot);

        await interaction.reply({
            content: `
メンバー数 : ${user.size}人 (+ Bot${bot.size}台)
ロール数 : ${(await guild.roles.fetch()).size}個 (上限250個)
チャンネル数 : ${(await guild.channels.fetch()).size}個 (上限500個)
            `,
            ephemeral: true,
        });
    },
};