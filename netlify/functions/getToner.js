import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import chromium from 'chrome-aws-lambda';

dotenv.config();

export async function handler(event, context) {
    console.log("🔄 Ejecutando Puppeteer...");

    const printers = process.env.PRINTERS.split(',').map(printer => {
        const [ip, name] = printer.split(':');
        return { ip, name };
    });

    async function getDataFromWebPage(ip, name) {
        console.log(`🔍 Accediendo a ${name} (${ip})...`);
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        const page = await browser.newPage();

        try {
            await page.goto(`http://${ip}/?MAIN=TOPACCESS`, { waitUntil: 'networkidle2' });

            const frames = page.frames();
            const contentsFrame = frames.find(frame => frame.name() === "contents");

            if (!contentsFrame) {
                console.error(`❌ No se encontró el frame 'contents' en ${name} (${ip})`);
                await browser.close();
                return null;
            }

            await contentsFrame.waitForSelector('#YellowToner', { timeout: 5000 }).catch(() => {
                console.error(`⚠️ No se encontró '#YellowToner' en ${name} (${ip})`);
            });

            const result = await contentsFrame.evaluate(() => ({
                YellowToner: document.querySelector('#YellowToner')?.innerText.trim() || "0%",
                Magentatoner: document.querySelector('#Magentatoner')?.innerText.trim() || "0%",
                Cyantoner: document.querySelector('#Cyantoner')?.innerText.trim() || "0%",
                Blacktoner: document.querySelector('#Blacktoner')?.innerText.trim() || "0%"
            }));

            console.log(`📊 Datos obtenidos para ${name} (${ip}):`, result);
            await browser.close();
            return { name, ip, ...result };

        } catch (error) {
            console.error(`❌ Error en ${name} (${ip}):`, error.message);
            await browser.close();
            return null;
        }
    }

    const results = [];

    for (const printer of printers) {
        const data = await getDataFromWebPage(printer.ip, printer.name);
        if (data) results.push(data);
    }

    console.log("\n📋 **Datos recopilados con éxito**");

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(results, null, 2),
    };
}
