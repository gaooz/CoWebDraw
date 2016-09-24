/**
 *  @description 客户端主控制器
 *  @date from 2015/12/18
 *  @author gaooz.com/CoWebDraw
 */
//===============================================================================
/**
 * @description 定义客户端需要的数据结构
 */
		//本地站点的id初始为-1，由服务器端决定。
	    var site_id = -1;
	    //本地颜色值
	    var site_color = "";
	    //本站点的状态向量
	    var sv = [0,0,0,0,0];
	    //本地站点绘图文档。存放所有绘图对象，绘图对象的位置与该对象的Z-INDEX值是相等的。
	    var doc = new Array();
	    //历史队列-存放所有insert操作
	    var hi = new Array();
	    //历史队列-存放所有delete操作
	    var hd = new Array();
	    //历史队列-存放所有update操作
	    var hu = new Array();
	    //本地站点的接收队列
	    var rq = new Array();
	    //定义全局的ws,负责与服务端进行通信。
	    var ws;
//===============================================================================
/**
 * @date 2015/12/18
 * @description 页面初始化加载的函数
 */
function init()
{
	//定义与服务端通信的socket变量
    ws = new WebSocket("ws://localhost:8080/CoWebDraw/CoWebDrawServer");
    //定义ws的回调函数
    ws.onopen = function() 
    {
    	//告诉服务器自己已经连上了
    	//ws.send("success");
    	//将信息显示在面板上
        document.getElementById("msgshow").innerHTML = "<p>[INFO]：Connecting to Server！</p>"+"<p>[INFO]：Synchronizing data...</p>";
        document.getElementById("msgshow").style.color = "#0000CD";
    };
    ws.onmessage = function(e) 
    {
    	/**
    	 * 
    	 * 服务端发来的消息是json格式的字符串
    	 */
    	var data = e.data;
    	console.log(data);
    	var json = eval("("+data+")");
    	if(json.type=="synchronous")
    	{
    		/**
    		 * 客户端第一次连接服务端时，服务端发来的同步消息
    		 * 用于初始化客户端的一些信息，格式：
    		 * 		{"type":"synchronous","site_id":"0","site_color":"#EEC900"}
    		 * 		type：该json字符串表示的是那种类型的数据。
    		 * 		site_id：该客户端的id，这是由服务端决定的。
    		 * 		site_color：客户端的颜色，也是由服务端决定。
    		 */
    		syschronous_func(json);
    		var child = document.createElement("p");
			child.innerHTML = "[INFO]：Synchronous successfully!";
	    	document.getElementById("msgshow").appendChild(child);
	    	document.getElementById("sitemsg_tbody").innerHTML = 
	    		"<tr align=center><td style=\"background-color:"+site_color+"\"></td>"+
	    		"<td>"+site_id+"</td><td>"+"Anonymous-"+site_id+"</td></tr>";
			return;
    	}
    	if(json.type=="online")
    	{
    		/**
    		 * 服务端发来的用户在线信息。
    		 * 当有客户端加入或者退出时，服务端会向当前在线的所有客户端广播在线客户端信息。格式：
    		 *		{"type":"online","online_user":[{"site_id":"0","site_color":"#EEC900"}]}
    		 * 		onlien_user：当前所有的在线客户端信息。
    		 * 
    		 */
    		document.getElementById("online_user_table").innerHTML = update_online_info(json);
    		return;
    	}
    	//服务端转发来的操作
    	if(json.type=="operation")
    	{
    		/**
    		 * 服务端发来的其他客户端生成的操作，格式：
    		 * {"site_id":"0","sv":{"0":"1","1":"0","2":"0","3":"0","4":"0"},
    		 * "type":"operation","obj_type":"line","first_x":"181","first_y":"92.125",
    		 * "second_x":"379","second_y":"240.125","stroke":"#ab2567",
    		 * "fill":"#72ab27","dofill":"true"}  或者：
    		 * {"site_id":"0","sv":{"0":"8","1":"0","2":"0","3":"0","4":"0"},
    		 * "type":"operation","obj_type":"path","first_x":"102","first_y":"197.125",
    		 * "points":[{"x":"103","y":"197.125"},{"x":"104","y":"197.125"},{"x":"106","y":"197.125"},{"x":"108","y":"197.125"},{"x":"113","y":"197.125"},{"x":"119","y":"197.125"},{"x":"126","y":"196.125"},{"x":"131","y":"196.125"},{"x":"133","y":"195.125"},{"x":"134","y":"195.125"},{"x":"135","y":"195.125"}],
    		 * "stroke":"#ab2567","fill":"#72ab27","dofill":"true"}
    		 * obj_type：绘图对象的类型，如果不是erase则这些操作都是插入类型的操作。
    		 * (first_x,first_y)是鼠标按下时（在绘图面板中）的坐标，
    		 * (second_x,second_y)是鼠标松开时（在绘图面板中坐标）。
    		 * stroke：是线的颜色，fill：是填充颜色，dofill：是否填充。
    		 * pints：表示鼠标移动的轨迹坐标，当绘制路径时会用到。
    		 */
    		handle_op(json);
    		
    		var child = document.createElement("p");
			child.innerHTML = e.data;
			child.style.color = site_color;
	    	document.getElementById("msgshow").appendChild(child);
	    	var msg_div = document.getElementById("msgshow");
	    	msg_div.scrollTop = msg_div.scrollHeight; 
    		return;
    	}
    	if(json.type=="msg")
    	{
    		/**
    		 * 服务端发来的一些显示信息，用于直接显示在用户面板上。
    		 */
    		//服务端发来的提示信息，直接显示在客户端即可
    		var content = json.content;
    		var child = document.createElement("p");
			child.innerHTML = content;
			child.style.color = json.color;
	    	document.getElementById("msgshow").appendChild(child);
	    	var msg_div = document.getElementById("msgshow");
	    	msg_div.scrollTop = msg_div.scrollHeight; 
    		return;
    	}
    	//聊天消息的显示处理
    	if(json.type=="chat")
    	{
    		/**
    		 *聊天内容的显示。由于绘图面板监听了键盘事件，暂不支持聊天。
    		 */
    		//聊天内容
    		var content = json.content;
    		//来自哪个站点
    		var id = json.site_id;
    		var child = document.createElement("p");
			child.innerHTML = "[CHAT]：Site "+id+" Says: "+content;
			child.style.color = "#000";
	    	document.getElementById("msgshow").appendChild(child);
	    	var msg_div = document.getElementById("msgshow");
	    	msg_div.scrollTop = msg_div.scrollHeight; 
    		return;
    	}
    	//出错是提示错误信息并关闭窗口
    	if(json.type=="error")
    	{
    		/**
    		 * 出错时提示
    		 */
    		var content = json.content;
    		alert(content);
    		var p = document.createElement("p");
    		p.innerHTML = content;
    		p.style.color = "red";
    		document.getElementById("msgshow").appendChild(p);
    		return;
    	}
    };
    ws.onerror = function()
    {
		alert("Can not connect to server!");
		document.getElementById("msgshow").innerHTML = "<p>[INFO]：Can not connect to server!</p>";
		document.getElementById("msgshow").style.color = "#CD2626";
    };
}
//===============================================================================
/**
 * @date 2015/12/18
 * @description 消息发送
 * 	实现聊天的功能
 */
