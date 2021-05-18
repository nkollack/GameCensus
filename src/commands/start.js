// https://github.com/lem-n/discord.js-boilerplate
// https://github.com/PollieDev/Discord.JS-Boilerplate

module.exports = {
    name: 'start',
    example: `${client.config.prefix}start`,
    description: "Start tracking the games being played",
    execute(client, message) {
        //update time if one provided in command
        if (args.length > 0)
            //changeInverval(args[0], message);


        //updateListOnInterval(guild, oddball_accept);
        var date = new Date();
        console.log("List started: " + (date.getHours() + 1) + ":" + date.getMinutes());
        message.reply('The list is now running, interval(minutes): ' + options.time / 60000);
    }
}