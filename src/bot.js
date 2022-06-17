const dotenv = require('dotenv');
const { ShardingManager } = require('discord.js');

dotenv.config();

const manager = new ShardingManager('./index.js', { token: process.env.DISCORD_TOKEN });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();