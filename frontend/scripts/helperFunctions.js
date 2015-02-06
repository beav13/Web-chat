// JavaScript Document

function UserModel(id, name){
	this.id = id;
	this.name = name;
	
	this.validConnection = true;
	
	this.set = function(attribute,value){
		this[attribute] = value;
		
		var name = 'change:'+attribute;
						
		$(this).trigger(name);
	}
	
	this.get = function(attribute){
		return this[attribute];
	}
}

function UserListView(model){
	this.model = model;
	
	this.id = this.model.id;
	this.name = this.model.name;
	
	var self = this;
		
	var domRepresentation = ich.listItem({id:this.id, name:this.name});
	
	this.el = domRepresentation;
	this.$el = $(domRepresentation);
	
	var options = [
			{
				"name":"Whisper",
				"command":"whisperCommand"
			},
			{
				"name":"Challenge",
				"options":	[
								{
									"name":"Tic Tac Toe",
									"options":	[
													{
														"name":"Tictactoe 3x3",
														"command":"sendChallangeCommand"
													},
													{
														"name":"Tictactoe 10x10",
														"command":"sendChallangeCommand"
													}
												]
								},
								{
									"name":"Pong",
									"command":"sendChallangeCommand"
								},
							]
			}
		];
	
	this.$el.bind("contextmenu",function(e){		
		
		if(window.user.name != self.name){
			self.$el.contextMenu(e,options,"contextmenu","body");
		}
		
		return false;
	});
	
	this.$el.hover(function(){
			self.$el.css('background-color','yellow');
		},
			function(){
				self.$el.css('background-color','');
	});
	
	this.$el.dblclick(function() {
		self.showWhisper();		
	});
	
	this.$el.click(function(e) {
		if(window.user.name != self.name){
			self.$el.contextMenu(e,options,"contextmenu","body");
		}
		
		return false;
	});
	
	this.showWhisper = function(){
		if(self.$el.attr('id') != window.user.id){
			var commandParam = {
								target:self.$el.attr('id')
							}
			
			$(window.App.commChannel).trigger('launchCommand',['whisperCommand',commandParam]);
		}
	}
	
	$(this.model).on('change:validConnection',function(){
			if(!self.model.get('validConnection')){
				self.$el.remove();
			}
		});
}

function UserWhisperView(model){
	this.model = model;
	
	this.id = this.model.id;
	this.name = this.model.name;
	
	this.highlighted = null;
	
	var self = this;
		
	var domRepresentation = ich.whisper({id:"w_"+this.id, name:this.name});	
	this.el = domRepresentation;
	this.$el = $(domRepresentation);
						
	this.$el.resizable({
		minWidth:250,
		minHeight:250,
	}).draggable({
		scroll:false,
		containment: '.appContainer'
	}).css('position','absolute');
						
	this.$el.find('.minimize_button').click(function(){		
		if(!self.$el.attr('minimized') || (self.$el.attr('minimized') == 'false')){
			self.$el.resizable('destroy');
			self.$el.attr('minimized',true);
			
			self.$el.attr('normalWidth',self.$el.css('width'));
			self.$el.attr('normalHeight',self.$el.css('height'));
			
			self.$el.find('.chat_content').css('display','none');
			
			self.$el.attr('minWidth',self.$el.css('min-width'));
			self.$el.attr('minHeight',self.$el.css('min-height'));
			
			self.$el.css('min-width','130px');
			self.$el.css('min-height','25px');
			
			self.$el.css('width','130px');
			self.$el.css('height','25px');
		}else {
			self.$el.attr('minimized', false);
			self.$el.find('.chat_content').css('display','block');
			
			self.$el.css('min-width',self.$el.attr('minWidth'));
			self.$el.css('min-height',self.$el.attr('minHeight'));
			
			self.$el.css('width',self.$el.attr('normalWidth'));
			self.$el.css('height',self.$el.attr('normalHeight'));
			
			self.$el.resizable({
					minWidth:400,
					minHeight:300,
					});
			self.$el.find('.to_send').focus();
		}
	});
	
	this.$el.find('.close_button').click(function(){
		if(self.$el.hasClass('front')){
			self.$el.removeClass('front');	
		}
		self.$el.hide();
	});
	
	this.$el.mousedown(function(){
		if(!self.$el.hasClass('front')){
		
			var frontElement = $('.front');
		
			if(frontElement.length > 0){
				frontElement.removeClass('front');
			}
			
			self.$el.addClass('front');	
		}
		if(self.highlighted != null){
				clearInterval(self.highlighted);
				self.highlighted = null
				if(self.$el.hasClass('highlight')){
					self.$el.removeClass('highlight');
				}
		}
		self.$el.find('.to_send').focus();
	});
	
	this.$el.find('.send_button').click(function(){
		self.sendMessage();
	});
	
	this.$el.find('.to_send').on('keypress', function(e){
			if (e.which == 13) {
				e.preventDefault();
				e.stopPropagation();
				self.sendMessage();
			}
		});
		
	this.sendMessage = function(){
		var sendData = {
					type:'whisper',
					to:self.id,
					from:window.user.id,
					message:encodeURIComponent(self.$el.find('.to_send').val())
				};
		$(window.App.commChannel).trigger('sendMessage',[sendData]);		
		//window.App.communicationManager.socket.send(JSON.stringify(sendData));
		self.$el.find('.to_send').val('');
	}
		
	this.appendMessage = function(from, message){
		var textArea = this.$el.find('.chat_zone');
		textArea.val(textArea.val() + '\n'+ from +': ' + decodeURIComponent(message));
		textArea.scrollTop(textArea[0].scrollHeight);
							
		if(this.highlighted == null 
				&& !this.$el.hasClass('front')){
					this.highlighted = setInterval(function(){
							self.$el.toggleClass('highlight');
					},2000);
				}
	}
	
	$(this.model).on('change:validConnection',function(){
			self.appendMessage('Server', '\n User disconected from server.');
			self.$el.find('#to_send').attr('disabled',true);
			self.$el.find('#send_button').attr('disabled',true);
		});
}

