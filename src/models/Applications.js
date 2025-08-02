const { Schema, model } = require('mongoose');

const applicationsSchema = new Schema({
    applicationId: { type: String, unique: true, required: true },
    type: { 
        type: String, 
        required: true, 
        enum: ['create_kingdom', 'join_kingdom'] 
    },
    applicantId: { type: String, required: true },
    applicantName: { type: String, required: true },
    status: { 
        type: String, 
        default: 'pending', 
        enum: ['pending', 'approved', 'rejected'] 
    },
    // بيانات إنشاء المملكة
    kingdomName: { type: String },
    kingdomDescription: { type: String },
    kingdomRules: { type: String },
    kingdomGoals: { type: String },
    kingdomRequirements: { type: String },
    // بيانات الانضمام إلى مملكة
    targetKingdomId: { type: String },
    targetKingdomName: { type: String },
    joinReason: { type: String },
    experience: { type: String },
    commitment: { type: String },
    // بيانات عامة
    answers: [{ 
        question: { type: String },
        answer: { type: String }
    }],
    // بيانات الإدارة
    reviewedBy: { type: String },
    reviewDate: { type: Date },
    reviewNotes: { type: String },
    // بيانات الرسائل
    applicationMessageId: { type: String },
    adminChannelId: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

applicationsSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Applications = model('Applications', applicationsSchema);

module.exports = Applications; 