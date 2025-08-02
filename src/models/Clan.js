const mongoose = require('mongoose');
const { Schema } = mongoose;

const clanSchema = new Schema({
  name: { type: String, required: true, unique: true },
  leaderId: { type: String, required: true },
  leaderRoleId: { type: String, required: true },
  assistantRoleId: { type: String, required: true },
  roleId: { type: String, required: true },
  categoryId: { type: String, required: true },
  castleChannelId: { type: String, required: true },
  ability: {
    type: {
      type: String,
      required: true
    },
    name: String,
    description: String
  },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  members: [{ type: String }], // user IDs
});

module.exports = mongoose.models.Clan || mongoose.model('Clan', clanSchema); 