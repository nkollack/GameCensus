module.exports = {
    message: (PREFIX, client, webhookClient) => {
        client.on('message', async (message) => {
            if(message.author.bot) return;
            if(message.content.startsWith(PREFIX)) {
                const [CMD_NAME, ...args ] = message.content
                .trim()
                .substring(PREFIX.length)
                .split(/\s+/);

                //kick
                if(CMD_NAME === 'kick') {
                    if(!message.member.hasPermission('KICK_MEMBERS'))
                        return message.reply('You do not have the permissions to use this command.');
                    if(args.length === 0)
                        return message.reply('Please provide an ID.');
                    const member = message.guild.members.cache.get(args[0]);
                    if(member) {
                        member
                        .kick()
                        .then((member) => message.channel.send(`${member} was kicked.`))
                        .catch((err) => message.channel.send('Permission level not high enough: cannot kick user.'));
                    } else {
                        message.channel.send('That member was not found.');
                    }
                }
                //ban
                else if(CMD_NAME === 'ban') {
                    if(!message.member.hasPermission('BAN_MEMBERS'))
                        return message.reply('You do not have the permissions to use this command.');
                    if(args.length === 0)
                        return message.reply('Please provide an ID.');

                    try {
                        const user = await message.guild.members.ban(args[0]);
                        message.channel.send('User was banned successfully.');
                    } catch(err) {
                        console.log(err);
                        message.channel.send('Either permissions are not sufficient to execute this command or the user was not found.');
                    }
                }
                //announcements
                else if(CMD_NAME === 'announce') {
                    const message = args.join(' ');
                    webhookClient.send(message);
                }
            }
        });
    },
    addReaction: (PREFIX, client, webhookClient) => {
        client.on('messageReactionAdd', (reaction, user) => {
            console.log('spooky');
            const { name } = reaction.emoji;
            const member = reaction.message.guild.members.cache.get(user.id);
            
            if(reaction.message.id === '833050294874144769') {
                switch(name) {
                    case '👻':
                        member.roles.add('833050013361242155');
                        break;
                }
            }
        });
    },

    removeReaction: (PREFIX, client, webhookClient) => {
        client.on('messageReactionRemove', (reaction, user) => {
            console.log('spooky');
            const { name } = reaction.emoji;
            const member = reaction.message.guild.members.cache.get(user.id);
            
            if(reaction.message.id === '833050294874144769') {
                switch(name) {
                    case '👻':
                        member.roles.remove('833050013361242155');
                        break;
                }
            }
        });
    }
};