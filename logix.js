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
  toBeUpdated=true;
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
  simulationArea.setup();
}

function resetup(){
  width = window.innerWidth*scale;
  height = window.innerHeight*scale;
  simulationArea.setup();
}

function play(){
  console.log("simulatoin");
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
    var updated=false;
		if(simulationArea.mouseDown==true && simulationArea.selected==false && this.checkWithin(simulationArea.mouseDownX,simulationArea.mouseDownY)){
      var n=new Node(simulationArea.mouseDownX,simulationArea.mouseDownY,2,root);
      this.converge(n);
      n.clicked=true;
      n.wasClicked=true;
      simulationArea.selected=true;
      updated=true;
    }

    if(this.node1.deleted||this.node2.deleted)this.delete();
    if(simulationArea.mouseDown==false){
      if(this.type=="horizontal"){
        if(node1.absY()!=this.y1){
            var n=new Node(node1.absX(),this.y1,2,root);
            this.converge(n);
            updated=true;
        }
        else if(node2.absY()!=this.y2){
            var n=new Node(node2.absX(),this.y2,2,root);
            this.converge(n);
            updated=true;
        }
      }
      else if(this.type=="vertical"){
        if(node1.absX()!=this.x1){
            var n=new Node(this.x1,node1.absY(),2,root);
            this.converge(n);
            updated=true;
        }
        else if(node2.absX()!=this.x2){
            var n=new Node(this.x2,node2.absY(),2,root);
            this.converge(n);
            updated=true;
        }
      }
		}
    return updated;
	}
  this.draw=function(){
    ctx=simulationArea.context;
		color=["red","DarkGreen","Lime"][this.node1.value+1];
		drawLine(ctx,this.node1.absX(),this.node1.absY(),this.node2.absX(),this.node2.absY(),color,3*scale);
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
      this.node1.connect(n);
      this.node2.connect(n);
      this.delete();
  }

  this.delete=function(){
		toBeUpdated=true;
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
    hover: false,
		lastSelected:undefined,
    stack:[],
    setup: function() {
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(update, 50);
        // this.interval = setInterval(play, 300);
        window.addEventListener('mousemove', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseX = (e.clientX - rect.left)*scale;
            simulationArea.mouseY = (e.clientY - rect.top)*scale;
            simulationArea.mouseX = Math.round(simulationArea.mouseX/unit)*unit;
            simulationArea.mouseY = Math.round(simulationArea.mouseY/unit)*unit;
        });
				window.addEventListener('keydown', function (e) {
            if(e.keyCode==8&&simulationArea.lastSelected!=undefined){
							simulationArea.lastSelected.delete();
						}
        })
        window.addEventListener('mousedown', function(e) {
					  simulationArea.lastSelected=undefined;
					  simulationArea.selected=false;
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
  // play();


     var updated=false;
     simulationArea.hover=false;
     for(var i=0;i<objects.length;i++)
        for(var j=0;j<objects[i].length;j++)
          updated|=objects[i][j].update();
    toBeUpdated|=updated;
		// console.log(updated);
		if(toBeUpdated){
      toBeUpdated=false;
			play();
		}

		simulationArea.clear();
		dots(10);
		for(var i=0;i<objects.length;i++)
				for(var j=0;j<objects[i].length;j++)
				  updated|=objects[i][j].draw();


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
  this.element=new Element(x,y,"and",25,this);
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
    var updated=false;
    updated|=this.output1.update();
    updated|=this.inp1.update();
    updated|=this.inp2.update();
    updated|=this.element.update();
    return updated;
  }

  this.draw=function(){

    ctx = simulationArea.context;

    ctx.beginPath();
		ctx.lineWidth=3*scale;
		ctx.strokeStyle = "black";//("rgba(0,0,0,1)");
		ctx.fillStyle = "rgba(255, 255, 32,0.5)";
    var xx=this.element.x;
    var yy=this.element.y;
    ctx.moveTo(xx-10, yy-20);
    ctx.lineTo(xx, yy-20);
    ctx.arc(xx,yy,20,-Math.PI/2,Math.PI/2);
    ctx.lineTo(xx-10,yy+20);
    ctx.lineTo(xx-10, yy-20);
    ctx.closePath();
		if(this.element.b.hover||simulationArea.lastSelected==this)ctx.fill();
    ctx.stroke();
    // this.element.update();

    this.inp1.draw();
    this.inp2.draw();
    this.output1.draw();

    if(this.element.b.hover)
      console.log(this.id);
  }
  this.delete=function(){
		this.output1.delete();
    this.inp1.delete();
    this.inp2.delete();
		simulationArea.lastSelected=undefined;
		andGates.clean(this);
	}
}

function SevenSegDisplay(x, y){
  this.element=new Element(x,y,"SevenSegmentDisplay",50,this);
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
			var updated=false;
	    updated|=this.a.update();
	    updated|=this.b.update();
	    updated|=this.c.update();
	    updated|=this.d.update();
	    updated|=this.e.update();
	    updated|=this.f.update();
	    updated|=this.g.update();
	    updated|=this.dot.update();
	    updated|=this.element.update();
			return updated;
	}
  this.draw=function(){
    ctx = simulationArea.context;

    var xx=this.element.x;
    var yy=this.element.y;

		ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth=3*scale;
		ctx.rect(xx-30,yy-50,60,100);
		ctx.fillStyle = "rgba(100, 100, 100,0.5)";
		if(this.element.b.hover||simulationArea.lastSelected==this)ctx.fill();
    ctx.stroke();

		this.drawSegment(20, -5, 20, -35, ["grey","black","red"][this.b.value+1]);
  	this.drawSegment(20, 5, 20, 35, ["grey","black","red"][this.c.value+1]);
  	this.drawSegment(-20, -5, -20, -35, ["grey","black","red"][this.f.value+1]);
  	this.drawSegment(-20, 5, -20, 35, ["grey","black","red"][this.e.value+1]);
		this.drawSegment(-15, -40, 15, -40, ["grey","black","red"][this.a.value+1]);
  	this.drawSegment(-15, 0, 15, 0, ["grey","black","red"][this.g.value+1]);
  	this.drawSegment(-15, 40, 15, 40, ["grey","black","red"][this.d.value+1]);

		ctx.beginPath();
		ctx.strokeStyle=["grey","black","red"][this.dot.value+1];
		ctx.rect(xx+20,yy+40,2,2);
		ctx.stroke();

    this.element.draw();
    this.a.draw();
    this.b.draw();
    this.c.draw();
    this.d.draw();
    this.e.draw();
    this.f.draw();
    this.g.draw();
    this.dot.draw();
  }
  this.delete=function(){
		this.a.delete();
    this.b.delete();
    this.c.delete();
    this.d.delete();
    this.e.delete();
    this.f.delete();
    this.g.delete();
		simulationArea.lastSelected=undefined;
		sevenseg.clean(this);
	}
}

