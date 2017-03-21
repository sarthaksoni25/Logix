	data={};
scale=1;
var b1;
var width;
var height;
uniqueIdCounter=0;
unit=10
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

var root={
  element:new Element(0,0,"root")
}
function setup() {
  width = window.innerWidth*scale;
  height = window.innerHeight*scale;
  inputs=[];
  grounds=[];
  andGates=[];
  sevenseg=[];
  orGates=[];
  notGates=[];
  outputs=[];
  nodes=[];//intermediate nodes only
  allNodes=[];
  wires=[];
  powers=[];
  objects=[wires,inputs,grounds,powers,andGates,sevenseg,orGates,notGates,outputs,nodes];
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

  for(var i=0;i<allNodes.length;i++)
    if(allNodes[i].parent.element.type!="input")allNodes[i].reset();
  for(var i=0;i<inputs.length;i++){
    simulationArea.stack.push(inputs[i]);
  }
  for(var i=0;i<grounds.length;i++){
    simulationArea.stack.push(grounds[i]);
  }
  for(var i=0;i<powers.length;i++){
    simulationArea.stack.push(powers[i]);
  }
  while(simulationArea.stack.length){
    var elem=simulationArea.stack.pop();
   	elem.resolve();
  }

}


function Wire(node1,node2){
  this.node1=node1;
  this.node2=node2;
  this.type="horizontal";
  this.x1=node1.absX();
  this.y1=node1.absY();
  this.x2=node2.absX();
  this.y2=node2.absY();
  if(this.x1==this.x2)this.type="vertical";
  wires.push(this);
  this.update=function(){
    //console.log(this.node1.absX(),this.node1.absY(),this.node2.absX(),this.node2.absY(),this.type);
    //console.log(simulationArea.mouseX,simulationArea.mouseY);
    //console.log(simulationArea.mouseDown,simulationArea.selected==false,this.checkWithin(simulationArea.mouseX,simulationArea.mouseY));
    if(simulationArea.mouseDown==true && simulationArea.selected==false && this.checkWithin(simulationArea.mouseDownX,simulationArea.mouseDownY)){

      var n=new Node(simulationArea.mouseDownX,simulationArea.mouseDownY,2,root);
      this.converge(n);
      n.clicked=true;
      n.wasClicked=true;
      // n.count=-20;
      simulationArea.selected=true;

    }

    if(this.node1.deleted||this.node2.deleted)this.delete();
    if(simulationArea.mouseDown==false){
      if(this.type=="horizontal"){
        if(node1.absY()!=this.y1){
            var n=new Node(node1.absX(),this.y1,2,root);
            // this.node1.connect(n);
            // this.node2.connect(n);
            // this.delete();
            this.converge(n);
        }
        else if(node2.absY()!=this.y2){
            var n=new Node(node2.absX(),this.y2,2,root);
            // this.node1.connect(n);
            // this.node2.connect(n);
            // this.delete();
            this.converge(n);
        }
      }
      else if(this.type=="vertical"){
        if(node1.absX()!=this.x1){
            var n=new Node(this.x1,node1.absY(),2,root);
            // this.node1.connect(n);
            // this.node2.connect(n);
            // this.delete();
            this.converge(n);
        }
        else if(node2.absX()!=this.x2){
            var n=new Node(this.x2,node2.absY(),2,root);
            // this.node1.connect(n);
            // this.node2.connect(n);
            // this.delete();
            this.converge(n);
        }
      }

  }

    ctx=simulationArea.context;
    ctx.moveTo(this.node1.absX(),this.node1.absY());
    ctx.lineTo(this.node2.absX(),this.node2.absY());
    ctx.stroke();
  }

  this.checkConvergence=function(n){
    return this.checkWithin(n.absX(),n.absY());
  }
  this.checkWithin=function(x,y){
    if((this.type=="horizontal") && (this.node1.absX()<this.node2.absX()) && (x>this.node1.absX()) && (x<this.node2.absX()) && (y===this.node2.absY()))
      return true;
    else if((this.type=="horizontal")  && (this.node1.absX()>this.node2.absX()) && (x<this.node1.absX()) && (x>this.node2.absX()) && (y===this.node2.absY()))
      return true;
    else if((this.type=='vertical')  && (this.node1.absY()<this.node2.absY()) && (y>this.node1.absY()) && (y<this.node2.absY()) && (x===this.node2.absX()))
        return true;
    else if((this.type=='vertical')  && (this.node1.absY()>this.node2.absY()) && (y<this.node1.absY()) && (y>this.node2.absY()) && (x===this.node2.absX()))
          return true
    return false;

  }
  this.converge=function(n){
      ////console.log(1111);
      this.node1.connect(n);
      this.node2.connect(n);
      this.delete();

  }
  this.delete=function(){
    this.node1.connections.clean(this.node2);
    this.node2.connections.clean(this.node1);
    wires.clean(this);
  }
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
  play();
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
  this.id='and'+uniqueIdCounter;
  uniqueIdCounter++;
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
    if(this.element.b.isHover())
      console.log(this.id);
  }
}

