const LineBot = require('@line/bot-sdk')
const admin = require('firebase-admin')
const axios = require('axios')
const Bot = new LineBot.Client({
	channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
})

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
		return axios.get('https://api88.net/api/img/rand?type=json', {
			headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36' }
		}).then(({data}) => {
			const ImageURL = data.url
			return {
				type: 'image',
				originalContentUrl: ImageURL,
				previewImageUrl: ImageURL
			}
		}).catch((error) => {
			throw error
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
	}
}
