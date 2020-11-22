const jwt = require('jsonwebtoken');

const config = require('../config');
const {Session} = require('../models');

module.exports = {
	generateNewToken(payload) {
		return new Promise((resolve, reject) => {
			jwt.sign(
				payload,
				config.jwt.secret,
				{
					expiresIn: config.jwt.accessTokenLifeTime,
				},
				(err, token) => {
					if (err) {
						return reject(err);
					}

					return resolve(token);
				}
			);
		});
	},
	verifyToken(token) {
		return new Promise(async (resolve, reject) => {
			jwt.verify(token, config.jwt.secret, async (error, decoded) => {
				if (error) {
					return reject(error);
				}

				const session = await Session.findOne({
					where     : {
						accessToken: token,
						userId     : decoded.userId
					},
					attributes: ['id'],
				});

				if (!session) {
					return reject('Invalid Token.');
				}

				return resolve(decoded);
			});
		});
	},
};
