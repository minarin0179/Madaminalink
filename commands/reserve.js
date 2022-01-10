const Discord = require('discord.js');

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

        // 埋め込みを作成
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('転送するメッセージと同じリアクションを付けてください')
            .addFields(
                { name: '送信先', value: `<#${destination.id}>`, inline: true },
            );

        const button = new Discord.MessageButton()
            .setCustomId('transfer')
            .setStyle('PRIMARY')
            .setLabel('転送');

            /*
        const channels = interaction.guild.channels.cache;
        const selectmenu = new Discord.MessageSelectMenu()
            .setCustomId('target')
            .setPlaceholder('送信先を選択してください')
            .addOptions([
                {
                    label: 'firstoption',
                    valud: 'hoge',
                    description:'hoge',
                },
                {
                    label: 'secondoption',
                    valud: 'hogehoge',
                    description:'hogehoge',
                },
            ]);
*/
        // remindを送信
        await interaction.channel.send({
            embeds: [exampleEmbed],
            components: [new Discord.MessageActionRow().addComponents(button)],
        });

        await interaction.deleteReply();

    },
};