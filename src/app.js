async function start() {
    const Discord = require("discord.js");
    const { promisify } = require("util");
    const readdir = promisify(require("fs").readdir);
    const chalk = require("chalk");
    const log = console.log;

    class GameCensus extends Discord.Client {
        constructor() {
            super();

            this.config = require("../config");
            this.events = new Collection();
            this.commands = new Collection();
            this.aliases = new Collection();
            this.models = new Collection();

            this.loadLogs();
            this.loadEvents('events');
            this.loadCommands('commands');
            this.loadModels('models');
            this.login(this.config.botToken);
        }

        async loadEvents(eventDir) {

            // Create an empty array that will store all the file paths for the events,
            // and push all files to the array.
            const items = [];
            items.push(...glob.sync(`${path.join(__dirname, eventDir)}/**/*.js`));

            for (const item of items) {
                // Remove any cached events
                if (require.cache[require.resolve(item)]) delete require.cache[require.resolve(item)];

                // Store the event in their Collection.
                const event = require(item);

                try {
                    this.events.set(event.name, event);
                    this.on(event.name, event.bind(null, this));
                } catch (e) {
                    this.logError(`Unable to load event ${event.name}: ${e}`);
                }
            }
            this.logSuccess('Events were loaded...');


        }

        async loadCommands(commandDir) {
            // Create an empty array that will store all the file paths for the commands,
            // and push all files to the array.
            const items = [];
            items.push(...glob.sync(`${path.join(__dirname, commandDir)}/**/*.js`));

            // Iterate through each element of the items array and add the commands / aliases
            // to their respective Collection.
            for (const item of items) {
                // Remove any cached commands
                if (require.cache[require.resolve(item)]) delete require.cache[require.resolve(item)];

                try {
                    // Store the command and aliases (if it has any) in their Collection.
                    const command = require(item);
                    this.commands.set(command.name, command);
                    if (command.aliases) {
                        for (const alias of command.aliases) {
                            this.aliases.set(alias, command.name);
                        }
                    }
                } catch (e) {
                    this.logError(`Unable to load command ${command.name}: ${e}`);
                }
            }
            this.logSuccess('Commands were loaded...');
        }

        async loadModels(modelsDir) {
            const Sequelize = require("sequelize");
            const config = require("../../config");
            const { promisify } = require("util");
            const readdir = promisify(require("fs").readdir);

            if (!config.database) return (module.exports = null);

            const sequelize = new Sequelize(
                config.database.database,
                config.database.user,
                config.database.pass,
                {
                    host: config.database.host,
                    dialect: "mysql",
                    define: {
                        timestamps: false
                    }
                }
            );

            const items = [];
            items.push(...glob.sync(`${path.join(__dirname, modelsDir)}/**/*.js`));

            for (const item of items) {
                // Remove any cached models
                if (require.cache[require.resolve(item)]) delete require.cache[require.resolve(item)];

                try {
                    const model = require(item)(
                        sequelize,
                        Sequelize.DataTypes
                    );
                    this.models.set(model.Name, model);
                } catch (e) {
                    this.logError(`Unable to load model ${model.Name}: ${e}`);
                }
            }
        };



        loadLogs() {
            this.log = (msg, ignoreLogChannel = false) => {
                log(chalk.bgBlue.whiteBright(`ℹ ${msg}`));

                if (client.logChannel && !ignoreLogChannel)
                    client.logChannel.send(
                        "Log from " +
                        client.config.name +
                        "```" +
                        msg.substring(0, 1950) +
                        "```"
                    );
            };

            this.logSuccess = (msg, ignoreLogChannel = false) => {
                log(chalk.bgGreen.whiteBright(`✅ ${msg}`));

                if (client.logChannel && !ignoreLogChannel)
                    client.logChannel.send(
                        "Success log from " +
                        client.config.name +
                        "```css\n" +
                        msg.substring(0, 1950) +
                        "```"
                    );
            };

            this.logWarning = (msg, ignoreLogChannel = false) => {
                log(chalk.bgYellow.whiteBright(`⚠ ${msg}`));

                if (client.logChannel && !ignoreLogChannel)
                    client.logChannel.send(
                        "Warning log from " +
                        client.config.name +
                        "```fix\n" +
                        msg.substring(0, 1950) +
                        "```"
                    );
            };

            this.logError = (msg, ignoreLogChannel = false) => {
                log(chalk.bgRed.whiteBright(`❌ ${msg}`));

                if (client.logChannel && !ignoreLogChannel && !msg.stack)
                    client.logChannel.send(
                        "Error log from " +
                        client.config.name +
                        "```cs\n" +
                        "# " +
                        msg.substring(0, 1950) +
                        "```"
                    );
            };
        }
    }

    const client = new GameCensus();
    module.exports = client;
    require("./validation");

    // Error catching
    process.on("uncaughtException", errorHandling);
    process.on("unhandledRejection", errorHandling);

    function errorHandling(err) {
        client.logError(err);
        console.log(err);

        if (client.logChannel)
            client.logChannel.send(
                "Error occurred on " +
                client.config.name +
                "```" +
                err.stack.substring(0, 1950) +
                "```"
            );
    }
}

start();