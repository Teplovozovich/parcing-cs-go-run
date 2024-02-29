const puppeteer = require('puppeteer');
const fs = require('fs');

let initialNumbers = [];

const parseLatestCrashHistory = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://csgorun.net/crash');

    const numbers = await page.evaluate(() => {
        const elements = document.querySelectorAll('a.crash-history-item');
        const recentElements = Array.from(elements).slice(0, 5);

        return recentElements.map(element => parseFloat(element.textContent.replace('X', '')));
    });

    await browser.close();

    return numbers;
};

const writeNumbersToFile = (number) => {
    const timestamp = new Date().toISOString(); // Add timestamp for each entry
    fs.appendFileSync('crashHistory.txt', `${number.toString().replace('.', ',')}\n`);
};

const checkAndParse = async () => {
    console.log('Starting to check and parse...');
    const latestNumbers = await parseLatestCrashHistory();

    if (initialNumbers.length === 0) {
        initialNumbers = latestNumbers;
    } else {
        for (let i = 0; i < 5; i++) {
            if (latestNumbers[i] !== initialNumbers[i] && latestNumbers[i] !== 0) {
                console.log(`Number ${latestNumbers[i]} has changed!`);
                initialNumbers = latestNumbers;
                writeNumbersToFile(latestNumbers[i]);
                break;
            }
        }
    }
};

checkAndParse();
setInterval(checkAndParse, 10000);
