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

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function BASE64_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(
                        state.keys,
                        pino({ level: 'fatal' }).child({ level: 'fatal' })
                    ),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: Browsers.macOS('Chrome')
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
                    // Wait to ensure creds are written
                    await delay(2000);

                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    let b64data = Buffer.from(data).toString('base64');

                    // Send Base64 session
                    let sent = await sock.sendMessage(sock.user.id, {
                        text: 'starcore~' + b64data
                    });

                    // Confirmation message
                    await sock.sendMessage(sock.user.id, { 
                        text: "✅ Session exported successfully!\n\nUse this in your bot config."
                    }, { quoted: sent });

                    // Cleanup & exit
                    await delay(500);
                    await sock.ws.close();
                    removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} session exported & process exited.`);
                    process.exit(0); // <— prevents repeated linking notifications
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
