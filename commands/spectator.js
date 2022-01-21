const Discord = require('discord.js');

module.exports = {
    data: {
        name: 'spectator',
        description: '観戦ロールを付与するボタンを作成します',
    },
    need_admin: true,

    async execute(interaction) {

        // 応答時間の制限を15分に
        await interaction.deferReply({ ephemeral: true });

        const spectator_roles = interaction.guild.roles.cache.filter(role => role.name.includes('観戦'));

        /*
        await Promise.all(spectator_roles.map(async (role) => {
            await this.sendButton(role, interaction.channel);
        }));*/

        for await (const [, role] of spectator_roles.sort((roleA, roleB) => roleB.rawPosition - roleA.rawPosition)) {
            await this.sendButton(role, interaction.channel);
        }

        interaction.followUp({ content: 'ボタンを作成しました', ephemeral: true });
    },

    async sendButton(role, target_ch) {
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

        // ボタンを送信
        await target_ch.send({
            content: `@${role.name}`,
            components: [new Discord.MessageActionRow().addComponents(set).addComponents(remove)],
        });
    },
};