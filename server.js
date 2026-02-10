const { createServer } = require('http');
const next = require('next');
const fs = require('fs');
const path = require('path');
const url = require('url');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    // Handle /uploads/ requests manually to serve from D:\uploads
    // Use toLowerCase() to ensure case-insensitive matching
    if (pathname.toLowerCase().startsWith('/uploads/')) {
      let fileName;
      try {
        // Decode the file name to handle Thai characters correctly
        // Remove '/uploads/' case-insensitively
        fileName = decodeURIComponent(pathname.substring(9)); // 9 is length of '/uploads/'
      } catch (e) {
        console.error('Malform URL:', pathname);
        res.statusCode = 400;
        res.end('Bad Request');
        return;
      }
      const filePath = path.join('D:\\uploads', fileName);

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          res.statusCode = 404;
          res.end('File not found');
          return;
        }

        const readStream = fs.createReadStream(filePath);
        // Simple mime-type handling (optional, but good for browsers)
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.pdf') contentType = 'application/pdf';

        res.setHeader('Content-Type', contentType);
        readStream.pipe(res);
      });
      return;
    }

    handle(req, res).catch(err => {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    });
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });
});