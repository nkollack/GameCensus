const List = require("../GameCensus/list.js");

module.exports = {
    changeInverval: (client, message, args) => {
        //time must be a number
        let parsedTime = Number.parseInt(args[1], 10);
        if(Number.isInteger(parsedTime)) {    
            //time must be greater than one min
            if(parsedTime < 1) {
                message.channel.send('Time interval must be greater than 1 min, interval should be in minutes format.  Example: $interval 1');
            } else {
                parsedTime *= 60000 //convert minutes to milliseconds
                client.config.internal_options.polling_delay = parsedTime;
            }
        } else {
            message.channel.send('Time interval must be given in minutes format.  Example: $interval 1');
        }
    },

    updateListOnInterval: (client, message, args) => {
        interval = setInterval(function() {List.updateList(client, message, args)}, client.config.internal_options.polling_delay);
    },
}