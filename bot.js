// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// Require ClusterClient from the DHS Package
const { ClusterClient } = require('discord-hybrid-sharding');

// Require Dotenv and configure it
const dotenv = require('dotenv');
dotenv.config();

// Require filesystem and path for the command and event handler to read directories
const fs = require('node:fs');
const path = require('node:path');

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds],
	shards: ClusterClient.getInfo().SHARD_LIST,
	shardCount: ClusterClient.getInfo().TOTAL_SHARDS,
});
client.commands = new Collection();
client.cluster = new ClusterClient(client);

// Check if clusters are under maintanence
if (client.cluster.maintenance) console.log(`Bot on maintenance mode with ${client.cluster.maintenance}`);

client.cluster.on('ready', () => {
	// * Command Handler
	const commandsPath = path.join(__dirname, 'commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}

	// * Event Handler
	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);