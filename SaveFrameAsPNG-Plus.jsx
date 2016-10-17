//提示文本
//Tips
var scriptName = "SaveFrameAsPNG Plus";
var description = "Save current snapshot as PNG";
var btn1text = "PNG with good Alpha";
var btnhelptip1 = "Recommended";
var btnhelptip2 = "A little faster but will generate black edges if your PNG has transparency";
var btn2text = "PNG with bad Alpha";
var savetip = "Choose a dictionary";
var alert1 = "Please acive a composition.";
var error1 = "Please run the script again.";
var RQerr = "Render Queue is rendering item, please wait for it complete or stop it.";
var endmsg = "Done!\nYour PNG file is here:\n";
//for Chinese users
//如果你的AE是中文版。。。
if($.locale.toLowerCase() == "zh_cn"){
	scriptName = "SaveFrameAsPNG Plus";
	description = "将当前画面另存为png截图，支持透明通道。";
	btn1text = "无黑边PNG";
	btnhelptip1 = "推荐。生成的PNG文件保留完美透明度。";
	btn2text = "带黑边PNG";
	btnhelptip2 = "生成的透明PNG会有黑边，适合保存不透明PNG。";
	savetip = "选择存放路径。";
	alert1 = "请打开一个合成。";
	error1 = "请重新运行脚本。";
	RQerr = "渲染队列有正在渲染的项目，请等待渲染完成后继续。";
	endmsg = "导出成功！\nPNG文件在：\n";
}
//检查是否开启了脚本写入选项
//Check if the "Allow script to write files and access network" enabled
function checkAccess(){
	var thisFile = new File($.fileName);
	var wtestf = thisFile.path + "/tempfile";
	var wtest = new File(wtestf);
    try{
        wtest.open("w");
        wtest.write("test");
        wtest.remove(); 
        return 1;
    }catch(err){
        alert(err);
        wtest.remove(); 
        app.executeCommand(2359);
        return 0;
    }
}
//绘制UI
//draw UI
var mainPalette = new Window("palette",scriptName,undefined);
var dcp = mainPalette.add("statictext",undefined,description);
var grp = mainPalette.add("group");
var btn1 = grp.add("button",undefined,btn1text);
	btn1.helpTip = btnhelptip1;
var btn2 = grp.add("button",undefined,btn2text);
	btn2.helpTip = btnhelptip2;
mainPalette.show();
//判断操作系统
//check the OS
var os = $.os.toLowerCase().indexOf('mac') >= 0 ? "mac": "win";
var activeComp = app.project.activeItem;
//renderQ无黑边法（推荐），走普通渲染流程
//PNG with good alpha, which is the normal render way(recomanded)
btn1.onClick=function(){
	if (checkAccess()!=1) {
	    alert(error1);
	}else if((activeComp == null) || !(activeComp instanceof CompItem)){
		alert(alert1, scriptName);
	}else{
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