function GameContainerView(iFrame, name, width, height){
	
	this.highlighted = null;
	
	var self = this;
		
	var domRepresentation = ich.gameContainer({name:name});	
	this.el = domRepresentation;
	this.$el = $(domRepresentation);
	
	this.$el.css("width",width);
	this.$el.css("height",height);
	this.$el.find(".game_content").append(iFrame);
						
	this.$el.draggable({
		scroll:false,
		containment: '.appContainer',
		start:function(){
			var divt=document.createElement('div');
			$(divt).attr('id','tempdragdiv');
			 divt.style.height='93%';
			divt.style.width='100%';
			$(divt).css('position','absolute').css('left','0')  .css('top','0');                    
			self.$el.append(divt);//div where is iframe
		},
		stop:function(){
			self.$el.find('#tempdragdiv').remove();
		}
	}).css('position','absolute');
						
	this.$el.find('.minimize_button').click(function(){		
		if(!self.$el.attr('minimized') || (self.$el.attr('minimized') == 'false')){
			self.$el.attr('minimized',true);
			
			self.$el.attr('normalWidth',self.$el.css('width'));
			self.$el.attr('normalHeight',self.$el.css('height'));
			
			self.$el.find('.game_content').css('display','none');
			
			self.$el.attr('minWidth',self.$el.css('min-width'));
			self.$el.attr('minHeight',self.$el.css('min-height'));
			
			self.$el.css('min-width','200px');
			self.$el.css('min-height','25px');
			
			self.$el.css('width','200px');
			self.$el.css('height','25px');
		}else {
			self.$el.attr('minimized', false);
			self.$el.find('.game_content').css('display','block');
			
			self.$el.css('min-width',self.$el.attr('minWidth'));
			self.$el.css('min-height',self.$el.attr('minHeight'));
			
			self.$el.css('width',self.$el.attr('normalWidth'));
			self.$el.css('height',self.$el.attr('normalHeight'));			
		}
	});
	
	this.$el.find('.close_button').click(function(){
		if(self.$el.hasClass('front')){
			self.$el.removeClass('front');	
		}
		self.$el.remove();
	});
	
	this.$el.mousedown(function(){
		if(!self.$el.hasClass('front')){
		
			var frontElement = $('.front');
		
			if(frontElement.length > 0){
				frontElement.removeClass('front');
			}
			
			self.$el.addClass('front');	
		}
		if(self.highlighted != null){
				clearInterval(self.highlighted);
				self.highlighted = null
				if(self.$el.hasClass('highlight')){
					self.$el.removeClass('highlight');
				}
		}
	});
}

