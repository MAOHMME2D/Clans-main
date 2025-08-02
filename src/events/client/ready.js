const { Events, Client } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    /**
     * Executes when the bot is ready (logged in and fully operational).
     * @param {Client} client - The Discord client.
     */
    async execute(client) {
        try {
            console.log(`🟢 | Successfully logged in to ${client.user.tag}:${client.user.id}.`);
        } catch (error) {
            console.error(error);
        }
    },
};
