var width;
var height;
uniqueIdCounter = 0;
unit = 10;
toBeUpdated=true;
wireToBeChecked=0; // when node disconnects from another node

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

//fn to check if an elem is in an array
Array.prototype.contains = function(value) {
    return this.indexOf(value) > -1
};

//helper fn
function extract(obj) {
    return obj.saveObject();
}

//fn to create save data
function Save() {
    var data = {};
    data["inputs"] = globalScope.inputs.map(extract);
    data["outputs"] = globalScope.outputs.map(extract);
    data["allNodes"] = globalScope.allNodes.map(extract);
    data["andGates"] = globalScope.andGates.map(extract);
    data["orGates"] = globalScope.orGates.map(extract);
    data["notGates"] = globalScope.notGates.map(extract);
    data["sevenseg"] = globalScope.sevenseg.map(extract);
    data["grounds"] = globalScope.grounds.map(extract);
    data["powers"] = globalScope.powers.map(extract);
    data["subCircuits"] = globalScope.subCircuits.map(extract);
    // data["wires"]=globalScope.wires.map(extract);
    data["nodes"] = []
    for (var i = 0; i < globalScope.nodes.length; i++)
        data["nodes"].push(globalScope.allNodes.indexOf(globalScope.nodes[i]));

    //covnvert to text
    data = JSON.stringify(data)
    console.log(data);

    var http = new XMLHttpRequest();
    http.open("POST", "./index.php", true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var params = "data=" + data; // send the data
    http.send(params);
    http.onload = function() {
        window.location.hash = http.responseText; // assign hash key
    }
}

//Scope object for each circuit level, globalScope for outer level
function Scope(name = "localScope") {
    //root object for referring to main canvas - intermediate node uses this
    this.root = {
        element: new Element(simulationArea.ox, simulationArea.oy, "root"),
        scope: this,
        direction:'left'
    }
    this.name = name;
    this.stack = [];
    this.inputs = [];
    this.grounds = [];
    this.andGates = [];
    this.sevenseg = [];
    this.clocks = [];
    this.flipflops = [];
    this.subCircuits = [];
    this.orGates = [];
    this.notGates = [];
    this.outputs = [];
    this.nodes = []; //intermediate nodes only
    this.allNodes = [];
    this.wires = [];
    this.powers = [];
    this.objects = [this.wires, this.inputs, this.clocks, this.flipflops, this.subCircuits, this.grounds, this.powers, this.andGates, this.sevenseg, this.orGates, this.notGates, this.outputs, this.nodes];
}

//fn to load from data
function load(scope, data) {

    // buildNode(data["allNodes"][0]);
    data["allNodes"].map(function(x) {
        return loadNode(x, scope)
    });
    for (var i = 0; i < data["allNodes"].length; i++)
        constructNodeConnections(scope.allNodes[i], data["allNodes"][i]);
    if (data["inputs"]) data["inputs"].map(function(x) {
        return loadInput(x, scope);
    });
    if (data["outputs"]) data["outputs"].map(function(x) {
        return loadOutput(x, scope);
    });
    if (data["andGates"]) data["andGates"].map(function(x) {
        return loadAnd(x, scope);
    });
    if (data["orGates"]) data["orGates"].map(function(x) {
        return loadOr(x, scope);
    });
    if (data["notGates"]) data["notGates"].map(function(x) {
        return loadNot(x, scope);
    });
    if (data["sevenseg"]) data["sevenseg"].map(function(x) {
        return loadSevenSegmentDisplay(x, scope);
    });
    if (data["powers"]) data["powers"].map(function(x) {
        return loadPower(x, scope);
    });
    if (data["grounds"]) data["grounds"].map(function(x) {
        return loadGround(x, scope);
    });
    if (data["subCircuits"]) data["subCircuits"].map(function(x) {
        return loadSubCircuit(x, scope);
    });
    scope.wires.map(function(x) {
        x.updateData()
    })
    // scope.allNodes.map(constructNodeConnections);
    // console.log(globalScope);
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

}

//to resize window
function resetup() {
    width = window.innerWidth ;
    height = window.innerHeight ;
    simulationArea.setup();
}

window.onresize = resetup;

//for mobiles
window.addEventListener('orientationchange', resetup);

//Main fn that resolves circuit
function play() {

    console.log("simulation");

    for (var i = 0; i < globalScope.allNodes.length; i++)
        globalScope.allNodes[i].reset();

    for (var i = 0; i < globalScope.inputs.length; i++) {
        globalScope.stack.push(globalScope.inputs[i]);
    }
    for (var i = 0; i < globalScope.grounds.length; i++) {
        globalScope.stack.push(globalScope.grounds[i]);
    }
    for (var i = 0; i < globalScope.powers.length; i++) {
        globalScope.stack.push(globalScope.powers[i]);
    }
    for (var i = 0; i < globalScope.clocks.length; i++) {
        globalScope.stack.push(globalScope.clocks[i]);
    }
    for (var i = 0; i < globalScope.outputs.length; i++) {
        globalScope.stack.push(globalScope.outputs[i]);
    }
    while (globalScope.stack.length) {
        var elem = globalScope.stack.pop();
        elem.resolve();
    }

}

//wire object
function Wire(node1, node2, scope) {

    //if data changes
    this.updateData = function() {
        this.node1 = node1;
        this.scope = scope;
        this.node2 = node2;
        this.type = "horizontal";
        this.x1 = node1.absX();
        this.y1 = node1.absY();
        this.x2 = node2.absX();
        this.y2 = node2.absY();
        if (this.x1 == this.x2) this.type = "vertical";
    }

    this.updateData();
    this.scope.wires.push(this);

    //to check if nodes are disconnected
    this.checkConnections=function(){
        var check=!node1.connections.contains(node2)||!node2.connections.contains(node1);
        if(check)this.delete();
        return check;
    }


    this.update = function() {

        var updated = false;
        if(wireToBeChecked&&this.checkConnections()){this.delete();return;} // SLOW , REMOVE
        if (simulationArea.mouseDown == true && simulationArea.selected == false && this.checkWithin(simulationArea.mouseDownX, simulationArea.mouseDownY)) {
            // if(this.checkConnections()){this.delete();return;}
            var n = new Node(simulationArea.mouseDownX, simulationArea.mouseDownY, 2, this.scope.root);
            this.converge(n);
            n.clicked = true;
            n.wasClicked = true;
            simulationArea.selected = true;
            updated = true;
        }

        if (this.node1.deleted || this.node2.deleted) this.delete(); //if either of the nodes are deleted
        if (simulationArea.mouseDown == false) {
            if (this.type == "horizontal") {
                if (node1.absY() != this.y1) {
                    // if(this.checkConnections()){this.delete();return;}
                    var n = new Node(node1.absX(), this.y1, 2, this.scope.root);
                    this.converge(n);
                    updated = true;
                } else if (node2.absY() != this.y2) {
                    // if(this.checkConnections()){this.delete();return;}
                    var n = new Node(node2.absX(), this.y2, 2, this.scope.root);
                    this.converge(n);
                    updated = true;
                }
            } else if (this.type == "vertical") {
                if (node1.absX() != this.x1) {
                    // if(this.checkConnections()){this.delete();return;}
                    var n = new Node(this.x1, node1.absY(), 2, this.scope.root);
                    this.converge(n);
                    updated = true;
                } else if (node2.absX() != this.x2) {
                    // if(this.checkConnections()){this.delete();return;}
                    var n = new Node(this.x2, node2.absY(), 2, this.scope.root);
                    this.converge(n);
                    updated = true;
                }
            }
        }
        return updated;
    }
    this.draw = function() {
        ctx = simulationArea.context;
        color = ["red", "DarkGreen", "Lime"][this.node1.value + 1];
        drawLine(ctx, this.node1.absX(), this.node1.absY(), this.node2.absX(), this.node2.absY(), color, 3);
    }

    // checks if node lies on wire
    this.checkConvergence = function(n) {
        return this.checkWithin(n.absX(), n.absY());
    }
    // fn checks if coordinate lies on wire
    this.checkWithin = function(x, y) {
        if ((this.type == "horizontal") && (this.node1.absX() < this.node2.absX()) && (x > this.node1.absX()) && (x < this.node2.absX()) && (y === this.node2.absY()))
            return true;
        else if ((this.type == "horizontal") && (this.node1.absX() > this.node2.absX()) && (x < this.node1.absX()) && (x > this.node2.absX()) && (y === this.node2.absY()))
            return true;
        else if ((this.type == 'vertical') && (this.node1.absY() < this.node2.absY()) && (y > this.node1.absY()) && (y < this.node2.absY()) && (x === this.node2.absX()))
            return true;
        else if ((this.type == 'vertical') && (this.node1.absY() > this.node2.absY()) && (y < this.node1.absY()) && (y > this.node2.absY()) && (x === this.node2.absX()))
            return true
        return false;

    }

    //add intermediate node between these 2 nodes
    this.converge = function(n) {
        this.node1.connect(n);
        this.node2.connect(n);
        this.delete();
    }


    this.delete = function() {
        toBeUpdated = true;
        this.node1.connections.clean(this.node2);
        this.node2.connections.clean(this.node1);
        this.scope.wires.clean(this);
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
    setup: function() {
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(update, 50);
        this.ClockInterval = setInterval(clockTick, 2000);
        this.mouseDown = false;
        window.addEventListener('mousemove', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();

            simulationArea.mouseRawX = (e.clientX - rect.left);
            simulationArea.mouseRawY = (e.clientY - rect.top);
            simulationArea.mouseX = Math.round(((simulationArea.mouseRawX - simulationArea.ox)/simulationArea.scale)/ unit) * unit;
            simulationArea.mouseY = Math.round(((simulationArea.mouseRawY- simulationArea.oy)/simulationArea.scale  )/ unit) * unit;
        });
        window.addEventListener('keydown', function(e) {

            wireToBeChecked=1;
            if (e.keyCode == 8 && simulationArea.lastSelected != undefined) {
                simulationArea.lastSelected.delete(); // delete key
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
            // zoom in (+)
            if(e.keyCode==187 && simulationArea.scale < 4){
                changeScale(.1);
            }
            // zoom out (-)
            if(e.keyCode==189 && simulationArea.scale > 0.5){

                changeScale(-.1);
            }
        })
        window.addEventListener('mousedown', function(e) {
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
        });

        window.addEventListener('touchstart', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();

            simulationArea.mouseDownX = (e.touches[0].clientX - rect.left) * simulationArea.scale;
            simulationArea.mouseDownY = (e.touches[0].clientY - rect.top) * simulationArea.scale;
            simulationArea.mouseX = (e.touches[0].clientX - rect.left) * simulationArea.scale;
            simulationArea.mouseY = (e.touches[0].clientY - rect.top) * simulationArea.scale;
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
            simulationArea.mouseDownX = (e.clientX - rect.left) / simulationArea.scale;
            simulationArea.mouseDownY = (e.clientY - rect.top) / simulationArea.scale;
            simulationArea.mouseDownX = Math.round((simulationArea.mouseDownX - simulationArea.ox/simulationArea.scale)  / unit) * unit;
            simulationArea.mouseDownY = Math.round((simulationArea.mouseDownY - simulationArea.oy/simulationArea.scale )/ unit) * unit;

            simulationArea.mouseDown = false;
        });
        window.addEventListener('touchmove', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseX = (e.touches[0].clientX - rect.left) ;
            simulationArea.mouseY = (e.touches[0].clientY - rect.top) ;
        })
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

//fn to change scale (zoom) - It also shifts origin so that the position
//of the object in focus doent change
function changeScale(delta){
    var xx,yy;

    if(simulationArea.lastSelected){ // selected object
        xx=simulationArea.lastSelected.element.x;
        yy=simulationArea.lastSelected.element.y;
    }
    else{ //mouse location
        xx=simulationArea.mouseX;
        yy=simulationArea.mouseY;
    }

    var oldScale=simulationArea.scale;
    simulationArea.scale+=delta;
    simulationArea.scale = Math.round( simulationArea.scale*10) /10;
    simulationArea.ox-=Math.round(xx*(simulationArea.scale-oldScale));
    simulationArea.oy-=Math.round(yy*(simulationArea.scale-oldScale));
}

function clockTick() {
    for (var i = 0; i < globalScope.clocks.length; i++)
        globalScope.clocks[i].toggleState(); //tick clock!
    if (globalScope.clocks.length) {
        play(); // simulate
    }
}

function update() {


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
            updated |= globalScope.objects[i][j].update();
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
            updated |= globalScope.objects[i][j].draw();

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

//Fn to replace node by node @ index in global Node List - used when loading
function replace(node, index) {
    scope = node.scope;
    parent = node.parent;
    node.delete();
    node = scope.allNodes[index];
    node.parent = parent;
    return node;
}

//find Index of a node
function findNode(x) {
    return x.scope.allNodes.indexOf(x);
}

//get Node in index x in scope and set parent
function extractNode(x, scope, parent) {
    var n = scope.allNodes[x];
    n.parent = parent;
    return n;
}

//load AndGate fn
function loadAnd(data, scope) {
    var v = new AndGate(data["x"], data["y"], scope, data["inputs"],data["dir"]);
    v.output1 = replace(v.output1, data["output1"]);
    for (var i = 0; i < data["inputs"]; i++) v.inp[i] = replace(v.inp[i], data["inp"][i]);
}

//AndGate - (x,y)-position , scope - circuit level, inputLength - no of nodes, dir - direction of gate
function AndGate(x, y, scope, inputLength, dir) {

    this.scope = scope;
    this.id = 'and' + uniqueIdCounter;
    uniqueIdCounter++;
    this.element = new Element(x, y, "and", 25, this);
    this.inp = [];
    this.direction=dir;

    this.inputs = inputLength;

    //variable inputLength , node creation
    if (inputLength % 2 == 1) {
        for (var i = 0; i < inputLength / 2 - 1; i++) {
            var a = new Node(-10, -10 * (i + 1), 0, this);
            this.inp.push(a);
        }
        var a = new Node(-10, 0, 0, this);
        this.inp.push(a);
        for (var i = inputLength / 2 + 1; i < inputLength; i++) {
            var a = new Node(-10, 10 * (i + 1 - inputLength / 2 - 1), 0, this);
            this.inp.push(a);
        }
    } else {
        for (var i = 0; i < inputLength / 2; i++) {
            var a = new Node(-10, -10 * (i + 1), 0, this);
            this.inp.push(a);
        }
        for (var i = inputLength / 2; i < inputLength; i++) {
            var a = new Node(-10, 10 * (i + 1 - inputLength / 2), 0, this);
            this.inp.push(a);
        }
    }

    this.output1 = new Node(20, 0, 1, this);
    //nodeList - List of Lists - all nodes of object here - used for refreshing when direction changes
    this.nodeList=[this.inp,[this.output1]];
    scope.andGates.push(this);

    //fn to create save Json Data of object
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            inputs: this.inputs,
            inp: this.inp.map(findNode),
            output1: findNode(this.output1),
            dir:this.direction,
        }
        return data;
    }

    // checks if the module has enough information to resolve
    this.isResolvable = function() {
        var res1 = true;
        for (var i = 0; i < inputLength; i++)
            res1 = res1 && (this.inp[i].value != -1);
        return res1;
    }

    //resolve output values based on inputData
    this.resolve = function() {
        var result = true;
        if (this.isResolvable() == false) {
            return;
        }
        for (var i = 0; i < inputLength; i++)
            result = result && (this.inp[i].value);
        this.output1.value = result;
        this.scope.stack.push(this.output1);
    }

    //fn to update everything - location, hover etc
    this.update = function() {

        var updated = false;
        //nodes updation
        for (var j = 0; j < inputLength; j++)
            updated |= this.inp[j].update();
        updated |= this.output1.update();
        //module update
        updated |= this.element.update();
        return updated;
    }

    //fn to draw
    this.draw = function() {

        ctx = simulationArea.context;

        ctx.beginPath();
        ctx.lineWidth = 3 ;
        ctx.strokeStyle = "black"; //("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.5)";
        var xx = this.element.x;
        var yy = this.element.y;

        moveTo(ctx,-10,-20,xx,yy,this.direction);
        lineTo(ctx,0,-20,xx,yy,this.direction);
        // ctx.arc(xx, yy, 20, -Math.PI / 2, Math.PI / 2);
        arc(ctx,0,0,20,(-Math.PI/2),(Math.PI/2),xx,yy,this.direction);
        lineTo(ctx,-10,20,xx,yy,this.direction);
        lineTo(ctx,-10,-20,xx,yy,this.direction);
        ctx.closePath();

        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();
        // this.element.update();

        for (var i = 0; i < inputLength; i++)
            this.inp[i].draw();

        this.output1.draw();

        //for debugging
        if (this.element.b.hover)
            console.log(this,this.id);
    }

    //fn to delete object
    this.delete = function() {
        //delete all object nodes
        this.output1.delete();
        for (var i = 0; i < inputLength; i++) {
            this.inp[i].delete();
        }
        simulationArea.lastSelected = undefined;
        this.scope.andGates.clean(this);
    }
}

function loadSubCircuit(savedData, scope) {
    var v = new SubCircuit(savedData["x"], savedData["y"], scope, savedData);
    // for (var i = 0; i < v.inputNodes.length; i++) v.inputNodes[i] = replace(v.inputNodes[i], data["inputNodes"][i]);
    // for (var i = 0; i < v.outputNodes.length; i++) v.outputNodes[i] = replace(v.outputNodes[i], data["outputNodes"][i]);
}

//subCircuit
function SubCircuit(x, y, scope = globalScope, savedData=undefined,dir="left") {

    this.savedData=savedData;
    this.direction=dir;
    this.scope = scope;
    this.localScope = new Scope();
    this.id = 'subCircuits' + uniqueIdCounter;
    uniqueIdCounter++;
    this.element = new Element(x, y, "subCircuit", 35, this);
    this.scope.subCircuits.push(this);
    this.inputNodes = [];
    this.outputNodes = [];
    this.nodeList=[this.inputNodes,this.outputNodes];
    this.width = 0;
    this.height = 0;
    // this.deleted=false;
    if(savedData==undefined)
        this.dataHash = prompt("Enter Hash: ");

    var http = new XMLHttpRequest();
    http.open("POST", "./index.php", true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var params = "retrieve=" + this.dataHash; // probably use document.getElementById(...).value
    http.send(params);
    http.parent = this;

    if(this.savedData!=undefined){
        this.height=savedData["height"];
        this.height=savedData["width"];
        this.dataHash = savedData["dataHash"];
        for(var i=0;i<this.savedData["inputNodes"].length;i++){
            this.inputNodes.push(this.scope.allNodes[this.savedData["inputNodes"][i]]);
            this.inputNodes[i].parent=this;
        }
        for(var i=0;i<this.savedData["outputNodes"].length;i++){
            this.outputNodes.push(this.scope.allNodes[this.savedData["outputNodes"][i]]);
            this.outputNodes[i].parent=this;
        }
    }
    http.onload = function() {
        console.log(this.parent);
        if (http.responseText == "ERROR") {
            alert("Error: could not load ");
            this.parent.delete();
            return;
        } else {
            this.parent.data = JSON.parse(http.responseText);
            this.parent.buildCircuit();
        }
    }

    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            dataHash: this.dataHash,
            height:this.height,
            width:this.width,
            inputNodes: this.inputNodes.map(findNode),
            outputNodes: this.outputNodes.map(findNode),
        }
        return data;
    }
    this.buildCircuit = function() {
        load(this.localScope, this.data);
        toBeUpdated=true;
        this.width = 60;
        this.height = Math.floor((Math.max(this.localScope.inputs.length, this.localScope.outputs.length) + 2)/2)*20;

        if(this.savedData==undefined){
            if (this.localScope.inputs.length % 2 == 1) {
                for (var i = this.localScope.inputs.length / 2 - 1.5; i >= 0; i--) {
                    console.log(i);
                    var a = new Node(-30, -10 * (i + 1), 0, this);
                    this.inputNodes.push(a);
                }
                var a = new Node(-30, 0, 0, this);
                this.inputNodes.push(a);
                for (var i = this.localScope.inputs.length / 2+.5; i < this.localScope.inputs.length; i++) {
                    var a = new Node(-30, 10 * (i + 1 - this.localScope.inputs.length % 2 / 2 - 1.5), 0, this);
                    this.inputNodes.push(a);
                }
            } else {
                for (var i = 0; i < this.localScope.inputs.length / 2; i++) {
                    var a = new Node(-30, -10 * (i + 1), 0, this);
                    this.inputNodes.push(a);
                }
                for (var i = this.localScope.inputs.length / 2; i < this.localScope.inputs.length; i++) {
                    var a = new Node(-30, 10 * (i + 1 - this.localScope.inputs.length / 2), 0, this);
                    this.inputNodes.push(a);
                }
            }
            if (this.localScope.outputs.length % 2 == 1) {
                for (var i = this.localScope.outputs.length / 2 - 1; i >= 0; i--) {
                    var a = new Node(30, -10 * (i + 1), 1, this);
                    this.outputNodes.push(a);
                }
                var a = new Node(30, 0, 1, this);
                this.outputNodes.push(a);
                for (var i = this.localScope.outputs.length / 2 + 1; i < this.localScope.outputs.length; i++) {
                    var a = new Node(30, 10 * (i + 1 - this.localScope.outputs.length % 2 / 2 - 1), 1, this);
                    this.outputNodes.push(a);
                }
            } else {
                for (var i = 0; i < this.localScope.outputs.length / 2; i++) {
                    var a = new Node(30, -10 * (i + 1), 1, this);
                    this.outputNodes.push(a);
                }
                for (var i = this.localScope.outputs.length / 2; i < this.localScope.outputs.length; i++) {
                    var a = new Node(30, 10 * (i + 1 - this.localScope.outputs.length / 2), 1, this);
                    this.outputNodes.push(a);
                }
            }
        }

    }

    this.isResolvable = function() {
        for (i = 0; i < this.inputNodes.length; i++) {
            if (this.inputNodes[i].isResolvable() == false) return false;
        }
        return true;
    }

    this.resolve = function() {
        // console.log("HOT");
        for (i = 0; i < this.localScope.inputs.length; i++) {
            this.localScope.inputs[i].state = this.inputNodes[i].value;
        }
        for (i = 0; i < this.localScope.inputs.length; i++) {
            this.localScope.stack.push(this.localScope.inputs[i]);
        }
        while (this.localScope.stack.length) {
            var el = this.localScope.stack.pop();
            el.resolve();

        }
        for (i = 0; i < this.localScope.outputs.length; i++) {
            this.outputNodes[i].value = this.localScope.outputs[i].state;
        }
        for (i = 0; i < this.localScope.outputs.length; i++) {
            this.scope.stack.push(this.outputNodes[i]);
        }

    }

    this.update = function() {
        var updated = false;
        for (var i = 0; i < this.inputNodes.length; i++)
            updated |= this.inputNodes[i].update();
        for (var i = 0; i < this.outputNodes.length; i++)
            updated |= this.outputNodes[i].update();
        updated |= this.element.update();
        return updated;
    }

    this.draw = function() {

        ctx = simulationArea.context;

        ctx.beginPath();
        ctx.lineWidth = 3 ;
        ctx.strokeStyle = "black"; //("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.5)";
        var xx = this.element.x;
        var yy = this.element.y;
        rect2(ctx, - this.width / 2,  - this.height / 2, this.width, this.height,xx,yy,this.direction);
        ctx.closePath();
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();
        // this.element.update();

        for (var i = 0; i < this.inputNodes.length; i++)
            this.inputNodes[i].draw();
        for (var i = 0; i < this.outputNodes.length; i++)
            this.outputNodes[i].draw();
        if (this.element.b.hover)
            console.log(this,this.id);
    }

    this.delete = function() {
        this.scope.subCircuits.clean(this);
        for (var i = 0; i < this.inputNodes.length; i++) this.inputNodes[i].delete();
        for (var i = 0; i < this.outputNodes.length; i++) this.outputNodes[i].delete();
    }
}

