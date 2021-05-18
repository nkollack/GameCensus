module.exports = client => {
    if (client.config.logChannel)
      client.logChannel = client.channels.get(client.config.logChannel);
  
    client.logSuccess(`${client.user.username}: Successfully logged in.`);
  };