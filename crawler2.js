const admin = require('firebase-admin')
require('dotenv').config()

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert({
			'projectId': process.env.FIREBASE_PROJECT_ID,
			'private_key': process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
			'client_email': process.env.FIREBASE_CLIENT_EMAIL,
		}),
		databaseURL: process.env.FIREBASE_DATABASE_URL
	})
}

//IG圖片來源
const Resource = [
	'https://instagram.com/5269.swag?utm_medium=copy_link',
	'https://instagram.com/instagirlsasia?utm_medium=copy_link',
	'https://instagram.com/beautyclub__18?utm_medium=copy_link',
	'https://instagram.com/a.to.the.syu?utm_medium=copy_link',
	'https://instagram.com/oxox.55278?utm_medium=copy_link',
]
return admin.database().ref('/imageURL/1').once('value').then((snapShot) => {
	console.log(snapShot.val())
	process.exit()
})