function loadSevenSegmentDisplay(data, scope) {
    var v = new SevenSegDisplay(data["x"], data["y"], scope);
    v.a = replace(v.a, data["a"]);
    v.b = replace(v.b, data["b"]);
    v.c = replace(v.c, data["c"]);
    v.d = replace(v.d, data["d"]);
    v.e = replace(v.e, data["e"]);
    v.f = replace(v.f, data["f"]);
    v.g = replace(v.g, data["g"]);
    v.dot = replace(v.dot, data["dot"]);
}

function SevenSegDisplay(x, y, scope = globalScope) {
    this.element = new Element(x, y, "SevenSegmentDisplay", 50, this);
    this.scope = scope;
    this.g = new Node(-20, -50, 0, this);
    this.f = new Node(-10, -50, 0, this);
    this.a = new Node(+10, -50, 0, this);
    this.b = new Node(+20, -50, 0, this);
    this.e = new Node(-20, +50, 0, this);
    this.d = new Node(-10, +50, 0, this);
    this.c = new Node(+10, +50, 0, this);
    this.dot = new Node(+20, +50, 0, this);

    scope.sevenseg.push(this);

    this.isResolvable = function() {
        return this.a.value != -1 && this.b.value != -1 && this.c.value != -1 && this.d.value != -1 && this.e.value != -1 && this.f.value != -1 && this.g.value != -1 && this.dot.value != -1;
    }

    this.resolve = function() {
        //dummy function
    }
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            g: findNode(this.g),
            f: findNode(this.f),
            a: findNode(this.a),
            b: findNode(this.b),
            d: findNode(this.d),
            e: findNode(this.e),
            c: findNode(this.c),
            d: findNode(this.d),
            dot: findNode(this.dot),
            dir:this.direction,
        }
        return data;
    }
    this.drawSegment = function(x1, y1, x2, y2, color) {
        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5 ;
        xx=this.element.x;
        yy=this.element.y;
        moveTo(ctx,x1,y1,xx,yy,this.direction);
        lineTo(ctx,x2,y2,xx,yy,this.direction);
        ctx.stroke();
    }

    this.update = function() {
        var updated = false;
        updated |= this.a.update();
        updated |= this.b.update();
        updated |= this.c.update();
        updated |= this.d.update();
        updated |= this.e.update();
        updated |= this.f.update();
        updated |= this.g.update();
        updated |= this.dot.update();
        updated |= this.element.update();
        return updated;
    }
    this.draw = function() {
        ctx = simulationArea.context;

        var xx = this.element.x;
        var yy = this.element.y;

        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3 ;
        rect(ctx,xx - 30, yy - 50, 60, 100)
        ctx.fillStyle = "rgba(100, 100, 100,0.5)";

        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        this.drawSegment(20, -5, 20, -35, ["grey", "black", "red"][this.b.value + 1]);
        this.drawSegment(20, 5, 20, 35, ["grey", "black", "red"][this.c.value + 1]);
        this.drawSegment(-20, -5, -20, -35, ["grey", "black", "red"][this.f.value + 1]);
        this.drawSegment(-20, 5, -20, 35, ["grey", "black", "red"][this.e.value + 1]);
        this.drawSegment(-15, -40, 15, -40, ["grey", "black", "red"][this.a.value + 1]);
        this.drawSegment(-15, 0, 15, 0, ["grey", "black", "red"][this.g.value + 1]);
        this.drawSegment(-15, 40, 15, 40, ["grey", "black", "red"][this.d.value + 1]);

        ctx.beginPath();
        ctx.strokeStyle = ["grey", "black", "red"][this.dot.value + 1];
        rect(ctx,xx + 20, yy + 40, 2, 2);
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
    this.delete = function() {
        this.a.delete();
        this.b.delete();
        this.c.delete();
        this.d.delete();
        this.e.delete();
        this.f.delete();
        this.g.delete();
        simulationArea.lastSelected = undefined;
        scope.sevenseg.clean(this);
    }
}