function send_msg()
{
	//获取聊天框中内容
	var content = document.getElementById("msg_txt").value;
	//构造消息内容发送到服务端
	var json_msg = "{\"type\":\"chat\",\"content\":\"" + content + "\",\"site_id\":\"" + site_id + "\"}";
	ws.send(json_msg);
}
//===============================================================================
/**
 * @date: 2015-10
 * @description: syschronous
 * 	这个函数用于处理服务器端发来的同步数据（客户端第一次连接服务端时）
 */
function syschronous_func(json)
{
	//同步基本数据
	site_id = json.site_id;
	site_color = json.site_color;
	//得到状态向量
//	for(var i=0;i<json.site_sv.length;i++)
//	{
//		sv[i] = json.site_sv[i];
//		if(sv[i]==-1)
//			sv[i] = 0;
//	}
}
//===============================================================================
/**
 * @date 2015-10
 * @description 更新在线用户列表
 */
function update_online_info(json)
{
	var html = "";
	var online_user = json.online_user;
	for(var i=0;i<online_user.length;i++)
	{
		html = html + "<tr align=center borderColor=red border=1><td style=\"background-color:"+online_user[i].site_color
		+"\"></td><td>"+online_user[i].site_id+"</td><td>"+"Anonymous-"+online_user[i].site_id+
			"</td></tr>";
	}
	return html;
}
//===============================================================================
/**
* 处理远程站点的操作
* 对远程站点的操作进行OT后执行
* 首先将json数据解析成两部分：一是操作，而是操作对象。
* 将操作进行OT后找到正确的操作位置，根据操作位置将操作对象在绘图文档doc中执行，
* 然后再将doc中的绘图对象重新解析到绘图面板中。
*/
function handle_op(json){
	var obj_type = json.obj_type,
		first_x = json.first_x,
		first_y = json.first_y,
		fill = json.fill,
		stroke = json.stroke,
		dofill = json.dofill,
		type = "";//操作类型
	
	//解析得到绘图对象
//	var obj = "{\"obj_type\:\""+json.obj_type+"\",\"first_x\":\""+json.first_x+"\",\"first_y\":\""+
//		json.first_y+"\",";
	
	if(json.obj_type=="path"||json.obj_type=="pathClosed"){
		var points = json.points;
		type = "insert";
		//obj += "\"points\":[";
//		for(var i=0;i<points.length;i++){
//			obj += "{\"x\":\""+points[i].x+"\",\"y\":\""+points[i].y+"\"},";
//		}
//		if(points.length!=0)
//			obj = obj.substr(0,obj.length-1);
	}else if(json.obj_type=="slinky"){
		var points_slinky = json.points;
		type = "insert";
//		obj += "\"points\":["
//			for(var i=0;i<points.length;i++){
//				obj += "{\"x\":\""+points[i].x+"\",\"y\":\""+points[i].y+"\"},";
//			}
//			if(points.length!=0)
//				obj = obj.substr(0,obj.length-1);
	}else if(json.obj_type=="erase"){
		var points_erase = json.points;
		type = "delete";
//		obj += "\"points\":["
//			for(var i=0;i<points.length;i++){
//				obj += "{\"x\":\""+points[i].x+"\",\"y\":\""+points[i].y+"\"},";
//			}
//			if(points.length!=0)
//				obj = obj.substr(0,obj.length-1);
	}else{
		var second_x = json.second_x,
		second_y = json.second_y;
		type = "insert";
		//直线，圆形，矩形对象
		//obj += "\"second_x\":\""+json.second_x+"\",\"second_y\":\""+json.second_y+"\",";
	}
	
//	obj += "\"stroke\":\""json.stroke+"\",\"fill\":\""+json.fill+"\",\"dofill\":\""+json.dofill+"\"}";
	//alert("from "+obj);
	//解析得到操作
	var op = "{\"site_id\":\""+json.site_id+"\",\"sv\":{\"0\":\""+json.sv[0]+"\",\"1\":\""+json.sv[1]+
		"\",\"2\":\""+json.sv[2]+"\",\"3\":\""+json.sv[3]+"\",\"4\":\""+json.sv[4]+"\"},\"type\":\""+type+
		"\",\"position\":\""+json.position+"\"}";
	//alert("from:"+op);

	
	if(obj_type=="line"){//线段
		DrawingLine(first_x,first_y,second_x,second_y,stroke,fill);
	}else if(obj_type=="rectangle"){//矩形
		DrawingRectangle(first_x,first_y,second_x,second_y,stroke,fill,dofill);
	}else if(obj_type=="circle"){//圆形
		DrawingCircle(first_x,first_y,second_x,second_y,stroke,fill,dofill);
	}else if(obj_type=="path"||obj_type=="pathClosed"){//曲线路径
		//alert("ss");
		DrawingPath(first_x,first_y,points,stroke,fill,dofill,obj_type);
	}else if(obj_type=="slinky"){
		DrawingSlinky(first_x,first_y,points_slinky,stroke,fill,dofill);
	}else if(obj_type=="erase"){
		//alert(obj_type+"-"+points_erase.length);
		DrawingErase(first_x,first_y,points_erase,stroke,fill,dofill);
	}
}

