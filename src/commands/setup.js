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
        }, {
            type: 'ROLE',
            name: 'ロールを作成する位置',
            description: '新規ロールを指定したロールの下に作成します',
            required: false,
        }, {
            type: 'BOOLEAN',
            name: '個別ロールを作成しない',
            description: 'Trueにすると個別chは作られますが個別ロールは作成されません',
            required: false,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        // 応答時間の制限を15分に
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;
        const everyoneRole = guild.roles.everyone;
        const title = interaction.options.getString('シナリオ名');
        const num_players = interaction.options.getNumber('プレイヤーの数');
        const num_secVC = interaction.options.getNumber('密談チャンネル数');
        const role_pos = (interaction.options.getRole('ロールを作成する位置') || everyoneRole).position;

        if (num_players + num_secVC + 5 > 50) {
            await interaction.followUp('プレイヤーの数もしくは密談チャンネルの数が多すぎます\n数を減らして再度お試しください');
            return;
        }

        // GMロールを作成
        const role_GM = await guild.roles.create({ name: `${title}_GM`, position: role_pos });

        // 観戦ロールを作成
        const role_SP = await guild.roles.create({ name: `(観戦)${title}`, position: role_pos });

        // PLロールを作成
        const role_PL = await guild.roles.create({ name: `${title}_PL`, position: role_pos });

        const me = await guild.me;


        // カテゴリーを作成
        const new_category = await guild.channels.create(title, {
            type: 'GUILD_CATEGORY',
            permissionOverwrites: [{
                id: me.id,
                allow: ['VIEW_CHANNEL'],
            }, {
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
                id: me.id,
                allow: ['VIEW_CHANNEL'],
            }, {
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
        await guild.channels.create('共通情報', {
            type: 'GUILD_TEXT',
            parent: new_category,
            permissionOverwrites: [{
                id: me.id,
                allow: ['VIEW_CHANNEL'],
            }, {
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
                id: me.id,
                allow: ['VIEW_CHANNEL'],
            }, {
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

        // 個別チャンネル
        for (let i = 0; i < num_players; i++) {
            const individual_ch = await guild.channels.create(`pc${i + 1}`, {
                type: 'GUILD_TEXT',
                parent: new_category,
                permissionOverwrites: [{
                    id: me.id,
                    allow: ['VIEW_CHANNEL'],
                }, {
                    id: everyoneRole.id,
                    deny: ['VIEW_CHANNEL'],
                }, {
                    id: role_GM.id,
                    allow: ['VIEW_CHANNEL'],
                }, {
                    id: role_SP.id,
                    allow: ['VIEW_CHANNEL'],
                    deny: ['SEND_MESSAGES'],
                }],
            });

            if (interaction.options.getBoolean('個別ロールを作成しない')) continue;

            const role_i = await guild.roles.create(
                {
                    name: title + '_PC' + (i + 1),
                    position: role_pos,
                },
            );

            individual_ch.permissionOverwrites.create(role_i, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
            });
        }


        // 解説
        await guild.channels.create('解説', {
            type: 'GUILD_TEXT',
            parent: new_category,
            permissionOverwrites: [{
                id: me.id,
                allow: ['VIEW_CHANNEL'],
            }, {
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
                allow: ['VIEW_CHANNEL'],
                deny: ['SEND_MESSAGES'],
            }],
        });


        // 通話チャンネル
        await guild.channels.create('全体会議', {
            type: 'GUILD_VOICE',
            parent: new_category,
            permissionOverwrites: [{
                id: me.id,
                allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK'],
            }, {
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

        // 密談チャンネル
        for (let i = 0; i < num_secVC; i++) {
            await guild.channels.create(`密談場所${i + 1}`, {
                type: 'GUILD_VOICE',
                parent: new_category,
                permissionOverwrites: [{
                    id: me.id,
                    allow: ['VIEW_CHANNEL'],
                }, {
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