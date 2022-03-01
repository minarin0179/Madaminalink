const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
module.exports = {
    data: {
        name: 'roles',
        description: 'ロールを付与するボタンを作成します',
        options: [{
            type: 'ROLE',
            name: 'ロールを選択',
            description: '付与するロールを選択して下さい',
            required: false,
        }],
    },
    need_admin: true,
    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const role = await interaction.options.getRole('ロールを選択');

        if (role) {
            // ボタンを送信
            await interaction.channel.send({
                content: `@${role.name}`,
                components: [build_buttons(role)],
            });

            interaction.followUp({ content: 'ボタンを作成しました', ephemeral: true });
            return;
        }

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

    return data_second_sliced.map((roles, index_child) => {
        const new_index = index * 5 + index_child;
        return new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(`create_role_buttons;${new_index}`)
                .setPlaceholder(`ロールを選択 (ページ${new_index + 1})`)
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
    });
}

function slice_array(array, number) {
    const length = Math.ceil(array.length / number);
    return new Array(length).fill().map((_, i) =>
        array.slice(i * number, (i + 1) * number),
    );
}

function build_buttons(role) {

    // 付与ボタン
    const set = new MessageButton()
        .setCustomId(`set_role;${role.id}`)
        .setStyle('SUCCESS')
        .setLabel('取得');

    // 解除ボタン
    const remove = new MessageButton()
        .setCustomId(`remove_role;${role.id}`)
        .setStyle('DANGER')
        .setLabel('解除');

    return new MessageActionRow().addComponents(set).addComponents(remove);
}