function LobbyModel(id, name){
	this.id = id;
	this.name = name;
	
	this.set = function(attribute,value){
		this[attribute] = value;
		
		var name = 'change:'+attribute;
						
		$(this).trigger(name);
	}
	
	this.get = function(attribute){
		return this[attribute];
	}
}

function LobbyView(model){
	this.model = model;
	
	this.id = this.model.id;
	this.name = this.model.name;
	
	var self = this;
		
	var domRepresentation = ich.lobby({id:this.id, name:this.name});	
	this.el = domRepresentation;
	this.$el = $(domRepresentation);
							
	this.$el.resizable({
		minWidth:400,
		minHeight:300,
	}).draggable({
			scroll:false,
			containment:'.appContainer'
		}).css('position','absolute');
						
	this.$el.find('.minimize_button').click(function(){		
		if(!self.$el.attr('minimized') || (self.$el.attr('minimized') == 'false')){
			self.$el.resizable('destroy');
			self.$el.attr('minimized',true);
			
			self.$el.attr('normalWidth',self.$el.css('width'));
			self.$el.attr('normalHeight',self.$el.css('height'));
			
			self.$el.find('.chat_content').css('display','none');
			
			self.$el.attr('minWidth',self.$el.css('min-width'));
			self.$el.attr('minHeight',self.$el.css('min-height'));
			
			self.$el.css('min-width','130px');
			self.$el.css('min-height','25px');
			
			self.$el.css('width','130px');
			self.$el.css('height','25px');
		}else {
			self.$el.attr('minimized', false);
			self.$el.find('.chat_content').css('display','block');
			
			self.$el.css('min-width',self.$el.attr('minWidth'));
			self.$el.css('min-height',self.$el.attr('minHeight'));
			
			self.$el.css('width',self.$el.attr('normalWidth'));
			self.$el.css('height',self.$el.attr('normalHeight'));
			
			self.$el.resizable({
					minWidth:400,
					minHeight:300,
					});
			self.$el.find('.to_send').focus();
		}
	});
		
	this.$el.mousedown(function(e){
		if(!self.$el.hasClass('front')){
		
			var frontElement = $('.front');
		
			if(frontElement.length > 0){
				frontElement.removeClass('front');
			}
			
			self.$el.addClass('front');	
		}
		if(!$(e.target).hasClass("listItem")){
			self.$el.find('.to_send').focus();
		}		
	});
	
	this.$el.find('.send_button').click(function(){
		self.sendMessage();
	});
	
	this.$el.find('.to_send').on('keypress', function(e){
			if (e.which == 13) {
				e.preventDefault();
				e.stopPropagation();
				self.sendMessage();
			}
	});
	
	this.sendMessage = function(){
		var sendData = {
					type:'lobby-message',
					message:encodeURIComponent(self.$el.find('.to_send').val())
		};
		$(window.App.commChannel).trigger('sendMessage',[sendData]);
		//window.App.communicationManager.socket.send(JSON.stringify(sendData));
		self.$el.find('.to_send').val('');
	}
		
	this.appendMessage = function(from, message){
		var lobby_text = this.$el.find('.chat_zone');
		lobby_text.val(lobby_text.val() + '\n'+ from +': ' + decodeURIComponent(message));
		lobby_text.scrollTop(lobby_text[0].scrollHeight);
	}
	
	this.appendUserView = function(userEl){
		this.$el.find('.user_list ul').append(userEl);
	}
	
	this.removeUser = function(id){
		if(this.model.userArray[id]){
			//this.model.userArray[id].set('validConnection',false);
			//this.model.userModelArray[id] = null;
			delete this.model.userArray[id];
		}
	}
}

