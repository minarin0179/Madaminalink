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

        const roles_all = [...guild.roles.cache.sort((roleA, roleB) => roleB.position - roleA.position).values()].map(e => [e, false]);
        send_selectmenu(interaction, roles_all);
    },
};

async function send_selectmenu(interaction, data_all) {

    const datas_first_sliced = slice_array(data_all, 125);

    Promise.all(datas_first_sliced.map(async (data_first_sliced, index) => {
        await interaction.followUp({
            content: 'ボタンを作成するロールを選択してください',
            components: buildComponents(data_first_sliced, index),
            ephemeral: true,
        });

    }));


}

function buildComponents(data_first_sliced, index) {
    const data_second_sliced = slice_array(data_first_sliced, 25);

    return data_second_sliced.map((roles, index_child) => buildComponent(roles, index * 5 + index_child));
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