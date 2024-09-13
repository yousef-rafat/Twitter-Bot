const puppeteer = require('puppeteer');
const database = require('./database.js');

async function getQuotes() {

    async function getRandomSites(quotes) {
        try {

            const RandomWebsite = quotes[Math.floor(Math.random() * quotes.length)];
            const browser = await puppeteer.launch({ headless: false });

            const page = await browser.newPage();
            await page.goto(RandomWebsite);

            const data = await page.evaluate(() => {
                const divs = Array.from(document.querySelectorAll('div.grid-item.qb.clearfix.bqQt'));

                return divs.map(div => {
                    const anchors = Array.from(div.querySelectorAll('a'));
                    const anchorTexts = anchors.map(anchor => anchor.textContent.trim());
                    return {
                        name: anchorTexts[0] === '' ? anchorTexts[2] : anchorTexts[1],
                        text: anchorTexts[0] === '' ? anchorTexts[1] : anchorTexts[0],
                    };
                });
            });

            await browser.close();

            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    async function addDatabase(datas) {

        const User = new database;

        if (datas === null) {
            return;
        }

        for (let i = 0; i <= datas.length; i++) {
            if (datas[i] == undefined || datas[i] == undefined) { continue }
            if (datas[i].name.toString() === datas[i].text.toString()) {
                continue;
            }
            User.add(datas[i].name , datas[i].text);
        }

        User.removeDuplicates();
    }

    let quotes;

    (async () => {
        try {
            const website = "https://www.brainyquote.com/topics";
            const browser = await puppeteer.launch({headless: false});
            const page = await browser.newPage();
            await page.goto(website);

            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a')).map(a => a.href);
            });

            const halfLinks = links.slice(20);
            const quoteLinks = halfLinks.slice(0, halfLinks.length - 236);

            quotes = quoteLinks;

            await browser.close();
            const textQuotes = await getRandomSites(quotes);
            
            addDatabase(textQuotes);

        } catch (error) {
            console.error('Error:', error);
        }
    })();
}

module.exports = getQuotes;