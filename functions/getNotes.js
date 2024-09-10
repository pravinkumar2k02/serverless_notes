const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../data/notes.json'); // Path to notes.json

exports.handler = async function(event, context) {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return {
      statusCode: 200,
      body: data,
    };
  } catch (err) {
    console.error('Error reading notes:', err);
    return {
      statusCode: 500,
      body: 'Error reading notes',
    };
  }
};
