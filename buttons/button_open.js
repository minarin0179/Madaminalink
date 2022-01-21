module.exports = {
    customId: 'open',

    async execute(interaction) {

        const customId = interaction.customId;
        const options = customId.substr(customId.indexOf(';') + 1).split(',');
        const target_mentionable = await interaction.guild.roles.fetch(options[0]) || await interaction.guild.members.fetch(options[0]);
        const target_channel = await interaction.guild.channels.fetch(options[1]);

        // チャンネルを閲覧可能にする
        await target_channel.permissionOverwrites.create(target_mentionable, { VIEW_CHANNEL: true });

        // ボタンを削除
        interaction.message.delete();
        interaction.reply({ content: 'チャンネルを公開しました', ephemeral: true });
    },
};