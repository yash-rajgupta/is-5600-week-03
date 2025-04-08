const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();
const chatEmitter = new EventEmitter();

// Serve static files from the public folder
app.use(express.static(__dirname + '/public'));

/**
 * Responds with plain text
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
function respondText(req, res) {
  res.send('hi');
}

/**
 * Responds with JSON
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

/**
 * Responds with the input string in various formats
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
function respondEcho(req, res) {
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

/**
 * Serves the chat HTML page
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

/**
 * Receives chat message and emits it
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
function respondChat(req, res) {
  const { message } = req.query;
  if (message) {
    chatEmitter.emit('message', message);
  }
  res.end();
}

/**
 * Responds with a stream of server-sent events
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  });

  const onMessage = message => {
    res.write(`data: ${message}\n\n`);
  };

  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// Routes
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
