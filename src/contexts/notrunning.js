modules.export = {
    check(client) { return client.options.running },
    failure: message.reply('The list is already running.')
}