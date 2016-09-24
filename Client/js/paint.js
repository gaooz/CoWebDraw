/*
 * 绘画面板核心代码 
 * 	2015/12
*/

var COREHTML5 = COREHTML5 || { };

// Constructor................................................................

COREHTML5.paintExample = function() {//构造函数
   var paint = this;
   
   this.iconCanvas = document.getElementById('paint-icon-canvas');//绘图图标绘制画板
   this.drawingCanvas = document.getElementById('paint-drawing-canvas');//用户作图画板
   this.drawingContext = this.drawingCanvas.getContext('2d');//作图面板上下文
   this.backgroundContext = document.createElement('canvas').getContext('2d');
   this.iconContext = this.iconCanvas.getContext('2d');//图标绘制画板上下文
   this.strokeStyleSelect = document.getElementById('linecolor_input');//描边颜色
   this.fillStyleSelect = document.getElementById('fillcolor_input');//填充颜色 
   //this.lineWidthSelect = document.getElementById('paint-lineWidthSelect');
   this.eraseAllButton = document.getElementById('paint-erase-all');
   this.snapshotButton = document.getElementById('paint-snapshot-button');
   this.controls = document.getElementById('paint-controls');
   this.curveInstructions = document.getElementById('paint-curve-instructions');
   this.curveInstructionsOkayButton = document.getElementById('paint-curve-instructions-okay-button');
   this.curveInstructionsNoMoreButton = document.getElementById('paint-curve-instructions-no-more-button');
   this.paintInformation = document.getElementById('paint-information-icon');
   
   //保存鼠标移动时的轨迹
   this.points = new Array();
   //保存slinky绘制时鼠标移动的轨迹
   this.points_slinky = new Array();
   //擦除时的鼠标移动轨迹点
   this.points_erase = new Array();
   this.CURVE_INSTRUCTIONS_LS_KEY = 'COREHTML5.canvas.paintInstructions';

   this.CONTROL_POINT_RADIUS = 15;
   this.CONTROL_POINT_FILL_STYLE = 'rgba(255,255,0,0.5)';
   this.CONTROL_POINT_STROKE_STYLE = 'rgba(0, 0, 255, 0.8)';
   
   this.GRID_HORIZONTAL_SPACING = 10;
   this.GRID_VERTICAL_SPACING = 10;
   this.GRID_LINE_COLOR = 'rgb(0, 0, 200)';

   this.ERASER_ICON_GRID_COLOR = 'rgb(0, 0, 200)';
   this.ERASER_ICON_CIRCLE_COLOR = 'rgba(100, 140, 200, 0.5)';
   this.ERASER_ICON_RADIUS = 20;

   this.SLINKY_LINE_WIDTH = 1;
   this.SLINKY_SHADOW_STYLE = 'rgba(0,0,0,0.2)';
   this.SLINKY_SHADOW_OFFSET = -5;
   this.SLINKY_SHADOW_BLUR = 20;
   this.SLINKY_RADIUS = 60;

   this.ERASER_LINE_WIDTH = 1;
   this.ERASER_SHADOW_STYLE = 'blue';
   this.ERASER_STROKE_STYLE = 'rgba(0,0,255,0.6)';
   this.ERASER_SHADOW_OFFSET = -5;
   this.ERASER_SHADOW_BLUR = 20;
   this.ERASER_RADIUS = 40;

   this.SHADOW_COLOR = 'rgba(0,0,0,1)';

   this.ICON_BACKGROUND_STYLE = '#eeeeee';
   this.ICON_BORDER_STROKE_STYLE = 'rgba(100, 140, 230, 0.5)';
   this.ICON_STROKE_STYLE = 'rgb(100, 140, 230)';
   this.ICON_FILL_STYLE = '#dddddd';

   this.TEXT_ICON_FILL_STYLE = 'rgba(100, 140, 230, 0.5)';
   this.TEXT_ICON_TEXT = 'T';

   this.CIRCLE_ICON_RADIUS = 20;

   this.ICON_RECTANGLES = [
      { x: 13.5, y: 13.5, w: 48, h: 48 },
      { x: 13.5, y: 71.5, w: 48, h: 48 },
      { x: 13.5, y: 129.5, w: 48, h: 48 },
      { x: 13.5, y: 187.5, w: 48, h: 48 },
      { x: 13.5, y: 245.5, w: 48, h: 48 },
      { x: 13.5, y: 303.5, w: 48, h: 48 },
      { x: 13.5, y: 361.5, w: 48, h: 48 },
      { x: 13.5, y: 419.5, w: 48, h: 48 },
      { x: 13.5, y: 477.5, w: 48, h: 48 },
      { x: 13.5, y: 477.5, w: 48, h: 48 }
   ];

   this.LINE_ICON = 0;
   this.RECTANGLE_ICON = 1;
   this.CIRCLE_ICON = 2;
   this.OPEN_PATH_ICON = 3;
   this.CLOSED_PATH_ICON = 4;
   this.CURVE_ICON = 5;
   this.TEXT_ICON = 6;
   this.SLINKY_ICON = 7;
   this.ERASER_ICON = 8;

   this.CONTROL_POINT_RADIUS = 5;
   this.CONTROL_POINT_STROKE_STYLE = 'blue';
   this.CONTROL_POINT_FILL_STYLE = 'rgba(255, 255, 0, 0.5)';
   this.END_POINT_STROKE_STYLE = 'navy';
   this.END_POINT_FILL_STYLE   = 'rgba(0, 255, 0, 0.5)';
   this.GUIDEWIRE_STROKE_STYLE = 'rgba(0,0,230,0.4)';

   this.endPoints     = [ {}, {} ];  // end point locations (x, y)
   this.controlPoints = [ {}, {} ];  // control point locations (x, y)
   this.draggingPoint = false; // End- or control-point the user is dragging

   this.drawingSurfaceImageData = null;
   this.rubberbandW = null;
   this.rubberbandH = null;
   this.rubberbandUlhc = {};

   this.dragging = false;
   this.mousedown = {};
   this.lastRect = {};
   this.lastX = 0;
   this.lastY = 0;

   this.controlPoint = {};
   this.editingCurve = false;
   this.curveStart = {};
   this.curveEnd = {};
   
   this.doFill = true;
   this.selectedRect = null;
   this.selectedFunction;

   this.editingText = false;
   this.currentText;

   this.keyboard = new COREHTML5.Keyboard();

   this.iconContext.strokeStyle = this.ICON_STROKE_STYLE;
   this.iconContext.fillStyle = this.ICON_FILL_STYLE;

   this.iconContext.font = '48px Palatino';
   this.iconContext.textAlign = 'center';
   this.iconContext.textBaseline = 'middle';

   this.drawingContext.font = '48px Palatino';
   this.drawingContext.textBaseline = 'bottom';

   this.drawingContext.strokeStyle = "#" + this.strokeStyleSelect.value;
   this.drawingContext.fillStyle = "#" + this.fillStyleSelect.value;
   this.drawingContext.lineWidth = 1;//this.lineWidthSelect.value;

   this.drawGrid(this.drawingContext, this.GRID_LINE_COLOR, 10, 10);
   this.selectedRect = this.ICON_RECTANGLES[this.CURVE_ICON];
   this.selectedFunction = 'curve';

   // This event listener prevents touch devices from
   // scrolling the visible viewport.
   //触摸事件响应
   document.body.addEventListener('touchmove', function (e) {
      e.preventDefault();
   }, false);
   
   this.drawIcons();
   this.drawBackground();

   this.keyboard.appendTo('paint-keyboard');

   this.keyboard.addKeyListener( function (key) { 
      if (key === 'Enter') paint.enter();
      else if (key === '<') paint.backspace();
      else paint.insert(key);
   });

   document.onkeydown = function (e) {
      if (navigator.platform === 'iPad' && !this.keyboardVisible) return;
      if (e.ctrlKey || e.metaKey) return;

      if (e.keyCode === 8) {  // backspace
         e.preventDefault();
         paint.backspace();
      }
      else if (e.keyCode === 13) { // enter
         e.preventDefault();
         paint.enter();
      }
   }
   
   document.onkeypress = function (e) {
      var key = String.fromCharCode(e.which);

      if (navigator.platform === 'iPad' && !this.keyboardVisible) return;
      if (e.ctrlKey || e.metaKey) return;

      if (paint.editingText && e.keyCode !== 8) {
         e.preventDefault();
         paint.insert(key);
      }

      e.preventDefault();
   }

   // Control canvas event handlers.................................
   
   //鼠标点击绘图图标时的处理事件
   this.iconCanvas.onmousedown = function (e) {
      var x = e.x || e.clientX,
          y = e.y || e.clientY,
        loc = paint.windowToCanvas(paint.iconCanvas, x, y);

      e.preventDefault();
      paint.mouseDownOrTouchStartInControlCanvas(loc);
   }
   //触摸绘图图标时的触屏事件
   this.iconCanvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
         e.preventDefault();
         paint.mouseDownOrTouchStartInControlCanvas(
            paint.windowToCanvas(paint.iconCanvas,
               e.touches[0].clientX, e.touches[0].clientY));
      }
   });

   // Drawing canvas event handlers.................................
   //绘图面板上鼠标按下处理事件
   this.drawingCanvas.onmousedown = function (e) {
      var x = e.x || e.clientX,
          y = e.y || e.clientY;
      //alert("鼠标按下："+x+"--"+y);
      e.preventDefault();
      paint.mouseDownOrTouchStartInDrawingCanvas(
         paint.windowToCanvas(paint.drawingCanvas, x, y));
      
   }
   //触屏
   this.drawingCanvas.ontouchstart = function (e) { 
      if (e.touches.length === 1) {
         e.preventDefault();
         paint.mouseDownOrTouchStartInDrawingCanvas(
            paint.windowToCanvas(paint.drawingCanvas,
               e.touches[0].clientX, e.touches[0].clientY));
      }
   }
   //触屏移动
   this.drawingCanvas.ontouchmove = function (e) { 
      if (e.touches.length === 1) {
         paint.mouseMoveOrTouchMoveInDrawingCanvas(
            paint.windowToCanvas(paint.drawingCanvas,
               e.touches[0].clientX, e.touches[0].clientY));
      }
   }

   this.drawingCanvas.ontouchend = function (e) { 
      var loc;
   
      if (e.changedTouches.length === 1) {
         loc = paint.windowToCanvas(paint.drawingCanvas, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
         paint.mouseUpOrTouchEndInDrawingCanvas(loc);
      }
   }
   //鼠标移动
   this.drawingCanvas.onmousemove = function (e) {
      var x = e.x || e.clientX,
          y = e.y || e.clientY,
        loc = paint.windowToCanvas(paint.drawingCanvas, x, y);

      e.preventDefault();
      paint.mouseMoveOrTouchMoveInDrawingCanvas(loc);
   }
   //鼠标松开
   this.drawingCanvas.onmouseup = function (e) {
      var x = e.x || e.clientX,
          y = e.y || e.clientY,
        loc = paint.windowToCanvas(paint.drawingCanvas, x, y);
      e.preventDefault();
      paint.mouseUpOrTouchEndInDrawingCanvas(loc);
   }

   // Control event handlers........................................

   this.strokeStyleSelect.onchange = function (e) {
      paint.drawingContext.strokeStyle = "#" + paint.strokeStyleSelect.jscolor;
   };

   this.fillStyleSelect.onchange = function (e) {
      paint.drawingContext.fillStyle = "#" + paint.fillStyleSelect.jscolor;
   };

//   this.lineWidthSelect.onchange = function (e) {
//      paint.drawingContext.lineWidth = 1;//paint.lineWidthSelect.value;
//   };

   this.eraseAllButton.onclick = function (e) {
      paint.drawingContext.clearRect(0,0,
                               paint.drawingCanvas.width,
                               paint.drawingCanvas.height);
      paint.drawGrid(paint.drawingContext, paint.GRID_LINE_COLOR, 10, 10);
      paint.saveDrawingSurface();
      paint.rubberbandW = paint.rubberbandH = 0;
   };

   this.curveInstructionsOkayButton.onclick = function (e) {
      paint.curveInstructions.style.display = 'none';
   };

   this.curveInstructionsNoMoreButton.onclick = function (e) {
      paint.curveInstructions.style.display = 'none';
      localStorage[paint.CURVE_INSTRUCTIONS_LS_KEY]= 'no';
   };

   this.snapshotButton.onclick = function (e) {
      var dataUrl,
          snapshotImageElement = document.getElementById('paint-snapshot-image-element'),
          snapshotInstructions = document.getElementById('paint-snapshot-instructions'),
          eraseAllButton = document.getElementById('paint-erase-all'),
          paintDiv = document.getElementById('paint-div');

      e.preventDefault();
      
      if (paint.snapshotButton.innerHTML === 'Take a snapshot') {
         dataUrl = paint.drawingCanvas.toDataURL();

         paint.snapshotButton.innerHTML = 'Back to Paint';
         snapshotImageElement.src = dataUrl;
         
         snapshotImageElement.style.display = 'inline';
         paint.iconCanvas.style.opacity = 0.1;
         eraseAllButton.style.opacity = 0.1;
         paint.controls.style.opacity = 0.0;

         snapshotInstructions.style.display = 'inline';

         setTimeout( function (e) {
            snapshotInstructions.style.opacity = 1.0;
         },100);
      }
      else {
         snapshotImageElement.style.display = 'none';
         
         snapshotInstructions.style.display = 'none';
         setTimeout( function (e) {
            snapshotInstructions.style.opacity = 0;
         },100);

         paint.controls.style.opacity = 1.0;
         eraseAllButton.style.opacity = 1.0;
         paint.iconCanvas.style.opacity = 1.0;
         paint.snapshotButton.innerHTML = 'Take a snapshot';
      }
   };
};
//---------------------------------------------------------------以上是构造函数的内容
COREHTML5.paintExample.prototype = {
// Grid..........................................................

drawGrid: function (context, color, stepx, stepy) {
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
},

// Icons.........................................................
//绘制图表
drawLineIcon: function (rect) {//直线
   this.iconContext.beginPath();
   this.iconContext.moveTo(rect.x + 5, rect.y + 5);
   this.iconContext.lineTo(rect.x + rect.w - 5, rect.y + rect.h - 5);
   this.iconContext.stroke();
},

drawRectIcon: function (rect) {//矩形
   this.fillIconLowerRight(rect);
   this.iconContext.strokeRect(rect.x + 5, rect.y + 5,
                               rect.w - 10, rect.h - 10); 
},

drawCircleIcon: function (rect) {//圆形
   var startAngle = 3*Math.PI/4,
       endAngle = 7*Math.PI/4,
       center = {x: rect.x + rect.w/2, y: rect.y + rect.h/2 };

   this.fillIconLowerRight(rect);

   this.iconContext.beginPath();
   this.iconContext.arc(rect.x + rect.w/2, rect.y + rect.h/2,
                   this.CIRCLE_ICON_RADIUS, 0, Math.PI*2, false);
   this.iconContext.stroke();
},

drawOpenPathIcon: function (rect) {//路径
   this.iconContext.beginPath();
   this.drawOpenPathIconLines(rect);
   this.iconContext.stroke();
},

drawClosedPathIcon: function (rect) {//闭合路径
   this.fillIconLowerRight(rect);
   this.iconContext.beginPath();
   this.drawOpenPathIconLines(rect);
   this.iconContext.closePath();
   this.iconContext.stroke();
},

drawCurveIcon: function (rect) {//曲线
   this.fillIconLowerRight(rect);
   this.iconContext.beginPath();
   this.iconContext.beginPath();
   this.iconContext.moveTo(rect.x + rect.w - 10, rect.y + 5);
   this.iconContext.quadraticCurveTo(rect.x - 10, rect.y,
                                     rect.x + rect.w - 10,
                                     rect.y + rect.h - 5);
   this.iconContext.stroke();
},

drawTextIcon: function (rect) {//文本
   var text = this.TEXT_ICON_TEXT;
   
   this.fillIconLowerRight(rect);
   this.iconContext.fillStyle = this.TEXT_ICON_FILL_STYLE;
   this.iconContext.fillText(text, rect.x + rect.w/2,
                             rect.y + rect.h/2 + 5);
   this.iconContext.strokeText(text, rect.x + rect.w/2,
                               rect.y + rect.h/2 + 5);
},

drawSlinkyIcon: function (rect) {//连续圆形
   var x, y;
   
   this.fillIconLowerRight(rect);

   this.iconContext.save();
   this.iconContext.strokeStyle = 'rgba(100, 140, 230, 0.6)';

   for (var i=-2; i < rect.w/3 + 2; i+=1.5) {
      if (i < rect.w/6) x = rect.x + rect.w/3 + i + rect.w/8;
      else              x = rect.x + rect.w/3 + (rect.w/3 - i) + rect.w/8;

      y = rect.y + rect.w/3 + i;
      
      this.iconContext.beginPath();
      this.iconContext.arc(x, y, 12, 0, Math.PI*2, false);
      this.iconContext.stroke();
   }
   this.iconContext.restore();
},

drawEraserIcon: function (rect) {//擦除
   var rect = this.ICON_RECTANGLES[this.ERASER_ICON];
   this.iconContext.save();

   this.iconContext.beginPath();
   this.iconContext.arc(rect.x + rect.w/2,
                        rect.y + rect.h/2,
                        this.ERASER_ICON_RADIUS, 0, Math.PI*2, false);

   this.iconContext.strokeStyle = this.ERASER_ICON_CIRCLE_COLOR;
   this.iconContext.stroke();

   this.iconContext.clip(); // restrict drawGrid() to the circle

   this.drawGrid(this.iconContext, this.ERASER_ICON_GRID_COLOR, 5, 5);

   this.iconContext.restore();
},

drawIcon: function (rect) {
   this.iconContext.save();

   this.iconContext.strokeStyle = this.ICON_BORDER_STROKE_STYLE;
   this.iconContext.strokeRect(rect.x, rect.y, rect.w, rect.h);
   this.iconContext.strokeStyle = this.ICON_STROKE_STYLE;
   
   if (rect.y === this.ICON_RECTANGLES[this.LINE_ICON].y)             this.drawLineIcon(rect);
   else if (rect.y === this.ICON_RECTANGLES[this.RECTANGLE_ICON].y)   this.drawRectIcon(rect);
   else if (rect.y === this.ICON_RECTANGLES[this.CIRCLE_ICON].y)      this.drawCircleIcon(rect);
   else if (rect.y === this.ICON_RECTANGLES[this.OPEN_PATH_ICON].y)   this.drawOpenPathIcon(rect);
   else if (rect.y === this.ICON_RECTANGLES[this.CLOSED_PATH_ICON].y) this.drawClosedPathIcon(rect, 20);
   else if (rect.y === this.ICON_RECTANGLES[this.TEXT_ICON].y)        this.drawTextIcon(rect);
   else if (rect.y === this.ICON_RECTANGLES[this.CURVE_ICON].y)       this.drawCurveIcon(rect);
   else if (rect.y === this.ICON_RECTANGLES[this.ERASER_ICON].y)      this.drawEraserIcon(rect);
   else if (rect.y === this.ICON_RECTANGLES[this.SLINKY_ICON].y)      this.drawSlinkyIcon(rect);

   this.iconContext.restore();
},

drawIcons: function () {
   var paint = this;
   
   this.iconContext.clearRect(0,0, this.iconCanvas.width,
                                   this.iconCanvas.height);
   
   this.ICON_RECTANGLES.forEach(function(rect) {
      paint.iconContext.save();

      if (paint.selectedRect === rect) paint.setSelectedIconShadow();
      else                             paint.setIconShadow();

      paint.iconContext.fillStyle = paint.ICON_BACKGROUND_STYLE;
      paint.iconContext.fillRect(rect.x, rect.y, rect.w, rect.h);

      paint.iconContext.restore();

      paint.drawIcon(rect);
   });
},

drawOpenPathIconLines: function (rect) {
   this.iconContext.lineTo(rect.x + 13, rect.y + 19);
   this.iconContext.lineTo(rect.x + 15, rect.y + 17);
   this.iconContext.lineTo(rect.x + 25, rect.y + 12);
   this.iconContext.lineTo(rect.x + 35, rect.y + 13);
   this.iconContext.lineTo(rect.x + 38, rect.y + 15);
   this.iconContext.lineTo(rect.x + 40, rect.y + 17);
   this.iconContext.lineTo(rect.x + 39, rect.y + 23);
   this.iconContext.lineTo(rect.x + 36, rect.y + 25);
   this.iconContext.lineTo(rect.x + 32, rect.y + 27);
   this.iconContext.lineTo(rect.x + 28, rect.y + 29);
   this.iconContext.lineTo(rect.x + 26, rect.y + 31);
   this.iconContext.lineTo(rect.x + 24, rect.y + 33);
   this.iconContext.lineTo(rect.x + 22, rect.y + 35);
   this.iconContext.lineTo(rect.x + 20, rect.y + 37);
   this.iconContext.lineTo(rect.x + 18, rect.y + 39);
   this.iconContext.lineTo(rect.x + 16, rect.y + 39);
   this.iconContext.lineTo(rect.x + 13, rect.y + 36);
   this.iconContext.lineTo(rect.x + 11, rect.y + 34);
},

fillIconLowerRight: function (rect) {
   this.iconContext.beginPath();
   this.iconContext.moveTo(rect.x + rect.w, rect.y);
   this.iconContext.lineTo(rect.x + rect.w, rect.y + rect.h);
   this.iconContext.lineTo(rect.x, rect.y + rect.h);
   this.iconContext.closePath();
   this.iconContext.fill();
},

isPointInIconLowerRight: function (rect, x, y) {
   this.iconContext.beginPath();   
   this.iconContext.moveTo(rect.x + rect.w, rect.y);
   this.iconContext.lineTo(rect.x + rect.w, rect.y + rect.h);
   this.iconContext.lineTo(rect.x, rect.y + rect.h);
            
   return this.iconContext.isPointInPath(x, y);
},

getIconFunction: function (rect, loc) {
   var action;

   if (rect.y === this.ICON_RECTANGLES[this.LINE_ICON].y)             action = 'line';
   else if (rect.y === this.ICON_RECTANGLES[this.RECTANGLE_ICON].y)   action = 'rectangle';
   else if (rect.y === this.ICON_RECTANGLES[this.CIRCLE_ICON].y)      action = 'circle';
   else if (rect.y === this.ICON_RECTANGLES[this.OPEN_PATH_ICON].y)   action = 'path';
   else if (rect.y === this.ICON_RECTANGLES[this.CLOSED_PATH_ICON].y) action = 'pathClosed';
   else if (rect.y === this.ICON_RECTANGLES[this.CURVE_ICON].y)       action = 'curve';
   else if (rect.y === this.ICON_RECTANGLES[this.TEXT_ICON].y)        action = 'text';
   else if (rect.y === this.ICON_RECTANGLES[this.SLINKY_ICON].y)      action = 'slinky';
   else if (rect.y === this.ICON_RECTANGLES[this.ERASER_ICON].y)      action = 'erase';

   if (action === 'rectangle'  || action === 'circle' ||
       action === 'pathClosed' || action === 'text'   ||
       action === 'curve'      || action === 'slinky') {
      this.doFill = true;//this.isPointInIconLowerRight(rect, loc.x, loc.y);
   }

   return action;
},

setIconShadow: function () {
   this.iconContext.shadowColor = this.SHADOW_COLOR;
   this.iconContext.shadowOffsetX = 1;
   this.iconContext.shadowOffsetY = 1;
   this.iconContext.shadowBlur = 2;
},

setSelectedIconShadow: function () {
   this.iconContext.shadowColor = this.SHADOW_COLOR;
   this.iconContext.shadowOffsetX = 4;
   this.iconContext.shadowOffsetY = 4;
   this.iconContext.shadowBlur = 5;
},

selectIcon: function (rect) {
   this.selectedRect = rect;
   this.drawIcons();
},

// Saving/Restoring the drawing surface..........................

saveDrawingSurface: function () {
   this.drawingSurfaceImageData = this.drawingContext.getImageData(0, 0,
                             this.drawingCanvas.width,
                             this.drawingCanvas.height);
},

restoreDrawingSurface: function () {
   this.drawingContext.putImageData(this.drawingSurfaceImageData, 0, 0);
},

// Rubberbands...................................................

updateRubberbandRectangle: function (loc) {
   this.rubberbandW = Math.abs(loc.x - this.mousedown.x);
   this.rubberbandH = Math.abs(loc.y - this.mousedown.y);

   if (loc.x > this.mousedown.x) this.rubberbandUlhc.x = this.mousedown.x;
   else                          this.rubberbandUlhc.x = loc.x;

   if (loc.y > this.mousedown.y) this.rubberbandUlhc.y = this.mousedown.y;
   else                          this.rubberbandUlhc.y = loc.y;
}, 

drawRubberbandRectangle: function () {
   this.drawingContext.strokeRect(this.rubberbandUlhc.x,
                             this.rubberbandUlhc.y,
                             this.rubberbandW, this.rubberbandH); 
},

drawRubberbandLine: function (loc) {
   this.drawingContext.beginPath();
   this.drawingContext.moveTo(this.mousedown.x, this.mousedown.y);
   this.drawingContext.lineTo(loc.x, loc.y);
   this.drawingContext.stroke();
},

drawRubberbandCircle: function (loc) {
   var angle = Math.atan(this.rubberbandH/this.rubberbandW);
   var radius = this.rubberbandH / Math.sin(angle);
   
   if (this.mousedown.y === loc.y) {
      radius = Math.abs(loc.x - this.mousedown.x); 
   }

   this.drawingContext.beginPath();
   this.drawingContext.arc(this.mousedown.x, this.mousedown.y, radius, 0, Math.PI*2, false); 
   this.drawingContext.stroke();
},

drawRubberband: function (loc) {
   this.drawingContext.save();

   if (this.selectedFunction === 'rectangle') {
      this.drawRubberbandRectangle();
   }
   else if (this.selectedFunction === 'line' ||
            this.selectedFunction === 'curve') {
      this.drawRubberbandLine(loc);
   }
   else if (this.selectedFunction === 'circle') { 
      this.drawRubberbandCircle(loc);
   }

   this.drawingContext.restore();
},

// Eraser........................................................

setPathForEraser: function () {
   this.drawingContext.beginPath();
   this.drawingContext.moveTo(this.lastX, this.lastY);
   this.drawingContext.arc(this.lastX, this.lastY,
                      this.ERASER_RADIUS + this.ERASER_LINE_WIDTH,
                      0, Math.PI*2, false);
},

setSlinkyAttributes: function () {
  this.drawingContext.lineWidth     = 1;//this.lineWidthSelect.value;
  this.drawingContext.shadowColor   = "#" + this.strokeStyleSelect.jscolor;
  this.drawingContext.shadowOffsetX = this.SLINKY_SHADOW_OFFSET; 
  this.drawingContext.shadowOffsetY = this.SLINKY_SHADOW_OFFSET;
  this.drawingContext.shadowBlur    = this.SLINKY_SHADOW_BLUR;
  this.drawingContext.strokeStyle   = "#" + this.strokeStyleSelect.jscolor;
},

setEraserAttributes: function () {
  this.drawingContext.lineWidth     = this.ERASER_LINE_WIDTH;
  this.drawingContext.shadowColor   = this.ERASER_SHADOW_STYLE;
  this.drawingContext.shadowOffsetX = this.ERASER_SHADOW_OFFSET; 
  this.drawingContext.shadowOffsetY = this.ERASER_SHADOW_OFFSET;
  this.drawingContext.shadowBlur    = this.ERASER_SHADOW_BLUR;
  this.drawingContext.strokeStyle   = this.ERASER_STROKE_STYLE;
},

/**
 * 擦除函数
 */
eraseLast: function () {
   var x = this.lastX - this.ERASER_RADIUS - this.ERASER_LINE_WIDTH,
       y = this.lastY - this.ERASER_RADIUS - this.ERASER_LINE_WIDTH,
       w = this.ERASER_RADIUS*2+this.ERASER_LINE_WIDTH*2,
       h = w,
       cw = this.drawingContext.canvas.width,
       ch = this.drawingContext.canvas.height;
   //alert(x+"-"+y+"-"+w+"-"+h+"-"+cw+"-"+ch);
   this.drawingContext.save();

   this.setPathForEraser();
   this.drawingContext.clip();

      if (x + w > cw) w = cw - x;
      if (y + h > ch) h = ch - y;

      if (x < 0) { x = 0; }
      if (y < 0) { y = 0; }

      this.drawingContext.drawImage(
         this.backgroundContext.canvas, x, y, w, h, x, y, w, h);
      //alert(this.backgroundContext.canvas);
   this.drawingContext.restore();
},
/**
 * 这个函数的作用是在鼠标移动时绘制一个圆形跟着鼠标移动，这个圆形就是擦板。
 */
drawEraser: function (loc) {
   this.drawingContext.save();
   this.setEraserAttributes();     

   this.drawingContext.beginPath();
   this.drawingContext.arc(loc.x, loc.y, this.ERASER_RADIUS,
                           0, Math.PI*2, false);
   this.drawingContext.clip();
   this.drawingContext.stroke();

   this.drawingContext.restore();
},

drawSlinky: function (loc) {
   this.drawingContext.save();
   this.setSlinkyAttributes();     

   this.drawingContext.beginPath();
   this.drawingContext.arc(loc.x, loc.y, this.ERASER_RADIUS,
                           0, Math.PI*2, false);
   this.drawingContext.clip();

   this.drawingContext.strokeStyle = "#" + this.strokeStyleSelect.jscolor;
   this.drawingContext.stroke();

   if (this.doFill) {
      this.drawingContext.shadowColor = undefined;
      this.drawingContext.shadowOffsetX = 0;
      this.drawingContext.globalAlpha = 0.2;
      this.drawingContext.fill();
   }
   this.drawingContext.restore();
},

// Finish drawing lines, circles, and rectangles.................

finishDrawingLine: function (loc) {   
   this.drawingContext.beginPath();
   this.drawingContext.moveTo(this.mousedown.x, this.mousedown.y);
   this.drawingContext.lineTo(loc.x, loc.y);
   this.drawingContext.stroke();
},

finishDrawingCircle: function (loc) {
   var angle = Math.atan(this.rubberbandH/this.rubberbandW),
       radius = this.rubberbandH / Math.sin(angle);
   
   if (this.mousedown.y === loc.y) {
      radius = Math.abs(loc.x - this.mousedown.x); 
   }

   this.drawingContext.beginPath();
   this.drawingContext.arc(this.mousedown.x, this.mousedown.y,
                      radius, 0, Math.PI*2, false); 

   if (this.doFill) {
      this.drawingContext.fill();
   }

   this.drawingContext.stroke();
},

finishDrawingRectangle: function () {
   if (this.rubberbandW > 0 && this.rubberbandH > 0) {
      if (this.doFill) {
        this.drawingContext.fillRect(this.rubberbandUlhc.x,
                                this.rubberbandUlhc.y,
                                this.rubberbandW, this.rubberbandH) 
      }
      this.drawingContext.strokeRect(this.rubberbandUlhc.x,
                                this.rubberbandUlhc.y,
                                this.rubberbandW, this.rubberbandH); 
   }
},

// Drawing curves................................................

/* Previous version:
drawControlPoint: function () {
   this.drawingContext.save();

   this.drawingContext.strokeStyle = this.CONTROL_POINT_STROKE_STYLE;
   this.drawingContext.fillStyle   = this.CONTROL_POINT_FILL_STYLE;
   this.drawingContext.lineWidth   = 1.0;

   this.drawingContext.beginPath();
   this.drawingContext.arc(this.controlPoint.x, this.controlPoint.y,
                           this.CONTROL_POINT_RADIUS, 0, Math.PI*2, false);
   this.drawingContext.stroke(); 
   this.drawingContext.fill();

   this.drawingContext.restore();
},
*/
drawCurve: function () {
   this.drawingContext.beginPath();
   this.drawingContext.moveTo(this.curveStart.x, this.curveStart.y);
   this.drawingContext.quadraticCurveTo(this.controlPoint.x, this.controlPoint.y,
                                   this.curveEnd.x, this.curveEnd.y);
   this.drawingContext.stroke();
},

finishDrawingCurve: function () {
   this.drawingContext.save();
   this.drawingCanvas.style.cursor = 'crosshair';
   this.drawingContext.strokeStyle = "#" + this.strokeStyleSelect.jscolor;
   this.restoreDrawingSurface();
   this.drawingContext.strokeStyle = "#" + this.strokeStyleSelect.jscolor;
   this.drawingContext.fillStyle = "#" + this.fillStyleSelect.jscolor;
   this.drawingContext.lineWidth = 1;//this.lineWidthSelect.value;
   this.drawBezierCurve(); 

   if (this.doFill) {
      this.drawingContext.fillStyle = "#" + this.fillStyleSelect.jscolor;
      this.drawingContext.fill();
   }

   this.saveDrawingSurface();
   this.drawingContext.restore();
},

// Guidewires....................................................

drawHorizontalLine: function (y) {
   this.drawingContext.beginPath();
   this.drawingContext.moveTo(0, y+0.5);
   this.drawingContext.lineTo(this.drawingCanvas.width, y+0.5);
   this.drawingContext.stroke();
},

drawVerticalLine: function (x) {
   this.drawingContext.beginPath();
   this.drawingContext.moveTo(x+0.5, 0);
   this.drawingContext.lineTo(x+0.5, this.drawingCanvas.height);
   this.drawingContext.stroke();
},

drawGuidewires: function (x, y) {
   this.drawingContext.save();
   this.drawingContext.strokeStyle = 'rgba(0,0,230,0.4)';
   this.drawingContext.lineWidth = 0.5;
   this.drawVerticalLine(x);
   this.drawHorizontalLine(y);
   this.drawingContext.restore();
},

// START NEW STUFF

// End points and control points......................................

drawControlPoint: function (index) {
   this.drawingContext.beginPath();
   this.drawingContext.arc(this.controlPoints[index].x, this.controlPoints[index].y,
               this.CONTROL_POINT_RADIUS, 0, Math.PI*2, false);
   this.drawingContext.stroke();
   this.drawingContext.fill();
},

drawControlPoints: function () {
   this.drawingContext.save();
   this.drawingContext.strokeStyle = this.CONTROL_POINT_STROKE_STYLE;
   this.drawingContext.fillStyle   = this.CONTROL_POINT_FILL_STYLE;
   this.drawingContext.lineWidth   = 1.0;

   this.drawControlPoint(0);
   this.drawControlPoint(1);

   this.drawingContext.stroke();
   this.drawingContext.fill();
   this.drawingContext.restore();
},

drawEndPoint: function (index) {
   this.drawingContext.beginPath();
   this.drawingContext.arc(this.endPoints[index].x, this.endPoints[index].y,
               this.CONTROL_POINT_RADIUS, 0, Math.PI*2, false);
   this.drawingContext.stroke();
   this.drawingContext.fill();
},

drawEndPoints: function () {
   this.drawingContext.save();
   this.drawingContext.strokeStyle = this.END_POINT_STROKE_STYLE;
   this.drawingContext.fillStyle   = this.END_POINT_FILL_STYLE;
   this.drawingContext.lineWidth   = 1.0;

   this.drawEndPoint(0);
   this.drawEndPoint(1);

   this.drawingContext.stroke();
   this.drawingContext.fill();
   this.drawingContext.restore();
},

drawControlAndEndPoints: function () {
   this.drawControlPoints();
   this.drawEndPoints();
},

cursorInEndPoint: function (loc) {
   var pt, self = this;

   this.endPoints.forEach( function(point) {
      self.drawingContext.beginPath();
      self.drawingContext.arc(point.x, point.y,
                  self.CONTROL_POINT_RADIUS, 0, Math.PI*2, false);

      if (self.drawingContext.isPointInPath(loc.x, loc.y)) {
         pt = point;
      }
   });

   return pt;
},

cursorInControlPoint: function (loc) {
   var pt, self = this;

   this.controlPoints.forEach( function(point) {
      self.drawingContext.beginPath();
      self.drawingContext.arc(point.x, point.y, 
                  self.CONTROL_POINT_RADIUS, 0, Math.PI*2, false);

      if (self.drawingContext.isPointInPath(loc.x, loc.y)) {
         pt = point;
      }
   });

   return pt;
},

updateDraggingPoint: function (loc) {
   this.draggingPoint.x = loc.x;
   this.draggingPoint.y = loc.y;
},

drawBezierCurve: function () {
   this.drawingContext.save();
   this.drawingContext.beginPath();
   this.drawingContext.moveTo(this.endPoints[0].x, this.endPoints[0].y);
   this.drawingContext.bezierCurveTo(this.controlPoints[0].x, this.controlPoints[0].y,
                         this.controlPoints[1].x, this.controlPoints[1].y,
                         this.endPoints[1].x, this.endPoints[1].y);
   this.drawingContext.stroke();
   this.drawingContext.restore();
},

updateEndAndControlPoints: function () {
   this.endPoints[0].x = this.rubberbandUlhc.x;
   this.endPoints[0].y = this.rubberbandUlhc.y;

   this.endPoints[1].x = this.rubberbandUlhc.x + this.rubberbandW;
   this.endPoints[1].y = this.rubberbandUlhc.y  + this.rubberbandH;

   this.controlPoints[0].x = this.rubberbandUlhc.x;
   this.controlPoints[0].y = this.rubberbandUlhc.y  + this.rubberbandH;

   this.controlPoints[1].x = this.rubberbandUlhc.x + this.rubberbandW;
   this.controlPoints[1].y = this.rubberbandUlhc.y;
},

// END NEW STUFF

// Keyboard......................................................

showKeyboard: function () {
   var keyboardElement = document.getElementById('paint-keyboard');

   keyboardElement.style.position = 'absolute';
   keyboardElement.style.height = '370px';
   keyboardElement.style.top = '250px';
   keyboardElement.style.left = '30px';
   keyboardElement.style.border = 'thin inset rgba(0,0,0,0.5)';
   keyboardElement.style.borderRadius = '20px';

   this.keyboard.resize(940, 368);
   this.keyboard.translucent = this.mousedown.y > this.drawingCanvas.height/2;
   this.keyboard.draw();
   this.keyboardVisible = true;
},

hideKeyboard: function () {
   var keyboardElement = document.getElementById('paint-keyboard');

   keyboardElement.style.height = '0px';
   keyboardElement.style.top = '760px';
   keyboardElement.style.border = '';
   keyboardElement.style.borderRadius = '';
   keyboardElement.style.display = 'none';

   this.keyboardVisible = false;
},

// Event handling functions......................................

windowToCanvas: function (canvas, x, y) {
   var bbox = canvas.getBoundingClientRect();
   return { x: x - bbox.left * (canvas.width  / bbox.width),
            y: y - bbox.top  * (canvas.height / bbox.height)
          };
},

mouseDownOrTouchStartInControlCanvas: function (loc) {
   var paint = this;
   
   if (this.editingText) {
      this.editingText = false;
      this.eraseTextCursor();

      if (navigator.platform === 'iPad') {
         this.hideKeyboard();
      }
   }
  
   this.ICON_RECTANGLES.forEach(function(rect) {
      paint.iconContext.beginPath();

      paint.iconContext.rect(rect.x, rect.y, rect.w, rect.h);

      if (paint.iconContext.isPointInPath(loc.x, loc.y)) {
         paint.selectIcon(rect, loc);
         paint.selectedFunction = paint.getIconFunction(rect, loc);

         if (paint.selectedFunction === 'text') {
            paint.drawingCanvas.style.cursor = 'text';
         }
         else {
            paint.drawingCanvas.style.cursor = 'crosshair';
         }
      }
   });
},

// Key event handlers............................................

backspace: function () {
   this.restoreDrawingSurface();
   this.currentText = this.currentText.slice(0, -1);
   this.eraseTextCursor();
},

enter: function () {
   this.finishDrawingText();
   this.mousedown.y += this.drawingContext.measureText('W').width;
   this.saveDrawingSurface();
   this.startDrawingText();
},

insert: function (key) {
   this.currentText += key;
   this.restoreDrawingSurface();
   this.drawCurrentText();
   this.drawTextCursor();
},

eraseTextCursor: function () {
   this.restoreDrawingSurface();
   this.drawCurrentText();
},

drawCurrentText: function () {
   if (this.doFill)
      this.drawingContext.fillText(this.currentText, this.mousedown.x, this.mousedown.y);

   this.drawingContext.strokeText(this.currentText, this.mousedown.x, this.mousedown.y);
},

drawTextCursor: function () {
  var widthMetric = this.drawingContext.measureText(this.currentText),
      heightMetric = this.drawingContext.measureText('W'),
      cursorLoc = {
        x: this.mousedown.x + widthMetric.width,
        y: this.mousedown.y - heightMetric.width + 5
      };

   this.drawingContext.beginPath();
   this.drawingContext.moveTo(cursorLoc.x, cursorLoc.y);
   this.drawingContext.lineTo(cursorLoc.x, cursorLoc.y + heightMetric.width - 12);
   this.drawingContext.stroke();
},

startDrawingText: function () {
   this.editingText = true; 
   this.currentText = '';
   this.drawTextCursor();

   if (navigator.platform === 'iPad')
      this.showKeyboard();
},

finishDrawingText: function () {
   this.restoreDrawingSurface();
   this.drawCurrentText();
},

mouseDownOrTouchStartInDrawingCanvas: function (loc) {
   this.dragging = true;

   if (this.editingText) {
      this.finishDrawingText();
   }
   else if (this.editingCurve) {
      this.draggingPoint = this.cursorInControlPoint(loc);
      
      if (!this.draggingPoint) {
         this.draggingPoint = this.cursorInEndPoint(loc);
      }

      if(!this.draggingPoint) {
         this.restoreDrawingSurface();
         this.finishDrawingCurve();
         this.editingCurve = false;
         this.draggingPoint = false;
         this.dragging = false;
      }
   }

   if (!this.draggingPoint) {
      this.saveDrawingSurface();
      this.mousedown.x = loc.x;
      this.mousedown.y = loc.y;
   
      if (this.selectedFunction === 'path' || this.selectedFunction === 'pathClosed') {
         this.drawingContext.beginPath();
         this.drawingContext.moveTo(loc.x, loc.y);               
      }
      else if (this.selectedFunction === 'text') {
         this.startDrawingText();
      }
      else {
         this.editingText = false;
      }      

      this.lastX = loc.x;
      this.lastY = loc.y;
   }
},

moveControlPoint: function (loc) {
   this.controlPoint.x = loc.x;
   this.controlPoint.y = loc.y;
},

mouseMoveOrTouchMoveInDrawingCanvas: function (loc) {
   if (this.draggingPoint) {
      this.restoreDrawingSurface();

      this.moveControlPoint(loc);

      this.drawingContext.save();

      this.drawGuidewires(loc.x, loc.y);

      this.updateDraggingPoint(loc);
      this.drawControlAndEndPoints();
      this.drawBezierCurve();
   }
   else if (this.dragging) {
      if (this.selectedFunction === 'erase') {
         this.eraseLast();
         this.drawEraser(loc);
         //记录下鼠标移动时的轨迹
         this.points_erase.push(loc);
      }
      else if (this.selectedFunction === 'slinky') {
    	  this.points_slinky.push(loc);
    	  this.drawSlinky(loc); 
      }
      else if (this.selectedFunction === 'path' ||
               this.selectedFunction === 'pathClosed') {
    	 //在绘制路径和闭合路径的时候，应当将鼠标移动的轨迹保存起来
    	 this.points.push(loc);//存入元素
         this.drawingContext.lineTo(loc.x, loc.y);
         this.drawingContext.stroke();
      }
      else if (this.selectedFunction === 'curve') {
         this.restoreDrawingSurface();
         this.updateRubberbandRectangle(loc);
         this.updateDraggingPoint(loc);
         this.updateEndAndControlPoints();
         this.drawControlAndEndPoints();
         this.drawBezierCurve();
      }
      else { // For lines, circles, rectangles, and curves, draw rubberbands
         this.restoreDrawingSurface();
         this.updateRubberbandRectangle(loc);
         this.drawRubberband(loc);   
      }

      this.lastX = loc.x;
      this.lastY = loc.y;
   
      this.lastRect.w = this.rubberbandW;
      this.lastRect.h = this.rubberbandH;
   }

   if (this.dragging) {
       if (this.selectedFunction === 'line' ||
           this.selectedFunction === 'rectangle' ||
           this.selectedFunction === 'circle') {
         this.drawGuidewires(loc.x, loc.y);
      }
   }
},

endPath: function (loc) {
   this.drawingContext.lineTo(loc.x, loc.y);
   this.drawingContext.stroke();
                 
   if (this.selectedFunction === 'pathClosed') {
      this.drawingContext.closePath();

      if (this.doFill) {
         this.drawingContext.fill();
      }
      this.drawingContext.stroke();
   }
},

//鼠标松开或触屏松开，绘制完整的图形。
mouseUpOrTouchEndInDrawingCanvas: function (loc) {
	var first_x=0,first_y=0,second_x=0,second_y=0;
   if (this.selectedFunction !== 'erase'  &&
       this.selectedFunction !== 'slinky' &&
       this.selectedFunction !== 'curve') {
      this.restoreDrawingSurface();
      
   }
  // alert(this.selectedFunction);
   if (this.dragging && ! this.draggingPoint) {
      if (this.selectedFunction === 'erase') {
         this.eraseLast(); 
         //鼠标松开时生成擦除事件
         //alert(this.points_erase.length);
         //获取鼠标按下时的坐标
    	 first_x = this.mousedown.x;
    	 first_y = this.mousedown.y;
    	 //获取鼠标松开时的坐标
    	 second_x = loc.x;
    	 second_y = loc.y;
    	 //this.points_erase.push(loc);
    	 createOP_Erase(this.selectedFunction,first_x,first_y,this.points_erase,
    			 this.drawingContext.strokeStyle,this.drawingContext.fillStyle,this.doFill);
         this.points_erase.length = 0;
      }
      else if (this.selectedFunction === 'path' ||
               this.selectedFunction === 'pathClosed') {//路径和闭合路径 
         this.endPath(loc);//绘制闭合
    	 first_x = this.mousedown.x;
    	 first_y = this.mousedown.y;
    	 second_x = loc.x;
    	 second_y = loc.y;
    	 createOP_Path(this.selectedFunction,first_x,first_y,this.points,
    			 this.drawingContext.strokeStyle,this.drawingContext.fillStyle,this.doFill);
    	 //使用完后将轨迹数组清空
    	 this.points.length = 0;
      }
      else {
         if (this.selectedFunction === 'line'){//线段      
        	 this.finishDrawingLine(loc);
        	 first_x = this.mousedown.x;
        	 first_y = this.mousedown.y;
        	 second_x = loc.x;
        	 second_y = loc.y;
         }
         else if (this.selectedFunction === 'rectangle') {//矩形
        	 this.finishDrawingRectangle();
        	 first_x = this.rubberbandUlhc.x;
        	 first_y = this.rubberbandUlhc.y;
        	 second_x = this.rubberbandW;
        	 second_y = this.rubberbandH;
         }
         else if (this.selectedFunction === 'circle'){//圆
        	 this.finishDrawingCircle(loc);
        	 first_x = this.mousedown.x;
        	 first_y = this.mousedown.y;
        	 second_x = loc.x;
        	 second_y = loc.y;
        }
         else if (this.selectedFunction === 'curve') {//曲线的绘制
            if (!this.editingCurve) {
               this.updateRubberbandRectangle(loc);
               this.drawControlAndEndPoints();

               this.dragging = false;
               this.editing = true;
               this.editingCurve = true;

               this.drawingContext.canvas.style.cursor = 'pointer';

               if (localStorage[this.CURVE_INSTRUCTIONS_LS_KEY] !== 'no') {
                  this.curveInstructions.style.display = 'inline';
               }
            }
            else {
               this.restoreDrawingSurface();
               this.updateRubberbandRectangle(loc);
               this.drawBezierCurve();
            }
         }else if(this.selectedFunction=="slinky"){///连续圆形绘制
             //alert(this.points_slinky.length);
             frist_x = this.mousedown.x;
             first_y = this.mousedown.y;
             createOP_Slinky(this.selectedFunction,first_x,first_y,this.points_slinky,
        			 this.drawingContext.strokeStyle,this.drawingContext.fillStyle,this.doFill);
         }
     }
   }
   this.dragging = false;
   this.draggingPoint = false;
   //绘制完成时将操作发送到远地站点
   createOP(this.selectedFunction,first_x,first_y,second_x,second_y,
		   this.drawingContext.strokeStyle,this.drawingContext.fillStyle,this.doFill);
},

drawBackground: function () {
   this.backgroundContext.canvas.width = this.drawingContext.canvas.width;
   this.backgroundContext.canvas.height = this.drawingContext.canvas.height;

   this.drawGrid(this.backgroundContext, this.GRID_LINE_COLOR, 10, 10);
},
};

