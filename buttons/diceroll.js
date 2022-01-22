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

        const x = args[0];
        const y = args[1];

        // 例外処理
        if (x < 1 || x > 100 || y < 2 || y > 10000) {
            return '不正な値です ダイスの数は1~100 ダイスの面数は2~10000で指定してください';
        }

        // ダイスの数が1の時
        if (x == 1) {
            return figure + ' → ' + this.getRandomInt(y);
        }

        // ダイスの数が複数の時
        const result = [...Array(x)].map(() => this.getRandomInt(y));
        return `${figure} → [${result}] → ${result.reduce((a, b) => a + b)}`;
    },

    // 整数の乱数発生機
    getRandomInt(max) {
        return Math.floor(Math.random() * max + 1);
    },
};