// JavaScript Document

require (['text!templates/lobby_template.htm',
		'text!templates/whisper_template.htm',
		'text!templates/list_item_template.htm',
		'text!templates/game_container_template.htm'], 
		function(lobby, whisper, listItem, gameContainer) {
			ich.addTemplate('lobby',lobby);
			ich.addTemplate('whisper',whisper);
			ich.addTemplate('listItem',listItem);
			ich.addTemplate('gameContainer',gameContainer);
				
			var dialogDiv = $("<div id='dialog_content'>");
			var dialogLabel = $("<label>Name:</label>");
			var dialogInput = $("<input id='dialog_input'></input>");
			dialogLabel.appendTo(dialogDiv);
			dialogInput.appendTo(dialogDiv);
			
			dialogDiv.dialog({
			  resizable: false,
			  dialogClass: "no-close",
			  draggable: false,
			  closeOnEscape:false,
			  height:140,
			  modal: true,
			  close: function(){
				  $(this).dialog('destroy').remove();
			  },
			  buttons: {
				"Connect": function() {
					if($('#dialog_input').val()!=""){
						
						window.user = {};
						
						window.user.name = $('#dialog_input').val();						
						
						window.App = {};
						
						window.App.userModelPool = new Pool();
						
						window.App.viewWhisperPool = new Pool();
						
						window.App.viewLobbyPool = new Pool();
						
						window.App.commChannel = {};
						
						window.App.commandLauncher = new CommandLauncher();
						
						window.App.communicationManager = new CommunicationManager();
						
						var topDrawerInstance = new TopDrawer();
						topDrawerInstance.initialize();
						
						$( this ).dialog( "close" );
					}
						
				},
			  }
			});	
});