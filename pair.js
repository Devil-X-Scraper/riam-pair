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

// Array of browser fingerprints
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

// Hardcoded Baileys version (ensure compatibility with WhatsApp as of this bot version)
const HARDCODED_VERSION = { version: [2, 3000, 2017531287] };

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function BASE64_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        let connectionClosed = false;
        try {
            // Use a random browser fingerprint
            let randomBrowser = browserOptions[Math.floor(Math.random() * browserOptions.length)];
            let sock = makeWASocket({
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
                if (connectionClosed) return;
                if (connection === 'open') {
                    await delay(2000);
                    try {
                        let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                        let b64data = Buffer.from(data).toString('base64');
                        let sent = await sock.sendMessage(sock.user.id, {
                            text: 'starcore~' + b64data
                        });
                        await sock.sendMessage(sock.user.id, { 
                            text: "✅ Session exported successfully!

Use this in your bot config."
                        }, { quoted: sent });
                    } catch (err) {
                        console.error("Error sending exported session or confirmation:", err.message);
                    }
                    await delay(500);
                    await sock.ws.close();
                    removeFile('./temp/' + id);
                    connectionClosed = true;
                    // Do NOT call process.exit(); just finish handler
                } 
                else if (connection === 'close') {
                    if (lastDisconnect?.error?.output?.statusCode !== 401) {
                        console.log("Connection closed (not logout). Not retrying to avoid spam.");
                        connectionClosed = true;
                        await sock.ws.close();
                        removeFile('./temp/' + id);
                    }
                }
            });
        } catch (err) {
            console.error('❌ Error in BASE64_PAIR_CODE:', err.message);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.send({ code: 'Service Currently Unavailable' });
            }
            // Do NOT call process.exit(); return gracefully
        }
    }

    return await BASE64_PAIR_CODE();
});

module.exports = router;
