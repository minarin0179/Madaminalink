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
        // ロールを取得
        const role = interaction.options.getRole('付与するロール');

        // ボタンを送信
        await interaction.channel.send({
            content: `@${role.name}`,
            components: [build_buttons(role)],
        });

        interaction.reply({ content: 'ボタンを作成しました', ephemeral: true });
    },
};

function build_buttons(role) {

    // 付与ボタン
    const set = new Discord.MessageButton()
        .setCustomId(`set_role;${role.id}`)
        .setStyle('SUCCESS')
        .setLabel('取得');

    // 解除ボタン
    const remove = new Discord.MessageButton()
        .setCustomId(`remove_role;${role.id}`)
        .setStyle('DANGER')
        .setLabel('解除');

    return new Discord.MessageActionRow().addComponents(set).addComponents(remove);
}