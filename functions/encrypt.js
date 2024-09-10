const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FILE_PATH = path.join(__dirname, '../build/notes.json'); // Path to notes.json

function generateKeyIV(userKey, iv = null) {
  const key = crypto.createHash('sha256').update(userKey).digest().slice(0, 32); // 256-bit key
  return iv ? { key, iv: Buffer.from(iv, 'hex') } : { key, iv: crypto.randomBytes(16) }; // 128-bit IV
}

function encryptJSON(content, userKey) {
  const { key, iv } = generateKeyIV(userKey);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(content), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
}

exports.handler = async function(event, context) {
  const { userKey } = JSON.parse(event.body);

  if (!userKey) {
    return {
      statusCode: 400,
      body: 'Missing userKey in request',
    };
  }

  try {
    const fileContent = fs.readFileSync(FILE_PATH, 'utf8');
    const jsonData = JSON.parse(fileContent);
    const encryptedData = encryptJSON(jsonData, userKey);

    fs.writeFileSync(FILE_PATH, JSON.stringify(encryptedData, null, 2), 'utf8');
    return {
      statusCode: 200,
      body: 'Encrypted JSON data has been saved to notes.json',
    };
  } catch (err) {
    console.error('Error reading or parsing the file:', err);
    return {
      statusCode: 500,
      body: 'Error reading or parsing the file',
    };
  }
};
