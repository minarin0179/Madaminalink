const { Util: { splitMessage, discordSort } } = require('discord.js');
const { make_transfer_msg } = require('../commands/transfer.js')
const before_after = {}

module.exports = {
    data: {
        name: 'copy',
        description: 'チャンネルをメッセージや添付ファイルを含めて複製します',
        options: [{
            type: 'CHANNEL',
            channelTypes: ['GUILD_TEXT', 'GUILD_CATEGORY'],
            name: '対象',
            description: 'コピーするチャンネル または カテゴリー',
            required: false,
        }],
    },
    need_admin: true,

    async execute(interaction) {
        // 応答時間の制限を15分に
        await interaction.deferReply({ ephemeral: true });

        const original_ch = interaction.options.getChannel('対象') || interaction.channel;

        await copy_ch(original_ch);

        await interaction.followUp(`${original_ch.name}のコピーが完了しました`);
    },
};

async function copy_ch(original_ch, options) {

    if (options?.parent == undefined && original_ch.parent?.children.size >= 50) {
        options.parent = null;
    }

    if (original_ch.isText()) {
        // カテゴリ内のチャンネル数の上限は50
        const new_ch = await original_ch.clone(options);
        before_after[original_ch.id] = new_ch;

        await transfer_msgs(original_ch, new_ch);
    }
    else if (original_ch.type == 'GUILD_CATEGORY') {
        const new_category = await original_ch.clone({ name: `(copy) ${original_ch.name}` });
        const children = discordSort(original_ch.children);

        await Promise.all(children.map(async child => {
            await copy_ch(child, { parent: new_category });
        }));
    }
    else if (original_ch.isVoice()) {
        await original_ch.clone(options);
    }
}

async function transfer_msgs(original_ch, new_ch) {

    // これがないとリアクションのキャッシュが残る
    original_ch.messages.cache.clear();

    const messages = (await original_ch.messages.fetch({ limit: 100 })).reverse();

    for await (const original_msg of messages.values()) {

        if (original_msg.system && original_msg.type != 'THREAD_CREATED') continue;

        // botが送れるファイルのサイズは8MBまで
        const [files, big_files] = original_msg.attachments
            .partition(attachment => attachment.size < 8388608);

        let msg_temp = {
            files: files.map(attachment => attachment.url),
            components: original_msg.components,
            embeds: original_msg.embeds,
            allowedMentions: { parse: [] },
        };

        msg_temp.components.map(action_row => {
            action_row.components.map(action_row_component => {
                const customId = action_row_component.customId;
                if (customId.startsWith('transfer;')) {
                    const target_ch_id = customId.substr(customId.indexOf(';') + 1);
                    if (before_after.hasOwnProperty(target_ch_id)) {
                        msg_temp = make_transfer_msg(before_after[target_ch_id]);
                    }
                }
            });
        });

        await new_ch.sendTyping();

        // botは2000文字までしか送れないため超えたら分割
        if (original_msg.content.length > 2000) {
            const msgs_split = splitMessage(original_msg.content);
            msg_temp.content = msgs_split.pop();
            for await (const str of msgs_split) {
                await new_ch.send(str);
            }
        }
        // contentをemptyにするとエラー
        else if (original_msg.content.length > 0) {
            msg_temp.content = original_msg.content;
        }

        const new_msg = await new_ch.send(msg_temp).catch(() => { console.log(original_msg) });

        if (original_msg.pinned) {
            await new_msg.pin();
        }

        for await (const file of big_files) {
            await new_ch.send(`\`\`\`diff
- ${file.name}のコピーに失敗しました
- ファイルサイズの上限は8MBまでです\`\`\``);
        }

        const reactions = original_msg.reactions.cache.keys();

        for await (const reaction of reactions) {
            new_msg.react(reaction);
        }

        if (original_msg.hasThread) {
            const original_thread = original_msg.thread;
            const StartThreadOptions = {
                name: original_thread.name,
                autoArchiveDuration: original_thread.autoArchiveDuration
            }

            let new_thread;
            if (original_msg.type == 'THREAD_CREATED') {
                new_thread = await new_ch.threads.create(StartThreadOptions);
                await new_msg.delete();
            } else {
                new_thread = await new_msg.startThread(StartThreadOptions);
            }

            await transfer_msgs(original_thread, new_thread);
        }
    }
}