require('dotenv').config();

const { Client, Webhook, WebhookClient } = require('discord.js');

const { message, addReaction, removeReaction } = require('./admin_commands.js');
const { list } = require('./list_games');

const PREFIX = "$";
const oddball_accept = 2;

const client = new Client({
    partials: ['MESSAGE', 'REACTION']
});

const webhookClient = new WebhookClient(
    process.env.WEBHOOK_ID,
    process.env.WEBHOOK_TOKEN
);

client.on('ready', () => {
    console.log(`${client.user.username}: Successfully logged in.`);
});

//call admin_commands functions
message(PREFIX, client, webhookClient);
addReaction(PREFIX, client, webhookClient);
removeReaction(PREFIX, client, webhookClient);

//call list_game functions
list(PREFIX, client, oddball_accept);

client.login(process.env.DISCORDJS_BOT_TOKEN);