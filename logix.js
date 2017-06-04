var width;
var height;
uniqueIdCounter = 0;
unit = 10;
toBeUpdated=true;
wireToBeChecked=0; // when node disconnects from another node
willBeUpdated=false;
function scheduleUpdate(){
    return;
    if(willBeUpdated)return;

    if(simulationArea.mouseDown)
        setTimeout(update, 100);
    else
        setTimeout(update, 200);
    willBeUpdated=true;

}
//fn to remove elem in array
Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
Array.prototype.extend = function (other_array) {
    /* you should include a test to check whether other_array really is an array */
    other_array.forEach(function(v) {this.push(v)}, this);
}

//fn to check if an elem is in an array
Array.prototype.contains = function(value) {
    return this.indexOf(value) > -1
};

//Scope object for each circuit level, globalScope for outer level
function Scope(name = "localScope") {
    //root object for referring to main canvas - intermediate node uses this
    this.root = {
        element: new Element(simulationArea.ox, simulationArea.oy, "root"),
        scope: this,
        direction:'left'
    }
    this.clockTick=function() {
        for (var i = 0; i < this.clocks.length; i++)
            this.clocks[i].toggleState(); //tick clock!
        for (var i = 0; i < this.subCircuits.length; i++)
            this.subCircuits[i].localScope.clockTick(); //tick clock!
    }
    this.name = name;
    this.stack = [];
    this.hexdis = [];
    this.adders = [];
    this.inputs = [];
    this.splitters = [];
    this.grounds = [];
    this.andGates = [];
    this.multiplexers = [];
    this.sevenseg = [];
    this.clocks = [];
    this.flipflops = [];
    this.subCircuits = [];
    this.orGates = [];
    this.notGates = [];
    this.triStates = [];
    this.rams = [];
    this.outputs = [];
    this.nodes = []; //intermediate nodes only
    this.allNodes = [];
    this.wires = [];
    this.powers = [];
    this.objects = [this.wires, this.inputs,this.splitters, this.hexdis,this.adders,this.rams,this.clocks, this.flipflops, this.subCircuits, this.grounds, this.powers, this.andGates,this.multiplexers, this.sevenseg, this.orGates,this.triStates, this.notGates, this.outputs, this.nodes];
}

//fn to setup environment
function setup() {
    globalScope = new Scope("globalScope");//enabling scope

    data = {};
    //retrieving data
    if (parent.location.hash.length > 1) {

        var http = new XMLHttpRequest();
        hash = parent.location.hash.substr(1);
        // alert(hash);
        http.open("POST", "./index.php", true);
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var params = "retrieve=" + hash; // probably use document.getElementById(...).value
        http.send(params);
        http.onload = function() {
            // console.log(http.responseText);
            if (http.responseText == "ERROR") alert("Error: could not load ");
            else {
                data = JSON.parse(http.responseText);
                console.log(data);
                load(globalScope, data);
            }
        }

    }

    toBeUpdated = true;
    width = window.innerWidth ;
    height = window.innerHeight ;

    //setup simulationArea
    simulationArea.setup();
    scheduleUpdate();

}

//to resize window
function resetup() {
    width = window.innerWidth ;
    height = window.innerHeight ;
    simulationArea.canvas.width=width;
    simulationArea.canvas.height=height;
    // simulationArea.setup();
    scheduleUpdate();
}

window.onresize = resetup;

//for mobiles
window.addEventListener('orientationchange', resetup);

//Main fn that resolves circuit
function play(scope=globalScope) {

    // console.log("simulation");


    for (var i = 0; i < scope.allNodes.length; i++)
        scope.allNodes[i].reset();

    for (var i = 0; i < scope.subCircuits.length; i++) {
        if(scope.subCircuits[i].isResolvable())
            scope.stack.push(scope.subCircuits[i]);
    }
    for (var i = 0; i < scope.flipflops.length; i++) {
        scope.stack.push(scope.flipflops[i]);
    }

    for (var i = 0; i < scope.inputs.length; i++) {
        scope.stack.push(scope.inputs[i]);
    }

    for (var i = 0; i < scope.clocks.length; i++) {
        scope.stack.push(scope.clocks[i]);
    }
    for (var i = 0; i < scope.grounds.length; i++) {
        scope.stack.push(scope.grounds[i]);
    }
    for (var i = 0; i < scope.powers.length; i++) {
        scope.stack.push(scope.powers[i]);
    }

    for (var i = 0; i < scope.outputs.length; i++) {
        scope.stack.push(scope.outputs[i]);
    }

    while (scope.stack.length) {
        var elem = scope.stack.pop();
        // console.log("DEBUG",elem);
        elem.resolve();
    }

}

