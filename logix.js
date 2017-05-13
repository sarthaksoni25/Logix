
scale = 1;
var b1;
var width;
var height;
uniqueIdCounter = 0;
unit = 10
Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
Array.prototype.contains = function(value) {
    return this.indexOf(value) > -1
};

function extract(obj) {
    return obj.saveObject();
}

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

    data = JSON.stringify(data)
    console.log(data);

    var http = new XMLHttpRequest();
    http.open("POST", "./index.php", true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var params = "data=" + data; // probably use document.getElementById(...).value
    http.send(params);
    http.onload = function() {
        window.location.hash = http.responseText;
    }
}

function Scope(name = "localScope") {
    this.root = {
        element: new Element(0, 0, "root"),
        scope: this,
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

function setup() {
    globalScope = new Scope("globalScope");

    data = {};
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
    width = window.innerWidth * scale;
    height = window.innerHeight * scale;
    // load(globalScope,data);
    simulationArea.setup();

}

function resetup() {
    width = window.innerWidth * scale;
    height = window.innerHeight * scale;
    simulationArea.setup();
}

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

function Wire(node1, node2, scope) {


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
    // this.saveObject=function(){
    //   var data={
    //     node1:scope.allNodes.indexOf(this.node1),
    //     node2:scope.allNodes.indexOf(this.node2),
    //     x1:this.x1,
    //     y1:this.y1,
    //     y1:this.y1,
    //   }
    // }
    this.update = function() {
        var updated = false;
        if (simulationArea.mouseDown == true && simulationArea.selected == false && this.checkWithin(simulationArea.mouseDownX, simulationArea.mouseDownY)) {
            var n = new Node(simulationArea.mouseDownX, simulationArea.mouseDownY, 2, this.scope.root);
            this.converge(n);
            n.clicked = true;
            n.wasClicked = true;
            simulationArea.selected = true;
            updated = true;
        }

        if (this.node1.deleted || this.node2.deleted) this.delete();
        if (simulationArea.mouseDown == false) {
            if (this.type == "horizontal") {
                if (node1.absY() != this.y1) {
                    var n = new Node(node1.absX(), this.y1, 2, this.scope.root);
                    this.converge(n);
                    updated = true;
                } else if (node2.absY() != this.y2) {
                    var n = new Node(node2.absX(), this.y2, 2, this.scope.root);
                    this.converge(n);
                    updated = true;
                }
            } else if (this.type == "vertical") {
                if (node1.absX() != this.x1) {
                    var n = new Node(this.x1, node1.absY(), 2, this.scope.root);
                    this.converge(n);
                    updated = true;
                } else if (node2.absX() != this.x2) {
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
        drawLine(ctx, this.node1.absX(), this.node1.absY(), this.node2.absX(), this.node2.absY(), color, 3 * scale);
    }

    this.checkConvergence = function(n) {
        return this.checkWithin(n.absX(), n.absY());
    }
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

window.onresize = resetup;


window.addEventListener('orientationchange', resetup);

var simulationArea = {
    canvas: document.getElementById("simulationArea"),
    selected: false,
    hover: false,
    clockState: 0,
    lastSelected: undefined,
    stack: [],
    setup: function() {
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(update, 50);
        this.ClockInterval = setInterval(clockTick, 2000);
        // this.interval = setInterval(play, 300);
        this.mouseDown = false;
        window.addEventListener('mousemove', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseX = (e.clientX - rect.left) * scale;
            simulationArea.mouseY = (e.clientY - rect.top) * scale;
            simulationArea.mouseX = Math.round(simulationArea.mouseX / unit) * unit;
            simulationArea.mouseY = Math.round(simulationArea.mouseY / unit) * unit;
        });
        window.addEventListener('keydown', function(e) {
            if (e.keyCode == 8 && simulationArea.lastSelected != undefined) {
                simulationArea.lastSelected.delete();
            }
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
        })
        window.addEventListener('mousedown', function(e) {
            simulationArea.lastSelected = undefined;
            simulationArea.selected = false;
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseDownX = (e.clientX - rect.left) * scale;
            simulationArea.mouseDownY = (e.clientY - rect.top) * scale;
            simulationArea.mouseDownX = Math.round(simulationArea.mouseDownX / unit) * unit;
            simulationArea.mouseDownY = Math.round(simulationArea.mouseDownY / unit) * unit;
            simulationArea.mouseDown = true;
        });
        window.addEventListener('touchstart', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();

            simulationArea.mouseDownX = (e.touches[0].clientX - rect.left) * scale;
            simulationArea.mouseDownY = (e.touches[0].clientY - rect.top) * scale;
            simulationArea.mouseX = (e.touches[0].clientX - rect.left) * scale;
            simulationArea.mouseY = (e.touches[0].clientY - rect.top) * scale;
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
            simulationArea.mouseDownX = (e.clientX - rect.left) * scale;
            simulationArea.mouseDownY = (e.clientY - rect.top) * scale;
            simulationArea.mouseDownX = Math.round(simulationArea.mouseDownX / unit) * unit;
            simulationArea.mouseDownY = Math.round(simulationArea.mouseDownY / unit) * unit;

            simulationArea.mouseDown = false;
        });
        window.addEventListener('touchmove', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseX = (e.touches[0].clientX - rect.left) * scale;
            simulationArea.mouseY = (e.touches[0].clientY - rect.top) * scale;
        })
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function clockTick() {
    for (var i = 0; i < globalScope.clocks.length; i++)
        globalScope.clocks[i].toggleState();
    if (globalScope.clocks.length) {
        play();
    }
}

function update() {
    // play();
    // return;

    var updated = false;
    simulationArea.hover = false;
    for (var i = 0; i < globalScope.objects.length; i++)
        for (var j = 0; j < globalScope.objects[i].length; j++)
            updated |= globalScope.objects[i][j].update();
    toBeUpdated |= updated;
    // console.log(updated);
    if (toBeUpdated && simulationArea.mouseDown == false) {
        toBeUpdated = false;
        play();
    }

    simulationArea.clear();
    dots(10);
    for (var i = 0; i < globalScope.objects.length; i++)
        for (var j = 0; j < globalScope.objects[i].length; j++)
            updated |= globalScope.objects[i][j].draw();


}

function dots(scale) {
    var canvasWidth = simulationArea.canvas.width;
    var canvasHeight = simulationArea.canvas.height;
    var ctx = simulationArea.context;
    var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

    function drawPixel(x, y, r, g, b, a) {
        var index = (x + y * canvasWidth) * 4;
        canvasData.data[index + 0] = r;
        canvasData.data[index + 1] = g;
        canvasData.data[index + 2] = b;
        canvasData.data[index + 3] = a;
    }
    for (var i = 0; i < canvasWidth; i += scale)
        for (var j = 0; j < canvasHeight; j += scale)
            drawPixel(i, j, 0, 0, 0, 255);

    ctx.putImageData(canvasData, 0, 0);

}

function replace(node, index) {
    scope = node.scope;
    parent = node.parent;
    node.delete();
    node = scope.allNodes[index];
    node.parent = parent;
    return node;
}

function findNodes(x) {
    return x.scope.allNodes.indexOf(x);
}

function extractNode(x, scope, parent) {
    var n = scope.allNodes[x];
    n.parent = parent;
    return n;
}

function loadAnd(data, scope) {
    var v = new AndGate(data["x"], data["y"], scope, data["inputs"]);
    v.output1 = replace(v.output1, data["output1"]);
    for (var i = 0; i < data["inputs"]; i++) v.inp[i] = replace(v.inp[i], data["inp"][i]);
}

function AndGate(list) {
    this.func=AndGate;
    [x, y, scope, inputLength, dir] = list;
    console.log(scope)
    this.scope = scope;
    this.id = 'and' + uniqueIdCounter;
    uniqueIdCounter++;
    this.element = new Element(x, y, "and", 25, this);
    this.inp = [];
    this.direction=dir;
    this.list=list;

    this.inputs = inputLength;
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
    scope.andGates.push(this);

    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            inputs: this.inputs,
            inp: this.inp.map(findNodes),
            output1: this.scope.allNodes.indexOf(this.output1),
        }
        return data;
    }
    this.isResolvable = function() {
        var res1 = true;
        for (var i = 0; i < inputLength; i++)
            res1 = res1 && (this.inp[i].value != -1);
        return res1;
    }

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
    this.update = function() {
        var updated = false;
        for (var j = 0; j < inputLength; j++) {
            updated |= this.inp[j].update();
        }
        updated |= this.output1.update();
        updated |= this.element.update();
        return updated;
    }

    this.draw = function() {

        ctx = simulationArea.context;

        ctx.beginPath();
        ctx.lineWidth = 3 * scale;
        ctx.strokeStyle = "black"; //("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.5)";
        var xx = this.element.x;
        var yy = this.element.y;

        moveTo(ctx,xx,yy,0,0,-10,-20,this.direction,scale);
        lineTo(ctx,xx,yy,0,0,0,-20,this.direction,scale);
        arc(ctx,xx,yy,0,0,20,(-Math.PI/2),(Math.PI/2),this.direction,scale,0,0);
        lineTo(ctx,xx,yy,0,0,-10,20,this.direction,scale);
        lineTo(ctx,xx,yy,0,0,-10,-20,this.direction,scale);
        ctx.closePath();

        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();
        // this.element.update();

        for (var i = 0; i < inputLength; i++)
            this.inp[i].draw();

        this.output1.draw();

        if (this.element.b.hover)
            console.log(this.id);
    }
    this.delete = function() {
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


function SubCircuit(x, y, scope = globalScope, savedData=undefined) {


    this.savedData=savedData;
    this.scope = scope;
    this.localScope = new Scope();
    this.id = 'subCircuits' + uniqueIdCounter;
    uniqueIdCounter++;
    this.element = new Element(x, y, "subCircuit", 35, this);
    this.scope.subCircuits.push(this);
    this.inputNodes = [];
    this.outputNodes = [];
    this.width = 0;
    this.height = 0;
    // this.deleted=false;
    if(savedData!=undefined)
        this.dataHash = savedData["dataHash"];
    else
        this.dataHash = prompt("Enter Hash: ");

    var http = new XMLHttpRequest();
    http.open("POST", "./index.php", true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var params = "retrieve=" + this.dataHash; // probably use document.getElementById(...).value
    http.send(params);
    http.parent = this;
    if(this.savedData!=undefined){

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
            inputNodes: this.inputNodes.map(findNodes),
            outputNodes: this.outputNodes.map(findNodes),
        }
        return data;
    }
    this.buildCircuit = function() {
        load(this.localScope, this.data);
        this.width = 60;
        this.height = (Math.max(this.localScope.inputs.length, this.localScope.outputs.length) + 2) * 10;


        if(this.savedData==undefined){
            if (this.localScope.inputs.length % 2 == 1) {
                for (var i = this.localScope.inputs.length / 2 - 2; i >= 0; i--) {
                    var a = new Node(-30, -10 * (i + 1), 0, this);
                    this.inputNodes.push(a);
                }
                var a = new Node(-30, 0, 0, this);
                this.inputNodes.push(a);
                for (var i = this.localScope.inputs.length / 2 + 1; i < this.localScope.inputs.length; i++) {
                    var a = new Node(-30, 10 * (i + 1 - this.localScope.inputs.length % 2 / 2 - 1), 0, this);
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
                for (var i = this.localScope.outputs.length / 2 - 2; i >= 0; i--) {
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
        ctx.lineWidth = 3 * scale;
        ctx.strokeStyle = "black"; //("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.5)";
        var xx = this.element.x;
        var yy = this.element.y;
        ctx.rect(xx - this.width / 2, yy - this.height / 2, this.width, this.height);
        ctx.closePath();
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();
        // this.element.update();

        for (var i = 0; i < this.inputNodes.length; i++)
            this.inputNodes[i].draw();
        for (var i = 0; i < this.outputNodes.length; i++)
            this.outputNodes[i].draw();
        if (this.element.b.hover)
            console.log(this.id);
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

    }
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            g: this.scope.allNodes.indexOf(this.g),
            f: this.scope.allNodes.indexOf(this.f),
            a: this.scope.allNodes.indexOf(this.a),
            b: this.scope.allNodes.indexOf(this.b),
            d: this.scope.allNodes.indexOf(this.d),
            e: this.scope.allNodes.indexOf(this.e),
            c: this.scope.allNodes.indexOf(this.c),
            d: this.scope.allNodes.indexOf(this.d),
            dot: this.scope.allNodes.indexOf(this.dot),
        }
        return data;
    }
    this.drawSegment = function(x1, y1, x2, y2, color) {
        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5 * scale;
        ctx.moveTo(this.element.x + x1, this.element.y + y1);
        ctx.lineTo(this.element.x + x2, this.element.y + y2);
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
        ctx.lineWidth = 3 * scale;
        ctx.rect(xx - 30, yy - 50, 60, 100);
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
        ctx.rect(xx + 20, yy + 40, 2, 2);
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
    var v = new OrGate(data["x"], data["y"], scope, data["inputs"]);
    v.output1 = replace(v.output1, data["output1"]);
    for (var i = 0; i < data["inputs"]; i++) v.inp[i] = replace(v.inp[i], data["inp"][i]);
}

function OrGate(x, y, scope = globalScope, inputs = 2) {
    this.id = 'or' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
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

    this.saveObject = function() {
        console.log(this.scope.allNodes);
        var data = {
            x: this.element.x,
            y: this.element.y,
            inputs: this.inputs,
            inp: this.inp.map(findNodes),
            output1: this.scope.allNodes.indexOf(this.output1),
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
        ctx.lineWidth = 3 * scale;

        var xx = this.element.x;
        var yy = this.element.y;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 32,0.5)";
        ctx.moveTo(xx - 10, yy - 20);
        ctx.bezierCurveTo(xx, yy - 20, xx + 15, yy - 10, xx + 20, yy);
        ctx.bezierCurveTo(xx + 15, yy + 10, xx, yy + 20, xx - 10, yy + 20);
        ctx.bezierCurveTo(xx, yy, xx, yy, xx - 10, yy - 20);
        ctx.closePath();
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        for (var i = 0; i < inputs; i++)
            this.inp[i].draw();

        this.output1.draw();;
        if (this.element.b.isHover())
            console.log(this.id);
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
    var v = new NotGate(data["x"], data["y"], scope);
    v.output1 = replace(v.output1, data["output1"]);
    v.inp1 = replace(v.inp1, data["inp1"]);
}

function NotGate(list) {
    this.func=NotGate;
    [x, y, scope, dir]=list;
    this.id = 'not' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.element = new Element(x, y, "not", 15, this);
    this.direction=dir;
    this.list=list;
    this.inp1 = new Node(-10, 0, 0, this);
    this.output1 = new Node(20, 0, 1, this);
    scope.notGates.push(this);

    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: this.scope.allNodes.indexOf(this.output1),
            inp1: this.scope.allNodes.indexOf(this.inp1),
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
        ctx.lineWidth = 3 * scale;

        var xx = this.element.x;
        var yy = this.element.y;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 32,1)";
        moveTo(ctx,xx,yy,0,0,-10,-10,this.direction,scale);
        lineTo(ctx,xx,yy,0,0,10,0,this.direction,scale);
        arc(ctx,xx,yy,0,0,5,2*(Math.PI),0,this.direction,scale,15,0);
        lineTo(ctx,xx,yy,0,0,-10,10,this.direction,scale);
        ctx.closePath();
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();
        this.inp1.draw();
        this.output1.draw();
        if (this.element.b.isHover())
            console.log(this.id);
    }
    this.delete = function() {
        this.output1.delete();
        this.inp1.delete();
        simulationArea.lastSelected = undefined;
        scope.notGates.clean(this);
    }

}

function loadInput(data, scope) {

    var v = new Input(data["x"], data["y"], scope);
    v.output1 = replace(v.output1, data["output1"]);
}

function Input(list) {
    this.func=Input;
    [x, y, scope, dir] = list;
    this.id = 'input' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.list=list;
    this.direction=dir;
    this.element = new Element(x, y, "input", 15, this);
    this.output1 = new Node(10, 0, 1, this);
    this.state = 0;
    this.output1.value = this.state;
    scope.inputs.push(this);
    this.wasClicked = false;
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: this.scope.allNodes.indexOf(this.output1),
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
            console.log(this.id);
        return updated;

    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.lineWidth = 3 * scale;
        var xx = this.element.x;
        var yy = this.element.y;

        rect(ctx,0,0,xx-10,yy-10,20,20,scale);
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "20px Georgia";
        ctx.fillStyle = "green";
        ctx.fillText(this.state.toString(), xx - 5, yy + 5);
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

function FlipFlop(list) {
    this.func = FlipFlop;
    [x, y, scope, dir] = list;
    this.direction = dir;
    this.list = list;
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
            console.log(this.id);
        return updated;

    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.lineWidth = 3 * scale;
        var xx = this.element.x;
        var yy = this.element.y;
        rect(ctx,0,0,xx - 20, yy - 20, 40, 40);
        moveTo(ctx,xx,yy,0,0,-20,-15,this.direction,scale);
        lineTo(ctx,xx,yy,0,0,-15,-10,this.direction,scale);
        lineTo(ctx,xx,yy,0,0,-20,-5,this.direction,scale);


        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "20px Georgia";
        ctx.fillStyle = "green";
        ctx.fillText(this.slaveState.toString(), xx - 5, yy + 5);
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

function Clock(list) {
    [x, y, f, scope , dir] = list;
    this.func = Clock;
    this.direction=dir;
    this.list=list;
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
            console.log(this.id);
        return updated;

    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.lineWidth = 3 * scale;
        var xx = this.element.x;
        var yy = this.element.y;
        rect(ctx,0,0,xx - 10, yy - 10, 20, 20);
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        // ctx.font="20px Georgia";
        // ctx.fillStyle="green";
        // ctx.fillText(this.state.toString(),xx-5,yy+5);
        ctx.strokeStyle = ["DarkGreen", "Lime"][this.state];
        ctx.lineWidth = 2 * scale;
        if (this.state == 0) {
            ctx.moveTo(xx - 6, yy);
            ctx.lineTo(xx - 6, yy + 6);
            ctx.lineTo(xx, yy + 6);
            ctx.lineTo(xx, yy - 6);
            ctx.lineTo(xx + 6, yy - 6);
            ctx.lineTo(xx + 6, yy);

        } else {
            ctx.moveTo(xx - 6, yy);
            ctx.lineTo(xx - 6, yy - 6);
            ctx.lineTo(xx, yy - 6);
            ctx.lineTo(xx, yy + 6);
            ctx.lineTo(xx + 6, yy + 6);
            ctx.lineTo(xx + 6, yy);
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
            output1: this.scope.allNodes.indexOf(this.output1),
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
        ctx.lineWidth = 3 * scale;
        var ox=0;
        var oy=0;
        var xx = this.element.x;
        var yy = this.element.y;
        ctx.moveTo(xx+ ox, yy +oy - 10);
        ctx.lineTo(xx+ ox, yy +oy);
        ctx.moveTo(xx+ ox - 10, yy +oy);
        ctx.lineTo(xx+ ox + 10, yy +oy);
        ctx.moveTo(xx+ ox - 6, yy +oy + 5);
        ctx.lineTo(xx+ ox + 6, yy +oy + 5);
        ctx.moveTo(xx+ ox - 2.5, yy +oy + 10);
        ctx.lineTo(xx+ ox + 2.5, yy +oy + 10);
        ctx.stroke();

        this.element.draw();
        this.output1.draw();

        if (this.element.b.hover)
            console.log(this.id);
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
            output1: this.scope.allNodes.indexOf(this.output1),
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
        ctx.lineWidth = 3 * scale;
        ctx.fillStyle = "green";
        ctx.moveTo(xx, yy);
        ctx.lineTo(xx - 10, yy + 10);
        // ctx.moveTo(xx-10, yy+10);
        ctx.lineTo(xx + 10, yy + 10);
        // ctx.moveTo(xx+10, yy+10);
        ctx.lineTo(xx, yy);
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.moveTo(xx, yy + 10);
        ctx.lineTo(xx, yy + 20);

        ctx.stroke();

        this.element.draw();
        this.output1.draw();
        if (this.element.b.hover)
            console.log(this.id);
    }
    this.delete = function() {
        this.output1.delete();
        simulationArea.lastSelected = undefined;
        scope.powers.clean(this);
    }
}

function loadOutput(data, scope) {

    var v = new Output(data["x"], data["y"], scope);
    v.inp1 = replace(v.inp1, data["inp1"]);
}

function Output(list) {
    this.func=Output;
    [x, y, scope, dir] = list;
    this.scope = scope;
    this.id = 'output' + uniqueIdCounter;
    uniqueIdCounter++;
    this.list=list;
    this.direction=dir;
    this.element = new Element(x, y, "output", 15, this);
    this.inp1 = new Node(10, 0, 0, this);
    this.state = -1;
    this.inp1.value = this.state;
    this.scope.outputs.push(this);

    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            inp1: scope.allNodes.indexOf(this.inp1),
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
            console.log(this.id);
        return updated;
    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "rgba(255, 255, 32,0.6)";
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        var xx = this.element.x;
        var yy = this.element.y;
        ctx.arc(xx, yy, 10, 0, 2 * Math.PI);
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.font = "19px Georgia";
        if (this.state == -1)
            ctx.fillText("x", xx - 5, yy + 5);
        else
            ctx.fillText(this.state.toString(), xx - 5, yy + 5);
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
        // this.b.x=Math.round(this.b.x/unit)*unit;
        // this.b.y=Math.round(this.b.y/unit)*unit;
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

    this.leftx=x*scale;
    this.lefty=y*scale;

    if(type!=2){
      [X,Y]=rotate(this.leftx,this.lefty,this.parent.direction);
      this.x=X;
      this.y=Y;
    }
    else{
      this.x=x;
      this.y=y;
    }

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
    this.saveObject = function() {
        var data = {
            x: this.x,
            y: this.y,
            type: this.type,
            connections: [],
        }
        for (var i = 0; i < this.connections.length; i++) {
            data["connections"].push(this.scope.allNodes.indexOf(this.connections[i]));
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
            console.log(this.id);
        var ctx = simulationArea.context;

        if (this.clicked) {
            if (this.prev == 'x') {
                drawLine(ctx, this.absX(), this.absY(), simulationArea.mouseX, this.absY(), "black", 3 * scale);
                drawLine(ctx, simulationArea.mouseX, this.absY(), simulationArea.mouseX, simulationArea.mouseY, "black", 3 * scale);
            } else if (this.prev == 'y') {
                drawLine(ctx, this.absX(), this.absY(), this.absX(), simulationArea.mouseY, "black", 3 * scale);
                drawLine(ctx, this.absX(), simulationArea.mouseY, simulationArea.mouseX, simulationArea.mouseY, "black", 3 * scale);
            } else {
                if (Math.abs(this.x + this.parent.element.x - simulationArea.mouseX) > Math.abs(this.y + this.parent.element.y - simulationArea.mouseY)) {
                    drawLine(ctx, this.absX(), this.absY(), simulationArea.mouseX, this.absY(), "black", 3 * scale);
                } else {
                    drawLine(ctx, this.absX(), this.absY(), this.absX(), simulationArea.mouseY, "black", 3 * scale);
                }
            }
        }
        if (this.type != 2) {
            drawCircle(ctx, this.absX(), this.absY(), 3, "green");
        }

        if (simulationArea.lastSelected == this || (this.isHover() && !simulationArea.selected)) {
          ctx.strokeStyle ="green";
          ctx.beginPath();
          ctx.lineWidth= 3 * scale;
          ctx.arc(this.x+this.parent.element.x, this.y+this.parent.element.y, 8, 0, Math.PI * 2, false);
          ctx.closePath();
          ctx.stroke();
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
        // var ctx = simulationArea.context;
        // if (this.clicked || (this.isHover() && !simulationArea.selected)) {
        // 		drawCircle(ctx,this.x,this.y,this.radius,"black");
        // 		return true;
        // }
        // return false;

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
    var a = new AndGate([200, 150, globalScope, 2, 'left']);
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
    var npt = new NotGate([200, 150, globalScope, 'left']);
}

function addInput() {
    var a = new Input([200, 150, globalScope, 'left']);
}

function addOutput() {
    var a = new Output([200, 150, globalScope, 'left']);
}

function addFlipflop() {
    var a = new FlipFlop([200, 150, globalScope, 'left']);
}

function addClock() {
    var a = new Clock([200, 150, 2, globalScope, 'left']);
}

function addSevenSeg() {
    var a = new SevenSegDisplay(400, 150);
}

function addSubCircuit() {
    var a = new SubCircuit(400, 150);
}


function moveTo(ctx,xx,yy,ox,oy,x1,y1,dir,scale){
  [newX,newY]=rotate(x1,y1,dir);
  newX = newX*scale;
  newY = newY*scale;
  ctx.moveTo(xx+ox+newX,yy+oy+newY);
}
function lineTo(ctx,xx,yy,ox,oy,x1,y1,dir,scale){
  [newX,newY]=rotate(x1,y1,dir);
  newX = newX*scale;
  newY = newY*scale;
  ctx.lineTo(xx+ox+newX,yy+oy+newY);
}
function arc(ctx,xx,yy,ox,oy,radius,start,stop,dir,scale,sx,sy){        //ox-x of origin, xx- x of element , sx - shift in x from element

  [Sx,Sy]= rotate(sx,sy,dir);
  Sx = Sx*scale;
  Sy = Sy*scale;
  [newStart,newStop,counterClock]=rotateAngle(start,stop,dir);
  ctx.arc(xx+ox+Sx,yy+oy+Sy,radius,newStart,newStop,counterClock);
}
function rect(ctx,ox,oy,x1,y1,x2,y2,scale){
  x1 = x1*scale;
  y1 = y1*scale;
  x2 = x2*scale;
  y2 = y2*scale;
  ctx.rect(ox + x1, oy + y1, ox + x2, oy + y2);
}
function newDirection(obj,dir){
  var newFunction=obj.func;
  obj.list.pop();
  obj.list.push(dir);
  obj.list[0]=obj.element.x;
  obj.list[1]=obj.element.y;
  var b= new newFunction(obj.list);
  obj.delete();
  simulationArea.lastSelected=b;
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
    x1*=scale;
    y1*=scale;
    x2*=scale;
    y2*=scale;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = width;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawCircle(ctx, x1, y1, r, color) {
    r = r*scale;
    ctx.beginPath();
    ctx.fillStyle = color;
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
document.getElementById("clockButton").addEventListener("click", addClock);
document.getElementById("flipflopButton").addEventListener("click", addFlipflop);
document.getElementById("sevenSegButton").addEventListener("click", addSevenSeg);
document.getElementById("subCircuitButton").addEventListener("click", addSubCircuit);
document.getElementById("saveButton").addEventListener("click", Save);
