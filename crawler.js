const cheerio = require('cheerio')
const axios = require('axios')

function GetRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

return axios.get('https://pic.netbian.com/4kmeinv/index.html').then(async({ data }) => {
	const $ = cheerio.load(data)
	// $('.slist img').each((index, element) => {
	// 	console.log(element.attribs.src)
	// })

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
		console.log('https://pic.netbian.com' + DOM[RandomImageNumber].attribs.src)
	})
})
