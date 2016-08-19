var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

//请求的文件不存在时发送404错误
function send404(response) {
	response.writeHead(404, {
		'Content-Type': 'text/plain'
	});
	response.write('Error 404:resource not found.');
	response.end();
}

//辅助函数提供文件数据服务
function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200, {
			"content-type": mime.lookup(path.basename(filePath))
		}
	);
	response.end(fileContents);
}

function serverStatic(response, cache, absPath) {
	if(cache[absPath]) { //檢查文件是否緩存在內存中
		sendFile(response, absPath, cache[absPath]); //从内存中返回文件
	} else {
		fs.exists(absPath, function(exists) { //检查文件是否存在
			if(exists) {
				fs.readFile(absPath, function(err, data) { //从硬盘中读取文件
					if(err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data); //从硬盘中读取文件并返回
					}
				});
			} else {
				send404(response); //发送http 404相应
			}
		});
	}
}

//创建http服务器
var server = http.createServer(function(request, response) {
	var filePath = false;
	if(request.url == '/') {
		filePath = 'public/index.html'; //确定返回的默认html文件
	} else {
		filePath = 'public' + request.url; //将url路径转为文件的相对路径
	}
	var absPath = './'+filePath;
	serverStatic(response, cache, absPath); //返回静态文件
})

//启动http服务器
server.listen(3000,function(){
	console.log('Server http://localhost:3000/');
})

//设置Socket.io
var chatServer = require('./lib/chat_server');

//启动Socket.io服务器
chatServer.listen(server);

