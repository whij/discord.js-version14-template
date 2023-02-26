const { ClusterManager, ReClusterManager, HeartbeatManager } = require('discord-hybrid-sharding');
const dotenv = require('dotenv');
dotenv.config();

const manager = new ClusterManager(`${__dirname}/bot.js`, {
	totalShards: 'auto',
	shardsPerClusters: 2,
	mode: 'process',
	token: `${process.env.TOKEN}`,
	restarts: {
		max: 5,
		interval: 60000 * 60,
	},
});

manager.extend(
	new ReClusterManager(),
	new HeartbeatManager({
		interval: 2000,
		maxMissedHeartbeats: 5,
	}),
);

manager.on('clusterCreate', cluster => {
	console.log(`Launched Cluster ${cluster.id}`);
});

manager.spawn({ timeout: -1 });