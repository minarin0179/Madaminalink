module.exports = {
    customId: 'open',

    async execute(interaction) {

        const customId = interaction.customId;
        const option = customId.substr(customId.indexOf(';') + 1);
        const target_mentionable = await interaction.guild.roles.fetch(option) || await interaction.guild.members.fetch(option);
        const target_channel = interaction.channel;

        // チャンネルを閲覧可能にする
        await target_channel.permissionOverwrites.edit(target_mentionable, { VIEW_CHANNEL: true });

        // ボタンを削除
        interaction.message.delete();
        interaction.reply({ content: 'チャンネルを公開しました', ephemeral: true });
    },
};