//===============================================================================
//重新写绘图函数
/**
 * 得到绘图面板和绘图环境
 */
	var drawingCanvas = document.getElementById('paint-drawing-canvas');
	var drawingContext = drawingCanvas.getContext('2d');
	var backgroundContext = document.createElement('canvas').getContext('2d');
	//这个backgroundContext绘图环境是用于擦除时截取该面板的图形使用的。
	backgroundContext.canvas.width = drawingContext.canvas.width;
	backgroundContext.canvas.height = drawingContext.canvas.height;
	drawGrid(backgroundContext, 'rgb(0, 0, 200)', 10, 10);
//===============================================================================
/**
 * 画直线，从点(first_x,first_y)到点(second_x,second_y)
 * @param first_x
 * @param first_y
 * @param second_x
 * @param second_y
 */
function DrawingLine(first_x,first_y,second_x,second_y,stroke,fill) { 
	//保存旧值
	var oldStrokeStyle = drawingContext.strokeStyle;
	var oldFillStyle = drawingContext.fillStyle;
	//描边颜色
	drawingContext.strokeStyle = stroke;
	//填充颜色
	drawingContext.fillStyle = fill;
	//绘制
	drawingContext.beginPath();
	drawingContext.moveTo(first_x, first_y);
	drawingContext.lineTo(second_x, second_y);
	drawingContext.stroke();
	//设置回旧值
	drawingContext.strokeStyle = oldStrokeStyle;
	drawingContext.fillStyle = oldFillStyle;
}
//===============================================================================
/**
 * 绘制矩形
 */
