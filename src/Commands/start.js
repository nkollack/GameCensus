const config = require("../../config");
const Interval = require("../GameCensus/interval.js");

module.exports = {
    commands: [
      {
        command: "start",
        example: `${config.prefix}start`,
        description: "Starts recording user-gameplay activity."
      }
    ],
  
    run: (client, message, args) => {
        if(!client.running) {
            //update time if one provided in command
            if (args.length > 1)
                Interval.changeInverval(client, message, args);


            Interval.updateListOnInterval(client, message, args);
            var date = new Date();
            console.log("List started: " + (date.getHours() + 1) + ":" + date.getMinutes());
            message.reply('The list is now running, interval(minutes): ' + client.config.internal_options.polling_delay / 60000);
        }
    }
  };