//=============================================================================
/**
 * 将本地生成的操作以json格式发送到服务端。
 * 在执行过操作后：
 * 		更新本地sv
 * 		将操作加入到HB中
 */
/**
 * 生成直线操作，矩形操作,圆形操作
 */
function createOP(type,first_x,first_y,second_x,second_y,stroke,fill,dofill){
	//先更新sv
	sv[site_id]++;
	var op_json = "{\"site_id\":\""+site_id+"\",\"sv\":{";
	var op = "{\"site_id\":\""+site_id+"\",\"sv\":{";
	var obj = "{\"obj_type\":\""+type+"\",\"first_x\":\""+first_x+"\",\"first_y\":\""+first_y+
		"\",\"second_x\":\""+second_x+"\",\"second_y\":\""+second_y+"\",\"stroke\":\""+
		stroke+"\",\"fill\":\""+fill+"\",\"dofill\":\""+dofill+"\"}";//绘图对象
	for(var i=0;i<sv.length;i++){
		op_json = op_json + "\""+i+"\":"+"\""+sv[i]+"\",";
		op += "\""+i+"\":"+"\""+sv[i]+"\",";
	}
	if(sv.length!=0){
		op_json = op_json.substr(0,op_json.length-1);//去掉最后一个逗号
		op = op.substr(0,op.length-1);
	}
	op_json += "},";
	op += "},"
	op_json += "\"type\":\"operation\",\"obj_type\":\""+type+"\",\"first_x\":\""+first_x+
		"\",\"first_y\":\""+first_y+"\",\"second_x\":\""+second_x+"\",\"second_y\":\""+second_y+
		"\",\"stroke\":\""+stroke+"\",\"fill\":\""+fill+"\",\"dofill\":\""+dofill+"\",\"position\":\""+doc.length+"\"}";
	op += "\"type\":\"insert\",\"position\":\""+doc.length+"\"}";//position表示操作的位置。
	ws.send(op_json);
	//将执行过的操作写入到历史队列中。
	hi.push(op);
	//将绘图对象加入到绘图文档doc中
	doc.push(obj);
	//alert(op);
	return op_json;
}
/**
 * 构造操作--路径和闭合路径的构建方式
 * @param type
 * @param first_x
 * @param first_y
 * @param stroke
 * @param fill
 * @param dofill
 */