function SevenSegDisplay(x, y){
  this.element=new Element(x,y,"SevenSegmentDisplay");
  this.g=new Node(-20,-50,0,this);
  this.f=new Node(-10,-50,0,this);
  this.a=new Node(+10, -50,0,this);
  this.b=new Node(+20,-50,0,this);
  this.e=new Node(-20,+50,0,this);
  this.d=new Node(-10,+50,0,this);
  this.c=new Node(+10,+50,0,this);
  this.dot=new Node(+20,+50,0,this);

  sevenseg.push(this);
  this.isResolvable=function(){
    return this.a.value!=-1 && this.b.value!=-1 && this.c.value!=-1 && this.d.value!=-1 && this.e.value!=-1 && this.f.value!=-1 && this.g.value!=-1 && this.dot.value!=-1;
  }

  this.resolve=function(){

  }
  this.drawSegment = function(x1,y1,x2,y2,color){
  	ctx=simulationArea.context;
  	ctx.beginPath();
  	ctx.strokeStyle=color;
  	ctx.lineWidth=5*scale;
  	ctx.moveTo(this.element.x+x1,this.element.y+y1);
  	ctx.lineTo(this.element.x+x2,this.element.y+y2);
  	ctx.stroke();
  }
  this.update=function(){
    this.a.updatePosition();
    this.b.updatePosition();
    this.c.updatePosition();
    this.d.updatePosition();
    this.e.updatePosition();
    this.f.updatePosition();
    this.g.updatePosition();
    this.dot.updatePosition();
    this.element.updatePosition();
    ctx = simulationArea.context;

    var xx=this.element.x;
    var yy=this.element.y;
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth=3*scale;
    ctx.rect(xx-30,yy-50,60,100);
    ctx.stroke();

    if(this.b.value == 1)
    	this.drawSegment(20, -5, 20, -35, 'red');
    else
    	this.drawSegment(20, -5, 20, -35, 'black');
    if(this.c.value == 1)
    	this.drawSegment(20, 5, 20, 35, 'red');
    else
    	this.drawSegment(20, 5, 20, 35, 'black');
    if(this.f.value == 1)
    	this.drawSegment(-20, -5, -20, -35, 'red');
    else
    	this.drawSegment(-20, -5, -20, -35, 'black');
    if(this.e.value == 1)
    	this.drawSegment(-20, 5, -20, 35, 'red');
    else
    	this.drawSegment(-20, 5, -20, 35, 'black');
    if(this.a.value == 1)
    	this.drawSegment(-15, -40, 15, -40, 'red');
    else
    	this.drawSegment(-15, -40, 15, -40, 'black');
    if(this.g.value == 1)
    	this.drawSegment(-15, 0, 15, 0, 'red');
    else
    	this.drawSegment(-15, 0, 15, 0, 'black');
    if(this.d.value == 1)
    	this.drawSegment(-15, 40, 15, 40, 'red');
    else
    	this.drawSegment(-15, 40, 15, 40, 'black');
	ctx.beginPath();
	if(this.dot.value==1)
		ctx.strokeStyle='red';
	else
		ctx.strokeStyle='black';
	ctx.rect(xx+20,yy+40,2,2);
	ctx.stroke();
    this.element.update();
    this.a.update();
    this.b.update();
    this.c.update();
    this.d.update();
    this.e.update();
    this.f.update();
    this.g.update();
    this.dot.update();
  }
}

function OrGate(x,y){
  this.id='or'+uniqueIdCounter;
  uniqueIdCounter++;
  this.element=new Element(x,y,"or");
  this.inp1=new Node(-10,-10,0,this);
  this.inp2=new Node(-10,+10,0,this);
  this.output1=new Node(20,0,1,this);
  orGates.push(this);
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

    var xx=this.element.x;
    var yy=this.element.y;
    ctx.beginPath();
    ctx.moveTo(xx-10,yy-20);
    ctx.bezierCurveTo(xx,yy-20,xx+15,yy-10,xx+20,yy);
    ctx.bezierCurveTo(xx+15,yy+10,xx,yy+20,xx-10,yy+20);
    ctx.bezierCurveTo(xx,yy,xx,yy,xx-10,yy-20);
    ctx.closePath();
    ctx.stroke();
    this.element.update();
    this.inp1.update();
    this.inp2.update();
    this.output1.update();
    if(this.element.b.isHover())
      console.log(this.id);
  }
}

