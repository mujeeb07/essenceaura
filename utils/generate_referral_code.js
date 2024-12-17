const crypto = require("crypto");

function generate_referral_code (user_id) {
    const hash = crypto.createHash('sha256').update(user_id.toString()).digest('hex');
    return `REF${hash.slice(0, 8).toUpperCase()}`;
}

module.exports = generate_referral_code;