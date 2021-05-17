require('dotenv').config();

const { Client, Webhook, WebhookClient } = require('discord.js');

const { message, addReaction, removeReaction } = require('./admin_commands.js');
const { list } = require('./list_games');
const config = require('./config.json');

const PREFIX = "$";


const client = new Client({
    partials: ['MESSAGE', 'REACTION']
});

const webhookClient = new WebhookClient(
    process.env.WEBHOOK_ID,
    process.env.WEBHOOK_TOKEN
);
this.options = {
    interval,
    prefix: process.env.PREFIX,
    polling_delay: 20000, //20 seconds
    oddball_accept: 2,
    running: false
}


// Create two Collections where we can store our commands and aliases in.
// Store these collections on the client object so we can access them inside commands etc.
client.commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();
client.options = this.options;

// Function that will load all commands from the given directory.
function loadCommands(cmdDir) {
    // Create an empty array that will store all the file paths for the commands,
    // and push all files to the array.
    const items = [];
    items.push(...glob.sync(`${path.join(__dirname, cmdDir)}/**/*.js`));

    // Iterate through each element of the items array and add the commands / aliases
    // to their respective Collection.
    for (const item of items) {
        // Remove any cached commands
        if (require.cache[require.resolve(item)]) delete require.cache[require.resolve(item)];

        // Store the command and aliases (if it has any) in their Collection.
        const command = require(item);
        client.commands.set(command.name, command);
        if (command.aliases) {
            for (const alias of command.aliases) {
                client.aliases.set(alias, command.name);
            }
        }
    }
    console.log('Commands were loaded...');
}
// Run function and pass the relative path to the 'commands' folder.
loadCommands('commands');

// Function that will load all events from the given directory.
function loadEvents(evntDir) {

    // Create an empty array that will store all the file paths for the events,
    // and push all files to the array.
    const items = [];
    items.push(...glob.sync(`${path.join(__dirname, cmdDir)}/**/*.js`));

    for (const item of items) {
        // Remove any cached events
        if (require.cache[require.resolve(item)]) delete require.cache[require.resolve(item)];

        // Store the event in their Collection.
        const event = require(item);

        try {
            client.events.set(event.name, event);
            this.on(event.name, event.bind(null, this));
        } catch (e) {
            this.logError(`Unable to load event ${f}: ${e}`);
        }
    }
    console.log('Events were loaded...');


}

async function loadModels() {
    return new Promise(async resolve => {
        let modelList = {};
        const models = await readdir("./src/Models/");
        models.forEach(f => {
            if (!f.endsWith(".js") || f === "index.js") return;

            try {
                const modelName = f.split(".")[0];
                modelList[modelName] = require(`./${modelName}`)(
                    sequelize,
                    Sequelize.DataTypes
                );
            } catch (e) {
                client.logError(`Unable to load model ${f}: ${e}`);
            }
        });
        resolve(modelList);
    });
}

// Client ready event
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