const mongoose = require('mongoose');
const ReferralSchema = mongoose.Schema({
	account_id: String,
	email: String,
	refcode: String,
	referreer: String,
	referral_count: Number
}, {
	timestamps: true
}); 

module.exports = mongoose.model('Referral', ReferralSchema);
