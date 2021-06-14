const admin = require('firebase-admin')
const {Builder, By, Key, until} = require('selenium-webdriver')

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
	'https://instagram.com/oxox.55278?utm_medium=copy_link'
]

async function example() {
	let driver = await new Builder().forBrowser('chrome').build()
	try {
		await driver.get('https://instagram.com/5269.swag?utm_medium=copy_link')
		await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN)
		await driver.wait(until.titleIs('webdriver - Google Search'), 3000)
	} finally {
		await driver.quit()
	}
}

example()
