const puppeteer = require('puppeteer');
const database = require('./database.js');

// function will scrap quotes from a quotes website and add them to a database
// it starts from below
async function getQuotes() {

    async function getRandomSites(quotes) {
        try {

            const RandomWebsite = quotes[Math.floor(Math.random() * quotes.length)]; // choose a random link (representing a genre) to scrap from
            const browser = await puppeteer.launch({ headless: false }); // start the browser
            // we will always use headless: false to not get detected in the bot detection systems

            const page = await browser.newPage();
            await page.goto(RandomWebsite); // go to the random website

            const data = await page.evaluate(() => {
                // in each div with this class, loop over them and get the name and the text
                // get all the elements (quote divs) that we want to scrap and put them into a constant array
                const divs = Array.from(document.querySelectorAll('div.grid-item.qb.clearfix.bqQt'));

                // map through the divs we have and get all the anchor elements and then get their text.
                return divs.map(div => {
                    const anchors = Array.from(div.querySelectorAll('a'));
                    const anchorTexts = anchors.map(anchor => anchor.textContent.trim());
                    return { // in case the first element in the anchorTexts is empty, move to second one to get the data
                        name: anchorTexts[0] === '' ? anchorTexts[2] : anchorTexts[1],
                        text: anchorTexts[0] === '' ? anchorTexts[1] : anchorTexts[0],
                    };
                });
            });

            await browser.close(); // close the browser

            return data; // and return the data

        } catch (error) {
            console.error('Error:', error);
            return null; // returning null in case we couldn't get any data. This is made so we won't miss up with the other functions
        }
    }

    async function addDatabase(datas) {

        const User = new database; // create a new database object

        if (datas === null) { // make sure we have scrapped data to proceed
            return;
        }

        for (let i = 0; i <= datas.length; i++) { // loop over the data we scrapped to validate them and add them to our database
            if (datas[i] == undefined || datas[i] == undefined) { continue } // if any of either the name or the quote is undefined, skip the current loop
            if (datas[i].name.toString() === datas[i].text.toString()) { // if in a mistake, the name and the quote were the same, skip the current loop
                continue;
            }
            User.add(datas[i].name , datas[i].text); // finally, if the data passed our tests, pass it to the database
        }

        User.removeDuplicates(); // in case we scrapped the same data, remove the duplicates
    }

    let quotes;

    (async () => {
        try {
            // in this first function, we will get all the links for the quote genres
            // e.g. life, death, wisdom, work, etc
            const website = "https://www.brainyquote.com/topics";
            const browser = await puppeteer.launch({headless: false}); // launch puppeteer to scrap the website
            const page = await browser.newPage(); // create a new page
            await page.goto(website); // go to the website

            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a')).map(a => a.href); // get all the links on the website
            });

            const halfLinks = links.slice(20); // remove the first 20 non-quote links (subjects) 
            const quoteLinks = halfLinks.slice(0, halfLinks.length - 236); // remove the last 236 non-quote links

            quotes = quoteLinks;

            await browser.close(); // close the browser
            const textQuotes = await getRandomSites(quotes); // start opening a random quote subject and scrap the quotes
            
            addDatabase(textQuotes); // add the quotes we scrapped to the database

        } catch (error) {
            console.error('Error:', error);
        }
    })();
}

module.exports = getQuotes;