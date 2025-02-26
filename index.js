import puppeteer from 'puppeteer';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config(); // Cargar las variables de entorno

const dataFile = 'data.json';

if (fs.existsSync(dataFile)) {
    fs.unlinkSync(dataFile);
    console.log("✅ Archivo data.json eliminado antes de la ejecución");
}

async function getDataFromWebPage(ip, name) {
    console.log(`🔍 Accediendo a ${name} (${ip})...`);
    const browser = await puppeteer.launch({ headless: true, defaultViewport: null, slowMo: 50 });
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

        const result = await contentsFrame.evaluate(() => {
            return {
                YellowToner: document.querySelector('#YellowToner')?.innerText.trim() || "0%",
                Magentatoner: document.querySelector('#Magentatoner')?.innerText.trim() || "0%",
                Cyantoner: document.querySelector('#Cyantoner')?.innerText.trim() || "0%",
                Blacktoner: document.querySelector('#Blacktoner')?.innerText.trim() || "0%"
            };
        });

        console.log(`📊 Datos obtenidos para ${name} (${ip}):`, result);

        await browser.close();
        return { name, ip, ...result };

    } catch (error) {
        console.error(`❌ Error en ${name} (${ip}):`, error.message);
        await browser.close();
        return null;
    }
}

(async () => {
    const printers = process.env.PRINTERS.split(',').map(printer => {
        const [ip, name] = printer.split(':');
        return { ip, name };
    });

    const results = [];

    for (const printer of printers) {
        const data = await getDataFromWebPage(printer.ip, printer.name);
        if (data) results.push(data);
    }

    fs.writeFileSync(dataFile, JSON.stringify(results, null, 2));
    console.log("\n📋 **Datos guardados en data.json**");
})();
