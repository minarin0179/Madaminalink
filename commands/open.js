const Discord = require('discord.js');

module.exports = {
    data: {
        name: 'open',
        description: 'このチャンネルを特定のロールに対して公開します',
        options: [{
            type: 'MENTIONABLE',
            name: 'target',
            description: '誰に対して公開しますか?',
            required: true,
        }],
    },
    need_admin: true,
    async execute(interaction) {

        await interaction.reply('処理中です お待ちください');

        // 送り先のチャンネルを取得
        const target = interaction.options.getMentionable('target');

        // ボタンを作成
        const button = new Discord.MessageButton()
            .setCustomId('open_')
            .setStyle('PRIMARY')
            .setLabel('公開');

        // ボタンを送信
        await interaction.channel.send({
            content: `ボタンを押すことでこのチャンネルが${target}に対して公開されます`,
            components: [new Discord.MessageActionRow().addComponents(button)],
        });

        await interaction.deleteReply();

    },
};