var http = require("http");
/*http.createServer(function(req, res) {
 res.writeHead( 200 , {"Content-Type":"text/html"});
 res.write("<h1>Node.js</h1>");
 res.write("<p>Hello World</p>");
 res.end("<p>beyondweb.cn</p>");
 }).listen(3000);
 console.log("HTTP server is listening at port 3000.");*/
var fs =require('fs');
http.createServer(function(req, res) {
	res.writeHead(200,{'Content-Type':'image/png'});
	fs.createReadStream('./image.png').pipe(res);
}).listen(3000);
console.log('Server running at http://localhost:3000')