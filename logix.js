data={};
scale=1;
var b1;
var width;
var height;
unit=10
var root={
  element:new Element(0,0,"root")
}
function setup() {
  width = window.innerWidth*scale;
  height = window.innerHeight*scale;
  inputs=[];
  andGates=[];
  outputs=[];
  nodes=[];//intermediate nodes only
  allNodes=[];
  objects=[inputs,andGates,outputs,nodes];
  // i1=new Input(100,100);
  // i2=new Input(100,200);
  // i3=new Input(100,300);
  // i4=new Input(100,400);
  //a1=new AndGate(200,150);
  // a2=new AndGate(200,350);
  // a3=new AndGate(300,250);
  // o1=new Output(400,250);
  // i1.output1.connections.push(a1.inp1);
  // i2.output1.connections.push(a1.inp2);
  // i4.output1.connections.push(a2.inp2);
  // i3.output1.connections.push(a2.inp1);
  // a1.output1.connections.push(a3.inp1);
  // a2.output1.connections.push(a3.inp2);
  // a3.output1.connections.push(o1.inp1);
  // o2=new Output(300,150);
  // o3=new Output(300,350);
  // a2.output1.connections.push(o3.inp1);
  // a1.output1.connections.push(o2.inp1);
  // setInterval(play,50);
  simulationArea.setup();
}

function resetup(){
  width = window.innerWidth*scale;
  height = window.innerHeight*scale;
  simulationArea.setup();
}

var canvas = document.getElementById("myCanvas");


function play(){
  for(var i=0;i<inputs.length;i++){
    simulationArea.stack.push(inputs[i]);
  }

  while(simulationArea.stack.length){
    var elem=simulationArea.stack.pop();
   	elem.resolve();
  }

}

function addAnd(){

  var a=new AndGate(200,150);

}

function addInput(){

  var a=new Input(200,150);

}

function addOutput(){

  var a=new Output(200,150);

}
window.onresize = resetup;

window.addEventListener('orientationchange', resetup);

var simulationArea = {
    canvas: document.getElementById("simulationArea"),
    selected: false,
    stack:[],
    setup: function() {
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(update, 20);
        window.addEventListener('mousemove', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseX = (e.clientX - rect.left)*scale;
            simulationArea.mouseY = (e.clientY - rect.top)*scale;
            simulationArea.mouseX = Math.round(simulationArea.mouseX/unit)*unit;
            simulationArea.mouseY = Math.round(simulationArea.mouseY/unit)*unit;
        });
        window.addEventListener('mousedown', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseDownX = (e.clientX - rect.left)*scale;
            simulationArea.mouseDownY = (e.clientY - rect.top)*scale;
            simulationArea.mouseDownX = Math.round(simulationArea.mouseDownX/unit)*unit;
            simulationArea.mouseDownY = Math.round(simulationArea.mouseDownY/unit)*unit;
            simulationArea.mouseDown = true;
        });
        window.addEventListener('touchstart', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();

            simulationArea.mouseDownX = (e.touches[0].clientX-rect.left)*scale;
            simulationArea.mouseDownY = (e.touches[0].clientY-rect.top)*scale;
            simulationArea.mouseX = (e.touches[0].clientX- rect.left)*scale;
            simulationArea.mouseY = (e.touches[0].clientY- rect.top)*scale;
            simulationArea.mouseDown = true;
        });
        window.addEventListener('touchend', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseDown = false;
        });
        window.addEventListener('touchleave', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseDown = false;
        });
        window.addEventListener('mouseup', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseDownX = (e.clientX - rect.left)*scale;
            simulationArea.mouseDownY = (e.clientY - rect.top)*scale;
            simulationArea.mouseDownX = Math.round(simulationArea.mouseDownX/unit)*unit;
            simulationArea.mouseDownY = Math.round(simulationArea.mouseDownY/unit)*unit;

            simulationArea.mouseDown = false;
        });
        window.addEventListener('touchmove', function (e) {
           var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseX = (e.touches[0].clientX- rect.left)*scale;
            simulationArea.mouseY = (e.touches[0].clientY- rect.top)*scale;
        })
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function update() {
    simulationArea.clear();
     dots(10);
    //  play();
     for(var i=0;i<objects.length;i++)
        for(var j=0;j<objects[i].length;j++)
          objects[i][j].update();


}


