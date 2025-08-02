const {
  REST,
  Collection,
  ApplicationCommandType,
  Events,
  Routes,
} = require("discord.js");
const path = require("path");
const ascii = require("ascii-table");
const { readdirSync, statSync } = require("node:fs");
const { connect } = require("mongoose");

const EventsTable = new ascii("Events").setJustify();
const SlashTable = new ascii("SlashCommands").setJustify();
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
const MongoDBURL = process.env.MONGO_URL;

// =======-> Database Connection
/**
* Connects to MongoDB and logs success or failure.
*/
async function connectToDatabase() {
  try {
      await connect(MongoDBURL).then((connection) => {
          console.log(
              `🟢 | MongoDB connected successfully as: ${connection.connections[0].name}`
          );
      });
  } catch (error) {
      console.error(`🔴 | Failed to connect to MongoDB!`);
      console.error(error);
  }
}

// =======-> Event Handler
/**
* Loads and registers events from the events folder.
* @param {Client} client - The Discord client instance.
*/
function EventsHandler(client) {
  const eventDir = path.join(__dirname, "../events");

  // Loop through all event files and register them
  readdirSync(eventDir).forEach((folder) => {
      const eventFiles = readdirSync(path.join(eventDir, folder)).filter(
          (file) => file.endsWith(".js")
      );
      eventFiles.forEach((file) => {
          const event = require(path.join(eventDir, folder, file));

          if (event.name) {
              const eventHandler = (...args) =>
                  event.execute(...args, client);

              if (event.once) {
                  client.once(event.name, eventHandler); // Trigger only once
              } else {
                  client.on(event.name, eventHandler); // Trigger every time
              }

              EventsTable.addRow(event.name, "🟢 Working");
          } else {
              EventsTable.addRow(file, "🔴 Not working");
          }
      });
  });

  console.log(EventsTable.toString());
}

// =======-> Recursive function to load commands from subdirectories
/**
* Recursively loads commands from directories and subdirectories.
* @param {string} dirPath - The directory path to search in.
* @param {Array} commands - Array to store commands.
* @param {Collection} clientCommands - Client commands collection.
* @param {string} category - The category name for the table.
*/
function loadCommandsRecursively(dirPath, commands, clientCommands, category) {
  const items = readdirSync(dirPath);
  
  items.forEach((item) => {
    const fullPath = path.join(dirPath, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // If it's a directory, recursively load commands from it
      loadCommandsRecursively(fullPath, commands, clientCommands, `${category}/${item}`);
    } else if (item.endsWith('.js')) {
      // If it's a JavaScript file, load the command
      try {
        const command = require(fullPath);
        
        if (command.name && command.description) {
          commands.push({
            type: ApplicationCommandType.ChatInput,
            name: command.name,
            description: command.description,
            options: command.options || [],
          });
          
          clientCommands.set(command.name, command);
          SlashTable.addRow(`/${command.name}`, "🟢 Working");
        } else if (command.data?.name && command.data?.description) {
          commands.push(command.data.toJSON());
          clientCommands.set(command.data.name, command);
          SlashTable.addRow(`/${command.data.name}`, "🟢 Working");
        } else {
          SlashTable.addRow(item, "🔴 Not Working");
        }
      } catch (error) {
        console.error(`Error loading command ${fullPath}:`, error);
        SlashTable.addRow(item, "🔴 Error");
      }
    }
  });
}

// =======-> Slash Command Handler
/**
* Loads and registers slash commands from the commands folder.
* @param {Client} client - The Discord client instance.
*/
async function SlashCommandEvent(client) {
  const commands = [];
  client.commands = new Collection();
  const commandsDir = path.join(__dirname, "../commands");

  // Loop through all command categories and load commands recursively
  readdirSync(commandsDir).forEach((folder) => {
    const folderPath = path.join(commandsDir, folder);
    const stat = statSync(folderPath);
    
    if (stat.isDirectory()) {
      loadCommandsRecursively(folderPath, commands, client.commands, folder);
    }
  });

  console.log(SlashTable.toString());

  // Once the client is ready, register slash commands
  client.once(Events.ClientReady, async (c) => {
      try {
          const data = await rest.put(Routes.applicationCommands(c.user.id), {
              body: commands,
          });
          console.log(
              `🟢 | Successfully refreshed ${commands.length} commands. ${data.length} commands reloaded.`
          );
      } catch (error) {
          console.error("🔴 | Error while refreshing slash commands:", error);
      }
      });
  }
  
  // =======-> Get all kingdom names for autocomplete
  /**
  * Gets all kingdom names from the database for autocomplete suggestions.
  * @returns {Promise<Array>} Array of kingdom names.
  */
  async function getAllKingdomNames() {
    try {
      const Clan = require('../models/Clan');
      const kingdoms = await Clan.find({}, 'name');
      return kingdoms.map(kingdom => kingdom.name);
    } catch (error) {
      console.error('Error fetching kingdom names:', error);
      return [];
    }
  }
  
  // =======-> Initialize the environment
module.exports = {
  /**
   * This function is responsible for initializing the environment and interacting with the `client` object.
   * It connects to the database, handles events, and processes Slash Commands.
   *
   * @param {Client} client - The client object representing the bot.
   */
  handler: async function (client) {
      try {
          // Connect to the database
          await connectToDatabase();

          // Handle events
          EventsHandler(client);

          // Handle Slash Commands
          SlashCommandEvent(client);
      } catch (error) {
          console.error("Error during initialization: ", error);
          process.exit(1); // Exit the process on failure
      }
  },

  /**
   * Handles all types of errors to ensure the stability of the application.
   */
  isError: function () {
      // Handle uncaught exceptions (errors thrown without a try-catch)
      process.on("uncaughtException", (error) => {
          console.error("Uncaught exception in the application: ", error);
          process.exit(1); // Exit the process on critical errors
      });

      // Handle uncaught exception monitor (similar to uncaughtException, but for asynchronous errors)
      process.on("uncaughtExceptionMonitor", (error) => {
          console.error("Uncaught exception monitor triggered: ", error);
      });

      // Handle rejections after they have been handled
      process.on("rejectionHandled", (error) => {
          console.error(
              "Promise rejection handled after an exception: ",
              error
          );
      });

      // Handle worker errors (for child processes/workers)
      process.on("worker", (error) => {
          console.error("Worker process error: ", error);
      });

      // Handle SIGTERM (terminate signal, used in many production environments)
      process.on("SIGTERM", () => {
          console.log("Caught SIGTERM (terminate signal)");
          client.destroy(); // Gracefully shutdown the client
          process.exit(0); // Exit the process with success code
      });
  },

  /**
   * Gets all kingdom names from the database for autocomplete suggestions.
   * @returns {Promise<Array>} Array of kingdom names.
   */
  getAllKingdomNames: getAllKingdomNames,
};
