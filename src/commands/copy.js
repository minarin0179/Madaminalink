const { Util: { splitMessage, discordSort } } = require('discord.js');

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

        if (original_ch.type === 'GUILD_TEXT') {

            const options = {};

            // カテゴリ内のチャンネル数の上限は50
            if (original_ch.parent && original_ch.parent.children.size == 50) {
                options.parent = null;
            }

            await copy_ch(original_ch, options);
        }
        else if (original_ch.type == 'GUILD_CATEGORY') {
            const new_category = await original_ch.clone({ name: `(copy) ${original_ch.name}` });
            const childrens = discordSort(original_ch.children);

            await Promise.all(childrens.map(async children => {
                await copy_ch(children, { parent: new_category });
            }));
        }

        await interaction.followUp(`${original_ch.name}のコピーが完了しました`);
    },
};

async function copy_ch(original_ch, options) {

    const new_ch = await original_ch.clone(options);

    // これ以降はメッセージのコピーに関する処理
    if (!original_ch.isText()) return;

    // これがないとリアクションのキャッシュが残る
    original_ch.messages.cache.clear();

    const messages = (await original_ch.messages.fetch({ limit: 100 })).reverse();

    for await (const original_msg of messages.values()) {
        // botが送れるファイルのサイズは8MBまで
        const [files, big_files] = original_msg.attachments
            .partition(attachment => attachment.size < 8388608);

        const msg_temp = {
            files: files.map(attachment => attachment.url),
            components: original_msg.components,
            embeds: original_msg.embeds,
            allowedMentions: { parse: [] },
        };

        await new_ch.sendTyping();

        // botは2000文字までしか送れないため超えたら分割
        if (original_msg.content.length > 2000) {
            const msgs_splited = splitMessage(original_msg.content);
            msg_temp.content = msgs_splited.pop();
            for await (const str of msgs_splited) {
                await new_ch.send(str);
            }
        }
        // contentをemptyにするとエラー
        else if (original_msg.content.length > 0) {
            msg_temp.content = original_msg.content;
        }

        const new_msg = await new_ch.send(msg_temp).catch(console.log);

        for await (const file of big_files) {
            await new_ch.send(`\`\`\`diff
- ${file.name}のコピーに失敗しました
- ファイルサイズの上限は8MBまでです\`\`\``);
        }

        const reactions = original_msg.reactions.cache.keys();

        for await (const reaction of reactions) {
            new_msg.react(reaction);
        }
    }
}