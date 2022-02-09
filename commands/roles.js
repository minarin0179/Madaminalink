const { MessageActionRow, MessageSelectMenu } = require('discord.js');
module.exports = {
    data: {
        name: 'roles',
        description: 'ロールを付与するボタンを作成します (ロールの選択はコマンドの入力後に行います)',
    },
    need_admin: true,
    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;


        await interaction.followUp({
            content: 'ボタンを作成するロールを選択してください',
            components: buildComponents(guild),
            ephemeral: true,
        });
    },
};

function buildComponents(guild) {
    const roles_all = [...guild.roles.cache.sort((roleA, roleB) => roleB.position - roleA.position).values()].map(e => [e, false]);
    const roles_sliced = slice_array(roles_all, 25);

    return roles_sliced.map((roles, index) => buildComponent(roles, index));
}

function buildComponent(roles, index) {

    return new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId(`create_role_buttons;${index}`)
            .setPlaceholder(`ロールを選択 (ページ${index + 1})`)
            .setMinValues(0)
            .setMaxValues(roles.length)
            .addOptions(
                roles.map(([role, selected]) => ({
                    label: role.name,
                    value: role.id,
                    default: selected,
                }),
                ),
            ),
    );
}

function slice_array(array, number) {
    const length = Math.ceil(array.length / number);
    return new Array(length).fill().map((_, i) =>
        array.slice(i * number, (i + 1) * number),
    );
}