function DrawingRectangle(first_x,first_y,second_x,second_y,stroke,fill,dofill){
	//保存旧值
	var oldStrokeStyle = drawingContext.strokeStyle;
	var oldFillStyle = drawingContext.fillStyle;
	
	drawingContext.strokeStyle = stroke;
	drawingContext.fillStyle = fill;
      if (dofill=="true") {//判断是否有填充色
    	  //填充绘制
        drawingContext.fillRect(first_x,first_y,second_x,second_y);
      }
      //描边绘制
      drawingContext.strokeRect(first_x,first_y,second_x,second_y);
  	//设置回旧值
  	drawingContext.strokeStyle = oldStrokeStyle;
  	drawingContext.fillStyle = oldFillStyle;
}
//===============================================================================
/**
 * 绘制圆形
 */
function DrawingCircle(first_x,first_y,second_x,second_y,stroke,fill,dofill) {
	//保存旧值
	var oldStrokeStyle = drawingContext.strokeStyle;
	var oldFillStyle = drawingContext.fillStyle;
	drawingContext.strokeStyle = stroke;
	drawingContext.fillStyle = fill;
	
	var rubberbandW = second_x - first_x;
	var rubberbandH = second_y - first_y;
	
	var angle = Math.atan(rubberbandH/rubberbandW),
    radius = rubberbandH / Math.sin(angle);//计算半径
   
    if (first_y === second_y) {//计算半径
       radius = Math.abs(second_x - first_x); 
    }
    drawingContext.beginPath();
    drawingContext.arc(first_x, first_y,radius, 0, Math.PI*2, false); 

    if (dofill=="true") {
       drawingContext.fill();
    }

    drawingContext.stroke();
    
  	//设置回旧值
  	drawingContext.strokeStyle = oldStrokeStyle;
  	drawingContext.fillStyle = oldFillStyle;
}
//===============================================================================

/**
 * 绘制路径和闭合路径
 */
function DrawingPath(first_x,first_y,points,stroke,fill,dofill,selectedFunction) {
	//保存旧值
	var oldStrokeStyle = drawingContext.strokeStyle;
	var oldFillStyle = drawingContext.fillStyle;
	drawingContext.strokeStyle = stroke;
	drawingContext.fillStyle = fill;
	//开始循环绘制
	drawingContext.beginPath();
	drawingContext.moveTo(first_x, first_y);
	for(var i=0;i<points.length;i++){
		drawingContext.lineTo(points[i].x, points[i].y);
		//drawingContext.moveTo(points[i].x, points[i].y);去掉这句要不然无法闭合路径填充颜色
	}
	drawingContext.stroke();     
    if (selectedFunction == 'pathClosed') {
       //drawingContext.lineTo(first_x,first_y);//闭合
    	drawingContext.closePath();
       if (dofill=="true") {
          drawingContext.fill();
       }
       drawingContext.stroke();
    }
     
 	//设置回旧值
 	drawingContext.strokeStyle = oldStrokeStyle;
 	drawingContext.fillStyle = oldFillStyle;
}


//===============================================================================

/**
 * 绘制连续圆形
 */