function dots(scale){
  var canvasWidth = simulationArea.canvas.width;
  var canvasHeight = simulationArea.canvas.height;
  var ctx = simulationArea.context;
  var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    function drawPixel (x, y, r, g, b, a) {
        var index = (x + y * canvasWidth) * 4;
        canvasData.data[index + 0] = r;
        canvasData.data[index + 1] = g;
        canvasData.data[index + 2] = b;
        canvasData.data[index + 3] = a;
    }
    for(var i=0;i<canvasWidth;i+=scale)
      for(var j=0;j<canvasHeight;j+=scale)
    drawPixel(i, j, 0,0, 0, 255);

    ctx.putImageData(canvasData, 0, 0);

}

function AndGate(x,y){
  this.element=new Element(x,y,"and");
  this.inp1=new Node(-10,-10,0,this);
  this.inp2=new Node(-10,+10,0,this);
  this.output1=new Node(20,0,1,this);
  andGates.push(this);
  this.isResolvable=function(){
    return this.inp1.value!=-1 && this.inp2.value!=-1;
  }

  this.resolve=function(){
    if(this.isResolvable()==false){
      return;
    }
    this.output1.value=this.inp1.value&this.inp2.value;
    simulationArea.stack.push(this.output1);
  }

  this.update=function(){
    this.inp1.updatePosition();
    this.inp2.updatePosition();
    this.output1.updatePosition();
    this.element.updatePosition();
    ctx = simulationArea.context;
    ctx.strokeStyle = ("rgba(0,0,0,1)");
    ctx.lineWidth=3*scale;
    ctx.beginPath();
    var xx=this.element.x;
    var yy=this.element.y;
    ctx.moveTo(xx-10, yy-20);
    ctx.lineTo(xx, yy-20);
    ctx.arc(xx,yy,20,-Math.PI/2,Math.PI/2);
    ctx.lineTo(xx-10,yy+20);
    ctx.lineTo(xx-10, yy-20);
    ctx.closePath();
    ctx.stroke();
    this.element.update();
    this.inp1.update();
    this.inp2.update();
    this.output1.update();
  }
}

function OrGate(x,y){
  this.element=new Element(x,y,"and");
  this.inp1=new Node(-10,-10,0,this);
  this.inp2=new Node(-10,+10,0,this);
  this.output1=new Node(20,0,1,this);
  andGates.push(this);
  this.isResolvable=function(){
    return this.inp1.value!=-1 && this.inp2.value!=-1;
  }

  this.resolve=function(){
    if(this.isResolvable()==false){
      return;
    }
    this.output1.value=this.inp1.value|this.inp2.value;
    simulationArea.stack.push(this.output1);
  }

  this.update=function(){
    this.inp1.updatePosition();
    this.inp2.updatePosition();
    this.output1.updatePosition();
    this.element.updatePosition();
    ctx = simulationArea.context;
    ctx.strokeStyle = ("rgba(0,0,0,1)");
    ctx.lineWidth=3*scale;
    ctx.beginPath();
    var xx=this.element.x;
    var yy=this.element.y;
    ctx.moveTo(xx-10,yy-20);
    ctx.bezierCurveTo(xx,yy-20,xx+15,yy-10,xx+20,yy);
    ctx.moveTo(xx-10,yy-20);
    ctx.bezierCurveTo(xx,yy,xx,yy,xx-10,yy+20);
    ctx.moveTo(xx-10,yy+20);
    ctx.bezierCurveTo(xx,yy+20,xx+15,yy+10,xx+20,yy);
    ctx.closePath();
    ctx.stroke();
    this.element.update();
    this.inp1.update();
    this.inp2.update();
    this.output1.update();
  }
}


