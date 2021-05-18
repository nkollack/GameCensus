module.exports = {
    name: "message",
    execute: (client, message) => {
        if (message.author.bot) return;
        message.member.checkRoles();
        // seperate prefix, command, and args from message
        const [cmd, ...args] = message.content
            .trim()
            .toLowerCase()
            .substring(PREFIX.length)
            .split(/\s+/);

        // verify the command exists, if not, print help message 
        if (!client.commands[cmd])
            return message.reply(`Unknown command: ${client.config.prefix}${cmd}. Use '${client.config.prefix}help' to see available commands.`);

        // Check each condition on the command
        client.commands[cmd].conditions.forEach(condition => {
            // if the condition is false, reply with the response and return
            if (!condition.check)
                return message.reply(condition.response)
        });

        // run the command
        client.commands[cmd].execute(client, message, args);
    }
};