const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require('pino');
const {
    default: Malvin_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');

// Function to remove temp session folder
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// Define multiple browser profiles for better connection
const browserOptions = [
    Browsers.macOS('Chrome'),
    Browsers.macOS('Safari'),
    Browsers.macOS('Edge'),
    Browsers.windows('Chrome'),
    Browsers.windows('Firefox'),
    Browsers.windows('Edge'),
    Browsers.ubuntu('Chrome'),
    Browsers.ubuntu('Firefox'),
];

// Pick a random browser each run
function getRandomBrowser() {
    return browserOptions[Math.floor(Math.random() * browserOptions.length)];
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    
    async function Malvin_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Pair_Code_By_Malvin_Tech = Malvin_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(
                        state.keys,
                        pino({ level: 'fatal' }).child({ level: 'fatal' })
                    ),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: getRandomBrowser(), // 👈 randomized browser
            });

            if (!Pair_Code_By_Malvin_Tech.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_Malvin_Tech.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Pair_Code_By_Malvin_Tech.ev.on('creds.update', saveCreds);
            Pair_Code_By_Malvin_Tech.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');
                    let session = await Pair_Code_By_Malvin_Tech.sendMessage(
                        Pair_Code_By_Malvin_Tech.user.id,
                        { text: 'RIAM~' + b64data }
                    );

                    let Star_MD_TEXT = `*Hello there Riam User! 👋🏻* 

> Do not share your session id with your gf 😂.

 *Thanks for using 👑Queen Riam🚩* 

> Join WhatsApp Channel :- ⤵️
 
https://whatsapp.com/channel/0029Va8YUl50bIdtVMYnYd0E

Dont forget to fork the repo ⬇️

https://github.com/Dev-Kango/Queen-Riam

> *© Powered BY Hector Manuel 🖤*`;

                    await Pair_Code_By_Malvin_Tech.sendMessage(
                        Pair_Code_By_Malvin_Tech.user.id,
                        { text: Star_MD_TEXT },
                        { quoted: session }
                    );

                    await delay(100);
                    await Pair_Code_By_Malvin_Tech.ws.close();
                    return await removeFile('./temp/' + id);
                } else if (
                    connection === 'close' &&
                    lastDisconnect &&
                    lastDisconnect.error &&
                    lastDisconnect.error.output.statusCode != 401
                ) {
                    await delay(10000);
                    Malvin_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log('Service restarted');
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }
    
    return await Malvin_PAIR_CODE();
});

module.exports = router;
