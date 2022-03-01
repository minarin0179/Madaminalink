const Discord = require('discord.js');

module.exports = {
    data: {
        name: 'open',
        description: 'チャンネルを特定のロールに対して公開します',
        options: [{
            type: 'MENTIONABLE',
            name: 'target',
            description: '誰に対して公開しますか?',
            required: true,
        }, {
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT'],
            name: 'channel',
            description: '公開するチャンネルを指定(指定しない場合はこのチャンネル)',
            required: false,
        }],
    },
    need_admin: true,
    async execute(interaction) {

        await interaction.reply('処理中です お待ちください');

        const target_role = interaction.options.getMentionable('target');
        const target_ch = interaction.options.getChannel('channel') || interaction.channel;

        await target_ch.permissionOverwrites.edit(target_role, { VIEW_CHANNEL: false });

        // ボタンを作成
        const button = new Discord.MessageButton()
            .setCustomId(`open;${target_role.id}`)
            .setStyle('PRIMARY')
            .setLabel('公開');

        // ボタンを送信
        await target_ch.send({
            content: `ボタンを押すと、このチャンネルが${target_role}に対して公開されます`,
            components: [new Discord.MessageActionRow().addComponents(button)],
        });

        await interaction.deleteReply();

    },
};