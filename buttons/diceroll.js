module.exports = {
    customId: 'diceroll',

    execute(interaction) {
        interaction.reply('ダイスロールを実行中');
        interaction.channel.send(`<@${interaction.member.id}> 🎲 ${this.DiceRole(interaction.component.label)}`);
        interaction.deleteReply();
    },

    // ダイスロールを行う 入力 〇d〇
    DiceRole(str) {
        // スペースを削除した式
        const figure = str.replace(/ /g, '');

        // dの前後で区切る
        const args = figure.split('d').map(num => Number(num));

        // 例外処理
        if (args[0] < 1 || args[0] > 100 || args[1] < 2 || args[1] > 10000) {
            return '不正な値です ダイスの数は1~100 ダイスの面数は2~10000で指定してください';
        }

        // ダイスの数が1の時
        if (args[0] == 1) {
            return figure + ' → ' + this.getRandomInt(args[1]);
        }

        // ダイスの数が複数の時
        const result = [...Array(args[0])].map(() => this.getRandomInt(args[1]));
        return `${figure} → [${result}] → ${result.reduce((a, x) => a + x)}`;
    },

    // 整数の乱数発生機
    getRandomInt(max) {
        return Math.floor(Math.random() * max + 1);
    },
};