function createOP_Path(type,first_x,first_y,points,stroke,fill,dofill){
	//alert(points.length);
	//先更新sv
	sv[site_id]++;
	var op_json = "{\"site_id\":\""+site_id+"\",\"sv\":{";
	var op = "{\"site_id\":\""+site_id+"\",\"sv\":{";
	
	for(var i=0;i<sv.length;i++){
		op_json = op_json + "\""+i+"\":"+"\""+sv[i]+"\",";
		op += "\""+i+"\":"+"\""+sv[i]+"\",";
	}
	if(sv.length!=0){
		op_json = op_json.substr(0,op_json.length-1);//去掉最后一个逗号
		op = op.substr(0,op.length-1);
	}
	op_json += "},";
	op += "},";
	op_json += "\"type\":\"operation\",\"obj_type\":\""+type+"\",\"first_x\":\""+first_x+
		"\",\"first_y\":\""+first_y+"\",\"points\":[";
	for(var i=0;i<points.length;i++){
		op_json = op_json + "{\"x\":\""+points[i].x+"\",\"y\":\""+points[i].y+"\"},";
	}
	if(points.length!=0)
		op_json = op_json.substr(0,op_json.length-1);
	op_json = op_json +"],\"stroke\":\""+stroke+"\",\"fill\":\""+fill+"\",\"dofill\":\""+dofill+"\",\"position\":\""+doc.length+"\"}";
	op += "\"type\":\"insert\",\"position\":\""+doc.length+"\"}";//position表示操作的位置。
	
	ws.send(op_json);
	//将执行过的操作写入到历史队列中。
	hi.push(op);
	var obj = "{\"obj_type\":\""+type+"\",\"first_x\":\""+first_x+"\",\"first_y\":\""+first_y+
	"\",\"points\":[";
	for(var i=0;i<points.length;i++){
		obj = obj + "{\"x\":\""+points[i].x+"\",\"y\":\""+points[i].y+"\"},";
	}
	if(points.length!=0)
		obj = obj.substr(0,obj.length-1);
	obj = obj + "],\"stroke\":\""+stroke+"\",\"fill\":\""+fill+"\",\"dofill\":\""+dofill+"\"}";//绘图对象
	//将绘图对象加入到绘图文档doc中
	doc.push(obj);
	//alert(obj);
	return op_json;
}
/**
 * 生成连续圆形操作
 * @param type
 * @param first_x
 * @param first_y
 * @param points
 * @param stroke
 * @param fill
 * @param dofill
 * @returns {String}
 */