function OrGate(x,y){
  this.id='or'+uniqueIdCounter;
  uniqueIdCounter++;
  this.element=new Element(x,y,"or",25,this);
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
    var updated=false;
    updated|=this.output1.update();
    updated|=this.inp1.update();
    updated|=this.inp2.update();
    updated|=this.element.update();
    return updated;
  }
  this.draw=function(){

    ctx = simulationArea.context;
    ctx.strokeStyle = ("rgba(0,0,0,1)");
    ctx.lineWidth=3*scale;

    var xx=this.element.x;
    var yy=this.element.y;
    ctx.beginPath();
		ctx.fillStyle = "rgba(255, 255, 32,0.5)";
    ctx.moveTo(xx-10,yy-20);
    ctx.bezierCurveTo(xx,yy-20,xx+15,yy-10,xx+20,yy);
    ctx.bezierCurveTo(xx+15,yy+10,xx,yy+20,xx-10,yy+20);
    ctx.bezierCurveTo(xx,yy,xx,yy,xx-10,yy-20);
    ctx.closePath();
		if(this.element.b.hover||simulationArea.lastSelected==this)ctx.fill();
    ctx.stroke();
		this.inp1.draw();
    this.inp2.draw();
    this.output1.draw();;
    if(this.element.b.isHover())
      console.log(this.id);
  }
  this.delete=function(){
		this.output1.delete();
    this.inp1.delete();
    this.inp2.delete();
		simulationArea.lastSelected=undefined;
		orGates.clean(this);
	}
}

