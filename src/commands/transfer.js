const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    data: {
        name: 'transfer',
        description: 'リアクションが付けられたメッセージを別のチャンネルにまとめて転送します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT'],
            name: 'channel',
            description: 'どこに転送しますか?',
            required: true,
        }],
    },
    need_admin: true,
    async execute(interaction) {

        // 応答時間の制限を15分に
        await interaction.reply('処理中です お待ちください');

        // 送り先のチャンネルを取得
        const destination = interaction.options.getChannel('channel');

        await interaction.channel.send(this.make_transfer_msg(destination));

        // インタラクションを削除
        await interaction.deleteReply();
    },
    make_transfer_msg(destination) {

        // 埋め込みを作成
        const Embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('転送するメッセージと同じリアクションを付けてください')
            .addField('転送先', destination.toString());

        // ボタンを作成
        const button = new MessageButton()
            .setCustomId(`transfer;${destination.id}`)
            .setStyle('PRIMARY')
            .setLabel(`「#${destination.name}」へ転送`);

        return {
            embeds: [Embed],
            components: [new MessageActionRow().addComponents(button)],
        };
    },
};