function loadOr(data, scope) {
    var v = new OrGate(data["x"], data["y"], scope, data["inputs"],data["dir"]);
    v.output1 = replace(v.output1, data["output1"]);
    for (var i = 0; i < data["inputs"]; i++) v.inp[i] = replace(v.inp[i], data["inp"][i]);
}

function OrGate(x, y, scope = globalScope, inputs = 2,dir='left') {
    this.id = 'or' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.direction=dir;
    this.element = new Element(x, y, "or", 25, this);
    this.inp = [];
    this.inputs = inputs;
    if (inputs % 2 == 1) {
        for (var i = 0; i < inputs / 2 - 1; i++) {
            var a = new Node(-10, -10 * (i + 1), 0, this);
            this.inp.push(a);
        }
        var a = new Node(-10, 0, 0, this);
        this.inp.push(a);
        for (var i = inputs / 2 + 1; i < inputs; i++) {
            var a = new Node(-10, 10 * (i + 1 - inputs / 2 - 1), 0, this);
            this.inp.push(a);
        }
    } else {
        for (var i = 0; i < inputs / 2; i++) {
            var a = new Node(-10, -10 * (i + 1), 0, this);
            this.inp.push(a);
        }
        for (var i = inputs / 2; i < inputs; i++) {
            var a = new Node(-10, 10 * (i + 1 - inputs / 2), 0, this);
            this.inp.push(a);
        }
    }
    this.output1 = new Node(20, 0, 1, this);
    scope.orGates.push(this);

    this.nodeList=[this.inp,[this.output1]];

    this.saveObject = function() {
        console.log(this.scope.allNodes);
        var data = {
            x: this.element.x,
            y: this.element.y,
            inputs: this.inputs,
            inp: this.inp.map(findNode),
            output1: findNode(this.output1),
            dir:this.direction,
        }
        return data;
    }
    this.isResolvable = function() {
        var res1 = true;
        for (var i = 0; i < inputs; i++)
            res1 = res1 && (this.inp[i].value != -1);

        return res1;
    }

    this.resolve = function() {
        var result = false;
        if (this.isResolvable() == false) {
            return;
        }

        for (var i = 0; i < inputs; i++)
            result = result || (this.inp[i].value);

        this.output1.value = result;
        this.scope.stack.push(this.output1);
    }
    this.update = function() {
        var updated = false;
        updated |= this.output1.update();
        for (var j = 0; j < inputs; j++) {
            updated |= this.inp[j].update();
        }
        updated |= this.element.update();
        return updated;
    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3 ;

        var xx = this.element.x;
        var yy = this.element.y;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 32,0.5)";

        moveTo(ctx,-10,-20,xx ,yy,this.direction);
        bezierCurveTo(0,  - 20,  + 15, - 10,  20, 0 ,xx,yy,this.direction);
        bezierCurveTo(0 + 15, 0 + 10, 0, 0 + 20,  - 10,  + 20,xx,yy,this.direction);
        bezierCurveTo(0, 0, 0, 0, - 10,  - 20,xx,yy,this.direction);
        ctx.closePath();
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        for (var i = 0; i < inputs; i++)
            this.inp[i].draw();

        this.output1.draw();;
        if (this.element.b.isHover())
            console.log(this,this.id);
    }
    this.delete = function() {
        this.output1.delete();
        for (var i = 0; i < inputs; i++)
            this.inp[i].delete();
        simulationArea.lastSelected = undefined;
        scope.orGates.clean(this);
    }
}

