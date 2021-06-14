const LineBot = require('@line/bot-sdk')
const admin = require('firebase-admin')
const cheerio = require('cheerio')
const axios = require('axios')
const Bot = new LineBot.Client({
	channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
})

function GetRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
	GetProfile(event) {
		let Instance
		switch (event.source.type) {
			case 'user':
				Instance = Bot.getProfile(event.source.userId)
				break
			case 'group':
				Instance = Bot.getGroupMemberProfile(event.source.groupId, event.source.userId)
				break
			case 'room':
				Instance = Bot.getRoomMemberProfile(event.source.roomId, event.source.userId)
				break
		}
		return Instance.then((profile) => {
			return profile
		}).catch((error) => {
			throw error
		})
	},
	CreateMember(profile, event = {}) {
		let Collection = 'LineUser'
		switch (event.source.type) {
			case 'group':
				Collection += event.source.type + '-' + event.source.groupId
				break
			case 'room':
				Collection += event.source.type + '-' + event.source.roomId
				break
		}
		return admin.firestore().collection(Collection).doc(profile.userId).set({
			userId: profile.userId,
			displayName: profile.displayName,
			gameName: (profile.gameName || '--尚未設定--'),
			groupName: (profile.groupName || '--尚未設定--'),
			createTime: admin.firestore.Timestamp.now()
		}, { merge: true }).then(() => {
			return admin.firestore().collection(Collection).doc(profile.userId).get().then((doc) => {
				return doc.data()
			})
		}).catch((error) => {
			throw error
		})
	},
	GetProfileMessage(event) {
		return this.GetProfile(event).then((profile) => {
			let Collection = 'LineUser'
			switch (event.source.type) {
				case 'group':
					Collection += event.source.type + '-' + event.source.groupId
					break
				case 'room':
					Collection += event.source.type + '-' + event.source.roomId
					break
			}
			return admin.firestore().collection(Collection).doc(profile.userId).get().then((doc) => {
				if (doc.exists) {
					return {
						type: 'text',
						text: '名稱: ' + profile.displayName + '\n' + '遊戲名稱: ' + (doc.data().gameName || '--尚未設定--') + '\n' + '分組名稱: ' + (doc.data().groupName || '--尚未設定--')
					}
				} else {
					return this.CreateMember(profile, event).then(() => {
						return {
							type: 'text',
							text: '名稱: ' + profile.displayName + '\n' + '遊戲名稱: ' + (profile.gameName || '--尚未設定--') + '\n' + '分組名稱: ' + (profile.groupName || '--尚未設定--')
						}
					}).catch((error) => {
						throw error
					})
				}
			})
		}).catch((error) => {
			throw error
		})
	},
	SetGameName(event) {
		return this.GetProfile(event).then((profile) => {
			let Collection = 'LineUser'
			switch (event.source.type) {
				case 'group':
					Collection += event.source.type + '-' + event.source.groupId
					break
				case 'room':
					Collection += event.source.type + '-' + event.source.roomId
					break
			}
			return admin.firestore().collection(Collection).doc(profile.userId).set({
				userId: profile.userId,
				displayName: profile.displayName,
				gameName: event.message.text,
				updateTime: admin.firestore.Timestamp.now()
			}, { merge: true }).then(() => {
				return admin.firestore().collection(Collection).doc(profile.userId).get().then((doc) => {
					return {
						type: 'text',
						text: '名稱: ' + doc.data().displayName + '\n' + '遊戲名稱: ' + (doc.data().gameName || '--尚未設定--') + '\n' + '分組名稱: ' + (doc.data().groupName || '--尚未設定--')
					}
				}).catch((error) => {
					throw error
				})
			})
		})
	},
	SetGameGroup(event) {
		return this.GetProfile(event).then((profile) => {
			let Collection = 'LineUser'
			switch (event.source.type) {
				case 'group':
					Collection += event.source.type + '-' + event.source.groupId
					break
				case 'room':
					Collection += event.source.type + '-' + event.source.roomId
					break
			}
			return admin.firestore().collection(Collection).doc(profile.userId).set({
				userId: profile.userId,
				displayName: profile.displayName,
				groupName: event.message.text,
				updateTime: admin.firestore.Timestamp.now()
			}, { merge: true }).then(() => {
				return admin.firestore().collection(Collection).doc(profile.userId).get().then((doc) => {
					return {
						type: 'text',
						text: '名稱: ' + doc.data().displayName + '\n' + '遊戲名稱: ' + (doc.data().gameName || '--尚未設定--') + '\n' + '分組名稱: ' + (doc.data().groupName || '--尚未設定--')
					}
				}).catch((error) => {
					throw error
				})
			})
		})
	},
	GetImageFromURL_01(event) {
		//隨機取得某一頁面的某一圖片
		const RandomNumber = GetRandomNumber(0, 2860)
		return admin.database().ref(`/imageURL/${RandomNumber}`).once('value').then((snapShot) => {
			return {
				type: 'image',
				originalContentUrl: snapShot.val(),
				previewImageUrl: snapShot.val()
			}
		})
	},
	GetImageFromURL_02(event) {
		return axios.get('http://www.crys.top/api/beauty.php?n=9').then(({data}) => {
			const ImageURL = data.replace('±', '').replace('±', '').replace('img=', '').replace('http://img5.adesk.com', process.env.BASE_URL + '/pump')
			return {
				type: 'image',
				originalContentUrl: ImageURL,
				previewImageUrl: ImageURL
			}
		})
	},
	GetImageFromURL_03(event) {
		console.log('GetImageFromURL_03')
		return axios.get('https://pic.netbian.com/4kmeinv/index.html',{
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36'
			}
		}).then(({ data }) => {
			const $ = cheerio.load(data)

			//取得總頁數
			const TotalPage = $('.page a')[6].childNodes[0].data

			//隨機取得某一頁面的某一圖片
			const RandomNumber = GetRandomNumber(2, TotalPage)
			console.log(RandomNumber)
			return axios.get(`https://pic.netbian.com/4kmeinv/index_${RandomNumber}.html`, {
				headers: {
					'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36'
				}
			}).then(({ data }) => {
				const $ = cheerio.load(data)

				//計算圖片個數
				const DOM =  $('.slist img')
				const TotalImages = DOM.length
				const RandomImageNumber = GetRandomNumber(0, TotalImages)
				console.log(RandomImageNumber)
				return {
					type: 'image',
					originalContentUrl: 'https://pic.netbian.com' + DOM[RandomImageNumber].attribs.src,
					previewImageUrl: 'https://pic.netbian.com' + DOM[RandomImageNumber].attribs.src
				}
			}).catch((error) => {
				console.log(error)
				throw error
			})
		}).catch((error) => {
			console.log(error)
			throw error
		})
	},
	GetImageFromURL_04(event) {
		//隨機取得某一頁面的某一圖片
		const RandomNumber = GetRandomNumber(2, 144)
		console.log(RandomNumber)
		return axios.get(`https://pic.netbian.com/4kmeinv/index_${RandomNumber}.html`, {
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36'
			}
		}).then(({ data }) => {
			const $ = cheerio.load(data)

			//計算圖片個數
			const DOM =  $('.slist img')
			const TotalImages = DOM.length
			const RandomImageNumber = GetRandomNumber(0, TotalImages)
			console.log(RandomImageNumber)
			return {
				type: 'image',
				originalContentUrl: 'https://pic.netbian.com' + DOM[RandomImageNumber].attribs.src,
				previewImageUrl: 'https://pic.netbian.com' + DOM[RandomImageNumber].attribs.src
			}
		}).catch((error) => {
			console.log(error)
			throw error
		})
	},
	GetAllUsers(event) {
		const Id = ['U5e867f6835338b9e410a7013532e587b'];
		if (!Id.includes(event.source.userId)) {
			return Promise.resolve({
				type: 'text',
				text: '權限不足'
			})
		}
		let Collection = 'LineUser'
		switch (event.source.type) {
			case 'group':
				Collection += event.source.type + '-' + event.source.groupId
				break
			case 'room':
				Collection += event.source.type + '-' + event.source.roomId
				break
		}
		return admin.firestore().collection(Collection).get().then((qs) => {
			let Text = '[群組內名單]\n\n名稱::遊戲名稱::分組名稱\n'
			qs.forEach((doc) => {
				Text += `${doc.data().displayName}::${doc.data().gameName}::${doc.data().groupName}\n`
			})
			return {
				type: 'text',
				text: Text
			}
		}).catch((error) => {
			throw error
		})
	}
}