function NotGate(x,y){
  this.id='not'+uniqueIdCounter;
  uniqueIdCounter++;
  this.element=new Element(x,y,"not",15,this);
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
		var updated=false;
		updated|=this.output1.update();
		updated|=this.inp1.update();
		updated|=this.element.update();
		return updated;
	}

  this.draw=function(){

    ctx = simulationArea.context;
    ctx.strokeStyle = ("rgba(0,0,0,1)");
    ctx.lineWidth=3*scale;

    var xx=this.element.x;
    var yy=this.element.y;
    ctx.beginPath();
		ctx.fillStyle = "rgba(255, 255, 32,1)";
    ctx.moveTo(xx-10,yy-10);
    ctx.lineTo(xx+10,yy);
    ctx.arc(xx+15,yy,5,-Math.PI,Math.PI);
    ctx.lineTo(xx-10,yy+10);
    ctx.closePath();
		if(this.element.b.hover||simulationArea.lastSelected==this)ctx.fill();
    ctx.stroke();
    this.inp1.draw();
    this.output1.draw();
    if(this.element.b.isHover())
      console.log(this.id);
  }
  this.delete=function(){
		this.output1.delete();
    this.inp1.delete();
		simulationArea.lastSelected=undefined;
		notGates.clean(this);
	}

}

function Input(x,y){
  this.id='input'+uniqueIdCounter;
  uniqueIdCounter++;
  this.element=new Element(x,y,"input",15,this);
  this.output1=new Node(10,0,1,this);
  this.state=0;
  this.output1.value=this.state;
  inputs.push(this);
  this.wasClicked=false;

  this.resolve=function(){
		this.output1.value=this.state;
    this.output1.resolve();
  }

  this.toggleState=function(){
    this.state=(this.state+1)%2;
    this.output1.value=this.state;
  }
  this.update=function(){
		var updated=false;
    updated|=this.output1.update();
    updated|=this.element.update();

    if(simulationArea.mouseDown==false)
		this.wasClicked=false;

		if(simulationArea.mouseDown && !this.wasClicked && this.element.b.clicked){
    	this.toggleState();
    	this.wasClicked=true;
    	}


    if(this.element.b.hover)
      console.log(this.id);
		return updated;

  }
	this.draw=function(){

		ctx = simulationArea.context;
		ctx.beginPath();
		ctx.strokeStyle = ("rgba(0,0,0,1)");
    ctx.fillStyle = "rgba(255, 255, 32,0.8)";
		ctx.lineWidth=3*scale;
		var xx=this.element.x;
		var yy=this.element.y;
		ctx.rect(xx-10,yy-10,20,20);
    if(this.element.b.hover||simulationArea.lastSelected==this)ctx.fill();
		ctx.stroke();

    ctx.beginPath();
		ctx.font="20px Georgia";
    ctx.fillStyle="green";
    ctx.fillText(this.state.toString(),xx-5,yy+5);
    ctx.stroke();

		this.element.draw();
    this.output1.draw();

	}
	this.delete=function(){
		this.output1.delete();
		simulationArea.lastSelected=undefined;
		inputs.clean(this);

	}
}

function Ground(x,y){
  this.id='ground'+uniqueIdCounter;
  uniqueIdCounter++;
  this.element=new Element(x,y,"ground",15,this);
  this.output1=new Node(0,-10,1,this);
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
    var updated=false;
    updated|=this.output1.update();
    updated|=this.element.update();
    return updated;
  }

  this.draw=function(){

    ctx = simulationArea.context;

    ctx.beginPath();
    ctx.strokeStyle = ["black","brown"][this.element.b.hover];
    ctx.lineWidth=3*scale;
    var xx=this.element.x;
    var yy=this.element.y;
    ctx.moveTo(xx , yy-10);
    ctx.lineTo(xx , yy);
    ctx.moveTo(xx-10, yy);
    ctx.lineTo(xx+10 , yy);
    ctx.moveTo(xx-6 , yy +5);
    ctx.lineTo(xx+6 , yy+5);
    ctx.moveTo(xx-2.5 , yy +10);
    ctx.lineTo(xx+2.5 , yy+10);
    ctx.stroke();

    this.element.draw();
    this.output1.draw();

    if(this.element.b.hover)
      console.log(this.id);
  }
  this.delete=function(){
		this.output1.delete();
		simulationArea.lastSelected=undefined;
		grounds.clean(this);
	}
}