function loadNot(data, scope) {
    var v = new NotGate(data["x"], data["y"], scope,data["dir"]);
    v.output1 = replace(v.output1, data["output1"]);
    v.inp1 = replace(v.inp1, data["inp1"]);
}

function NotGate(x, y, scope, dir) {
    this.id = 'not' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.element = new Element(x, y, "not", 15, this);
    this.direction=dir;
    this.inp1 = new Node(-10, 0, 0, this);
    this.output1 = new Node(20, 0, 1, this);
    scope.notGates.push(this);
    this.nodeList=[[this.inp1,this.output1]];
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: findNode(this.output1),
            inp1: findNode(this.inp1),
            dir:this.direction,
        }
        return data;
    }

    this.isResolvable = function() {
        return this.inp1.value != -1;
    }

    this.resolve = function() {
        if (this.isResolvable() == false) {
            return;
        }
        this.output1.value = (this.inp1.value + 1) % 2;
        this.scope.stack.push(this.output1);
    }
    this.update = function() {
        var updated = false;
        updated |= this.output1.update();
        updated |= this.inp1.update();
        updated |= this.element.update();
        return updated;
    }

    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3 ;

        var xx = this.element.x;
        var yy = this.element.y;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 32,1)";
        moveTo(ctx,-10,-10,xx,yy,this.direction);
        lineTo(ctx,10,0,xx,yy,this.direction);
        lineTo(ctx,-10,10,xx,yy,this.direction);
        // arc(ctx,5,2*(Math.PI),0,xx,yy,this.direction,15,0);
        ctx.closePath();
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        arc(ctx,15,0,5,2*(Math.PI),0,xx,yy,this.direction);
        ctx.stroke();
        this.inp1.draw();
        this.output1.draw();
        if (this.element.b.isHover())
            console.log(this,this.id);
    }
    this.delete = function() {
        this.output1.delete();
        this.inp1.delete();
        simulationArea.lastSelected = undefined;
        scope.notGates.clean(this);
    }

}

