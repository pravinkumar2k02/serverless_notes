const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FILE_PATH = path.join(__dirname, '../../notes.json'); // Path to notes.json

function generateKeyIV(userKey, iv = null) {
  const key = crypto.createHash('sha256').update(userKey).digest().slice(0, 32); // 256-bit key
  return iv ? { key, iv: Buffer.from(iv, 'hex') } : { key, iv: crypto.randomBytes(16) }; // 128-bit IV
}

function decryptJSON(encryptedData, userKey) {
  const { key, iv } = generateKeyIV(userKey, encryptedData.iv);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
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
    const encryptedData = JSON.parse(fileContent);

    const isDecrypted = !!encryptedData.encryptedData;

    if (isDecrypted) {
      const decryptedData = decryptJSON(encryptedData, userKey);
      fs.writeFileSync(FILE_PATH, JSON.stringify(decryptedData, null, 2), 'utf8');
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Decrypted JSON data has been saved to notes.json', isDecrypted: true }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'File is already decrypted', isDecrypted: false }),
      };
    }
  } catch (error) {
    console.error('Error decrypting JSON data:', error);
    return {
      statusCode: 500,
      body: 'Error decrypting JSON data',
    };
  }
};