function CommunicationManager(){
	
	this.initialize = function(){
				
		var socketPath = "ws://" + window.location.hostname + ":1337";
		this.socket = new WebSocket(socketPath, "echo-protocol");
		
		var self = this;
		
		this.socket.addEventListener("open", function(event) {
			var requestData = {
					type:'setup',
					message:{name:window.user.name}
					};
			self.socket.send(JSON.stringify(requestData));
		});
						
		this.socket.addEventListener("message", function(event) {
			var message = JSON.parse(event.data);
			switch(message.type) {
				case "setup":
					window.user.id = message.message.id;
					
					for(var i in message.message.userList){
						var tempUserModel = new UserModel(message.message.userList[i].id, message.message.userList[i].name);
						window.App.userModelPool.addObject(tempUserModel);
					}
					
					var tempLobbyModel = new LobbyModel('lobby', 'Lobby');
										
					var tempLobbyView = new LobbyView(tempLobbyModel);
					
					var tempUserIds = window.App.userModelPool.getAllObjectIds();
					
					for (var i in tempUserIds) {
				
						var tempUserListView = new UserListView(window.App.userModelPool.getObjectById(tempUserIds[i]));
												
						tempLobbyView.appendUserView(tempUserListView.el);
					}
					
					window.App.viewLobbyPool.addObject(tempLobbyView);
					
					$('.appContainer').append(tempLobbyView.el);
					break;	
									
				case "addUser":
					var tempUserModel = new UserModel(message.message.id,message.message.name);
				
					window.App.userModelPool.addObject(tempUserModel);
					
					var tempUserListView = new UserListView(tempUserModel);
					
					window.App.viewLobbyPool.getObjectById('lobby').appendUserView(tempUserListView.el);
				break;
								
				case "removeUser":	
					window.App.userModelPool.getObjectById(message.message).set('validConnection',false);
					window.App.userModelPool.removeObject(message.message);
				break;		
									
				case "lobby-message":
					window.App.viewLobbyPool.getObjectById('lobby').appendMessage(message.from, message.message);
				break;
				
				case "whisper":
				
					var commandParam;
				
					if(message.from != window.user.id){					
						commandParam = {
								target:message.from,
								initiator:message.from,
								message:message.message
							}
					}else{
						commandParam = {
								target:message.to,
								initiator:message.from,
								message:message.message
							}
					}
					
					$(window.App.commChannel).trigger('launchCommand',['whisperCommand',commandParam]);
				break;
				
				case "challange-request":
				
					var commandParam;
					commandParam = {
							target:message.to,
							initiator:message.from,
							message:message.message
						}
					$(window.App.commChannel).trigger('launchCommand',['challangeDialogCommand',commandParam]);
				break;
				
				case "challange-accepted":
				
					var commandParam;
					commandParam = {
							target:message.to,
							initiator:message.from,
							message:message.message
						}
					$(window.App.commChannel).trigger('launchCommand',[message.message,commandParam]);
				break;
				}
		});
		
		this.sendMessage = function(e,arg){
			self.socket.send(JSON.stringify(arg));
		}
		
		$(window.App.commChannel).on('sendMessage',this.sendMessage);
						
		// Display any errors that occur
		this.socket.addEventListener("error", function(event) {
			alert('An error has occured.');
		});
						
		this.socket.addEventListener("close", function(event) {
			alert('Server disconnected');
			var tempIds = window.App.viewWhisperPool.getAllObjectIds();
			for(var i in tempIds){
				window.App.viewWhisperPool.getObjectById(tempIds[i]).$el.hide();
			}
			window.App.viewLobbyPool.getObjectById('lobby').$el.hide();
		});
	
	}	
	this.initialize();
}