function loadInput(data, scope) {

    var v = new Input(data["x"], data["y"], scope,data["dir"]);
    v.output1 = replace(v.output1, data["output1"]);
}

function Input(x, y, scope, dir) {
    // this.func=Input;
    // [x, y, scope, dir] = list;
    this.id = 'input' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    // this.list=list;
    this.direction=dir;
    this.element = new Element(x, y, "input", 15, this);
    this.output1 = new Node(10, 0, 1, this);
    this.state = 0;
    this.output1.value = this.state;
    scope.inputs.push(this);
    this.wasClicked = false;
    this.nodeList=[[this.output1]];
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: findNode(this.output1),
            dir:this.direction,
        }
        return data;
    }
    this.isResolvable = function() {
        return true;
    }

    this.resolve = function() {
        this.output1.value = this.state;
        this.scope.stack.push(this.output1);
    }
    this.toggleState = function() {
        this.state = (this.state + 1) % 2;
        this.output1.value = this.state;
    }
    this.update = function() {
        var updated = false;
        updated |= this.output1.update();
        updated |= this.element.update();

        if (simulationArea.mouseDown == false)
            this.wasClicked = false;

        if (simulationArea.mouseDown && !this.wasClicked && this.element.b.clicked) {
            this.toggleState();
            this.wasClicked = true;
        }


        if (this.element.b.hover)
            console.log(this,this.id);
        return updated;

    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.lineWidth = 3 ;
        var xx = this.element.x;
        var yy = this.element.y;

        rect(ctx,xx-10,yy-10,20,20);
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "20px Georgia";
        ctx.fillStyle = "green";

        fillText(ctx,this.state.toString(), xx - 5, yy + 5);
        ctx.stroke();

        this.element.draw();
        this.output1.draw();

    }
    this.delete = function() {
        this.output1.delete();
        simulationArea.lastSelected = undefined;
        scope.inputs.clean(this);

    }
}

function FlipFlop(x, y, scope, dir) {
    // this.func = FlipFlop;
    // [x, y, scope, dir] = list;
    this.direction = dir;
    // this.list = list;
    this.id = 'FlipFlip' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.element = new Element(x, y, "FlipFlip", 40, this);
    this.clockInp = new Node(-20, -10, 0, this);
    this.dInp = new Node(-20, +10, 0, this);
    this.qOutput = new Node(20, -10, 1, this);
    this.masterState = 0;
    this.slaveState = 0;
    this.prevClockState = 0;
    scope.flipflops.push(this);
    this.wasClicked = false;
    this.nodeList=[[this.clockInp,this.dInp,this.qOutput]];

    this.isResolvable = function() {
        return true;
    }
    this.resolve = function() {
        if (this.clockInp.value == this.prevClockState) {
            if (this.clockInp.value == 0 && this.dInp.value != -1) {
                this.masterState = this.dInp.value;
            }
        } else if (this.clockInp.value != -1) {
            if (this.clockInp.value == 1) {
                this.slaveState = this.masterState;
            } else if (this.clockInp.value == 0 && this.dInp.value != -1) {
                this.masterState = this.dInp.value;
            }
            this.prevClockState = this.clockInp.value;
        }

        if (this.qOutput.value != this.slaveState) {
            this.qOutput.value = this.slaveState;
            this.scope.stack.push(this.qOutput);
            console.log("hit", this.slaveState);
        }
    }

    this.update = function() {
        var updated = false;
        updated |= this.dInp.update();
        updated |= this.clockInp.update();
        updated |= this.qOutput.update();
        updated |= this.element.update();

        if (simulationArea.mouseDown == false)
            this.wasClicked = false;

        if (simulationArea.mouseDown && !this.wasClicked && this.element.b.clicked) {
            // this.toggleState();
            this.wasClicked = true;
        }


        if (this.element.b.hover)
            console.log(this,this.id);
        return updated;

    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.lineWidth = 3 ;
        var xx = this.element.x;
        var yy = this.element.y;
        rect(ctx,xx - 20 , yy - 20, 40, 40);
        moveTo(ctx,-20,-15,xx,yy,this.direction);
        lineTo(ctx,-15,-10,xx,yy,this.direction);
        lineTo(ctx,-20,-5,xx,yy,this.direction);


        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "20px Georgia";
        ctx.fillStyle = "green";
        fillText(ctx,this.slaveState.toString(), xx - 5 , yy + 5);
        ctx.stroke();

        this.dInp.draw();
        this.qOutput.draw();
        this.clockInp.draw();

    }
    this.delete = function() {
        this.dInp.delete();
        this.qOutput.delete();
        this.clockInp.delete();
        simulationArea.lastSelected = undefined;
        scope.flipflops.clean(this);

    }
}

function Clock(x, y, f, scope , dir) {
    this.direction=dir;
    this.id = 'clock' + uniqueIdCounter;
    this.f = f;
    this.scope = scope;
    this.timeInterval = 1000 / f;
    uniqueIdCounter++;
    this.element = new Element(x, y, "clock", 15, this);
    this.output1 = new Node(10, 0, 1, this);
    this.state = 0;
    this.output1.value = this.state;
    scope.clocks.push(this);
    this.wasClicked = false;
    this.interval = null;
    this.nodeList=[[this.output1]];

    this.resolve = function() {
        this.output1.value = this.state;
        this.scope.stack.push(this.output1);
    }

    this.toggleState = function() {
        this.state = (this.state + 1) % 2;
        this.output1.value = this.state;
    }
    this.update = function() {
        var updated = false;
        updated |= this.output1.update();
        updated |= this.element.update();

        if (simulationArea.mouseDown == false)
            this.wasClicked = false;

        if (simulationArea.mouseDown && !this.wasClicked && this.element.b.clicked) {
            this.toggleState();
            this.wasClicked = true;
        }

        if (this.element.b.hover)
            console.log(this,this.id);
        return updated;

    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.lineWidth = 3 ;
        var xx = this.element.x;
        var yy = this.element.y;
        rect(ctx,xx - 10, yy - 10, 20, 20);
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = ["DarkGreen", "Lime"][this.state];
        ctx.lineWidth = 2 ;
        if (this.state == 0) {
            moveTo(ctx,-6,0,xx,yy,this.direction);
            lineTo(ctx,-6,6,xx,yy,this.direction);
            lineTo(ctx,0,6,xx,yy,this.direction);
            lineTo(ctx,0,-6,xx,yy,this.direction);
            lineTo(ctx,6,-6,xx,yy,this.direction);
            lineTo(ctx,6,0,xx,yy,this.direction);

        } else {
            moveTo(ctx,-6,0,xx,yy,this.direction);
            lineTo(ctx,-6,-6,xx,yy,this.direction);
            lineTo(ctx,0,-6,xx,yy,this.direction);
            lineTo(ctx,0,6,xx,yy,this.direction);
            lineTo(ctx,6,6,xx,yy,this.direction);
            lineTo(ctx,6,0,xx,yy,this.direction);
        }
        ctx.stroke();

        this.element.draw();
        this.output1.draw();

    }
    this.delete = function() {
        this.output1.delete();
        simulationArea.lastSelected = undefined;
        scope.clocks.clean(this);

    }
}

function loadGround(data, scope) {
    var v = new Ground(data["x"], data["y"], scope);
    v.output1 = replace(v.output1, data["output1"]);
}

