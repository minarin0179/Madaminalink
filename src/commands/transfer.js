const { MessageActionRow, MessageButton, MessageEmbed, Util: { discordSort } } = require('discord.js');
const { buildComponents } = require('./new_transfer.js');
module.exports = {
    data: {
        name: 'transfer',
        description: 'リアクションが付けられたメッセージを別のチャンネルにまとめて転送します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT'],
            name: 'channel',
            description: 'どこに転送しますか?',
            required: false,
        }],
    },
    need_admin: true,
    async execute(interaction) {

        // 応答時間の制限を15分に
        await interaction.reply('処理中です お待ちください');

        // 送り先のチャンネルを取得
        const destination = interaction.options.getChannel('channel');

        if (destination != null) {
            await interaction.channel.send(this.make_transfer_msg(destination));
            await interaction.deleteReply();
            return;
        }

        const category = interaction.channel.parent?.children || interaction.guild.channels.cache.filter(ch => !ch.parent);
        const channels = [...discordSort(category).filter(child => child.isText()).values()].map(e => [e, false]);

        await interaction.followUp({
            content: '転送先を選択してください',
            components: buildComponents(channels, `transfers`),
            ephemeral: true,
        });
        await interaction.deleteReply();
        return;

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