function Input(x,y){
  this.element=new Element(x,y,"input");
  this.output1=new Node(10,0,1,this);
  this.state=0;
  this.output1.value=this.state;
  inputs.push(this);
  this.wasClicked=false;
  this.resolve=function(){
    this.output1.resolve();
  }

  this.toggleState=function(){
    this.state=(this.state+1)%2;
    this.output1.value=this.state;
  }
  this.update=function(){

    this.output1.updatePosition();
    this.element.updatePosition();
    ctx = simulationArea.context;
    ctx.strokeStyle = ("rgba(0,0,0,1)");
    ctx.lineWidth=3*scale;
    ctx.beginPath();
    var xx=this.element.x;
    var yy=this.element.y;
    ctx.rect(xx-10,yy-10,20,20);
    ctx.stroke();
    ctx.closePath();
    if(simulationArea.mouseDown==false)
		this.wasClicked=false;
    if(simulationArea.mouseDown && !this.wasClicked && this.element.b.clicked){
    	this.toggleState();
    	this.wasClicked=true;
    	}
    ctx.font="20px Georgia";
    ctx.fillText(this.state.toString(),xx-5,yy+5);
    this.element.update();
    this.output1.update();
  }
}

function Output(x,y){
  this.element=new Element(x,y,"output");
  this.inp1=new Node(-10,0,0,this);
  this.state=-1;
  this.inp1.value=this.state;
  outputs.push(this);

  this.resolve=function(){
  	this.state=this.inp1.value;
  }

  this.isResolvable=function(){
    return this.inp1.value!=-1;
  }

  this.update=function(){

    this.inp1.updatePosition();
    this.element.updatePosition();
    ctx = simulationArea.context;
    ctx.strokeStyle = ("rgba(0,0,0,1)");
    ctx.lineWidth=3*scale;
    ctx.beginPath();
    var xx=this.element.x;
    var yy=this.element.y;
    ctx.arc(xx,yy,10,0,2*Math.PI);
    ctx.stroke();
    ctx.closePath();

    ctx.font="19px Georgia";
    if(this.state==-1)
      ctx.fillText("x",xx-5,yy+5);
    else
      ctx.fillText(this.state.toString(),xx-5,yy+5);
    this.element.update();
    this.inp1.update();
  }
}

function Element(x,y,type){
  this.type=type;
  this.x=x;
  this.y=y;
  this.b=new Button(x,y,6,"rgba(255,255,255,0)", "rgba(0,0,0,1)");
  this.isResolved=false;
  this.updatePosition=function(){

    this.b.updatePosition();
    this.b.x=Math.round(this.b.x/unit)*unit;
    this.b.y=Math.round(this.b.y/unit)*unit;
    this.x=this.b.x;
    this.y=this.b.y;
  }
  this.update=function(){
        this.b.update();
  }
}

