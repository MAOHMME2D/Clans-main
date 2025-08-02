// Importing dependencies
require("dotenv/config");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const utils = require("./src/utils/helpers");

// Creating a new Discord client instance with proper intents and partials
const client = new Client({
    intents: [Object.keys(GatewayIntentBits)],
    partials: [Object.keys(Partials)],
});

// Login to Discord using the token from environment variables
client.login(process.env.TOKEN);

// Handling events and commands through the utility functions
utils.handler(client);
utils.isError();

// Gracefully shutting down the bot when the process is terminated
process.on("SIGINT", () => {
    console.log("🟢 | Gracefully shutting down...");
    client
        .destroy()
        .then(() => {
            console.log("🟢 | Bot successfully disconnected.");
            process.exit(0); // Exit the process successfully
        })
        .catch((error) => {
            console.error("🔴 | Error while shutting down:", error);
            process.exit(1); // Exit the process with an error code
        });
});

// For unhandled promise rejections globally for better debugging
process.on("unhandledRejection", (error) => {
    console.error("🔴 | Unhandled Promise Rejection:", error);
});