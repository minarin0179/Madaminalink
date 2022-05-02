const crypto = require('crypto-js');

const Discord = require('discord.js');
const { connection, key } = require('../modules/sql.js');

module.exports = {
    data: {
        name: 'new_remind',
        description: '※この機能は/remind_talkへと改名されました 近日中にこちらのコマンド名では利用できなくなります',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT', 'GUILD_NEWS'],
            name: 'channel',
            description: 'どこに送信しますか?(指定しなかった場合はコマンドが入力されたチャンネルに送信されます)',
            require: true,
        }],
    },
    need_admin: true,
    async execute(interaction) {

        await interaction.reply('送信したいメッセージを入力して下さい');

        const msg = (await interaction.channel.awaitMessages({ max: 1, time: 180000 })).first();

        if (msg == undefined) {
            await interaction.followUp({ content: '応答がなかったためリマインドの登録をキャンセルしました', ephemeral: true });
            await interaction.deleteReply();
            return;
        }

        await msg.delete();
        await interaction.editReply(`送信されるメッセージ「${msg.content}」`);
        const msg_encrypted = crypto.AES.encrypt(msg.content, key).toString();


        const ch = interaction.channel;
        let date;

        while (true) {
            const temp = await ch.send(' 送信する日時を入力して下さい ex)2022/1/16 20:00');

            const time_entered = (await interaction.channel.awaitMessages({ max: 1, time: 180000 })).first();

            temp.delete();
            if (time_entered == undefined) {
                await interaction.followUp({ content: '応答がなかったためリマインドの登録をキャンセルしました', ephemeral: true });
                await interaction.deleteReply();
                return;
            }

            time_entered.delete();

            const time = time_entered.content;
            date = new Date(time);
            const lim_date = new Date();
            lim_date.setMonth(lim_date.getMonth() + 1);

            if (Number.isNaN(date.getDate())) {
                await interaction.followUp({ content: `不正な日時です(${time})`, ephemeral: true });
            }
            else if (date < new Date()) {
                await interaction.followUp({ content: `過去の日時は指定できません(${time})`, ephemeral: true });
            }
            else if (date > lim_date) {
                await interaction.followUp({ content: `1か月以上先の日時は指定できません(${time})`, ephemeral: true });
            }
            else {
                break;
            }
        }
        await interaction.deleteReply();

        const guild = interaction.guild;
        const author = interaction.user;

        const destination = interaction.options.getChannel('channel') || interaction.channel;
        const date_formated = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        const time_formated = `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;

        // 埋め込みを作成
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('リマインダーを設定しました')
            .addFields(
                { name: '日時', value: date_formated + ' ' + time_formated, inline: true },
                { name: '送信先', value: `<#${destination.id}>`, inline: true },
                { name: 'メッセージ', value: msg.content, inline: false },
            );

        const remind_ch = guild.channels.cache.find(channel => channel.name === 'remind') ||
            await guild.channels.create('remind', {
                type: 'GUILD_TEXT',
                permissionOverwrites: [{
                    id: guild.roles.everyone.id,
                    deny: ['VIEW_CHANNEL'],
                }, {
                    id: guild.me.id,
                    allow: ['VIEW_CHANNEL'],
                }],
            });

        // remindを送信
        const remind_message = await remind_ch.send({ embeds: [exampleEmbed] });

        connection.query(`INSERT INTO reminds VALUES (default,'${date_formated} ${time_formated}',${destination.id},${author.id},'${msg_encrypted}',${remind_ch.id},${remind_message.id})`, function (error, results) {
            if (error) throw error;

            const del_button = new Discord.MessageButton()
                .setCustomId(`del_remind;${results.insertId}`)
                .setStyle('DANGER')
                .setLabel('削除');

            remind_message.edit({
                components: [new Discord.MessageActionRow().addComponents(del_button)],
            });
        });

        await interaction.followUp({ content: 'リマインダーを設定しました', ephemeral: true });
    },
};