function Power(x,y){
  this.id='power'+uniqueIdCounter;
  uniqueIdCounter++;
  this.element=new Element(x,y,"power",15,this);
  this.output1=new Node(0,20,1,this);
  this.state=1;
  this.output1.value=this.state;
  powers.push(this);
  this.wasClicked=false;

  this.resolve=function(){
  	this.output1.value=this.state;
    this.output1.resolve();
  }

	this.update=function(){
		var updated=false;
		updated|=this.output1.update();
		updated|=this.element.update();
		return updated;
	}

  this.draw=function(){

    ctx = simulationArea.context;

    var xx=this.element.x;
    var yy=this.element.y;

    ctx.beginPath();
		ctx.strokeStyle = ("rgba(0,0,0,1)");
    ctx.lineWidth=3*scale;
		ctx.fillStyle = "green";
    ctx.moveTo(xx, yy);
    ctx.lineTo(xx-10,yy+10);
    // ctx.moveTo(xx-10, yy+10);
    ctx.lineTo(xx+10,yy+10);
    // ctx.moveTo(xx+10, yy+10);
    ctx.lineTo(xx,yy);
		if(this.element.b.hover||simulationArea.lastSelected==this)ctx.fill();
    ctx.moveTo(xx, yy+10);
    ctx.lineTo(xx,yy+20);

    ctx.stroke();

    this.element.draw();
    this.output1.draw();
    if(this.element.b.hover)
      console.log(this.id);
  }
  this.delete=function(){
		this.output1.delete();
		simulationArea.lastSelected=undefined;
		powers.clean(this);
	}
}

function Output(x,y){

  this.id='output'+uniqueIdCounter;
  uniqueIdCounter++;
  this.element=new Element(x,y,"output",15,this);
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

    var updated=false;
    updated|=this.inp1.update();
    updated|=this.element.update();

    if(this.element.b.hover)
      console.log(this.id);
    return updated;
  }
  this.draw=function(){

    ctx = simulationArea.context;
    ctx.strokeStyle = ("rgba(0,0,0,1)");
    ctx.fillStyle = "rgba(255, 255, 32,0.8)";
    ctx.lineWidth=3*scale;
    ctx.beginPath();
    var xx=this.element.x;
    var yy=this.element.y;
    ctx.arc(xx,yy,10,0,2*Math.PI);
    if(this.element.b.hover||simulationArea.lastSelected==this)ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle="green";
    ctx.font="19px Georgia";
    if(this.state==-1)
      ctx.fillText("x",xx-5,yy+5);
    else
      ctx.fillText(this.state.toString(),xx-5,yy+5);
    ctx.stroke();

    this.element.draw();
    this.inp1.draw();
  }
  this.delete=function(){
		this.inp1.delete();
		simulationArea.lastSelected=undefined;
		outputs.clean(this);
	}
}

