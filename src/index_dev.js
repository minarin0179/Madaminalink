const dotenv = require('dotenv');
const { ShardingManager } = require('discord.js');
const cron = require('node-cron');

dotenv.config();

const manager = new ShardingManager('./bot_dev.js', {
    token: process.env.DISCORD_TOKEN_DEV,
    totalShards: 2,
});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();


cron.schedule('5 * * * * *', () => {

});