module.exports = {
    name: "message",
    execute: (client, message) => {
        // seperate prefix, command, and args from message
        const [cmd, ...args] = message.content
            .trim()
            .toLowerCase()
            .substring(PREFIX.length)
            .split(/\s+/);


        message.member.checkRoles();

        if (message.author.bot) return;

        if (!message.content.startsWith(client.config.prefix.toLowerCase())) return;

        let cmd = args[0].substring(client.config.prefix.length);

        // verify the command exists, if not, print help message 
        if (!client.commands[cmd])
            return message.reply(`Unknown command: ${client.config.prefix}${CMD_NAME}. Use '${PREFIX}help' to see available commands.`);

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