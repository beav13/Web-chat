// JavaScript Document

!function($) {

    $.fn.contextMenu = function(event,optionsModel,contextMenuId,appendTo,targetId) {

        return this.each(function() {
            
            (function() {
				
				$('#'+contextMenuId).remove();
				
				var target;
				
				if(!targetId){
					target = $(event.currentTarget).attr('id');
				}
				else{
					target = targetId;
				}

                var box= $('<div class="context_menu">').attr('id',contextMenuId).hide().appendTo(appendTo);
				
				var timer;

                var contentDiv = $('<ul>');
				
				for(var i in optionsModel){
					var tempLi = $('<li/>');
					if(optionsModel[i].link){
						var a = $('<a></a>');
						a.text(optionsModel[i].name);
						a.attr('href',optionsModel[i].link);
						a.attr('target','_blank');
						tempLi.append(a);
					}else{
						//var p = $('<div></div>');
						//p.text(optionsModel[i].name);
						//tempLi.append(p);
						tempLi.text(optionsModel[i].name);
					}
					
					tempLi.attr("index",i);
					
					if(optionsModel[i].options){
						var rightArrow = $('<div/>');
						rightArrow.html('&#9658;');
						rightArrow.css('float','right');
						tempLi.append(rightArrow);
					}
					
					if(optionsModel[i].command){
						tempLi.one('mousedown',function(e){
							
								var commandParam = {
													target:target,
													initiator:window.user.id,
													game:optionsModel[$(this).attr("index")].name
												}
								
								$(window.App.commChannel).trigger('launchCommand',[optionsModel[$(this).attr("index")].command,commandParam]);
								$(e.target).parentsUntil('body').remove();
								
							})
					}
					
					var parentClientX = 0;
					var parentClientY = 0;
					if(event.parentClientX && event.parentClientY){
						parentClientX += event.parentClientX;
						parentClientY += event.parentClientY;
					}
										
					tempLi.hover(
						function(){
								$(this).css('background-color','cyan');
								if(optionsModel[$(this).attr("index")].options){
									$(this).contextMenu({clientX:$(this).width()-4,
														clientY:$(this).position().top + 2,
														parentClientX:event.clientX + parentClientX,
														parentClientY:event.clientY + parentClientY}
														,optionsModel[$(this).attr("index")].options,"sub-contextmenu"+tempLi[0].firstChild.data.replace(/\s/g,"_"),'#'+contextMenuId,target);
								}
							}
						,function(){
								$(this).css('background-color','');
							}
						);
					
					tempLi.appendTo(contentDiv);
				}

                contentDiv.appendTo(box);
				
				box.css('width', 'auto');
                box.css('height', 'auto');
                box.css('position', 'absolute');
				
				//position the box
				
				var maxWidth = event.clientX + 10 + box.width();
				
				if(event.parentClientX) maxWidth += event.parentClientX;
				
				if(maxWidth < window.innerWidth){
					box.css('left', event.clientX + 10);
				}else {
					box.css('left', event.clientX - 10 - box.width());
				}
				
				var maxHeight = event.clientY + 10 + box.height();
				
				if(event.parentClientY) maxHeight += event.parentClientY;
				
				if(maxHeight < window.innerHeight){
					box.css('top', event.clientY+10);
				}else{
					box.css('top', event.clientY - 10 - box.height());
				}
								
				box.hover(function(){
					clearTimeout(timer);
				},function(){
					timer = setTimeout(function(){
							box.remove();
						},2000);
				});
				
				timer = setTimeout(function(){
							box.remove();
						},2000);
						
				$('.appContainer').one('mousedown',function(){box.remove()});
				
				box.show();
            })();

        });
    };
}(window.$);