function Ground(x, y, scope = globalScope) {

    this.id = 'ground' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.element = new Element(x, y, "ground", 20, this);
    this.output1 = new Node(0, -10, 1, this);
    this.state = 0;

    this.output1.value = this.state;
    scope.grounds.push(this);
    console.log(this);
    this.wasClicked = false;
    this.resolve = function() {
        this.output1.value = this.state;
        this.scope.stack.push(this.output1);

    }
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: findNode(this.output1),
        }
        return data;
    }
    this.update = function() {
        var updated = false;
        updated |= this.output1.update();
        updated |= this.element.update();
        return updated;
    }

    this.draw = function() {

        ctx = simulationArea.context;

        ctx.beginPath();
        ctx.strokeStyle = ["black", "brown"][this.element.b.hover + 0];
        ctx.lineWidth = 3 ;

        var xx = this.element.x;
        var yy = this.element.y;

        moveTo(ctx,0,-10,xx,yy,this.direction);
        lineTo(ctx,0,0,xx,yy,this.direction);
        moveTo(ctx,-10,0,xx,yy,this.direction);
        lineTo(ctx,10,0,xx,yy,this.direction);
        moveTo(ctx,-6,5,xx,yy,this.direction);
        lineTo(ctx,6,5,xx,yy,this.direction);
        moveTo(ctx,-2.5,10,xx,yy,this.direction);
        lineTo(ctx,2.5,10,xx,yy,this.direction);
        ctx.stroke();

        this.element.draw();
        this.output1.draw();

        if (this.element.b.hover)
            console.log(this,this.id);
    }
    this.delete = function() {
        this.output1.delete();
        simulationArea.lastSelected = undefined;
        scope.grounds.clean(this);
    }
}

function loadPower(data, scope) {
    var v = new Power(data["x"], data["y"], scope);
    v.output1 = replace(v.output1, data["output1"]);
}

function Power(x, y, scope = globalScope) {
    this.id = 'power' + uniqueIdCounter;
    this.scope = scope;
    uniqueIdCounter++;
    this.element = new Element(x, y, "power", 15, this);
    this.output1 = new Node(0, 20, 1, this);
    this.state = 1;

    this.output1.value = this.state;
    scope.powers.push(this);
    this.wasClicked = false;

    this.resolve = function() {
        this.output1.value = this.state;
        this.scope.stack.push(this.output1);
    }
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: findNode(this.output1),
        }
        return data;
    }
    this.update = function() {
        var updated = false;
        updated |= this.output1.update();
        updated |= this.element.update();
        return updated;
    }

    this.draw = function() {

        ctx = simulationArea.context;

        var xx = this.element.x;
        var yy = this.element.y;

        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3 ;
        ctx.fillStyle = "green";
        moveTo(ctx,0,0,xx,yy,this.direction);
        lineTo(ctx,-10,10,xx,yy,this.direction);
        lineTo(ctx,10,10,xx,yy,this.direction);
        lineTo(ctx,0,0,xx,yy,this.direction);
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        moveTo(ctx,0,10,xx,yy,this.direction);
        lineTo(ctx,0,20,xx,yy,this.direction);
        ctx.stroke();

        this.element.draw();
        this.output1.draw();
        if (this.element.b.hover)
            console.log(this,this.id);
    }
    this.delete = function() {
        this.output1.delete();
        simulationArea.lastSelected = undefined;
        scope.powers.clean(this);
    }
}

function loadOutput(data, scope) {

    var v = new Output(data["x"], data["y"], scope,data["dir"]);
    v.inp1 = replace(v.inp1, data["inp1"]);
}

function Output(x, y, scope, dir) {
    this.scope = scope;
    this.id = 'output' + uniqueIdCounter;
    uniqueIdCounter++;
    this.direction=dir;
    this.element = new Element(x, y, "output", 15, this);
    this.inp1 = new Node(10, 0, 0, this);
    this.state = -1;
    this.inp1.value = this.state;
    this.scope.outputs.push(this);
    this.nodeList=[[this.inp1]];

    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            inp1: scope.allNodes.indexOf(this.inp1),
            dir:this.direction,
        }
        return data;
    }
    this.resolve = function() {
        this.state = this.inp1.value;
    }

    this.isResolvable = function() {
        return this.inp1.value != -1;
    }

    this.update = function() {

        var updated = false;
        updated |= this.inp1.update();
        updated |= this.element.update();

        if (this.element.b.hover)
            console.log(this,this.id);
        return updated;
    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.6)";
        ctx.lineWidth = 3 ;
        ctx.beginPath();
        var xx = this.element.x;
        var yy = this.element.y;
        arc(ctx,0,0,10,0,2* Math.PI,xx,yy,this.direction);
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.font = "19px Georgia";
        if (this.state == -1)
            fillText(ctx,"x", xx - 5, yy + 5);
        else
            fillText(ctx,this.state.toString(), xx - 5, yy + 5);
        ctx.stroke();

        this.element.draw();
        this.inp1.draw();
    }
    this.delete = function() {
        this.inp1.delete();
        simulationArea.lastSelected = undefined;
        this.scope.outputs.clean(this);
    }
}

function Element(x, y, type, r, parent) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.b = new Button(x, y, r, "rgba(255,255,255,0)", "rgba(0,0,0,1)");
    this.isResolved = false;
    this.update = function() {
        var updated = false;
        updated |= this.b.update();
        if (this.b.clicked) simulationArea.lastSelected = parent;
        this.x = this.b.x;
        this.y = this.b.y;
        return updated;
    }

    this.draw = function() {
        return this.b.draw();
    }
}

function loadNode(data, scope) {
    var n = new Node(data["x"], data["y"], data["type"], scope.root);
}

function constructNodeConnections(node, data) {
    console.log(data["connections"].length);
    for (var i = 0; i < data["connections"].length; i++)
        if (!node.connections.contains(node.scope.allNodes[data["connections"][i]])) node.connect(node.scope.allNodes[data["connections"][i]]);
}