//output node=1
//input node=0
//intermediate node =2
function Node(x,y,type,parent){
  this.parent=parent;
  this.x=x;
  this.y=y;
  this.type=type;
  this.connections=new Array();
  this.value=-1;
  this.radius=5;
  this.clicked=false;
  this.wasClicked=false;
  if(this.type==2)nodes.push(this);
  allNodes.push(this);

  this.absX=function(){
    return this.x+this.parent.element.x;
  }
  this.absY=function(){
    return this.y+this.parent.element.y;
  }
  this.reset=function(){
    this.value=-1;
  }

  this.connect=function(n){
    this.connections.push(n);
    n.connections.push(this);
  }

  this.resolve=function(){
    if(this.value==-1){
      return;
    }

    if(this.type==1){
      for(var i=0;i<this.connections.length;i++){
        this.connections[i].value=this.value;
        simulationArea.stack.push(this.connections[i]);
      }
    }
    else if(this.type==0){
      if(this.parent.isResolvable())
        simulationArea.stack.push(this.parent);
    }else if(this.type==2){
      for(var i=0;i<this.connections.length;i++){
        if(this.connections[i].value==-1){
        this.connections[i].value=this.value;
        simulationArea.stack.push(this.connections[i]);
      }
    }
  }
  }
  this.update=function(){
      if(this.type==2)this.updatePosition();
      var ctx = simulationArea.context;
      if(this.clicked){
        if(Math.abs(this.x+this.parent.element.x - simulationArea.mouseX)>Math.abs(this.y+this.parent.element.y - simulationArea.mouseY)){
            ctx.beginPath();
            ctx.moveTo(this.x+this.parent.element.x,this.y+this.parent.element.y);
            ctx.lineTo(simulationArea.mouseX,this.y+this.parent.element.y);
            ctx.closePath();
            ctx.stroke();
        }
        else{
          ctx.beginPath();
          ctx.moveTo(this.x+this.parent.element.x,this.y+this.parent.element.y);
          ctx.lineTo(this.x+this.parent.element.x,simulationArea.mouseY);
          ctx.closePath();
          ctx.stroke();
        }
      }

      ctx.fillStyle ="green";
      ctx.beginPath();
      ctx.arc(this.x+this.parent.element.x, this.y+this.parent.element.y, 3, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
      if(this.isHover() && !simulationArea.selected){
        ctx.strokeStyle ="green";
        ctx.beginPath();
        ctx.arc(this.x+this.parent.element.x, this.y+this.parent.element.y, 8, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
      }


  }
  this.updatePosition = function() {
      if (simulationArea.mouseDown && (this.clicked)) {
        if(this.type==2){
          // this.x = simulationArea.mouseX;
          // this.y = simulationArea.mouseY;
          return true;
        }
      } else if (simulationArea.mouseDown && !simulationArea.selected) {
          simulationArea.selected = this.clicked = this.hover = this.isClicked();
          this.wasClicked|=this.clicked;
          return this.clicked;
      } else if(!simulationArea.mouseDown){
          if (this.clicked) simulationArea.selected = false;
          this.clicked = false;
      }
      if(this.wasClicked&&!this.clicked){

        this.wasClicked=false;
        var n;
        var x,y;
        if(Math.abs(this.x+this.parent.element.x - simulationArea.mouseX)>Math.abs(this.y+this.parent.element.y - simulationArea.mouseY)){
          x=simulationArea.mouseX;
          y=this.absY();
        }else{
          y=simulationArea.mouseY;
          x=this.absX();
        }
        for(var i=0;i<allNodes.length;i++){
          if(x==allNodes[i].absX()&&y==allNodes[i].absY()){
            n=allNodes[i];

            break;
          }
        }
        if(n==undefined)
          n=new Node(x,y,2,root);
        this.connect(n);
      }
      return false;
  }
  this.isClicked = function() {
      if (Math.pow(this.x+this.parent.element.x - simulationArea.mouseDownX, 2) + Math.pow(this.y +this.parent.element.y- simulationArea.mouseDownY, 2) < Math.pow(this.radius * 2, 2)) {
          return true;
      }
      return false;
  }
  this.isHover = function() {
      if (Math.pow(this.x +this.parent.element.x- simulationArea.mouseX, 2) + Math.pow(this.y +this.parent.element.y- simulationArea.mouseY, 2) < Math.pow(this.radius * 2, 2)) {
          return true;
      }
      return false;
  }

}


function Button(x, y, radius, color1, color2) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color1 = color1;
    this.color2 = color2;
    this.clicked = false;

    this.update = function() {

        if (this.clicked || (this.isHover() && !simulationArea.selected)) {

            var ctx = simulationArea.context;
            ctx.fillStyle = this.color2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
        } else {

            var ctx = simulationArea.context;
            ctx.fillStyle =this.color1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
        }

    }
    this.updatePosition = function() {
        if (simulationArea.mouseDown && (this.clicked)) {
            this.x = simulationArea.mouseX;
            this.y = simulationArea.mouseY;
            return true;
        } else if (simulationArea.mouseDown && !simulationArea.selected) {
            simulationArea.selected = this.clicked = this.hover = this.isClicked();
            return this.clicked;
        } else {
            if (this.clicked) simulationArea.selected = false;
            this.clicked = false;
        }
        return false;
    }
    this.isClicked = function() {
        if (Math.pow(this.x - simulationArea.mouseDownX, 2) + Math.pow(this.y - simulationArea.mouseDownY, 2) < Math.pow(this.radius * 3, 2)) {
            return true;
        }
        return false;
    }
    this.isHover = function() {
        if (Math.pow(this.x - simulationArea.mouseX, 2) + Math.pow(this.y - simulationArea.mouseY, 2) < Math.pow(this.radius * 2, 2)) {
            return true;
        }
        return false;
    }
}


function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}


document.getElementById("playButton").addEventListener("click", play);
document.getElementById("andButton").addEventListener("click", addAnd);
document.getElementById("inputButton").addEventListener("click", addInput);
document.getElementById("outputButton").addEventListener("click", addOutput);
