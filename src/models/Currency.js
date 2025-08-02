const { Schema, model } = require('mongoose');

const currencySchema = new Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    balance: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastDaily: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
currencySchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = model('Currency', currencySchema);