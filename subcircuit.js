
function loadSubCircuit(savedData, scope) {
    var v = new SubCircuit(savedData["x"], savedData["y"], scope, savedData);
    // for (var i = 0; i < v.inputNodes.length; i++) v.inputNodes[i] = replace(v.inputNodes[i], data["inputNodes"][i]);
    // for (var i = 0; i < v.outputNodes.length; i++) v.outputNodes[i] = replace(v.outputNodes[i], data["outputNodes"][i]);
}

//subCircuit
function SubCircuit(x, y, scope = globalScope, savedData=undefined,dir="left") {
    this.bitWidth=parseInt(prompt("Enter bitWidth"),10);
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
                    var a = new Node(-30, -10 * (i + 1), 0, this,this.localScope.inputs[i].bitWidth);
                    this.inputNodes.push(a);
                }
                var a = new Node(-30, 0, 0, this);
                this.inputNodes.push(a);
                for (var i = this.localScope.inputs.length / 2+.5; i < this.localScope.inputs.length; i++) {
                    var a = new Node(-30, 10 * (i + 1 - this.localScope.inputs.length % 2 / 2 - 1.5), 0, this,this.localScope.inputs[i].bitWidth);
                    this.inputNodes.push(a);
                }
            } else {
                for (var i = 0; i < this.localScope.inputs.length / 2; i++) {
                    var a = new Node(-30, -10 * (i + 1), 0, this,this.localScope.inputs[i].bitWidth);
                    this.inputNodes.push(a);
                }
                for (var i = this.localScope.inputs.length / 2; i < this.localScope.inputs.length; i++) {
                    var a = new Node(-30, 10 * (i + 1 - this.localScope.inputs.length / 2), 0, this,this.localScope.inputs[i].bitWidth);
                    this.inputNodes.push(a);
                }
            }
            if (this.localScope.outputs.length % 2 == 1) {
                for (var i = this.localScope.outputs.length / 2 - 1; i >= 0; i--) {
                    var a = new Node(30, -10 * (i + 1), 1, this,this.localScope.inputs[i].bitWidth);
                    this.outputNodes.push(a);
                }
                var a = new Node(30, 0, 1, this);
                this.outputNodes.push(a);
                for (var i = this.localScope.outputs.length / 2 + 1; i < this.localScope.outputs.length; i++) {
                    var a = new Node(30, 10 * (i + 1 - this.localScope.outputs.length % 2 / 2 - 1), 1, this,this.localScope.inputs[i].bitWidth);
                    this.outputNodes.push(a);
                }
            } else {
                for (var i = 0; i < this.localScope.outputs.length / 2; i++) {
                    var a = new Node(30, -10 * (i + 1), 1, this,this.localScope.inputs[i].bitWidth);
                    this.outputNodes.push(a);
                }
                for (var i = this.localScope.outputs.length / 2; i < this.localScope.outputs.length; i++) {
                    var a = new Node(30, 10 * (i + 1 - this.localScope.outputs.length / 2), 1, this,this.localScope.inputs[i].bitWidth);
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
