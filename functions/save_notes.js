const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../notes.json');

exports.handler = async function (event, context) {
  const { notes } = JSON.parse(event.body);

  if (!notes) {
    return {
      statusCode: 400,
      body: 'Missing notes in request',
    };
  }

  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(notes, null, 2), 'utf8');
    return {
      statusCode: 200,
      body: 'Notes saved successfully',
    };
  } catch (err) {
    console.error('Error writing to notes file:', err);
    return {
      statusCode: 500,
      body: 'Error saving notes',
    };
  }
};
