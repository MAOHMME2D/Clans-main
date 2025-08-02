const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  clanId: { type: Schema.Types.ObjectId, ref: 'Clan', default: null },
  clanRole: { type: String, enum: ['leader', 'co-leader', 'elder', 'member'], default: 'member' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model('User', userSchema); 