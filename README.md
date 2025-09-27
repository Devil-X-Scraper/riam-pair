# 🔥 Starcore Session

**Ultra-Light Pair Session Generator for Baileys Bots**  
✨ *One-click authentication • Encrypted sessions • Cross-platform*
<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Black+Ops+One&size=70&pause=500&color=00BB00&center=true&width=1150&height=200&lines=PLEASE-FORK-STAR-SESSION-REPO" alt="Typing SVG" /></a>
  </div>
<a><img src='https://i.ibb.co/dsw0TXmj/malvin-xd.jpg?'/></a>

<p align="center">
  <a href="https://github.com/XdKing2"><img title="Developer" src="https://img.shields.io/badge/Author-Malvin%20King-FF00FF.svg?style=big-square&logo=github" /></a>
</p>

<div align="center">

<h1 align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=30&duration=6000&color=00FF00&background=000000&center=true&vCenter=true&width=600&lines=⚡+STAR+CORE+BETTER+OPTION;🔥+THE+MOST+POWERFUL+WHATSAPP+SESSION;💻+DEVELOPER+BY+MR+MALVIN;🚀+STARCORE-SESSION+SOLUTIONS;🌈+FAST+⚡+SECURE+🔒+RELIABLE+✅" alt="Typing Animation">
</h1>
  
[![WhatsApp Channel](https://img.shields.io/badge/Join-WhatsApp%20Channel-9ACD32?style=big-square&logo=whatsapp)](https://whatsapp.com/channel/0029VbB3YxTDJ6H15SKoBv3S)
</div>

---------


<p align="center">
<a href="https://github.com/XdKing2/starcore-session"><img title="PUBLIC-SESSION" src="https://img.shields.io/static/v1?label=Language&message=English&style=square&color=darkpink"></a> &nbsp;
  <img src="https://komarev.com/ghpvc/?username=starcore-session&label=VIEWS&style=square&color=blue" />
</p>
</p> 


<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js" alt="Node Version">
  <img src="https://img.shields.io/badge/Baileys-Compatible-blue?logo=whatsapp" alt="Baileys Compatible">
  <img src="https://img.shields.io/badge/License-MIT-red" alt="License">
</p>

---

## 🚀 Features
- **Base64 Session Support** (`starcore~` prefixed)  
- **Auto-Restore** after disconnections  
- **Encrypted Credential Storage**  
- **QR Code + Pairing Code Fallback**  



## Implementation Example
```
const fs = require('fs');
const path = require('path');

// Session directory setup
const sessionDir = path.join(__dirname, "./sessions");
const credsPath = path.join(sessionDir, "creds.json");

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

/**
 * Decodes and saves a base64 session (starcore~ prefixed)
 * @param {string} base64Session - Format: "starcore~BASE64_DATA"
 */
async function loadBase64Session(base64Session) {
  try {
    if (!base64Session.startsWith("starcore~")) {
      throw new Error("Invalid format: Session must start with 'starcore~'");
    }

    const base64Data = base64Session.replace("starcore~", "");
    
    // Validate base64
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      throw new Error("Invalid base64 characters detected");
    }

    // Decode and parse
    const decodedData = Buffer.from(base64Data, "base64");
    const sessionData = JSON.parse(decodedData.toString("utf-8"));

    // Save to file
    fs.writeFileSync(credsPath, decodedData);
    console.log("✅ Session decoded and saved successfully");
    return sessionData;

  } catch (error) {
    console.error("❌ Base64 session error:", error.message);
    return null;
  }
}

// Usage Example:
const config = {
  SESSION_ID: "starcore~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Your base64 session
};

if (config.SESSION_ID) {
  loadBase64Session(config.SESSION_ID).then(session => {
    if (!session) {
      console.log("🔄 Falling back to QR/pairing code");
      // Initiate normal auth flow here
    }
  });
}
```


## 📦 Installation
```bash
git clone https://github.com/XdKing2/starcore-session.git
cd starcore-session
npm install
