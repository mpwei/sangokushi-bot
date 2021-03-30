const LineBot = require('@line/bot-sdk')
const Bot = new LineBot.Client({
	channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
})

module.exports = {
	GetProfile (event) {
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
}
