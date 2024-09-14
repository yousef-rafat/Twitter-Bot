const UsedDatabase = require('./usedDatabase.js');
const { endDayEmail, successEmail } = require('./sendEmail.js');
const puppeteer = require('puppeteer');
const database = require('./database.js');

// the sleep function is important to divide the times the bot tweets
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const twitter = "https://x.com/i/flow/login";

async function login(days, howPosts, howMuch) {

    let name, quote;

    const User = new database;
    const Used = new UsedDatabase;

    // get a sample and put them in variables.
    // if the variables are Duplicated or their length exceeds 45 words, get another sample
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

    // launch our Chrome browser with arguments that are important to not get detected
    const browser = await puppeteer.launch({headless: false, args: ['--disable-blink-features=AutomationControlled', '--disable-features=site-per-process', '--no-sandbox',]})
    const page = await browser.newPage(); // create a new page that we will use
    await page.setUserAgent(userAgent); // set the agent that we will use

    await page.goto(twitter, {waitUntil: 'networkidle2'}); // go to the login page and wait until it finishes loading
    await page.waitForSelector("input[type='text']"); // wait for the first input to load. Can't work without it
    await page.click('div[role=button]'); // click on the first button

    const newPagePromise = new Promise(x => page.once('popup', x)); // go to the Google popup to put our information
    const popup = await newPagePromise;

    await popup.waitForSelector("input[type='email']", { visible: true }) // wait for the email input to be visible
    await popup.type('input[type="email"]', process.env.TWITTER_EMAIL.toString()) // write the email

    await popup.waitForSelector('div[id="identifierNext"]', {timeout: 60000, visible: true }) // wait for the button to be visible
    await popup.click('div[id="identifierNext"]') // click the button to proceed

    console.log("Passed the first");

    await popup.waitForSelector('input[type="password"]', { visible: true }); // wait until the password input is ready
    await popup.type('input[type="password"]', process.env.TWITTER_PASSWORD); // write the google's twitter password

    await popup.waitForSelector('div[id="passwordNext"]', {timeout: 60000, visible: true }) // wait for the password button to load
    await popup.click("div[id='passwordNext']"); // then click the button

    console.log('Signed In The Account')

    // this loop serves to create a schudle for the bot to tweet.
    for (let i = 0; i < days; i++){ // for how many days
        for (let j = 0; j < howPosts; j++) { // for how much tweets per day
            for (let k = 0; k < 2; k++) { // this was fuzzy to get working and it requires it to reload for the tweet to happen
                // the reason why we requires loading is in puppeteer it likes to click and use elements that haven't loaded yet
                // when reloaded almost all of the elements would be in the CPU register, so we will be able to write the tweet

                await page.waitForSelector(`div[class="css-175oi2r r-18u37iz r-184en5c"]`, { visible: true , timeout: 100000}) // wait for the tweet selector
                await page.type(`div[class="css-175oi2r r-18u37iz r-184en5c"]`, `//////\n${quote} \n\n\r~${name}`) // write the tweet

                if (k === 0) { // on twitter, there  are multiple elements with the same class names
                    // this did work in practice to reload and get the page to the post only where there's only one class to work on

                    if (await page.url() !== "https://x.com/compose/post/") {
                        await page.goto("https://x.com/compose/post/")
                    }
                    // skip the first loop
                    continue;
                }

                // click the tweet button after waiting for it
                await page.waitForSelector('button[data-testid="tweetButton"]', {timeout: 100000, visible: true })
                await page.click('button[data-testid="tweetButton"');

                if (i === 0) { // if it ran without errors, it will send an email to celebrate
                    successEmail();
                } else if (i === (days - 1)) { // if it's the last day, it will send an email for renewing
                    endDayEmail();
                }

                await sleep(howMuch); // sleep the program
            }
            Used.add(name, quote); // add the quote and name to the used database so we won't use it again
        }
    }
}

module.exports = login;