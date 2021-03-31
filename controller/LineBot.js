const LineBot = require('@line/bot-sdk')
const admin = require('firebase-admin')
const Bot = new LineBot.Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
})

module.exports = {
    ReplyMessages3: (req, res, next) => {
        console.log(JSON.stringify(req.body.events))
        const Events = req.body.events
        const ReplyPromise = []
        Events.forEach(async (event) => {
            switch (event.type) {
                case 'message':
                    if (event.message.type === 'text') {
                        event.message.text = event.message.text.replace('！', '!')
                        if (event.message.text === '!老古') {
                            ReplyPromise.push(Bot.replyMessage(event.replyToken, {
                                type: 'text',
                                text: '在座的各位都是87'
                            }))
                        }
                        if (event.message.text === '!古武') {
                            ReplyPromise.push(Bot.replyMessage(event.replyToken, {
                                type: 'text',
                                text: '古武極白，勇猛頑強，吾古捌柒捌柒捌捌柒'
                            }))
                        }
                        if (event.message.text === '!我是誰') {
                            const Profile = await Bot.getProfile(event.source.userId).then((profile) => {
                                return profile
                            })
                            ReplyPromise.push(Bot.replyMessage(event.replyToken, {
                                type: 'text',
                                text: "名稱: " + Profile.displayName + "\n" + "遊戲名稱: " + '尚未設定' + "\n" + "個人狀態: " + Profile.statusMessage + "\n"
                            }))
                        }
                    }
                    break
                case 'join':
                case 'follow':
                case 'memberJoined':
                    ReplyPromise.push(Bot.replyMessage(event.replyToken, {
                        type: 'text',
                        text: "歡迎新加入的朋友們" + "\n\n" + "不管你來自哪裡？古武都真心歡迎你們，也希望你們喜歡古武這87很多的大家庭，可以感受看看古武的氣氛與帶團的方式，希望不會讓你們失望，並ㄧ起為未來的賽季努力。" + "\n\n" + "古武極白，勇猛頑強。"
                    }))
                    break
                case 'leave':
                case 'memberLeft':
                case 'unfollow':
                    // const Profile = await Bot.getProfile(event.left.members[0].userId).then((profile) => {
                    //     return profile
                    // })
                    ReplyPromise.push(Bot.pushMessage(event.source.groupId, {
                        type: 'text',
                        text: "感謝兄弟為古武付出的一切努力，希望我們有緣能再見！"
                    }))
                    break
            }
        })
        return Promise.all(ReplyPromise).then(() => {
            return res.send('OK')
        }).catch((error) => {
            return next({
                Code: 'BOT-C-001',
                Status: 501,
                Message: error
            })
        })
    },
    ReplyMessages: (req, res, next) => {
        console.log(JSON.stringify(req.body.events))
        const Events = req.body.events
        const ReplyPromise = []
        Events.forEach(async (event) => {
            switch (event.type) {
                case 'message':
                    if (event.message.type === 'text') {
                        const Command = admin.database().ref(`replyMessage/${event.type}/command/${event.message.text}`).once('value').then((snapshot) => {
                            if (snapshot.exists()) {
                                console.log(snapshot.val())
                                const ReplyMessagePromise = []
                                snapshot.val().forEach((message) => {
                                    switch (message.type) {
                                        case 'text':
                                            ReplyMessagePromise.push(Bot.replyMessage(event.replyToken, {
                                                type: message.type,
                                                text: message.text
                                            }))
                                            break
                                    }
                                })
                                return Promise.all(ReplyMessagePromise).then(() => true).catch((error) => {
                                    throw error
                                })
                            }
                        })
                        ReplyPromise.push(Command)
                    }
                    // if (event.message.type === 'text') {
                    //     event.message.text = event.message.text.replace('！', '!')
                    //     if (event.message.text === '!老古') {
                    //         ReplyPromise.push(Bot.replyMessage(event.replyToken, {
                    //             type: 'text',
                    //             text: '在座的各位都是87'
                    //         }))
                    //     }
                    //     if (event.message.text === '!古武') {
                    //         ReplyPromise.push(Bot.replyMessage(event.replyToken, {
                    //             type: 'text',
                    //             text: '古武極白，勇猛頑強，吾古捌柒捌柒捌捌柒'
                    //         }))
                    //     }
                    //     if (event.message.text === '!我是誰') {
                    //         const Profile = await Bot.getRoomMemberProfile(event.source.groupId, event.source.userId).then((profile) => {
                    //             return profile
                    //         })
                    //         ReplyPromise.push(Bot.replyMessage(event.replyToken, {
                    //             type: 'text',
                    //             text: "名稱: " + Profile.displayName + "\n" + "遊戲名稱: " + '尚未設定' + "\n" + "個人狀態: " + Profile.statusMessage + "\n"
                    //         }))
                    //     }
                    // }
                    break
                case 'join':
                case 'follow':
                case 'memberJoined':
                    // ReplyPromise.push(Bot.replyMessage(event.replyToken, {
                    //     type: 'text',
                    //     text: "歡迎新加入的朋友們" + "\n\n" + "不管你來自哪裡？古武都真心歡迎你們，也希望你們喜歡古武這87很多的大家庭，可以感受看看古武的氣氛與帶團的方式，希望不會讓你們失望，並ㄧ起為未來的賽季努力。" + "\n\n" + "古武極白，勇猛頑強。"
                    // }))
                    break
                case 'leave':
                case 'memberLeft':
                case 'unfollow':
                    // const Profile = await Bot.getProfile(event.left.members[0].userId).then((profile) => {
                    //     return profile
                    // })
                    // ReplyPromise.push(Bot.pushMessage(event.source.groupId, {
                    //     type: 'text',
                    //     text: "感謝兄弟為古武付出的一切努力，希望我們有緣能再見！"
                    // }))
                    break
            }
        })
        return Promise.all(ReplyPromise).then(() => {
            return res.send('OK')
        }).catch((error) => {
            return next({
                Code: 'BOT-C-001',
                Status: 501,
                Message: error
            })
        })
    },
    SendMessage: (req, res, next) => {
        return Bot.pushMessage(req.body.targetId, req.body.message).then(() => {
            return res.send('OK')
        }).catch((error) => {
            return next({
                Code: 'BOT-C-002',
                Status: 501,
                Message: error
            })
        })
    },
    BulkSendMessage: (req, res, next) => {
        return res.send('OK')
    }
}