function createOP_Slinky(type,first_x,first_y,points,stroke,fill,dofill){
	//alert(points.length);
	//先更新sv
	sv[site_id]++;
	var op_json = "{\"site_id\":\""+site_id+"\",\"sv\":{";
	for(var i=0;i<sv.length;i++){
		op_json = op_json + "\""+i+"\":"+"\""+sv[i]+"\",";
	}
	if(sv.length!=0)
		op_json = op_json.substr(0,op_json.length-1);//去掉最后一个逗号
	op_json += "},";
		
	op_json += "\"type\":\"operation\",\"obj_type\":\""+type+"\",\"first_x\":\""+first_x+
		"\",\"first_y\":\""+first_y+"\",\"points\":[";
	for(var i=0;i<points.length;i++){
		op_json = op_json + "{\"x\":\""+points[i].x+"\",\"y\":\""+points[i].y+"\"},";
	}
	op_json = op_json.substr(0,op_json.length-1);
	op_json = op_json +"],\"stroke\":\""+stroke+"\",\"fill\":\""+fill+"\",\"dofill\":\""+dofill+"\"}";
	ws.send(op_json);
	//alert(op_json);
	return op_json;
}
/**
 * 生成擦除操作
 * @param type
 * @param first_x
 * @param first_y
 * @param points
 * @param stroke
 * @param fill
 * @param dofill
 */
