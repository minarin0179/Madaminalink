const { MessageActionRow, MessageButton, Collection } = require('discord.js');

module.exports = {
    data: {
        name: 'vote',
        description: 'アンケートを作成します',
        options: [{
            type: 'INTEGER',
            name: '選択肢の数',
            description: '選択肢の数を入力して下さい(最大5)',
            required: true,
        }, {
            type: 'INTEGER',
            name: '投票時間',
            description: '投票の制限時間を設定してください(単位は分)',
            required: true,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        const channel = interaction.channel;
        const num_choices = interaction.options.getInteger('選択肢の数');
        let choices = new Collection();

        await interaction.reply({ content: '選択肢の入力を行います', ephemeral: true });

        for (let i = 1; i <= num_choices; i++) {
            await interaction.followUp({ content: `${i}つ目の選択肢を入力して下さい`, ephemeral: true });
            await channel.awaitMessages({ max: 1, time: 60000 })
                .then(msg => {
                    choices = choices.concat(msg);
                });
        }


        const components = [];

        const row = new MessageActionRow();

        Promise.all(choices.map(async (choice, index) => {
            console.log(choice);
            const button = new MessageButton()
                .setCustomId(`vote;${index}`)
                .setStyle('PRIMARY')
                .setLabel(choice.content);

            row.addComponents(button);
        }));

        components.push(row);

        await interaction.channel.send({
            content: '犯人だと思う人物に投票して下さい',
            components: components,
        });

        channel.bulkDelete(choices);

        console.log(choices);
    },
};