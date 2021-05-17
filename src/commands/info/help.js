const { RichEmbed } = require('discord.js');

// Make sure to export properties
module.exports = {
    name: 'help', // Command name (what's gonna be used to call the command)
    aliases: ['commands'], // Command aliases
    examples: [`${client.config.prefix}${this.name}`, `${client.config.prefix}${this.name} <command>`],
    description: "List available commands",

    execute(client, message, args) {
        // Create a string with all commands sepearated by ','.
        const cmdStr = client.commands.map(c => `\`${c.name}: ${c.description}\``).join('\n');
        const embed = new RichEmbed()
            .setTitle('Commands')
            .setColor('RANDOM')
            .setDescription(cmdStr);
        message.channel.send({ embed });
    }
};