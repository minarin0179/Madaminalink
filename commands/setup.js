module.exports = {
    data: {
        name: 'setup',
        description: '新規のプレイ用カテゴリーを作成',
        options: [{
            type: 'STRING',
            name: 'シナリオ名',
            description: 'シナリオ名',
            required: true,
        }, {
            type: 'NUMBER',
            name: 'プレイヤーの数',
            description: 'プレイヤーの数',
            required: true,
        }, {
            type: 'NUMBER',
            name: '密談チャンネル数',
            description: '密談チャンネルの数(不要な場合は0)',
            required: true,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        // 応答時間の制限を15分に
        await interaction.deferReply({ ephemeral: true });

        // シナリオ名を取得
        const title = interaction.options.getString('シナリオ名');
        // 送信するサーバーを取得
        const guild = interaction.guild;
        // everyoneロールを取得
        const everyoneRole = guild.roles.everyone;

        // GMロールを作成
        const role_GM = await guild.roles.create({ name: `${title}_GM` });

        // PLロールを作成
        const role_PL = await guild.roles.create({ name: `${title}_PL` });

        // 観戦ロールを作成
        const role_SP = await guild.roles.create({ name: `(観戦)${title}` });

        // カテゴリーを作成
        const new_category = await guild.channels.create(title, {
            type: 'GUILD_CATEGORY',
            permissionOverwrites: [{
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_GM.id,
                allow: ['VIEW_CHANNEL'],
            }, {
                id: role_PL.id,
                allow: ['VIEW_CHANNEL'],
            }, {
                id: role_SP.id,
                allow: ['VIEW_CHANNEL'],
                deny: ['SEND_MESSAGES'],
            }],
        });

        // 一般チャンネル
        await guild.channels.create('一般', {
            type: 'GUILD_TEXT',
            parent: new_category,
            permissionOverwrites: [{
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_GM.id,
                allow: ['VIEW_CHANNEL'],
            }, {
                id: role_PL.id,
                allow: ['VIEW_CHANNEL'],
            }, {
                id: role_SP.id,
                allow: ['VIEW_CHANNEL'],
            }],
        });

        // 共通情報チャンネル
        await guild.channels.create('共通情報（書き込み不可）', {
            type: 'GUILD_TEXT',
            parent: new_category,
            permissionOverwrites: [{
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_GM.id,
                allow: ['VIEW_CHANNEL'],
            }, {
                id: role_PL.id,
                allow: ['VIEW_CHANNEL'],
                deny: ['SEND_MESSAGES'],
            }, {
                id: role_SP.id,
                allow: ['VIEW_CHANNEL'],
                deny: ['SEND_MESSAGES'],
            }],
        });

        // 観戦チャンネル
        await guild.channels.create('観戦者', {
            type: 'GUILD_TEXT',
            parent: new_category,
            permissionOverwrites: [{
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_GM.id,
                allow: ['VIEW_CHANNEL'],
            }, {
                id: role_PL.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_SP.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
            }],
        });

        // 通話チャンネル
        await guild.channels.create('全体会議', {
            type: 'GUILD_VOICE',
            parent: new_category,
            permissionOverwrites: [{
                id: everyoneRole.id,
                deny: ['VIEW_CHANNEL'],
            }, {
                id: role_GM.id,
                allow: ['VIEW_CHANNEL'],
            }, {
                id: role_PL.id,
                allow: ['VIEW_CHANNEL'],
            }, {
                id: role_SP.id,
                allow: ['VIEW_CHANNEL'],
                deny: ['SPEAK'],
            }],
        });

        // 個別チャンネル
        for (let i = 0; i < interaction.options.getNumber('プレイヤーの数'); i++) {
            const role_i = await guild.roles.create(
                {
                    name: title + '_PL' + (i + 1),
                },
            );

            await guild.channels.create(`個別ch${i + 1}`, {
                type: 'GUILD_TEXT',
                parent: new_category,
                permissionOverwrites: [{
                    id: everyoneRole.id,
                    deny: ['VIEW_CHANNEL'],
                }, {
                    id: role_GM.id,
                    allow: ['VIEW_CHANNEL'],
                }, {
                    id: role_SP.id,
                    allow: ['VIEW_CHANNEL'],
                    deny: ['SEND_MESSAGES'],
                }, {
                    id: role_i.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                }],
            });
        }

        // 密談チャンネル
        for (let i = 0; i < interaction.options.getNumber('密談チャンネル数'); i++) {
            await guild.channels.create(`密談場所${i + 1}`, {
                type: 'GUILD_VOICE',
                parent: new_category,
                permissionOverwrites: [{
                    id: everyoneRole.id,
                    deny: ['VIEW_CHANNEL'],
                }, {
                    id: role_GM.id,
                    allow: ['VIEW_CHANNEL'],
                }, {
                    id: role_PL.id,
                    allow: ['VIEW_CHANNEL'],
                }, {
                    id: role_SP.id,
                    allow: ['VIEW_CHANNEL'],
                    deny: ['SPEAK'],
                }],
            });
        }
        await interaction.followUp(`「${title}」の準備が完了しました`);
    },
};