function NotGate(x,y){
  this.id='not'+uniqueIdCounter;
  uniqueIdCounter++;
  this.element=new Element(x,y,"not");
  this.inp1=new Node(-10,0,0,this);
  this.output1=new Node(20,0,1,this);
  notGates.push(this);

  this.isResolvable=function(){
    return this.inp1.value!=-1 ;
  }

  this.resolve=function(){
    if(this.isResolvable()==false){
      return;
    }
    this.output1.value=(this.inp1.value+1)%2;
    simulationArea.stack.push(this.output1);
  }

  this.update=function(){
    this.inp1.updatePosition();
    this.output1.updatePosition();
    this.element.updatePosition();
    ctx = simulationArea.context;
    ctx.strokeStyle = ("rgba(0,0,0,1)");
    ctx.lineWidth=3*scale;

    var xx=this.element.x;
    var yy=this.element.y;
    ctx.beginPath();
    ctx.moveTo(xx-10,yy-10);
    ctx.lineTo(xx+10,yy);
    ctx.arc(xx+15,yy,5,-Math.PI,Math.PI);
    ctx.lineTo(xx-10,yy+10);
    ctx.closePath();
    ctx.stroke();

    ctx.stroke();
    this.element.update();
    this.inp1.update();
    this.output1.update();
    if(this.element.b.isHover())
      console.log(this.id);
  }
}


function Input(x,y){
  this.id='input'+uniqueIdCounter;
  uniqueIdCounter++;
  this.element=new Element(x,y,"input");
  this.output1=new Node(10,0,1,this);
  this.state=0;
  this.output1.value=this.state;
  inputs.push(this);
  console.log(this);
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
    if(this.element.b.isHover())
      console.log(this.id);
  }
}
function Ground(x,y){
  this.id='ground'+uniqueIdCounter;
  uniqueIdCounter++;
  this.element=new Element(x,y,"ground");
  this.output1=new Node(0,-30,1,this);
  this.state=0;
  this.output1.value=this.state;
  grounds.push(this);
  console.log(this);
  this.wasClicked=false;
  this.resolve=function(){
  	this.output1.value=this.state;	
    this.output1.resolve();
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
    ctx.moveTo(xx , yy-30);
    ctx.lineTo(xx , yy-20);
    ctx.moveTo(xx-10, yy-20);
    ctx.lineTo(xx+10 , yy-20);
    ctx.moveTo(xx-6 , yy -15);
    ctx.lineTo(xx+6 , yy-15);
    ctx.moveTo(xx-2.5 , yy -10);
    ctx.lineTo(xx+2.5 , yy-10);
    ctx.stroke();
    this.element.update();
    this.output1.update();
    if(this.element.b.isHover())
      console.log(this.id);
  }
}
function Power(x,y){
  this.id='power'+uniqueIdCounter;
  uniqueIdCounter++;
  this.element=new Element(x,y,"power");
  this.output1=new Node(0,20,1,this);
  this.state=1;
  this.output1.value=this.state;
  powers.push(this);
  console.log(this);
  this.wasClicked=false;
  this.resolve=function(){
  	this.output1.value=this.state;	
    this.output1.resolve();
  }

  this.update=function(){

    this.output1.updatePosition();
    this.element.updatePosition();
    ctx = simulationArea.context;
    ctx.strokeStyle = ("rgba(0,0,0,1)");
    ctx.lineWidth=3*scale;
    var xx=this.element.x;
    var yy=this.element.y;
    ctx.beginPath();
    ctx.moveTo(xx, yy);
    ctx.lineTo(xx-10,yy+10);
    ctx.moveTo(xx-10, yy+10);
    ctx.lineTo(xx+10,yy+10);
    ctx.moveTo(xx+10, yy+10);
    ctx.lineTo(xx,yy);
    ctx.moveTo(xx, yy+10);
    ctx.lineTo(xx,yy+20);
    ctx.stroke();
    this.element.update();
    this.output1.update();
    if(this.element.b.isHover())
      console.log(this.id);
  }
}