function Element(x,y,type,r,parent){
  this.type=type;
  this.x=x;
  this.y=y;
  this.b=new Button(x,y,r,"rgba(255,255,255,0)", "rgba(0,0,0,1)");
  this.isResolved=false;
  this.update=function(){
		var updated=false;
    updated|=this.b.update();
    if(this.b.clicked)simulationArea.lastSelected=parent;
    // this.b.x=Math.round(this.b.x/unit)*unit;
    // this.b.y=Math.round(this.b.y/unit)*unit;
    this.x=this.b.x;
    this.y=this.b.y;
		return updated;
  }

  this.draw=function(){
        return this.b.draw();
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
	this.hover=false;
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
  this.prevx=this.absX();
  this.prevy=this.absY();

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

    else if(this.type==0){
      if(this.parent.isResolvable())
        simulationArea.stack.push(this.parent);
    }
		else if(this.type==1 || this.type==2){
      for(var i=0;i<this.connections.length;i++){
        if(this.connections[i].value==-1){
        this.connections[i].value=this.value;
        simulationArea.stack.push(this.connections[i]);
      }
    }
  }
  }
  this.draw=function(){

    if(this.isHover())
      console.log(this.id);


			var ctx = simulationArea.context;

      if(this.clicked){
        if(this.prev=='x')
        {
					drawLine(ctx,this.absX(),this.absY(),simulationArea.mouseX,this.absY(),"black",3*scale);
					drawLine(ctx,simulationArea.mouseX,this.absY(),simulationArea.mouseX,simulationArea.mouseY,"black",3*scale);
        }
        else if(this.prev=='y')
        {
					drawLine(ctx,this.absX(),this.absY(),this.absX(),simulationArea.mouseY,"black",3*scale);
					drawLine(ctx,this.absX(),simulationArea.mouseY,simulationArea.mouseX,simulationArea.mouseY,"black",3*scale);
        }
        else{
          if(Math.abs(this.x+this.parent.element.x - simulationArea.mouseX)>Math.abs(this.y+this.parent.element.y - simulationArea.mouseY)){
							drawLine(ctx,this.absX(),this.absY(),simulationArea.mouseX,this.absY(),"black",3*scale);
          }
          else{
						drawLine(ctx,this.absX(),this.absY(),this.absX(),simulationArea.mouseY,"black",3*scale);
          }
        }
      }
			if(this.type!=2){
			drawCircle(ctx,this.absX(),this.absY(),3,"green");
		}

			if(simulationArea.lastSelected==this||(this.isHover() && !simulationArea.selected)){
        ctx.strokeStyle ="green";
        ctx.beginPath();
        ctx.lineWidth=3*scale;
        ctx.arc(this.x+this.parent.element.x, this.y+this.parent.element.y, 8, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
      }


  }
  this.update = function() {
    if(!this.clicked){
      var px=this.prevx;
      var py=this.prevy;
      this.prevx=this.absX();
      this.prevy=this.absY();
      if(this.absX()!=px||this.absY()!=py){
        updated=true;
        this.nodeConnect();
        return updated;
      }
  }
		 var updated=false;
		 if(!simulationArea.mouseDown)this.hover=false;
		 if ((this.clicked||!simulationArea.hover)&&this.isHover()) {
				 this.hover=true;
				 simulationArea.hover=true;
		 }
		  else if(!simulationArea.mouseDown&&this.hover&&this.isHover()==false){
				 if (this.hover) simulationArea.hover = false;
				 this.hover = false;
			}

      if (simulationArea.mouseDown && (this.clicked)) {

        if(this.type==2){
					//console.log(this.absY(),simulationArea.mouseDownY,simulationArea.mouseDownX-this.parent.element.x);
					if(this.absX()==simulationArea.mouseX&&this.absY()==simulationArea.mouseY){
						updated=false;
						this.prev='a';
					}
					else if(this.connections.length==1&&this.connections[0].absX()==simulationArea.mouseX&&this.absX()==simulationArea.mouseX){
						this.y=simulationArea.mouseY-this.parent.element.y;
						this.prev='a';
						updated=true;
					}
					else if(this.connections.length==1&&this.connections[0].absY()==simulationArea.mouseY&&this.absY()==simulationArea.mouseY){
						this.x=simulationArea.mouseX-this.parent.element.x;
						this.prev='a';
						updated=true;
					}
					if(this.connections.length==1&&this.connections[0].absX()==this.absX()&&this.connections[0].absY()==this.absY()){
						this.connections[0].clicked=true;
						this.connections[0].wasClicked=true;
						// this.connections[0].connections.clean(this);
						// nodes.clean(this);
						// allNodes.clean(this);
            this.delete();
						updated=true;
					}
        }
				if(this.prev=='a' && distance(simulationArea.mouseX,simulationArea.mouseY,this.absX(),this.absY())>=10)
        {
          if(Math.abs(this.x+this.parent.element.x - simulationArea.mouseX)>Math.abs(this.y+this.parent.element.y - simulationArea.mouseY))
          {
            this.prev='x';
          }
          else{
            this.prev='y';
          }
        }
      }
			else if (simulationArea.mouseDown && !simulationArea.selected) {
          simulationArea.selected = this.clicked = this.hover ;
					updated|=this.clicked;
					this.wasClicked|=this.clicked;
					this.prev='a';
      } else if(!simulationArea.mouseDown){
          if (this.clicked) simulationArea.selected = false;
          this.clicked = false;
					this.count=0;
      }
      if(this.wasClicked&&!this.clicked){
        this.wasClicked=false;
        if(simulationArea.mouseDownX==this.absX()&&simulationArea.mouseDownY==this.absY()){
          this.nodeConnect();
          return updated;
				}

        var n,n1;
        var x,y,x1,y1,flag=-1;
        x1=simulationArea.mouseX;
        y1=simulationArea.mouseY;
        if(this.prev=='x'){
          x=x1;
          y=this.absY();
          flag=0;
        }else if(this.prev=='y'){
          y=y1;
          x=this.absX();
          flag=1;
        }
				if(this.type=='a')return; // this should never happen!!

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
                wires[i].converge(n);
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
                wires[i].converge(n1);
             }
          }
        }

        }
				updated=true;

				simulationArea.lastSelected=undefined;
      }

			if(this.type==2){
        if(this.connections.length==2 && simulationArea.mouseDown==false){
          if((this.connections[0].absX()==this.connections[1].absX())||(this.connections[0].absY()==this.connections[1].absY())){
            // this.connections[0].connections.clean(this);
            // this.connections[1].connections.clean(this);
            // allNodes.clean(this);
            // nodes.clean(this);
            // this.deleted=true;
            this.connections[0].connect(this.connections[1]);
            this.delete();
            updated=true;
          }
        }
				else if(this.connections.length==0)this.delete();
      }

      if(this.clicked&&this.type==2)simulationArea.lastSelected=this;
      return updated;



  }
  this.delete=function(){
		toBeUpdated=true;
    this.deleted=true;
    allNodes.clean(this);
    nodes.clean(this);
		if(simulationArea.lastSelected==this)simulationArea.lastSelected=undefined;
    for(var i=0;i<this.connections.length;i++){
      this.connections[i].connections.clean(this);
    }
  }
  this.isClicked = function() {
			if(distance(this.absX(),this.absY(),simulationArea.mouseDownX,simulationArea.mouseDownY)<=this.radius*1.5)return true;
      return false;
  }
  this.isHover = function() {
		if(distance(this.absX(),this.absY(),simulationArea.mouseX,simulationArea.mouseY)<=this.radius*1.5)return true;
		return false;
  }
  this.nodeConnect = function(){
    var x=this.absX();
    var y=this.absY();
    var n;
    for(var i=0;i<allNodes.length;i++){
      if(this!=allNodes[i]&&x==allNodes[i].absX()&&y==allNodes[i].absY()){
        n=allNodes[i];
        this.connect(n);
        break;
      }
    }

    if(n==undefined){
      for(var i=0;i<wires.length-1;i++){
        if(wires[i].checkConvergence(this)){
            wires[i].converge(this);
         }
      }
    }

  }
}

