/*
 * @Author: bobocde
 * @Description: 
 */
const superagent = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');
const config = require('./config');

const baseUrl = `https://www.v2ex.com/go/nodejs?p=`;
//http://www.v2ex.com/go/nodejs?p=1
let artileList = [];
function startPage(url, index) {
    superagent.get(url)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Safari/537.36')
        .end((err, res) => {
            if (err) {
                console.log(err);
            }
            let $ = cheerio.load(res.text);
            $('.item_title').map(function (i, el) {
                let avatar = $(el).parent().siblings().children().find('.avatar').attr('src');
                let title = $(el).text();
                let href = "https://www.v2ex.com" + $(el).children().attr('href');
                let pubDate = $(el).siblings().text().replace("最后回复来自", "");
                pubDate = pubDate.split("•")[1].trim();
                let replyNumber = $(el).parent().siblings().children().text().trim();
                let author = $(el).siblings().children().prev().text();
                artileList.push({
                    avatar,
                    title,
                    href,
                    author,
                    pubDate,
                    replyNumber
                });
            });
            fs.appendFile(`./data/info${index}.json`, `${JSON.stringify(artileList)}`, { encoding: 'utf8' }, (err) => {
                if (err) {
                    throw err;
                }
                console.log(`已完成${index}页`);
                artileList = [];
            });

        });
}

function rmFiles(path) {
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = `${path}/${file}`;
            fs.unlinkSync(curPath);
        });
        if (files.length == 0) {
            for (let index = 1; index < config.pageNumber; index++) {
                startPage(`${baseUrl}${index}`, index);
            }
        }
    }
}

rmFiles('./data/');