function Output(x,y){
  this.id='output'+uniqueIdCounter;
  uniqueIdCounter++;
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
    if(this.element.b.isHover())
      console.log(this.id);
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
  this.id='node'+uniqueIdCounter;
  uniqueIdCounter++;
  this.parent=parent;
  this.x=x;
  this.y=y;
  this.type=type;
  this.connections=new Array();
  this.value=-1;
  this.radius=5;
  this.clicked=false;
  this.wasClicked=false;
  this.prev='a';
  this.count=0;
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
    var w=new Wire(this,n);
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

    if(this.isHover())
      console.log(this.id);
      if(this.type==2)this.updatePosition();
      var ctx = simulationArea.context;

      if(this.clicked){
        if(this.prev=='x')
        {
          ctx.beginPath();
          ctx.moveTo(this.x+this.parent.element.x,this.y+this.parent.element.y);
          ctx.lineTo(simulationArea.mouseX,this.y+this.parent.element.y);
          ctx.lineTo(simulationArea.mouseX,simulationArea.mouseY);
          ctx.stroke();

        }
        else if(this.prev=='y')
        {
          ctx.beginPath();
          ctx.moveTo(this.x+this.parent.element.x,this.y+this.parent.element.y);
          ctx.lineTo(this.x+this.parent.element.x,simulationArea.mouseY);
          ctx.lineTo(simulationArea.mouseX,simulationArea.mouseY);
          ctx.stroke();
        }
        else{
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

      if(this.type==2){
        if(this.connections.length==2 && simulationArea.mouseDown==false){
          if((this.connections[0].absX()==this.connections[1].absX())||(this.connections[0].absY()==this.connections[1].absY())){
            this.connections[0].connections.clean(this);
            this.connections[1].connections.clean(this);
            allNodes.clean(this);
            nodes.clean(this);
            this.deleted=true;
            this.connections[0].connect(this.connections[1]);
          }
        }
      }
  }
  this.updatePosition = function() {

      if (simulationArea.mouseDown && (this.clicked)) {
        this.count+=1;
        if(this.prev=='a' && this.count>=20)
        {
          if(Math.abs(this.x+this.parent.element.x - simulationArea.mouseX)>Math.abs(this.y+this.parent.element.y - simulationArea.mouseY))
          {
            this.prev='x';
          }
          else{
            this.prev='y';
          }
        }
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
        if(simulationArea.mouseDownX==this.absX()&&simulationArea.mouseDownY==this.absY())
          return;

        var n,n1;
        var x,y,x1,y1,flag=-1;
        x1=simulationArea.mouseX;
        y1=simulationArea.mouseY;
        if(this.prev=='x'){
          x=x1;
          y=this.absY();
          //console.log(this.prev);
          flag=0;
        }else if(this.prev=='y'){
          y=y1;
          x=this.absX();
          flag=1;
          //console.log(this.prev);
        }
        else if(this.prev=='a'){
          //console.log(this.prev);
          if(Math.abs(this.x+this.parent.element.x - simulationArea.mouseX)>Math.abs(this.y+this.parent.element.y - simulationArea.mouseY)){
            x=x1;
            y=this.absY();
          }
          else{
            y=y1;
            x=this.absX();
          }
        }

        for(var i=0;i<allNodes.length;i++){
          if(x==allNodes[i].absX()&&y==allNodes[i].absY()){
            n=allNodes[i];
            this.connect(n);
            break;
          }
        }

        if(n==undefined){
          n=new Node(x,y,2,root);
          this.connect(n);
          for(var i=0;i<wires.length-1;i++){
            if(wires[i].checkConvergence(n)){

              ////console.log();
                wires[i].converge(n);
                //console.log(1111);
             }
          }
        }
        this.prev='a';


        if(flag==0 && (this.y+this.parent.element.y - simulationArea.mouseY)!=0){
          y=y1;
          flag=2;
        }
        else if((this.x+this.parent.element.x - simulationArea.mouseX)!=0 && flag==1) {
          x=x1;
          flag=2;
        }
        if(flag==2){
        for(var i=0;i<allNodes.length;i++){
          if(x==allNodes[i].absX()&&y==allNodes[i].absY()){
            n1=allNodes[i];
            n.connect(n1);
            break;
          }
        }
        if(n1==undefined){
          n1=new Node(x,y,2,root);
          n.connect(n1);
          for(var i=0;i<wires.length-1;i++){
            if(wires[i].checkConvergence(n1)){
              ////console.log();
                wires[i].converge(n1);
                //console.log(1111);
             }
          }
        }

        }
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

function addAnd(){
  var a=new AndGate(200,150);
}
function addOr(){
  var or=new OrGate(200,150);
}
function addNot(){
  var npt=new NotGate(200,150);
}
function addInput(){
  var a=new Input(200,150);
}
function addOutput(){
  var a=new Output(200,150);
}
function addSevenSeg(){
  var a=new SevenSegDisplay(400,150);
}

document.getElementById("playButton").addEventListener("click", play);
document.getElementById("andButton").addEventListener("click", addAnd);
document.getElementById("orButton").addEventListener("click", addOr);
document.getElementById("notButton").addEventListener("click", addNot);
document.getElementById("inputButton").addEventListener("click", addInput);
document.getElementById("outputButton").addEventListener("click", addOutput);
document.getElementById("sevenSegButton").addEventListener("click", addSevenSeg);
