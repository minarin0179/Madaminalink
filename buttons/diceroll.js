module.exports = {
    customId: 'diceroll',

    execute(interaction) {
        interaction.reply('ダイスロールを実行中');
        interaction.channel.send(`<@${interaction.member.id}> 🎲 ${this.DiceRole(interaction.component.label)}`);
        interaction.deleteReply();
    },


    // ダイスロールを行う 入力 〇d〇
    DiceRole(str) {
        const figure = str.replace(/ /g, '');
        const args = figure.split('d');

        if (args[0] < 1 || args[0] > 100 || args[1] < 2 || args[1] > 10000) {
            return '不正な値です ダイスの数は1~100 ダイスの面数は2~10000で指定してください';
        }

        if (args[0] == 1) {
            return figure + ' → ' + this.getRandomInt(args[1]);
        }
        const result = [];
        for (let i = 0; i < args[0]; i++) {
            result.push(this.getRandomInt(args[1]));
        }
        return `${figure} → [${result}] → ${this.sum(result)}`;
    },

    // 配列の合計
    sum(args) { args.reduce(function (a, b) { return a + b; }, 0); },

    // 整数の乱数発生機
    getRandomInt(max) {
        return Math.floor(Math.random() * max + 1);
    },

};