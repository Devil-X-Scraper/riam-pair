const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// browser fingerprints array
const browserOptions = [
    Browsers.macOS('Safari'),
    Browsers.macOS('Chrome'),
    Browsers.macOS('Edge'),
    Browsers.windows('Firefox'),
    Browsers.windows('Edge'),
    Browsers.windows('Chrome'),
    Browsers.ubuntu('Chrome'),
    Browsers.baileys('Baileys')
];

// Hardcoded WhatsApp Baileys version
const HARDCODED_VERSION = { version: [2, 3000, 2017531287] };

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function BASE64_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            // random browser selection for device fingerprint
            let randomBrowser = browserOptions[Math.floor(Math.random() * browserOptions.length)];

            let sock = makeWASocket({
                // explicitly set version for reliability
                version: HARDCODED_VERSION.version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(
                        state.keys,
                        pino({ level: 'fatal' }).child({ level: 'fatal' })
                    ),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: randomBrowser
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
                if (connection === 'open') {
                    await delay(2000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    let b64data = Buffer.from(data).toString('base64');
                    let sent = await sock.sendMessage(sock.user.id, {
                        text: 'starcore~' + b64data
                    });
                    await sock.sendMessage(sock.user.id, { 
                        text: "✅ Session exported successfully!

Use this in your bot config."
                    }, { quoted: sent });
                    await delay(500);
                    await sock.ws.close();
                    removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} session exported & process exited.`);
                    process.exit(0);
                } 
                else if (connection === 'close') {
                    if (lastDisconnect?.error?.output?.statusCode !== 401) {
                        console.log("Connection closed (not logout). Not retrying to avoid spam.");
                    }
                }
            });
        } catch (err) {
            console.error('❌ Error in BASE64_PAIR_CODE:', err.message);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.send({ code: 'Service Currently Unavailable' });
            }
            process.exit(1);
        }
    }

    return await BASE64_PAIR_CODE();
});

module.exports = router;