//output node=1
//input node=0
//intermediate node =2
function Node(x, y, type, parent) {
    this.id = 'node' + uniqueIdCounter;
    uniqueIdCounter++;
    this.parent = parent;
    this.leftx=x;
    this.lefty=y;
    this.x=x;
    this.y=y;

    this.type = type;
    this.connections = new Array();
    this.value = -1;
    this.radius = 5;
    this.clicked = false;
    this.hover = false;
    this.wasClicked = false;
    this.scope = this.parent.scope;
    this.prev = 'a';
    this.count = 0;

    //This fn is called during rotations and setup
    this.refresh=function(){
        [this.x,this.y]=rotate(this.leftx,this.lefty,this.parent.direction);
        for (var i = 0; i < this.connections.length; i++) {
            this.connections[i].connections.clean(this);
        }
        this.connections=[];

    }

    this.refresh();

    this.saveObject = function() {
        var data = {
            x: this.x,
            y: this.y,
            type: this.type,
            connections: [],
        }
        for (var i = 0; i < this.connections.length; i++) {
            data["connections"].push(findNode(this.connections[i]));
        }
        return data;
    }

    if (this.type == 2)
        this.parent.scope.nodes.push(this);

    this.parent.scope.allNodes.push(this);

    this.absX = function() {
        return this.x + this.parent.element.x;
    }
    this.absY = function() {
        return this.y + this.parent.element.y;
    }

    this.prevx = this.absX();
    this.prevy = this.absY();

    this.isResolvable = function() {
        return this.value != -1;
    }

    this.reset = function() {
        this.value = -1;
    }

    this.connect = function(n) {
        var w = new Wire(this, n, this.parent.scope);
        this.connections.push(n);
        n.connections.push(this);
    }

    this.resolve = function() {
        if (this.value == -1) {
            return;
        } else if (this.type == 0) {
            if (this.parent.isResolvable())
                this.scope.stack.push(this.parent);
        } else if (this.type == 1 || this.type == 2) {
            for (var i = 0; i < this.connections.length; i++) {
                if (this.connections[i].value != this.value) {
                    this.connections[i].value = this.value;
                    this.scope.stack.push(this.connections[i]);
                }
            }
        }
    }

    this.draw = function() {
        if (this.isHover())
            console.log(this,this.id);

        var ctx = simulationArea.context;

        if (this.clicked) {
            if (this.prev == 'x') {
                drawLine(ctx, this.absX(), this.absY(), simulationArea.mouseX, this.absY(), "black", 3 );
                drawLine(ctx, simulationArea.mouseX, this.absY(), simulationArea.mouseX, simulationArea.mouseY, "black", 3 );
            } else if (this.prev == 'y') {
                drawLine(ctx, this.absX(), this.absY(), this.absX(), simulationArea.mouseY, "black", 3 );
                drawLine(ctx, this.absX(), simulationArea.mouseY, simulationArea.mouseX, simulationArea.mouseY, "black", 3 );
            } else {
                if (Math.abs(this.x + this.parent.element.x - simulationArea.mouseX) > Math.abs(this.y + this.parent.element.y - simulationArea.mouseY)) {
                    drawLine(ctx, this.absX(), this.absY(), simulationArea.mouseX, this.absY(), "black", 3 );
                } else {
                    drawLine(ctx, this.absX(), this.absY(), this.absX(), simulationArea.mouseY, "black", 3 );
                }
            }
        }
        if (this.type != 2) {
            drawCircle(ctx, this.absX(), this.absY(), 3, "green");
        }

        if (simulationArea.lastSelected == this || (this.isHover() && !simulationArea.selected)) {
          ctx.strokeStyle ="green";
          ctx.beginPath();
          ctx.lineWidth= 3 ;
          arc(ctx,this.x,this.y, 8, 0, Math.PI * 2,this.parent.element.x,this.parent.element.y,"left");
          ctx.closePath();
          ctx.stroke();
        //   console.log("HIT");
        }


    }

    this.update = function() {
        if (!this.clicked && !simulationArea.mouseDown) {
            var px = this.prevx;
            var py = this.prevy;
            this.prevx = this.absX();
            this.prevy = this.absY();
            if (this.absX() != px || this.absY() != py) {
                updated = true;
                this.nodeConnect();
                return updated;
            }
        }
        var updated = false;
        if (!simulationArea.mouseDown) this.hover = false;
        if ((this.clicked || !simulationArea.hover) && this.isHover()) {
            this.hover = true;
            simulationArea.hover = true;
        } else if (!simulationArea.mouseDown && this.hover && this.isHover() == false) {
            if (this.hover) simulationArea.hover = false;
            this.hover = false;
        }

        if (simulationArea.mouseDown && (this.clicked)) {

            if (this.type == 2) {
                //console.log(this.absY(),simulationArea.mouseDownY,simulationArea.mouseDownX-this.parent.element.x);
                if (this.absX() == simulationArea.mouseX && this.absY() == simulationArea.mouseY) {
                    updated = false;
                    this.prev = 'a';
                } else if (this.connections.length == 1 && this.connections[0].absX() == simulationArea.mouseX && this.absX() == simulationArea.mouseX) {
                    this.y = simulationArea.mouseY - this.parent.element.y;
                    this.prev = 'a';
                    updated = true;
                } else if (this.connections.length == 1 && this.connections[0].absY() == simulationArea.mouseY && this.absY() == simulationArea.mouseY) {
                    this.x = simulationArea.mouseX - this.parent.element.x;
                    this.prev = 'a';
                    updated = true;
                }
                if (this.connections.length == 1 && this.connections[0].absX() == this.absX() && this.connections[0].absY() == this.absY()) {
                    this.connections[0].clicked = true;
                    this.connections[0].wasClicked = true;
                    // this.connections[0].connections.clean(this);
                    // nodes.clean(this);
                    // allNodes.clean(this);
                    this.delete();
                    updated = true;
                }
            }
            if (this.prev == 'a' && distance(simulationArea.mouseX, simulationArea.mouseY, this.absX(), this.absY()) >= 10) {
                if (Math.abs(this.x + this.parent.element.x - simulationArea.mouseX) > Math.abs(this.y + this.parent.element.y - simulationArea.mouseY)) {
                    this.prev = 'x';
                } else {
                    this.prev = 'y';
                }
            }
        } else if (simulationArea.mouseDown && !simulationArea.selected) {
            simulationArea.selected = this.clicked = this.hover;
            updated |= this.clicked;
            this.wasClicked |= this.clicked;
            this.prev = 'a';
        } else if (!simulationArea.mouseDown) {
            if (this.clicked) simulationArea.selected = false;
            this.clicked = false;
            this.count = 0;
        }
        if (this.wasClicked && !this.clicked) {
            this.wasClicked = false;
            if (simulationArea.mouseDownX == this.absX() && simulationArea.mouseDownY == this.absY()) {
                this.nodeConnect();
                return updated;
            }

            var n, n1;
            var x, y, x1, y1, flag = -1;
            x1 = simulationArea.mouseX;
            y1 = simulationArea.mouseY;
            if (this.prev == 'x') {
                x = x1;
                y = this.absY();
                flag = 0;
            } else if (this.prev == 'y') {
                y = y1;
                x = this.absX();
                flag = 1;
            }
            if (this.type == 'a') return; // this should never happen!!

            for (var i = 0; i < this.parent.scope.allNodes.length; i++) {
                if (x == this.parent.scope.allNodes[i].absX() && y == this.parent.scope.allNodes[i].absY()) {
                    n = this.parent.scope.allNodes[i];
                    this.connect(n);
                    break;
                }
            }

            if (n == undefined) {
                n = new Node(x, y, 2, this.scope.root);
                this.connect(n);
                for (var i = 0; i < this.parent.scope.wires.length; i++) {
                    if (this.parent.scope.wires[i].checkConvergence(n)) {
                        this.parent.scope.wires[i].converge(n);
                    }
                }
            }
            this.prev = 'a';


            if (flag == 0 && (this.y + this.parent.element.y - simulationArea.mouseY) != 0) {
                y = y1;
                flag = 2;
            } else if ((this.x + this.parent.element.x - simulationArea.mouseX) != 0 && flag == 1) {
                x = x1;
                flag = 2;
            }
            if (flag == 2) {
                for (var i = 0; i < this.parent.scope.allNodes.length; i++) {
                    if (x == this.parent.scope.allNodes[i].absX() && y == this.parent.scope.allNodes[i].absY()) {
                        n1 = this.parent.scope.allNodes[i];
                        n.connect(n1);
                        break;
                    }
                }
                if (n1 == undefined) {
                    n1 = new Node(x, y, 2, this.scope.root);
                    n.connect(n1);
                    for (var i = 0; i < this.parent.scope.wires.length; i++) {
                        if (this.parent.scope.wires[i].checkConvergence(n1)) {
                            this.parent.scope.wires[i].converge(n1);
                        }
                    }
                }

            }
            updated = true;

            simulationArea.lastSelected = undefined;
        }

        if (this.type == 2) {
            if (this.connections.length == 2 && simulationArea.mouseDown == false) {
                if ((this.connections[0].absX() == this.connections[1].absX()) || (this.connections[0].absY() == this.connections[1].absY())) {
                    // this.connections[0].connections.clean(this);
                    // this.connections[1].connections.clean(this);
                    // allNodes.clean(this);
                    // nodes.clean(this);
                    // this.deleted=true;
                    this.connections[0].connect(this.connections[1]);
                    this.delete();
                    updated = true;
                }
            } else if (this.connections.length == 0) this.delete();
        }

        if (this.clicked && this.type == 2) simulationArea.lastSelected = this;
        return updated;



    }

    this.delete = function() {
        toBeUpdated = true;
        this.deleted = true;
        this.parent.scope.allNodes.clean(this);
        this.parent.scope.nodes.clean(this);
        if (simulationArea.lastSelected == this) simulationArea.lastSelected = undefined;
        for (var i = 0; i < this.connections.length; i++) {
            this.connections[i].connections.clean(this);
        }
    }

    this.isClicked = function() {
        if (distance(this.absX(), this.absY(), simulationArea.mouseDownX, simulationArea.mouseDownY) <= this.radius * 1.5) return true;
        return false;
    }

    this.isHover = function() {
        if (distance(this.absX(), this.absY(), simulationArea.mouseX, simulationArea.mouseY) <= this.radius * 1.5) return true;
        return false;
    }

    this.nodeConnect = function() {
        var x = this.absX();
        var y = this.absY();
        var n;
        for (var i = 0; i < this.parent.scope.allNodes.length; i++) {
            if (this != this.parent.scope.allNodes[i] && x == this.parent.scope.allNodes[i].absX() && y == this.parent.scope.allNodes[i].absY()) {
                n = this.parent.scope.allNodes[i];
                this.connect(n);
                break;
            }
        }

        if (n == undefined) {
            for (var i = 0; i < this.parent.scope.wires.length; i++) {
                if (this.parent.scope.wires[i].checkConvergence(this)) {
                    var n = this;
                    if (this.type != 2) {
                        n = new Node(this.absX(), this.absY(), 2, this.scope.root);
                        this.connect(n);
                    }
                    this.parent.scope.wires[i].converge(n);
                    break;
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
    this.hover = false;
    this.draw = function() {

    }
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
        if (distance(this.x, this.y, simulationArea.mouseX, simulationArea.mouseY) < this.radius) return true;
        return false;
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

function addAnd() {
    var a = new AndGate(200, 150, globalScope, 2, 'left');
}

function addPower() {
    var p = new Power(200, 150);
}

function addGround() {
    var g = new Ground(200, 150);
}

function addOr() {
    var or = new OrGate(200, 150);
}

function addNot() {
    var npt = new NotGate(200, 150, globalScope, 'left');
}

function addInput() {
    var a = new Input(200, 150, globalScope, 'left');
}

function addOutput() {
    var a = new Output(200, 150, globalScope, 'left');
}

function addFlipflop() {
    var a = new FlipFlop(200, 150, globalScope, 'left');
}

function addClock() {
    var a = new Clock(200, 150, 2, globalScope, 'left');
}

function addSevenSeg() {
    var a = new SevenSegDisplay(400, 150);
}

function addSubCircuit() {
    var a = new SubCircuit(400, 150);
}

function bezierCurveTo(x1,y1,x2,y2,x3,y3,xx,yy,dir){
  [x1,y1]=rotate(x1,y1,dir);
  [x2,y2]=rotate(x2,y2,dir);
  [x3,y3]=rotate(x3,y3,dir);
  var ox=simulationArea.ox;
  var oy=simulationArea.oy;
  x1*=simulationArea.scale;
  y1*=simulationArea.scale;
  x2*=simulationArea.scale;
  y2*=simulationArea.scale;
  x3*=simulationArea.scale;
  y3*=simulationArea.scale;
  xx = xx*simulationArea.scale;
  yy = yy*simulationArea.scale;
  ctx.bezierCurveTo(xx+ox+x1,yy+oy+y1,xx+ox+x2,yy+oy+y2,xx+ox+x3,yy+oy+y3);
}

function moveTo(ctx,x1,y1,xx,yy,dir){
  [newX,newY]=rotate(x1,y1,dir);
  newX = newX*simulationArea.scale;
  newY = newY*simulationArea.scale;
  xx = xx*simulationArea.scale;
  yy = yy*simulationArea.scale;
  ctx.moveTo(xx+simulationArea.ox+newX,yy+simulationArea.oy+newY);
}

function lineTo(ctx,x1,y1,xx,yy,dir){
  [newX,newY]=rotate(x1,y1,dir);
  newX = newX*simulationArea.scale;
  newY = newY*simulationArea.scale;
  xx = xx*simulationArea.scale;
  yy = yy*simulationArea.scale;
  ctx.lineTo(xx+simulationArea.ox+newX,yy+simulationArea.oy+newY);
}

function arc(ctx,sx,sy,radius,start,stop,xx,yy,dir){        //ox-x of origin, xx- x of element , sx - shift in x from element

  [Sx,Sy]= rotate(sx,sy,dir);
  Sx = Sx*simulationArea.scale;
  Sy = Sy*simulationArea.scale;
  xx = xx*simulationArea.scale;
  yy = yy*simulationArea.scale;
  radius*=simulationArea.scale;
  [newStart,newStop,counterClock]=rotateAngle(start,stop,dir);
  // console.log(Sx,Sy);
  ctx.arc(xx+simulationArea.ox+Sx,yy+simulationArea.oy+Sy,radius,newStart,newStop,counterClock);
}

function rect(ctx,x1,y1,x2,y2){
  x1 = x1*simulationArea.scale;
  y1 = y1*simulationArea.scale;
  x2 = x2*simulationArea.scale;
  y2 = y2*simulationArea.scale;
  ctx.rect(simulationArea.ox + x1, simulationArea.oy + y1, x2,  y2);
}

function rect2(ctx,x1,y1,x2,y2,xx,yy,dir){

  [x1,y1]=rotate(x1,y1,dir);
  [x2,y2]=rotate(x2,y2,dir);
  // [xx,yy]=rotate(xx,yy,dir);
  x1 = x1*simulationArea.scale;
  y1 = y1*simulationArea.scale;
  x2 = x2*simulationArea.scale;
  y2 = y2*simulationArea.scale;
  xx *=simulationArea.scale;
  yy *=simulationArea.scale;
  ctx.rect(simulationArea.ox + xx+x1, simulationArea.oy+yy+y1, x2,  y2);
}

function newDirection(obj,dir){
    if(obj.direction==undefined)return;
    obj.direction=dir;
    for(var i =0;i<obj.nodeList.length;i++){
        for (var j=0;j<obj.nodeList[i].length;j++){
            // wireToBeChecked=1;
            obj.nodeList[i][j].refresh();
            // wireToBeChecked=1;
        }
    }

    //oldMethod for changing direction
    // for(var i=0;i<globalScope.wires.length;i++)
    //     globalScope.wires[i].checkConnections();
    // var newFunction=obj.func;
    // obj.list.pop();
    // obj.list.push(dir);
    // obj.list[0]=obj.element.x;
    // obj.list[1]=obj.element.y;
    // var b= new newFunction(obj.list);
    // obj.delete();
    // simulationArea.lastSelected=b;
}

function rotate(x1,y1,dir){
  if(dir=='right')
    return [-x1,y1];
  else if(dir=='up')
    return [y1,x1];
  else if(dir=='down')
    return [y1,-x1];
  else
    return [x1,y1];
}

function rotateAngle(start,stop,dir){
  if(dir=='right')
    return [start,stop,true];
  else if(dir=='up')
    return [start-Math.PI/2,stop-Math.PI/2,true];
  else if(dir=='down')
    return [start-Math.PI/2,stop-Math.PI/2,false];
  else
    return [start,stop,false];
}

function drawLine(ctx, x1, y1, x2, y2, color, width) {
    x1*=simulationArea.scale;
    y1*=simulationArea.scale;
    x2*=simulationArea.scale;
    y2*=simulationArea.scale;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = width;
    ctx.moveTo(x1+simulationArea.ox, y1+simulationArea.oy);
    ctx.lineTo(x2+simulationArea.ox, y2+simulationArea.oy);
    ctx.stroke();
}

function drawCircle(ctx, x1, y1, r, color) {
    // r = r*simulationArea.scale;
    x1 = x1*simulationArea.scale;
    y1 = y1*simulationArea.scale;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x1+simulationArea.ox, y1+simulationArea.oy, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function fillText(ctx,str, x1, y1 ) {
    x1 = x1*simulationArea.scale;
    y1 = y1*simulationArea.scale;
    ctx.font = 20*simulationArea.scale+"px Georgia";
    ctx.fillText(str, x1+simulationArea.ox, y1+simulationArea.oy);
}

document.getElementById("powerButton").addEventListener("click", addPower);
document.getElementById("groundButton").addEventListener("click", addGround);
document.getElementById("andButton").addEventListener("click", addAnd);
document.getElementById("orButton").addEventListener("click", addOr);
document.getElementById("notButton").addEventListener("click", addNot);
document.getElementById("inputButton").addEventListener("click", addInput);
document.getElementById("outputButton").addEventListener("click", addOutput);
document.getElementById("clockButton").addEventListener("click", addClock);
document.getElementById("flipflopButton").addEventListener("click", addFlipflop);
document.getElementById("sevenSegButton").addEventListener("click", addSevenSeg);
document.getElementById("subCircuitButton").addEventListener("click", addSubCircuit);
document.getElementById("saveButton").addEventListener("click", Save);
