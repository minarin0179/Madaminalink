const crypto = require('crypto-js');

const Discord = require('discord.js');
const { connection, key } = require('../sql.js');

module.exports = {
    data: {
        name: 'remind',
        description: '指定日時にメッセージを送信します',
        options: [{
            type: 'STRING',
            name: 'time',
            description: 'いつ送信しますか? 例)2022/1/16 20:00',
            required: true,
        }, {
            type: 'STRING',
            name: 'message',
            description: '送信するメッセージを入力してください(必要があればメンションも記入してください)',
            required: true,
        }, {
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT'],
            name: 'channel',
            description: 'どこに送信しますか?(指定しなかった場合はコマンドが入力されたチャンネルに送信されます)',
        }],
    },
    need_admin: true,
    async execute(interaction) {

        // 応答時間の制限を15分に
        await interaction.deferReply({ ephemeral: true });

        // 各種データを取得
        const time = interaction.options.getString('time');
        const message = interaction.options.getString('message');
        const msg_encrypted = crypto.AES.encrypt(message, key).toString();
        const guild = interaction.guild;
        const author = interaction.user;

        const date = new Date(time);
        const lim_date = new Date();
        lim_date.setMonth(lim_date.getMonth() + 1);

        if (Number.isNaN(date.getDate())) {
            await interaction.followUp(`不正な日時です(${time})`);
            return;
        }
        else if (date < new Date()) {
            await interaction.followUp(`過去の日時は指定できません(${time})`);
            return;
        }
        else if (date > lim_date) {
            await interaction.followUp(`1か月以上先の日時は指定できません(${time})`);
            return;
        }


        // 送り先のチャンネルを取得
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
                { name: 'メッセージ', value: message, inline: false },
            );

        const remind_ch = guild.channels.cache.find(channel => channel.name === 'remind') ||
            await guild.channels.create('remind', {
                type: 'GUILD_TEXT',
                permissionOverwrites: [{
                    id: guild.roles.everyone.id,
                    deny: ['VIEW_CHANNEL'],
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

        await interaction.followUp('リマインダーを設定しました');
    },
};