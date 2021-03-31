const LineBot = require('@line/bot-sdk')
const admin = require('firebase-admin')
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
			return admin.firestore().collection('LineUser').doc(profile.userId).get().then((doc) => {
				if (doc.exists) {
					return {
						type: 'text',
						text: '名稱: ' + profile.displayName + '\n' + '遊戲名稱: ' + (doc.data().gameName || '--尚未設定--')
					}
				} else {
					return this.CreateMember(profile).then(() => {
						return {
							type: 'text',
							text: '名稱: ' + profile.displayName + '\n' + '遊戲名稱: ' + (profile.gameName || '--尚未設定--')
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
	CreateMember(profile) {
		const Reference = admin.firestore().collection('LineUser')
		return Reference.doc(profile.userId).set({
			userId: profile.userId,
			displayName: profile.displayName,
			gameName: (profile.gameName || '--尚未設定--')
		}).then(() => {
			return Reference.doc(profile.userId).get().then((doc) => {
				return doc.data()
			})
		}).catch((error) => {
			throw error
		})
	}
}
