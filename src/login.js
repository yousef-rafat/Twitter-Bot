const UsedDatabase = require('./usedDatabase.js');
const { endDayEmail, successEmail } = require('./sendEmail.js');
const puppeteer = require('puppeteer');
const database = require('./database.js');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const twitter = "https://x.com/i/flow/login";

async function login(days, howMuch) {

    let name, quote;

    const User = new database;
    const Used = new UsedDatabase;
    
    do {
        const data = await User.sample();
        name = data[0].name;
        quote = data[0].text;

        console.log(name);
        console.log(quote);

        const isDuplicate = await Used.compare(name, quote);
        if (!isDuplicate) {
            break;
        }
    } while (await Used.compare(name, quote) || (name + quote).length > 45);

    const userAgent =
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36';

    const browser = await puppeteer.launch({headless: false, args: ['--disable-blink-features=AutomationControlled', '--disable-features=site-per-process', '--no-sandbox',]})
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    await page.goto(twitter, {waitUntil: 'networkidle2'});
    await page.waitForSelector("input[type='text']");

    await page.click('div[role=button]');
    const newPagePromise = new Promise(x => page.once('popup', x));
    const popup = await newPagePromise;

    await popup.waitForSelector("input[type='email']", { visible: true })
    await popup.type('input[type="email"]', process.env.TWITTER_EMAIL.toString())

    await popup.waitForSelector('div[id="identifierNext"]', {timeout: 60000, visible: true })
    await popup.click('div[id="identifierNext"]')

    console.log("Passed the first");

    await popup.waitForSelector('input[type="password"]', { visible: true });
    await popup.type('input[type="password"]', process.env.TWITTER_PASSWORD);

    await popup.waitForSelector('div[id="passwordNext"]', {timeout: 60000, visible: true })
    await popup.click("div[id='passwordNext']");

    console.log('Signed In The Account')

    for (let i = 0; i < days; i++){
        for (let j = 0; j < howMuch; j++) {
            for (let k = 0; k < 2; k++) {

                await page.waitForSelector(`div[class="css-175oi2r r-18u37iz r-184en5c"]`, { visible: true , timeout: 100000})
                await page.type(`div[class="css-175oi2r r-18u37iz r-184en5c"]`, `//////\n${quote} \n\n\r~${name}`)

                if (k === 0) {

                    await page.evaluate(() => {
                        const elements = document.getElementsByClassName("css-175oi2r r-18u37iz r-184en5c");
                        for (let element of elements) {
                            element.textContent = "";
                        }
                    });

                    if (await page.url() !== "https://x.com/compose/post/") {
                        await page.goto("https://x.com/compose/post/")
                    }
                    continue;
                }

                await page.waitForSelector('button[data-testid="tweetButton"]', {timeout: 100000, visible: true })
                await page.click('button[data-testid="tweetButton"');

                if (i === 0) {
                    successEmail();
                } else if (i === (days - 1)) {
                    endDayEmail();
                }

                await sleep(28800000);
            }
            Used.add(name, quote);
        }
    }
}

module.exports = login;