function DrawingSlinky(first_x,first_y,points_slinky,stroke,fill,dofill) {
    drawingContext.save();    
	//保存旧值
	var oldStrokeStyle = drawingContext.strokeStyle;
	var oldFillStyle = drawingContext.fillStyle;
	var oldShadowColor = drawingContext.shadowColor;
	var oldShadowOffsetX = drawingContext.shadowOffsetX;
	var oldShadowOffsetY = drawingContext.shadowOffsetY;
	var oldShadowBlur = drawingContext.shadowBlur;
	/**
	 * 设置绘图时的属性
	 */
	drawingContext.shadowColor = stroke;
	drawingContext.shadowOffsetX = -5;
	drawingContext.shadowOffsetY = -5;
	drawingContext.shadowBlur = 20;
	drawingContext.strokeStyle = stroke;
	
    drawingContext.beginPath();
    for(var i=0;i<points_slinky.length;i++){
    	drawingContext.arc(points_slinky[i].x,points_slinky[i].y, 40,0, Math.PI*2, false);
    }

    drawingContext.stroke();

    if (dofill=="true") {
       drawingContext.shadowColor = undefined;
       drawingContext.shadowOffsetX = 0;
       this.drawingContext.globalAlpha = 0.2;
       drawingContext.fill();
    }
    drawingContext.restore();
    
 	//设置回旧值
 	drawingContext.strokeStyle = oldStrokeStyle;
 	drawingContext.fillStyle = oldFillStyle;
	drawingContext.shadowColor = oldShadowColor;
	drawingContext.shadowOffsetX = oldShadowOffsetX;
	drawingContext.shadowOffsetY = oldShadowOffsetY;
	drawingContext.shadowBlur = oldShadowBlur;
}
//--------------------------------------------------------------------------------------
/**
 *     date:2016
 * 	   author:gaooz.com
 */

//===============================================================================
/**
 * 处理擦除的操作，实际上是绘制擦除圆形。
 */
function DrawingErase(first_x,first_y,points_erase,stroke,fill,dofill){
	 console.log("enter erase...");
    myeraseLast(first_x,first_y);
    //mydrawEraser(first_x,first_y);
    for(var i=0;i<points_erase.length;i++){
       myeraseLast(points_erase[i].x,points_erase[i].y);
        //mydrawEraser(points_erase[i].x,points_erase[i].y);
    }
}
//===============================================================================
/**
 * //功能是去除掉擦除时的圆形印记
 * @param lastX
 * @param lastY
 */
function myeraseLast(lastX,lastY) {
   var x = lastX - 40 - 1,
       y = lastY - 40 - 1,
       w = 40*2+1*2,
       h = w,
       cw = drawingContext.canvas.width,
       ch = drawingContext.canvas.height;

   drawingContext.save();

   mysetPathForEraser(lastX,lastY);
   drawingContext.clip();

      if (x + w > cw) w = cw - x;
      if (y + h > ch) h = ch - y;

      if (x < 0) { x = 0; }
      if (y < 0) { y = 0; }
      //console.log("falg: "+x+"-"+y+"-"+w+"-"+h);
      drawingContext.drawImage(backgroundContext.canvas, x, y, w, h, x, y, w, h);
      //console.log(backgroundContext.canvas);
   drawingContext.restore();
}
//===============================================================================
/**
 * 设置擦除时的属性
 * @param lastX
 * @param lastY
 */
function mysetPathForEraser(lastX,lastY) {
	drawingContext.beginPath();
	drawingContext.moveTo(lastX, lastY);
	drawingContext.arc(lastX, lastY,40 + 1,0, Math.PI*2, false);
}
//===============================================================================
/**
 * 对鼠标当前所在区域进行擦除绘制
 * @param loc
 */
function mydrawEraser(x,y) {
	   drawingContext.save();
	   //设置绘制时的属性
	   mysetEraserAttributes();     

	   drawingContext.beginPath();
	   drawingContext.arc(x, y, 40,0, Math.PI*2, false);
	   drawingContext.clip();
	   drawingContext.stroke();
	   console.log(x+"-"+y);
	   drawingContext.restore();
}
//===============================================================================
/**
 * 设置属性。这个函数用于在鼠标移动时绘制擦除圆形面板时，绘制该面板时的属性。
 */
function mysetEraserAttributes() {
	  drawingContext.lineWidth     = 1;
	  drawingContext.shadowColor   = 'blue';
	  drawingContext.shadowOffsetX = -5; 
	  drawingContext.shadowOffsetY = -5;
	  drawingContext.shadowBlur    = 20;
	  drawingContext.strokeStyle   = 'rgba(0,0,255,0.6)';
}

//--------------------------------------------------------------------------------------
//===============================================================================
/**
 * 画网格，就是绘图面板的背景网格
 */
function drawGrid(context, color, stepx, stepy) {
	   context.save()

	   context.strokeStyle = color;
	   context.fillStyle = '#ffffff';
	   context.lineWidth = 0.5;
	   context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	   context.globalAlpha = 0.1;

	   context.beginPath();
	   for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
	     context.moveTo(i, 0);
	     context.lineTo(i, context.canvas.height);
	   }
	   context.stroke();

	   context.beginPath();
	   for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
	     context.moveTo(0, i);
	     context.lineTo(context.canvas.width, i);
	   }
	   context.stroke();

	   context.restore();
}
//===============================================================================