function Button(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.clicked = false;
		this.hover=false;
    this.draw = function() {
				// var ctx = simulationArea.context;
        // if (this.clicked || (this.isHover() && !simulationArea.selected)) {
				// 		drawCircle(ctx,this.x,this.y,this.radius,"black");
				// 		return true;
        // }
				// return false;

    }
    this.update = function() {

        if(!simulationArea.mouseDown)this.hover=false;
				if ((this.clicked||!simulationArea.hover)&&this.isHover()) {
					 this.hover=true;
					 simulationArea.hover=true;
			 }
       else if(!simulationArea.mouseDown&&this.hover&&this.isHover()==false){
          if (this.hover) simulationArea.hover = false;
          this.hover = false;
       }

        if (simulationArea.mouseDown && (this.clicked)) {
					if(this.x==simulationArea.mouseX&&this.y==simulationArea.mouseY)return false;
            this.x = simulationArea.mouseX;
            this.y = simulationArea.mouseY;
            return true;
        } else if (simulationArea.mouseDown && !simulationArea.selected) {
            simulationArea.selected = this.clicked = this.hover = this.hover;
            return this.clicked;
        } else {
            if (this.clicked) simulationArea.selected = false;
            this.clicked = false;
        }



        return false;
    }
    // this.isClicked = function() {
		// 		if(distance(this.x,this.y,simulationArea.mouseDownX,simulationArea.mouseDownY)<this.radius)return true;
    //     return false;
    // }
    this.isHover = function() {
			if(distance(this.x,this.y,simulationArea.mouseX,simulationArea.mouseY)<this.radius)return true;
			return false;
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

function addAnd(){
  var a=new AndGate(200,150);
}
function addPower(){
  var p=new Power(200,150);
}
function addGround(){
  var g=new Ground(200,150);
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

function drawLine(ctx,x1,y1,x2,y2,color,width){
	ctx.beginPath();
	ctx.strokeStyle=color;
	ctx.lineCap="round";
	ctx.lineWidth=width;
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.stroke();
}
function drawCircle(ctx,x1,y1,r,color){

	ctx.beginPath();
	ctx.fillStyle =color;
	ctx.arc(x1, y1, r, 0, Math.PI * 2, false);
	ctx.closePath();
	ctx.fill();
}



document.getElementById("powerButton").addEventListener("click", addPower);
document.getElementById("groundButton").addEventListener("click", addGround);
document.getElementById("andButton").addEventListener("click", addAnd);
document.getElementById("orButton").addEventListener("click", addOr);
document.getElementById("notButton").addEventListener("click", addNot);
document.getElementById("inputButton").addEventListener("click", addInput);
document.getElementById("outputButton").addEventListener("click", addOutput);
document.getElementById("sevenSegButton").addEventListener("click", addSevenSeg);
