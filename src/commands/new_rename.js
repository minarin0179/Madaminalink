module.exports = {
    data: {
        name: 'ニックネームをリセット',
        type: 'USER',
    },
    need_admin: false,

    async execute(interaction) {
        const target_member = interaction.targetMember;

        if (interaction.member == target_member || interaction.member.permissions.has('MANAGE_NICKNAMES')) {
            await target_member.setNickname(null)
                .then(async() => {
                    await interaction.reply({
                        content:'ニックネームをリセットしました',
                        ephemeral:true,
                    });
                }).catch(async() => {
                    await interaction.reply({
                        content:'ニックネームをリセットできませんでした',
                        ephemeral:true,
                    });
                });
        }
        else{
            await interaction.reply({
                content:'このコマンドを実行する権限がありません',
                ephemeral:true,
            });
        }

    },
};
