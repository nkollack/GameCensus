const Players = require("../GameCensus/players.js");

module.exports = {
    updateList: (client, message, args) => {
        client.running = true;
        var date = new Date();
        var list = [];

        console.log("List running: " + (date.getHours() + 1) + ":" + date.getMinutes());

        message.guild.members.fetch()
            .then( fetchedMembers => {
            const users = fetchedMembers.filter(member => member.presence.status !== 'offline' && !member.user.bot);            
            
            users.forEach( async (user) =>  {
                if(user.presence.activities.length > 0 && (user.presence.activities[0].type === 'PLAYING' || user.presence.activities[0].type === 'STREAMING')) {
                    await Players.addPlayer(user.presence.activities[0].name, user.id);
                }
            });
        });       
    },
}