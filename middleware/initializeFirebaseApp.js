const admin = require('firebase-admin')

module.exports = (req, res, next) => {
	const isApp = admin.apps.filter((app) => app.name_ === 'userProjectApp-' + req.body.project)
	if (isApp.length > 0) {
		req.body.userProjectApp = isApp[0]
	} else {
		req.body.userProjectApp = admin.initializeApp({
			credential: admin.credential.cert({
				'projectId': process.env.FIREBASE_PROJECT_ID,
				'private_key': process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
				'client_email': process.env.FIREBASE_CLIENT_EMAIL,
			}),
			databaseURL: process.env.FIREBASE_DATABASE_URL
		}, 'userProjectApp-' + req.body.project)
	}

	if (!req.body.userProjectApp) {
		return next({
			code: 500,
			message: 'App initialize fail.',
			statusCode: 500,
			status: 'error',
		})
	}

	return next()
}
