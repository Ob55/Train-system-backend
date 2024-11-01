const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Import bcrypt

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// Pre-save hook to hash the password before saving the user
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) { // Check if password was modified
        this.password = await bcrypt.hash(this.password, 10); // Hash the password
    }
    next();
});

// Method to compare passwords for login
UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password); // Compare given password with the hashed password
};

module.exports = mongoose.model('User', UserSchema);
