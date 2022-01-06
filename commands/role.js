const Discord = require('discord.js');

module.exports = {
    data: {
        name: 'role',
        description: 'ロールを付与するボタンを作成します',
        options: [{
            type: 'ROLE',
            name: '付与するロール',
            description: '付与するロールを選択して下さい',
            required: true,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        const role = interaction.options.getRole('付与するロール');


        const set = new Discord.MessageButton()
            .setCustomId('set_role')
            .setStyle('SUCCESS')
            .setLabel('取得');

        const remove = new Discord.MessageButton()
            .setCustomId('remove_role')
            .setStyle('DANGER')
            .setLabel('解除');

        await interaction.channel.send({
            content: `<@&${role.id}>`,
            components: [new Discord.MessageActionRow().addComponents(set).addComponents(remove)],
        });

        interaction.reply({ content: 'ボタンを作成しました', ephemeral: true });
    },
};