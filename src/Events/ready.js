module.exports = client => {
  if (client.config.logChannel)
    client.logChannel = client.channels.cache.get(client.config.logChannel);

  console.log("Bot online!");
};