function CommandLauncher(){
	
	var self = this;
	
	this.launchCommand = function(e, commandName, commandParameters){
		//console.log('launch command: '+name);
		try{
			self[commandName](commandParameters);
		}
		catch(e){
			console.log('lipseste functia deocamdata');
		}
	}

	this.whisperCommand = function(commandParameters){
						
		if(window.App.viewWhisperPool.getObjectById(commandParameters.target)){
			window.App.viewWhisperPool.getObjectById(commandParameters.target).$el.show();
		} else{
			var tempWhisperView = new UserWhisperView(window.App.userModelPool.getObjectById(commandParameters.target));
			window.App.viewWhisperPool.addObject(tempWhisperView);
								
			$('.appContainer').append(tempWhisperView.el);
		}
		
		if(commandParameters.message){
			window.App.viewWhisperPool.getObjectById(commandParameters.target).appendMessage(window.App.userModelPool.getObjectById(commandParameters.initiator).get('name'), commandParameters.message);
		}
	}
	
	this.sendChallangeCommand = function(commandParameters){
		
		var sendData = {
					type:'challange-request',
					to:commandParameters.target,
					from:commandParameters.initiator,
					message:commandParameters.game
				};
		$(window.App.commChannel).trigger('sendMessage',[sendData]);
		
	}
	
	this.challangeDialogCommand = function(commandParameters){
		
		if(commandParameters.initiator != window.user.id){
			
			var name = window.App.userModelPool.getObjectById(commandParameters.initiator).name;
			
			var question = name + " has challanged you to a game of " + commandParameters.message + ".\n" + "Do you accept?";
			
			$("<div id='dialog-challange-content'></div>").text(question).dialog({
			   resizable: false,
			   draggable: false,
			   closeOnEscape:true,
			   width: 300,
			   height:200,
			   modal: true,
			   close: function(){
				   $(this).dialog('destroy').remove();
			   },
			   buttons: {
				"Yes": function() {
						$(this).dialog('destroy').remove();
						
						var command;
						
						switch(commandParameters.message){
							case "Tictactoe 3x3":
								command = "tictactoe3x3Command"
							break;
							case "Tictactoe 10x10":
								command = "tictactoe10x10Command"
							break;
							case "Pong":
								command = "pongCommand";
							break;
						}
						self[command](commandParameters);
						
						var sendData = {
							type:'challange-accepted',
							to:commandParameters.target,
							from:commandParameters.initiator,
							message:command
						};
						$(window.App.commChannel).trigger('sendMessage',[sendData]);
					},
				"No": function(){
						$(this).dialog('destroy').remove();
					}
			   }
			 });
		}else{
			var question = "The user has been challanged to a game of " + commandParameters.message + ".\n" + "Please wait until the user responds.";
			$("<div id='dialog-challange-content'></div>").text(question).dialog({
			   resizable: false,
			   draggable: false,
			   closeOnEscape:true,
			   width: 300,
			   height:200,
			   modal: true,
			   close: function(){
				   $(this).dialog('destroy').remove();
			   },
			   buttons: {
				"OK": function() {
						$(this).dialog('destroy').remove();
					}
			   }
			 });
		}
		
	}
	
	this.tictactoe3x3Command = function(commandParameters){
		var ifrm = document.createElement("IFRAME"); 
	    //ifrm.setAttribute("src", "http://localhost/tictactoe/tictactoe.html?gameMode=internet"); 
		var opponentId = (window.user.id == commandParameters.initiator)?commandParameters.target:commandParameters.initiator;
		var src = "../Tictactoe/tictactoe.html?gameMode=internet&me=" + window.user.id + "&opponent=" + opponentId + "&gameType=3x3";
		//alert(src);
		ifrm.setAttribute("src", src); 
	    ifrm.style.width = 908+"px"; 
	    ifrm.style.height = 705+"px"; 
		
		var name = "Tic Tac Toe vs. "+ window.App.userModelPool.getObjectById(opponentId).name;
		
		var g = new GameContainerView(ifrm, name, "930px", "745px");
		
		$('.appContainer').append(g.el);
		
		var frontElement = $('.front');
		
		if(frontElement.length > 0){
			frontElement.removeClass('front');
		}
			
		g.$el.addClass('front');
	}
	
	this.tictactoe10x10Command = function(commandParameters){
		var ifrm = document.createElement("IFRAME"); 
	    //ifrm.setAttribute("src", "http://localhost/tictactoe/tictactoe.html?gameMode=internet"); 
		var opponentId = (window.user.id == commandParameters.initiator)?commandParameters.target:commandParameters.initiator;
		var src = "../Tictactoe/tictactoe.html?gameMode=internet&me=" + window.user.id + "&opponent=" + opponentId + "&gameType=10x10";
		//alert(src);
		ifrm.setAttribute("src", src); 
	    ifrm.style.width = 733+"px"; 
	    ifrm.style.height = 525+"px"; 
		
		var name = "Tic Tac Toe vs. "+ window.App.userModelPool.getObjectById(opponentId).name;
		
		var g = new GameContainerView(ifrm, name, "750px", "570px");
		
		$('.appContainer').append(g.el);
		
		var frontElement = $('.front');
		
		if(frontElement.length > 0){
			frontElement.removeClass('front');
		}
			
		g.$el.addClass('front');	
	}
	
	this.pongCommand = function(commandParameters){
		var ifrm = document.createElement("IFRAME");
	    //ifrm.setAttribute("src", "http://localhost/tictactoe/tictactoe.html?gameMode=internet"); 
		var opponentId = (window.user.id == commandParameters.initiator)?commandParameters.target:commandParameters.initiator;
		var src = "../Pong/pong.html?gameMode=internet&me=" + window.user.id + "&opponent=" + opponentId;
		//alert(src);
		ifrm.setAttribute("src", src); 
	    ifrm.style.width = 930+"px"; 
	    ifrm.style.height = 520+"px"; 
		
		var name = "Pong vs. "+ window.App.userModelPool.getObjectById(opponentId).name;
		
		var g = new GameContainerView(ifrm, name, "950px", "560px");
		
		$('.appContainer').append(g.el);
		
		var frontElement = $('.front');
		
		if(frontElement.length > 0){
			frontElement.removeClass('front');
		}
			
		g.$el.addClass('front');	
	}
	
	$(window.App.commChannel).on('launchCommand',this.launchCommand);
}

