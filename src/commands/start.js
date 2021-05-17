// https://github.com/lem-n/discord.js-boilerplate
// https://github.com/PollieDev/Discord.JS-Boilerplate

module.exports = {
    command: 'start',
    example: `${client.config.prefix}start`,
    description: "Start tracking the games being played",
    run(client, message) {
        if (options.running)
            return message.reply('The list is already running.');

        //update time if one provided in command
        if (args.length > 0)
            module.exports.changeInverval(args[0], message);


        module.exports.updateListOnInterval(guild, oddball_accept);
        var date = new Date();
        console.log("List started: " + (date.getHours() + 1) + ":" + date.getMinutes());
        message.reply('The list is now running, interval(minutes): ' + options.time / 60000);
    }
}