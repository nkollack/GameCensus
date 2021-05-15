const { Client, Guild } = require("discord.js");
const { Blacklist, Games, Oddball_Players, Oddball, Players } = require('./dbObjects');
const { Op } = require('sequelize');
require('isomorphic-fetch');

let interval;
const player = new Players();
const game = new Games();
const blacklist = new Blacklist();
let options = {
    max: 1,
    time: 20000, //20 seconds
    running: false
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

module.exports = {
    list: (PREFIX, client, oddball_accept) => {
        client.on('message', async (message) => {
            if(message.author.bot) return;
            if(message.content.startsWith(PREFIX)) {
                const [CMD_NAME, ...args ] = message.content
                .trim()
                .substring(PREFIX.length)
                .split(/\s+/);

                if(!message.member.hasPermission('ADMINISTRATOR'))
                        return message.reply('You do not have the permissions to use this command.');

                const guild = message.guild;

                if(CMD_NAME === 'start') {
                    if(!options.running) {
                        //update time if one provided in command
                        if(args.length > 0) {
                            module.exports.changeInverval(args[0], message);
                        }

                        module.exports.updateListOnInterval(guild, oddball_accept);
                        var date = new Date();
                        console.log("List started: " + (date.getHours() + 1) + ":" + date.getMinutes());
                        message.reply('The list is now running, interval(minutes): ' + options.time / 60000);
                            
                    }

                } else if(CMD_NAME === 'stop') {
                    if(options.running) {
                        clearInterval(interval);
                        message.reply('The list has been stopped.');
                        options.running = false;
                    } else {
                        return message.reply('The list is not currently running.');
                    }

                } else if(CMD_NAME === 'interval') {
                    if(options.running) {
                        module.exports.changeInverval(args[0], message);
                        clearInterval(interval);
                        interval = setInterval(function() {module.exports.updateList(guild, oddball_accept)}, options.time);
                        message.reply('The interval has been updated.');
                    } else {
                        return message.reply('The list is not currently running.');
                    }

                } else if(CMD_NAME === 'blacklistAdd') {
                    if(args.length > 0) {
                        const gameName = args.join(' ');
                        const blacklisted = await blacklist.addGame(gameName);

                        if(blacklisted) {
                            message.reply(gameName + ' successfully blacklisted.');
                        } else {
                            message.reply(gameName + ' is already in the blacklist.');
                        }

                    } else {
                        message.reply('Command requires a game name to use.  ex: $blacklistAdd Dark Souls');
                    }

                } else if(CMD_NAME === 'blacklistRemove') {
                    if(args.length > 0) {
                        const gameName = args.join(' ');
                        const unblacklisted = await blacklist.removeGame(gameName);

                        if(unblacklisted) {
                            message.reply(gameName + ' successfully removed blacklist.');
                        } else {
                            message.reply(gameName + ' was not in the blacklist.');
                        }
                    } else {
                        message.reply('Command requires a game name to use.  ex: $blacklistRemove Dark Souls');
                    }

                } else if(CMD_NAME === 'blacklistReset') {
                    if(args.length > 0) {
                        const gameName = args.join(' ');
                        const success = await blacklist.reset(gameName);

                        if(success) {
                            message.reply(gameName + ' successfully reset.');
                        } else {
                            message.reply('There was an error in either trying to add or remove "' + gameName + '" from the blacklist.');
                        }
                    } else {
                        message.reply('Command requires a game name to use.  ex: $blacklistReset Dark Souls');
                    }

                } else if(CMD_NAME === 'whitelist') {
                    if(args.length > 0) {
                        const gameName = args.join(' ');
                        const whitelisted = await game.addGame(gameName);

                        if(whitelisted) {
                            message.reply(gameName + ' successfully whitelisted.');
                        } else {
                            message.reply(gameName + ' is already in the list.');
                        }
                    } else {
                        message.reply('Command requires a game name to use.  ex: $blacklistRemove Dark Souls');
                    }

                }

                
            }
        });
    },

    print: () => {

    },

    changeInverval: (time, message) => {
        //time must be a number
        let parsedTime = Number.parseInt(time, 10);
        if(Number.isInteger(parsedTime)) {    
            //time must be greater than one min
            if(parsedTime < 1) {
                message.channel.send('Time interval must be greater than 1 min, interval should be in minutes format.  Example: $interval 1');
            } else {
                parsedTime *= 60000 //convert minutes to milliseconds
                options.time = parsedTime;
            }
        } else {
            message.channel.send('Time interval must be given in minutes format.  Example: $interval 1');
        }
    },

    updateListOnInterval: (guild, oddball_accept) => {
        interval = setInterval(function() {module.exports.updateList(guild, oddball_accept)}, options.time);
    },

    updateList: (guild, oddball_accept) => {
        options.running = true;
        var date = new Date();
        var list = [];

        console.log("List running: " + (date.getHours() + 1) + ":" + date.getMinutes());

        guild.members.fetch()
            .then( fetchedMembers => {
            const users = fetchedMembers.filter(member => member.presence.status !== 'offline' && !member.user.bot);            
            
            users.forEach( async (user) =>  {
                if(user.presence.activities.length > 0 && (user.presence.activities[0].type === 'PLAYING' || user.presence.activities[0].type === 'STREAMING')) {
                    await player.addPlayer(user.presence.activities[0].name, user.id, oddball_accept);
                }
            });
        });       
    },
};