function createOP_Erase(type,first_x,first_y,points,stroke,fill,dofill){
	//alert(type+"-"+first_x+"-"+first_y+"-"+points.length+"-"+stroke+"-"+fill+"-"+dofill);
	//先更新sv
	sv[site_id]++;
	var op_json = "{\"site_id\":\""+site_id+"\",\"sv\":{";
	var op = "{\"site_id\":\""+site_id+"\",\"sv\":{";
	
	for(var i=0;i<sv.length;i++){
		op_json = op_json + "\""+i+"\":"+"\""+sv[i]+"\",";
		op += "\""+i+"\":"+"\""+sv[i]+"\",";
	}
	if(sv.length!=0){
		op_json = op_json.substr(0,op_json.length-1);//去掉最后一个逗号
		op = op.substr(0,op.length-1);
	}
	op_json += "},";
	op += "},";
	
	op_json += "\"type\":\"operation\",\"obj_type\":\""+type+"\",\"first_x\":\""+first_x+
		"\",\"first_y\":\""+first_y+"\",\"points\":[";
	for(var i=0;i<points.length;i++){
		op_json = op_json + "{\"x\":\""+points[i].x+"\",\"y\":\""+points[i].y+"\"},";
	}
	op_json = op_json.substr(0,op_json.length-1);
	op_json = op_json +"],\"stroke\":\""+stroke+"\",\"fill\":\""+fill+"\",\"dofill\":\""+dofill+"\"}";
	op += "\"type\":\"delete\",\"position\":\""+doc.length+"\"}";//position表示操作的位置。
	
	ws.send(op_json);
	
	//将执行过的操作写入到历史队列中。
	hi.push(op);
	var obj = "{\"obj_type\":\""+type+"\",\"first_x\":\""+first_x+"\",\"first_y\":\""+first_y+
	"\",\"points\":[";
	for(var i=0;i<points.length;i++){
		obj = obj + "{\"x\":\""+points[i].x+"\",\"y\":\""+points[i].y+"\"},";
	}
	if(points.length!=0)
		obj = obj.substr(0,obj.length-1);
	obj = obj + "],\"stroke\":\""+stroke+"\",\"fill\":\""+fill+"\",\"dofill\":\""+dofill+"\",\"position\":\""+doc.length+"\"}";//绘图对象
	//将绘图对象加入到绘图文档doc中
	doc.push(obj);
	//alert(obj);
	return op_json;
}