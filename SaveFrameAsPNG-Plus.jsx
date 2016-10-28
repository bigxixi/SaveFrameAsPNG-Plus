//Script by bigxixi, contact xixi@bigxixi.com
(function ALL(thisObj)
{
	//提示文本
	//Tips
	var scriptName = "SaveFrameAsPNG Plus";
	var description = "Save current snapshot as PNG. CONTACT ME: xixi@bigxixi.com";
	var btn1text = "PNG with good Alpha";
	var btnhelptip1 = "Recommended";
	var btnhelptip2 = "A little faster but will generate black edges if your PNG has transparency";
	var btn2text = "PNG with bad Alpha";
	var savetip = "Choose a dictionary";
	var alert1 = "Please acive a composition.";
	var error1 = "Please run the script again.";
	var RQerr = "Render Queue is rendering item, please wait for it complete or stop it.";
	var endmsg = "Done!\nYour PNG file is here:\n";
	var CheckAccessTip = "Please check this option:\n'Preferences->General->Allow Scripts to Write Files and Access Network'";
	var scriptNotRun = "Fail to run the script, please try again!";
	//for Chinese users
	//如果你的AE是中文版。。。
	if($.locale.toLowerCase() == "zh_cn"){
		scriptName = "SaveFrameAsPNG Plus";
		description = "将当前画面另存为png截图，支持透明通道。\n联系我: xixi@bigxixi.com";
		btn1text = "无黑边PNG";
		btnhelptip1 = "推荐。生成的PNG文件保留完美透明度。";
		btn2text = "带黑边PNG";
		btnhelptip2 = "生成的透明PNG会有黑边，适合保存不透明PNG。";
		savetip = "选择存放路径。";
		alert1 = "请打开一个合成。";
		error1 = "请重新运行脚本。";
		RQerr = "渲染队列有正在渲染的项目，请等待渲染完成后继续。";
		endmsg = "导出成功！\nPNG文件在：\n";
		CheckAccessTip = "请勾选 ‘首选项’->'常规'->'允许脚本写入文件和访问网络'。"
		scriptNotRun = "脚本运行失败，请重新运行。";
	}
	//绘制UI
	//draw UI
	var drawUI = UI(thisObj);
	if(drawUI instanceof Window){
			drawUI.center();
			drawUI.show();
	}else{
		drawUI.layout.layout(true);
	}

	function UI(thisObj){
		var win = (thisObj instanceof Panel) ? thisObj : new Window("palette",scriptName,undefined);
		if(win != null){
		var dcp = win.add("statictext",undefined,description,{readonly:0,noecho:0,borderless:0,multiline:1,enterKeySignalsOnChange:0});
		var grp = win.add("group");
		var btn1 = grp.add("button",undefined,btn1text);
			btn1.helpTip = btnhelptip1;
		var btn2 = grp.add("button",undefined,btn2text);
			btn2.helpTip = btnhelptip2;
		var os = $.os.toLowerCase().indexOf('mac') >= 0 ? "mac": "win";
			btn1.onClick = function(){
				if(!app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY")){
					alert(CheckAccessTip);
					app.executeCommand(2359);
					return;
					}
				if((app.project.activeItem == null) || !(app.project.activeItem instanceof CompItem)){
						alert(alert1, scriptName);
					}else{
						//调整分辨率。如果不是“最佳”，则存储当前分辨率并设置当前分辨率为最佳，然后恢复当前分辨率
						//if the resolution isnt 'Full', store current resolution and set to Full, then restore later;
						var res = [1,1];
						if(app.project.activeItem.resolutionFactor != "1,1"){
							res = app.project.activeItem.resolutionFactor;
							app.project.activeItem.resolutionFactor = [1,1];
							}
						var theLocation = File.saveDialog(savetip,"PNG Files:*.png;");
						if(theLocation!=null){
							//关闭渲染队列窗口
							//close the renderQueue panel
							app.project.renderQueue.showWindow(false);
							//转换路径中的非英文字符
							//show the correct charactar in the path
							theLocation = decodeURIComponent(theLocation);
							//备份一下渲染队列状态，然后把所有待渲染的项目的钩去掉
							//backup the render queue status, then uncheck the queued items
							var RQbackup = storeRenderQueue();
							if(RQbackup[RQbackup.length-1] == "rendering"){
								alert(RQerr);
							}else{
								//调用”帧另存为“命令，讲当前帧加至渲染队列
								//call command "save frame as" to add current frame to render queue
								app.executeCommand(2104);
								app.project.renderQueue.item(app.project.renderQueue.numItems).render = true;
								var templateTemp = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).templates;
								//调用隐藏模板"_HIDDEN X-Factor 16 Premul", 可输出带透明png
								//call hidden template '_HIDDEN X-Factor 16 Premul', which exports png with alpha
								var setPNG = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).templates[templateTemp.length-1];
								app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).applyTemplate(setPNG);
								app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).file = new File(theLocation);
								var finalpath = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).file.fsName;
								app.project.renderQueue.render();
								//事了拂衣去，深藏功与名
								//remove the rendered item and restored the render queue items
								app.project.renderQueue.item(app.project.renderQueue.numItems).remove();
								if(RQbackup != null){
									restoreRenderQueue(RQbackup);					
								}
								app.activeViewer.setActive();
								app.project.activeItem.resolutionFactor = res;
								//完成提示，并打开PNG文件所在文件夹
								//show alert and open the folder
								alert(endmsg + finalpath);
								finalpath = finalpath.substring(0,finalpath.lastIndexOf('/')+1);
								var openFolder = new Folder(finalpath);
								openFolder.execute();
							}
						}

					}
				}
				//内部函数法，快但有黑边，适合不透明图层
				//mathed two use the undocumented function "saveFrameToPng()" to get png.Faster and simpler than 
				//the regular one, but will generate black egdes if you render the freme with alpha.
				btn2.onClick=function(){
					var activeComp = app.project.activeItem;
					var theLocation = File.saveDialog(savetip,"PNG Files:*.png;");
					if(theLocation!=null){
						//转换路径中的非英文字符
						//show the correct charactar in the path
						theLocation = decodeURIComponent(theLocation);
						if(os=="win"){
							activeComp.saveFrameToPng(activeComp.time, File(theLocation));
							alert(endmsg + theLocation);
							var finalpath = theLocation.substring(0,theLocation.lastIndexOf('/')+1);
							var openFolder = new Folder(finalpath);
							openFolder.execute();
						}else{
							//防止重复添加png扩展名
							//prevent adding unnecessary extension name (.png.png)
							if(theLocation.substring(theLocation.lastIndexOf('.')+1,theLocation.length).toLowerCase() == "png"){
								theLocation = theLocation.substring(0,theLocation.lastIndexOf('.'));
								}
							activeComp.saveFrameToPng(activeComp.time, File(theLocation + ".png"));
							alert(endmsg + theLocation + ".png");
							var finalpath = theLocation.substring(0,theLocation.lastIndexOf('/')+1);
							var openFolder = new Folder(finalpath);
							openFolder.execute();
						}
					}
				}
				//备份渲染队列的函数
				//store the renderQ,return the index of active render items
				function storeRenderQueue(){
					var checkeds = [];
					for(var p = 1;p <= app.project.renderQueue.numItems; p++){
						if (app.project.renderQueue.item(p).status == RQItemStatus.RENDERING){
							checkeds.push("rendering");
							break;
						}else if(app.project.renderQueue.item(p).status == RQItemStatus.QUEUED){
								checkeds.push(p);
								app.project.renderQueue.item(p).render = false;
						}
					}
					return checkeds;
				}
				//恢复渲染队列的函数
				//restore the renderQ
				function restoreRenderQueue(checkedItems){
					for(var q = 0;q < checkedItems.length; q++){
						app.project.renderQueue.item(checkedItems[q]).render = true;
					}
				}
	}else{
			alert(scriptNotRun);
		}
		return win;
	}
})(this)
