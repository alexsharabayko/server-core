var express = require('express'),
    router = express.Router(),
    path = require('path'),
    multiparty = require('multiparty'),
    cloudinary = require('cloudinary'),
    uid = require('uid'),
    User = require('../models/user-model');

cloudinary.config({
    cloud_name: 'dz6xtu1hj',
    api_key: '933492627497273',
    api_secret: 'QSfpwFxgACzH0kbKQPe-3dRrOaI'
});

//-------------------- COMMON METHODS START --------------------------------------------------------

/**
 * Send successful message to client
 * @param req
 * @param res
 */
var sendOk = function (req, res) {
    res.json({ message: 'Ok' });
};

/**
 * Send user to client
 * @param req
 * @param res
 */
var sendUser = function (req, res) {
    res.send(req.user.getPublicFields());
};

//-------------------- COMMON METHODS END --------------------------------------------------------



//-------------------- REGISTER METHODS START ----------------------------------------------------

/**
 * Parse user data from request
 * @param req
 * @param res
 * @param next
 */
var parseFormData = function (req, res, next) {
    var form = new multiparty.Form({
        uploadDir: path.dirname(process.mainModule.filename) + '/user_files'
    });

    form.parse(req, function(err, fields, files) {
        var user = {};

        err && res.send(err);

        Object.keys(fields).forEach(function (key) {
            user[key] = fields[key][0];
        });

        user.avatar = files.avatar[0];

        req.user = user;

        next();
    });
};

/**
 * Save avatar on CDN using user data
 * @param req
 * @param res
 * @param next
 */
var uploadAvatarToCDN = function (req, res, next) {
    var user = req.user,
        crop = null;

    if (user.avatar) {
        crop = {
            x: user.avatar_x || 0,
            y: user.avatar_y || 0,
            width: user.avatar_w || 100,
            heigth: user.avatar_h || 100,
            crop: 'crop'
        };

        delete user.avatar_x;
        delete user.avatar_y;
        delete user.avatar_w;
        delete user.avatar_h;

        cloudinary.uploader.upload(user.avatar.path, function (result) {
            req.user.avatar = result;

            next();
        }, crop);
    } else {
        next();
    }
};

/**
 * Save new user to database
 * @param req
 * @param res
 * @param next
 */
var saveNewUser = function (req, res, next) {
    var user = new User(req.user);

    user.save(function (err) {
        err ? res.status(500).send(err) : next();
    });
};

/**
 * Listen register request
 */
router.route('/register').post(parseFormData, uploadAvatarToCDN, saveNewUser, sendOk);

//-------------------- REGISTER METHODS END ----------------------------------------------------


//-------------------- LOGIN METHODS START -----------------------------------------------------

/**
 * Find user using credentials from request
 * @param req
 * @param res
 * @param next
 */
var findUserByCreds = function (req, res, next) {
    var username = req.body.username,
        password = req.body.password;

    User.findOne({ username: username, password: password }, function (err, user) {
        if (err || !user) {
            return res.status(500).send({ message: 'User not found' });
        }

        req.user = user;

        next();
    });
};

/**
 * If user haven't got token, save it
 * @param req
 * @param res
 * @param next
 */
var saveTokenIfNeed = function (req, res, next) {
    var user = req.user;

    if (!user.token) {
        user.token = uid(16);

        user.save(function (err, user) {
            if (err) {
                return res.status(500).send({ message: 'Internal server error' })
            }

            req.user = user;

            next();
        });
    } else {
        next();
    }
};

/**
 * Listen login request
 */
router.route('/login').post(findUserByCreds, saveTokenIfNeed, sendUser);

//-------------------- LOGIN METHODS END -----------------------------------------------------

//-------------------- TOKEN METHODS START (LOGOUT AND LOGIN BY TOKEN) -----------------------

/**
 * Find user by token from request
 * @param req
 * @param res
 * @param next
 */
var findUserByToken = function (req, res, next) {
    var token = req.body.token;

    if (!token) {
        return res.status(500).send({ message: 'Bad token' });
    }

    User.findOne({ token: token }, function (err, user) {
        if (err || !user) {
            return res.status(500).send({ message: 'User not found' });
        }

        req.user = user;

        next();
    });
};

/**
 * Listen login by token request
 */
router.route('/loginByToken').post(findUserByToken, sendUser);

/**
 * Drop user token
 * @param req
 * @param res
 * @param next
 */
var saveEmptyToken = function (req, res, next) {
    var user = req.user;

    user.token = '';

    user.save(function (err, user) {
        if (err) {
            return res.status(500).send({ message: 'Internal server error' })
        }

        req.user = user;
        next();
    });
};

/**
 * Listen logout request
 */
router.route('/logout').post(findUserByToken, saveEmptyToken, sendOk);


//-------------------- TOKEN METHODS END (LOGOUT AND LOGIN BY TOKEN) -----------------------


module.exports = router;