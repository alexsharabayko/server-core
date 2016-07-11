var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    Schema = mongoose.Schema;

var userRoles = ['user', 'admin'];

/**
 * User mongoose schema
 */
var UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        'default': ''
    },

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        'default': userRoles[0],
        required: true
    },

    createdAt: Date,
    updatedAt: Date
});

/**
 * Save dates for user before save
 */
UserSchema.pre('save', function (next) {
    if (!this.createdAt) {
        this.createdAt = Date.now();
    }

    this.updatedAt = Date.now();

    next();
});

/**
 * Email valiadtion
 */
UserSchema.path('email').validate(function (email) {
    var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return emailRegex.test(email);
}, 'The e-mail field has bad pattern.');

/**
 * Role validation
 */
UserSchema.path('role').validate(function (role) {
    return userRoles.indexOf(role) > -1;
}, 'The role can be only "passenger"');

/**
 * Get public fields of user model for sending to client
 * @returns {{username: *, firstName: *, lastName: *, email: *, role: *, token: *}}
 */
UserSchema.methods.getPublicFields = function () {
    return {
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        role: this.role,
        token: this.token
    };
};

/**
 * Beautify unique validation errors
 */
UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', UserSchema);