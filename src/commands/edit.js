module.exports = {
    data: {
        name: 'メッセージを編集',
        type: 'MESSAGE',
    },
    need_admin: true,

    async execute(interaction) {

        const message = interaction.targetMessage;

        if (!message.editable) {
            await interaction.reply({ content: 'このメッセージは編集できません', ephemeral: true });
            return;
        }

        await interaction.reply('編集後のメッセージを入力してください(キャンセルする場合は`exit`と入力)');

        const msg = (await interaction.channel.awaitMessages({ max: 1, time: 180000 })).first();
        await msg.delete();

        if (msg == undefined) {
            await interaction.followUp({ content: '応答がなかったため編集をキャンセルしました', ephemeral: true });
            return;
        }

        if (msg.content == 'exit') {
            await interaction.followUp({ content: '編集をキャンセルしました', ephemeral: true });
            return;
        }

        if (msg.content.length > 2000) {
            await interaction.followUp({ content: 'メッセージ数の上限は2000文字です', ephemeral: true });
            return;
        }

        await message.edit(msg.content);

        await interaction.followUp({ content: 'メッセージを編集しました', ephemeral: true });

    },
};