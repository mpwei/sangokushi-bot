const cheerio = require('cheerio')
const axios = require('axios')
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

function GetRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

return axios.get('https://pic.netbian.com/4kmeinv/index.html').then(async({ data }) => {
	const $ = cheerio.load(data)
	const SaveData = []
	$('.slist img').each((index, element) => {
		SaveData.push('https://pic.netbian.com' + element.attribs.src)
		console.log(element.attribs.src)
	})

	//取得總頁數
	const TotalPage = $('.page a')[6].childNodes[0].data

	//隨機取得某一頁面的某一圖片
	for (let i = 2; i < TotalPage; i++) {
		await axios.get(`https://pic.netbian.com/4kmeinv/index_${i}.html`, {
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36'
			}
		}).then(({ data }) => {
			const $ = cheerio.load(data)
			//計算圖片個數
			const DOM =  $('.slist img')
			DOM.each((index, element) => {
				SaveData.push('https://pic.netbian.com' + element.attribs.src)
				console.log(element.attribs.src)
			})
		})
	}

	return admin.database().ref('/imageURL').set(SaveData).then(() => {
		console.log('OK')
		process.exit()
	}).catch((error) => {
		console.error(error)
		process.exit()
	})
})