function Pool(){
	
	var objectPool = [];
	
	this.addObject = function(object){
		objectPool[object.id] = object;
	}
	
	this.getObjectById = function(id){
		return objectPool[id];
	}
	
	this.removeObject = function(id){
		delete objectPool[id];
	}
	
	this.getAllObjectIds = function(){
		var idsArray = [];
		for(var i in objectPool){
			idsArray.push(objectPool[i].id);
		}
		return idsArray;
	}
	
}

function TopDrawer(){
	
	var self = this;
	
	var initialized = false;
	
	var innerObjectListData = [
							{imgLocation:"url('images/30x30_tictactoe_icon.png')",
							id:"ticTacToe_innerObject",
							lnk:"../Tictactoe/index.html",
							title:"Tic Tac Toe"
							},
							{imgLocation:"url('images/pong_icon.png')",
							id:"pong_innerObject",
							lnk:"../Pong/index.html",
							title:"Pong"
							},							
							];
	
	var innerObjectList = [];
	
	var domRepresentation = $("<div id='topDrawer' class='topDrawer'></div>");
	
	this.el = domRepresentation;
	this.$el = $(domRepresentation);
	
	this.initialize = function(){
		if(initialized)return;
		initialized = true;
		
		for(var i = 0 ; i < innerObjectListData.length ; i++){
			var innerObject = $("<div class='topDrawer_innerObject'></div>");
			var innerObjectJq = $(innerObject);
			
			innerObjectJq.attr("id",innerObjectListData[i].id);
			innerObjectJq.attr("index",i);
			innerObjectJq.attr("title",innerObjectListData[i].title);
			innerObjectJq.css("background-image",innerObjectListData[i].imgLocation);
			self.$el.append(innerObjectJq);
			
			innerObjectJq.click(function(e){
				window.open(innerObjectListData[$(this).attr('index')].lnk);
			});
			
			innerObjectList[i] = innerObjectJq;
		}
		
		var hoverHandler = function(e){
			self.$el.stop().animate({height:'40px'}, 'fast');
			for(var i = 0 ; i < innerObjectList.length ; i++){				
				innerObjectList[i].stop().animate({top:'0px',opacity:'1'}, 'slow');
			}
		}
		
		var unHoverHandler = function(e){
			for(var i = 0 ; i < innerObjectList.length ; i++){				
				innerObjectList[i].stop().animate({top:'-15px',opacity:'0'}, 'fast');
			}
			self.$el.stop().animate({height:'10px'},'slow');
		}
		
		var hoverCompleteHandler = function(){
			for(var i = 0 ; i < innerObjectList.length ; i++){				
				innerObjectList[i].css("display","inline-block");
			}
		}
		
		self.$el.hover(hoverHandler, unHoverHandler);
		
		$("body").append(this.el);
	}
}