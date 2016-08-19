var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nicknames={};
var namesUsed={};
var currentRoom={};


//启动Socket.IO服务器
exports.listen = function(server){
	io.socketio.listen(server); //启动socket.io服务器，允许他搭建在已有的http服务器上
	io.set('log lenven',1);
	io.sockets.on('connection',function(socket){ //定义每一个用户连接的处理逻辑
		guestNumber = assignGuestName(socket,guestNumber.nicknames.namesUsed); //在用户连接上来时，赋予其一个访问名
		joinRoom(socket,'Lobby'); //在用户连接上来时，把他放入聊天室Lobby里
		
		handleMessageBroadcasting(socket,nicknames); //处理用户的消息，更名以及聊天室的创建和变更
		handleNameChangeAttempts(socket,nicknames,namesUsed);
		handleRoomJoining(socket);
		
		socket.on('rooms',function(){ //用户发出请求时，向其提供已经被占用的聊天室的列表
			socket.emit('rooms',io.sockets.manager.rooms);
		});
		
		handleClentDisconnection(socket,nicknames,namesUsed); //定义用户断开连接后的消除逻辑
		
	});
	
};


//分配用户昵称
function assignGuestName(socket,guestNumber,nickNames,nameUsed){
	var name = "Guest" + guestNumber; //生成新昵称
	nickNames[socket.id] = name; //把用户昵称给客户端连接id关联上
	socket.emit('nameResult',{ //让用户知道他们的昵称
		success:true,
		name:name		
	});
	namesUsed.push(name); //存放已经被占用的昵称
	return guestNumber + 1; //增加用来生成昵称的计数器
	 
}


//与进入聊天室相关的逻辑
function joinRoom (socket,room){ 
	socket.join(room); //让用户进入房间
	currentRoom[socket.id] = room; //记录用户的当前房间 
	socket.emit('joinResult',{room:room}); //让用户知道他们进入了新房间
	
	socket.broadcast.to(room).emit('message',{ //让房间里的其他用户知道有新用户进入了房间
		text:nicknames[socket.id] + 'has joind'+ room +'.'
	});
	
	var usersInRoom = io.sockts.clients(room); //确定有哪些用户在这个房间里
	
	if(usersInRoom.length>1){ //如果不止一个用户在这个房间里，汇总下都是谁
		var userInRoomSummary = "Users currently in" + room +':';
		for(var index in usersInRoom){
			var userSocketId = usersInRoom[index].id;
			if(userSocketId != socket.id){
				if(index>0){
					userInRoomSummary += ',';
				}
				userInRoomSummary += nickNames[userSocketId];
			}
		}
		userInRoomSummary += '.';
		socket.emit('message',{text:userInRoomSummary}); //将房间里其他用户的汇总发送给这个用户
	}
}

//更名请求的处理逻辑
function handleNameChangeAttpmpts(socket,nicknames,nameUsed){
	//添加nameAtte-mpt 事件的监听器
	socket.on('nameAttempt',function(name){
		//昵称不能以Guest开头
		if(name.indexOf('Guest') == 0){
			socket.emit('nameResult',{
				success:false,
				message:'Names cannot begin with "Guest".'
			});
		}else{
			//如果昵称还没注册就注册上
			if(namesUsed.indexOf(name) == -1){
				var previousName = nicknames[socket.id];
				var previousNameIndex = namesUsed.indexOf(perviousName);
				namesUsed.push(name);
				nickNames[socket.id] = name;
				delete nameUsed[previousNameIndex]; //删除之前用的昵称，让其他用户可以使用
				socket.emit('nameResult',{
					success:true,
					name:name
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('message',{
					text:perviousName + 'is now known as' + name +'.'
				});
				
			}else{
				//如果昵称已经被占用，给客户端发送错误消息
				socket.emit('nameResult',{
					success:false,
					message:'That name is a already in use.'
				});
			}
		}
	});
}


//发送聊天消息
function handleMessageBroadcasting(socket){
	socket.on('message',function(message){
		socket.broadcast.to(message.room).emit('message',{
			text:nickNames[socket.id] + ':' + message.text
		});
	});
}


//创建房间
function handleRoomJoining(socket){
	socket.on('join',function(room){
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket,room.newRoom);
    // test
	});
}


//用户断开连接
function handleclientDisconnection(socket){
	socket.on('disconnect',function(){
		var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
		delete.nameUsed[nameIndex];
		delete nickNames[socket.id];
	})
}
