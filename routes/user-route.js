var express = require('express'),
    User = require('../models/user-model'),
    router = express.Router(),
    uid = require('rand-token').uid;

router.route('/users')
    .get(function (req, res) {
        User.find(function (err, users) {
            err && res.send(err);

            res.json(users);
        })
    })
    .post(function (req, res) {
        var username = req.body.username,
            password = req.body.password,
            email = req.body.email;

        if (!(username && password && email)) {
            res.status(400).json({ message: 'Bad data' });
        }

        var user = new User({
            username: username,
            password: password,
            email: email,
            firstName: req.body.firstName || '',
            lastName: req.body.lastName || ''
        });

        user.save(function (err) {
            if (err) {
                res.status(500).send({ message: 'Internal error with save user' });
            }

            res.json({ message: 'Ok', id: user._id });
        });
    });

router.route('/users/:id')
    .get(function (req, res) {
        User.findById(req.params.id, function (err, user) {
            if (err) {
                res.status(500).send({ message: 'Internal error with finding user' });
            }

            res.json(user);
        });
    })
    .put(function (req, res) {
        User.findById(req.params.id, function (err, user) {
            if (err) {
                res.status(500).send({ message: 'Internal error with finding user' });
            }

            user.save(function (err) {
                if (err) {
                    res.status(500).send({ message: 'Internal error with save user' });
                }

                res.json({ message: 'Ok', id: user._id });
            });
        });
    })
    .delete(function (req, res) {
        User.findById(req.params.id, function(err, user) {
            if (err) {
                res.status(500).send({ message: 'Internal error with finding user' });
            }

            user.remove(function(err) {
                if (err) {
                    res.status(500).send({ message: 'Internal error with deleting user' });
                }

                res.json({ message: 'User successfully removed' });
            });
        });
    });

router.route('/login').post(function (req, res) {
    User.findOne({ username: req.body.username, password: req.body.password }, function (err, user) {
        if (err) {
            res.sendStatus(500);
        }

        if (user) {
            user.token = uid(16);

            user.save(function (err, user) {
                if (err) {
                    res.sendStatus(500);
                }

                res.json({
                    token: user.token,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    level: user.level,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                });
            });
        }
        else {
            res.status(404).send({ message: 'Bad credentials' });
        }
    });
});

router.route('/loginByToken').post(function (req, res) {
    User.findOne({token: req.body.token}, function (err, user) {
        if (err) {
            res.sendStatus(500);
        }

        if (user) {
            res.json({
                token: user.token,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                level: user.level,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                id: user._id
            });
        }
        else {
            res.status(404).send({message: 'Bad credentials'});
        }
    });
});

router.route('/register').post(function (req, res) {
    var username = req.body.username,
        password = req.body.password,
        email = req.body.email;

    if (!(username && password && email)) {
        res.status(400).json({ message: 'Bad data' });
    }

    var user = new User({
        username: username,
        password: password,
        email: email,
        firstName: req.body.firstName || '',
        lastName: req.body.lastName || '',
        token: uid(16)
    });

    user.save(function (err) {
        if (err) {
            res.status(500).send({ message: 'Internal error with save user' });
        }

        res.json({
            message: 'User is logged in',
            username: username,
            token: user.token
        });
    });
});

router.route('/logout').post(function (req, res) {
    User.findOne({ token: req.body.token }, function (err, user) {
        err && res.sendStatus(500);

        user.token = '';

        user.save(function (err) {
            err && res.sendStatus(500);

            res.json({ message: 'User was logged out' });
        });
    })
});

module.exports = router;