//simulation environment object
var simulationArea = {
    canvas: document.getElementById("simulationArea"),
    selected: false,
    hover: false,
    clockState: 0,
    lastSelected: undefined,
    stack: [],
    ox:0,
    oy:0,
    oldx:0,
    oldy:0,
    scale:1,
    clickCount:0, //double click
    lock:"unlocked",
    timer: function(){
      ckickTimer=setTimeout(function() {
      simulationArea.clickCount = 0;
    }, 600);
    },
    setup: function() {
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(update, 100);
        this.ClockInterval = setInterval(clockTick, 2000);
        this.mouseDown = false;

        window.addEventListener('mousemove', function(e) {
            scheduleUpdate();
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseRawX = (e.clientX - rect.left);
            simulationArea.mouseRawY = (e.clientY - rect.top);
            simulationArea.mouseX = Math.round(((simulationArea.mouseRawX - simulationArea.ox)/simulationArea.scale)/ unit) * unit;
            simulationArea.mouseY = Math.round(((simulationArea.mouseRawY- simulationArea.oy)/simulationArea.scale  )/ unit) * unit;

        });
        window.addEventListener('keydown', function(e) {
            scheduleUpdate();
            wireToBeChecked=1;
            if (e.keyCode == 8 && simulationArea.lastSelected != undefined) {
                // simulationArea.lastSelected.delete(); // delete key
                deleteObj(simulationArea.lastSelected);
            }
            //change direction fns
            if(e.keyCode==37&&simulationArea.lastSelected!=undefined){
							newDirection(simulationArea.lastSelected,'right');
						}
            if(e.keyCode==38&&simulationArea.lastSelected!=undefined){
							newDirection(simulationArea.lastSelected,'down');
						}
            if(e.keyCode==39&&simulationArea.lastSelected!=undefined){
							newDirection(simulationArea.lastSelected,'left');
						}
            if(e.keyCode==40&&simulationArea.lastSelected!=undefined){
						 newDirection(simulationArea.lastSelected,'up');
						}
            if((e.keyCode==113||e.keyCode==81)&&simulationArea.lastSelected!=undefined){
                    if(simulationArea.lastSelected.bitWidth!==undefined)
					     newBitWidth(simulationArea.lastSelected,parseInt(prompt("Enter new bitWidth"),10));
			}
            if((e.keyCode==108||e.keyCode==76)&&simulationArea.lastSelected!=undefined){
                    if(simulationArea.lastSelected.setLabel!==undefined)
					     simulationArea.lastSelected.setLabel();
			}
            // zoom in (+)
            if(e.keyCode==187 && simulationArea.scale < 4){
                changeScale(.1);
            }
            // zoom out (-)
            if(e.keyCode==189 && simulationArea.scale > 0.5){

                changeScale(-.1);
            }
            // update();
        })
        window.addEventListener('mousedown', function(e) {
            update();
            scheduleUpdate();
            simulationArea.lastSelected = undefined;
            simulationArea.selected = false;
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseDownRawX = (e.clientX - rect.left) ;
            simulationArea.mouseDownRawY = (e.clientY - rect.top) ;
            simulationArea.mouseDownX = Math.round(((simulationArea.mouseDownRawX  - simulationArea.ox)/simulationArea.scale) / unit) * unit;
            simulationArea.mouseDownY = Math.round(((simulationArea.mouseDownRawY - simulationArea.oy)/simulationArea.scale )/ unit) * unit;
            simulationArea.mouseDown = true;
            simulationArea.oldx=simulationArea.ox;
            simulationArea.oldy=simulationArea.oy;
            if(simulationArea.clickCount===0 )
            {
                simulationArea.clickCount++;
                simulationArea.timer();
            }
            else if(simulationArea.clickCount===1){
              simulationArea.clickCount=0;
              if(simulationArea.lock==="locked")
                simulationArea.lock = "unlocked";
              else
                simulationArea.lock = "locked";
              console.log("Double",simulationArea.lock);
            }

        });
        window.addEventListener('mouseup', function(e) {
            update();
            scheduleUpdate();
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseDownX = (e.clientX - rect.left) / simulationArea.scale;
            simulationArea.mouseDownY = (e.clientY - rect.top) / simulationArea.scale;
            simulationArea.mouseDownX = Math.round((simulationArea.mouseDownX - simulationArea.ox/simulationArea.scale)  / unit) * unit;
            simulationArea.mouseDownY = Math.round((simulationArea.mouseDownY - simulationArea.oy/simulationArea.scale )/ unit) * unit;

            simulationArea.mouseDown = false;
        });
        window.addEventListener('touchmove', function(e) {
            scheduleUpdate();
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseX = (e.touches[0].clientX - rect.left) ;
            simulationArea.mouseY = (e.touches[0].clientY - rect.top) ;
        })
        window.addEventListener('touchstart', function(e) {
            scheduleUpdate();
            var rect = simulationArea.canvas.getBoundingClientRect();

            simulationArea.mouseDownX = (e.touches[0].clientX - rect.left) * simulationArea.scale;
            simulationArea.mouseDownY = (e.touches[0].clientY - rect.top) * simulationArea.scale;
            simulationArea.mouseX = (e.touches[0].clientX - rect.left) * simulationArea.scale;
            simulationArea.mouseY = (e.touches[0].clientY - rect.top) * simulationArea.scale;
            simulationArea.mouseDown = true;
        });
        window.addEventListener('touchend', function(e) {
            scheduleUpdate();
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseDown = false;
        });
        window.addEventListener('touchleave', function(e) {
            scheduleUpdate();
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseDown = false;
        });
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

//fn to change scale (zoom) - It also shifts origin so that the position
//of the object in focus doent changeB
function update() {
    // console.log("UPDATE");
    willBeUpdated=false;
    var updated = false;
    simulationArea.hover = false;
    // wireToBeChecked=true;
    if(wireToBeChecked){
        if(wireToBeChecked==2)wireToBeChecked=0; // this required due to timing issues
        else wireToBeChecked++;
        // WHY IS THIS REQUIRED ???? we are checking inside wire ALSO
        for(var i=0;i<globalScope.wires.length;i++)
            globalScope.wires[i].checkConnections();
    }

    for (var i = 0; i < globalScope.objects.length; i++)
        for (var j = 0; j < globalScope.objects[i].length; j++)
            updated |= updateObj(globalScope.objects[i][j]);
    toBeUpdated |= updated;

    if (toBeUpdated && simulationArea.mouseDown == false) {
        toBeUpdated = false;
        play();
    }


    if(!simulationArea.selected && simulationArea.mouseDown){
        //mouse click NOT on object
        simulationArea.selected=true;
        simulationArea.lastSelected=globalScope.root;
        simulationArea.hover=true;
    }
    else if (simulationArea.lastSelected==globalScope.root && simulationArea.mouseDown){
        //pane canvas
        simulationArea.ox=(simulationArea.mouseRawX-simulationArea.mouseDownRawX)+simulationArea.oldx;
        simulationArea.oy=(simulationArea.mouseRawY-simulationArea.mouseDownRawY)+simulationArea.oldy;
    }
    else if(simulationArea.lastSelected==globalScope.root){
        simulationArea.lastSelected=undefined;
        simulationArea.selected=false;
        simulationArea.hover=false;
    }

    //Draw
    simulationArea.clear();
    dots(); // draw dots
    for (var i = 0; i < globalScope.objects.length; i++)
        for (var j = 0; j < globalScope.objects[i].length; j++)
            updated |= drawObj(globalScope.objects[i][j]);;

}

//fn to draw Dots on screen
function dots() {
    var canvasWidth = simulationArea.canvas.width; //max X distance
    var canvasHeight = simulationArea.canvas.height;//max Y distance

    var ctx = simulationArea.context;
    var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

    var scale=unit*simulationArea.scale;
    var ox=simulationArea.ox%scale;//offset
    var oy=simulationArea.oy%scale;//offset

    function drawPixel(x, y, r, g, b, a) {
        var index = (x + y * canvasWidth) * 4;
        canvasData.data[index + 0] = r;
        canvasData.data[index + 1] = g;
        canvasData.data[index + 2] = b;
        canvasData.data[index + 3] = a;
    }

    for (var i = 0+ox; i < canvasWidth; i += scale)
        for (var j = 0+oy; j < canvasHeight; j += scale)
            drawPixel(i, j, 0, 0, 0, 255);

    ctx.putImageData(canvasData, 0, 0);

}

function Element(x, y, type, width, parent,height=undefined) {
    this.type = type;
    this.x = x;
    this.y = y;
    if(height==undefined)
        this.height=width;
    else
        this.height=height;
    this.width=width;
    this.b = new Button(x, y, this.width,this.height,parent);
    this.isResolved = false;
    this.update = function() {
        var updated = false;
        updated |= this.b.update();
        if (this.b.clicked) simulationArea.lastSelected = parent;
        this.x = this.b.x;
        this.y = this.b.y;
        return updated;
    }

    // this.draw = function() {
    //     return this.b.draw();
    // }
}

function Button(x, y, width, height,parent) {
    this.width=width;
    this.height=height;
    this.x = x;
    this.y = y;
    this.parent=parent;
    // this.radius = radius;
    this.clicked = false;
    this.hover = false;
    this.oldx=x;
    this.oldy=y;
    // this.draw = function() {
    //
    // }
    this.update = function() {

        if (!simulationArea.mouseDown) this.hover = false;
        if ((this.clicked || !simulationArea.hover) && this.isHover()) {
            this.hover = true;
            simulationArea.hover = true;
        } else if (!simulationArea.mouseDown && this.hover && this.isHover() == false) {
            if (this.hover) simulationArea.hover = false;
            this.hover = false;
        }

        if (simulationArea.mouseDown && (this.clicked)) {
            if (this.x == simulationArea.mouseX && this.y == simulationArea.mouseY) return false;
            this.x = this.oldx+simulationArea.mouseX-simulationArea.mouseDownX;
            this.y = this.oldy+simulationArea.mouseY-simulationArea.mouseDownY;
            return true;
        } else if (simulationArea.mouseDown && !simulationArea.selected) {
            this.oldx=this.x;
            this.oldy=this.y;
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
        // console.log(this.x-simulationArea.mouseX,(this.y-simulationArea.mouseY),this.l,this.b);
        var width,height;
        // [width,height]=rotate(this.width,this.height,this.parent.direction);
        [width,height]=rotate(this.width,this.height,"left");
        width=Math.abs(width);
        height=Math.abs(height);
        if (Math.abs(this.x-simulationArea.mouseX)<=width &&Math.abs(this.y-simulationArea.mouseY)<=height) return true;
        return false;
    }
}
//
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

function deleteObj(obj){
    if(obj.nodeList!==undefined)
        for(var i=0;i<obj.nodeList.length;i++){
            obj.nodeList[i].delete();
        }

    obj.delete();
}

function updateObj(obj){
    var update=false;
    if(obj.update===undefined){
        // if(obj.nodeList!==undefined)
        for(var i=0;i<obj.nodeList.length;i++){
            update|=obj.nodeList[i].update();
        }
        update|=obj.element.update();
    }
    else{
        update|=obj.update();
    }
    return update;
}

function drawObj(obj){
    // var update=false;
    obj.draw();

    if(obj.nodeList!==undefined)
        for(var i=0;i<obj.nodeList.length;i++)
            obj.nodeList[i].draw();

}
