#!/usr/bin/env node

var connectionPool = [];

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(1337, function() {
    console.log((new Date()) + ' Server is listening on port 1337');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
	
	connection.id = Math.floor(Math.random()*1000000);
	
	connectionPool[connection.id] = connection;
	
    console.log((new Date()) + ' Connection accepted. origin: '+ request.url+' connection remote address: '+ connection.remoteAddress );
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
			
			var msg = JSON.parse(message.utf8Data);
			
			switch(msg.type) {
					case "setup":
						
						connection.name = msg.message.name;
						
						var userList = [];
						
						//create the user list and update connections with the new user
						for (var i in connectionPool) {							
							var tempUser = {id:connectionPool[i].id,
											name:connectionPool[i].name
										};
							userList.push(tempUser);
							
							if(connectionPool[i].id != connection.id){
								
								var newUser = {id:connection.id,
									name:connection.name
								};						
								
								var updateUserList = {
										type:"addUser",
										message:newUser
									}
								connectionPool[i].sendUTF(JSON.stringify(updateUserList));
							}
						}
						
						var response = {
								type:'setup',
								message:{id:connection.id,
										userList:userList
									}
							};
						
						connection.sendUTF(JSON.stringify(response));
						
						break;
						
					case "lobby-message":
					
						var response = {
							type:"lobby-message",
							message:msg.message,
							from:connection.name
						}
						
						console.log(JSON.stringify(response));
						
						for (var i in connectionPool) {							
							connectionPool[i].sendUTF(JSON.stringify(response));
						}
						break;
						
					case "whisper":
					
						var response = {
							type:"whisper",
							message:msg.message,
							from:msg.from,
							to:msg.to
						}
						
						console.log(JSON.stringify(response));
						console.log("CE PULA CALULUI");
						connectionPool[msg.from].sendUTF(JSON.stringify(response));
						connectionPool[msg.to].sendUTF(JSON.stringify(response));
							
						break;
						
					case "challange-request":
					
						var response = {
							type:"challange-request",
							message:msg.message,
							from:msg.from,
							to:msg.to
						}
						
						connectionPool[msg.from].sendUTF(JSON.stringify(response));
						connectionPool[msg.to].sendUTF(JSON.stringify(response));
							
						break;
						
					case "challange-accepted":
					
						var response = {
							type:"challange-accepted",
							message:msg.message,
							from:msg.from,
							to:msg.to
						}
						connectionPool[msg.from].sendUTF(JSON.stringify(response));
							
						break;
				  }			
			
			console.log('id: '+ this.id +' Received Message: ' + message.utf8Data);
			
			/*for (var i in connectionPool) {
				console.log('sent to id: '+ i);
				connectionPool[i].sendUTF(message.utf8Data);
			}*/
			
            
            //connection.
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
		delete connectionPool[connection.id];
								
		var removeUser = {
				type:"removeUser",
				message:connection.id
			}
			
		for (var i in connectionPool) {							
			connectionPool[i].sendUTF(JSON.stringify(removeUser));
		}
		
    });
});