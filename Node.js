function constructNodeConnections(node, data) {
    // console.log(data["connections"].length);
    for (var i = 0; i < data["connections"].length; i++)
        if (!node.connections.contains(node.scope.allNodes[data["connections"][i]])) node.connect(node.scope.allNodes[data["connections"][i]]);
}

//Fn to replace node by node @ index in global Node List - used when loading
function replace(node, index) {
    scope = node.scope;
    parent = node.parent;
    parent.nodeList.clean(node);
    node.delete();
    node = scope.allNodes[index];
    node.parent = parent;
    parent.nodeList.push(node);
    node.updateRotation();
    return node;
}

function extractBits(num, start, end) {
    return (num << (32 - end)) >>> (32 - (end - start + 1));
}

function bin2dec(binString) {
    return parseInt(binString, 2);
}

function dec2bin(dec, bitWidth = undefined) {
    // only for positive nos
    var bin = (dec).toString(2);
    if (bitWidth == undefined) return bin;
    return '0'.repeat(bitWidth - bin.length) + bin;
}
//find Index of a node
function findNode(x) {
    return x.scope.allNodes.indexOf(x);
}

function loadNode(data, scope) {
    var n = new Node(data["x"], data["y"], data["type"], scope.root, data["bitWidth"]);
}

//get Node in index x in scope and set parent
function extractNode(x, scope, parent) {
    var n = scope.allNodes[x];
    n.parent = parent;
    return n;
}

//output node=1
//input node=0
//intermediate node =2
function Node(x, y, type, parent, bitWidth = undefined) {
    this.objectType = "Node";
    this.id = 'node' + uniqueIdCounter;
    uniqueIdCounter++;
    this.parent = parent;
    if (type != 2 && this.parent.nodeList !== undefined)
        this.parent.nodeList.push(this);
    // console.log(this.parent.nodeList);
    this.leftx = x;
    if (bitWidth == undefined) {
        this.bitWidth = parent.bitWidth;
    } else {
        this.bitWidth = bitWidth;
    }
    this.lefty = y;
    this.x = x;
    this.y = y;

    this.type = type;
    this.connections = new Array();
    this.value = undefined;
    this.radius = 5;
    this.clicked = false;
    this.hover = false;
    this.wasClicked = false;
    this.scope = this.parent.scope;
    this.prev = 'a';
    this.count = 0;
    this.highlighted = false;

    //This fn is called during rotations and setup

    this.updateRotation = function() {
        [this.x, this.y] = rotate(this.leftx, this.lefty, this.parent.direction);
    }
    this.refresh = function() {
        // [this.x,this.y]=rotate(this.leftx,this.lefty,this.parent.direction);
        this.updateRotation();
        for (var i = 0; i < this.connections.length; i++) {
            this.connections[i].connections.clean(this);
        }
        this.connections = [];

    }

    this.refresh();

    this.startDragging=function(){
        this.oldx = this.x;
        this.oldy = this.y;
    }
    this.drag=function(){
        this.x = this.oldx + simulationArea.mouseX - simulationArea.mouseDownX;
        this.y = this.oldy + simulationArea.mouseY - simulationArea.mouseDownY;
    }

    this.saveObject = function() {

        if (this.type == 2) {
            this.leftx = this.x;
            this.lefty = this.y;
        }
        var data = {
            x: this.leftx,
            y: this.lefty,
            type: this.type,
            bitWidth: this.bitWidth,
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
        return this.x + this.parent.x;
    }
    this.absY = function() {
        return this.y + this.parent.y;
    }


    this.isResolvable = function() {
        return this.value != undefined;
    }

    this.reset = function() {
        this.value = undefined;
        this.highlighted = false;
    }

    this.connect = function(n) {
        var w = new Wire(this, n, this.parent.scope);
        this.connections.push(n);
        n.connections.push(this);
    }

    this.resolve = function() {
        if (this.value == undefined) {
            return;
        }
        if (this.type == 0) {
            if (this.parent.isResolvable())
                this.scope.stack.push(this.parent);
        }

        for (var i = 0; i < this.connections.length; i++) {
            if (this.connections[i].value != this.value) {

                if (this.connections[i].type == 1 && this.connections[i].value != undefined) {
                    this.highlighted = true;
                    this.connections[i].highlighted = true;
                    showError("Contention Error: " + this.value + " and " + this.connections[i].value);
                    // console.log("CONTENTION", this.connections[i].value, this.value);
                } else if (this.connections[i].bitWidth == this.bitWidth || this.connections[i].type == 2) {
                    this.connections[i].bitWidth = this.bitWidth;
                    this.connections[i].value = this.value;
                    this.scope.stack.push(this.connections[i]);
                } else {
                    this.highlighted = true;
                    this.connections[i].highlighted = true;
                    showError("BitWidth Error: " + this.bitWidth + " and " + this.connections[i].bitWidth);
                    // console.log("BIT WIDTH ERROR");
                }
            }
            // else if(this.connections[i].value!=this.value){
            //     console.log("CONTENTION");
            // }
        }

    }

    this.draw = function() {
        if (this.isHover())
            console.log(this, this.id);

        var ctx = simulationArea.context;

        if (this.clicked) {
            if (this.prev == 'x') {
                drawLine(ctx, this.absX(), this.absY(), simulationArea.mouseX, this.absY(), "black", 3);
                drawLine(ctx, simulationArea.mouseX, this.absY(), simulationArea.mouseX, simulationArea.mouseY, "black", 3);
            } else if (this.prev == 'y') {
                drawLine(ctx, this.absX(), this.absY(), this.absX(), simulationArea.mouseY, "black", 3);
                drawLine(ctx, this.absX(), simulationArea.mouseY, simulationArea.mouseX, simulationArea.mouseY, "black", 3);
            } else {
                if (Math.abs(this.x + this.parent.x - simulationArea.mouseX) > Math.abs(this.y + this.parent.y - simulationArea.mouseY)) {
                    drawLine(ctx, this.absX(), this.absY(), simulationArea.mouseX, this.absY(), "black", 3);
                } else {
                    drawLine(ctx, this.absX(), this.absY(), this.absX(), simulationArea.mouseY, "black", 3);
                }
            }
        }
        // if (this.type != 2) {

        var color = (this.bitWidth != 1 || this.value == undefined) ? "black" : ["green", "lightgreen"][this.value];
        if (this.type == 1 || this.type == 0) color = "green";
        drawCircle(ctx, this.absX(), this.absY(), 3, color);
        // }

        if (this.highlighted || simulationArea.lastSelected == this || (this.isHover() && !simulationArea.selected && !simulationArea.shiftDown) || simulationArea.multipleObjectSelections.contains(this)) {
            ctx.strokeStyle = "green";
            ctx.beginPath();
            ctx.lineWidth = 3;
            arc(ctx, this.x, this.y, 8, 0, Math.PI * 2, this.parent.x, this.parent.y, "RIGHT");
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

            if(!simulationArea.shiftDown&&simulationArea.multipleObjectSelections.contains(this)){
                for(var i=0;i<simulationArea.multipleObjectSelections.length;i++){
                    simulationArea.multipleObjectSelections[i].drag();
                }
            }

            if (this.type == 2) {
                //console.log(this.absY(),simulationArea.mouseDownY,simulationArea.mouseDownX-this.parent.x);
                if (this.absX() == simulationArea.mouseX && this.absY() == simulationArea.mouseY) {
                    updated = false;
                    this.prev = 'a';
                } else if (this.connections.length == 1 && this.connections[0].absX() == simulationArea.mouseX && this.absX() == simulationArea.mouseX) {
                    this.y = simulationArea.mouseY - this.parent.y;
                    this.prev = 'a';
                    updated = true;
                } else if (this.connections.length == 1 && this.connections[0].absY() == simulationArea.mouseY && this.absY() == simulationArea.mouseY) {
                    this.x = simulationArea.mouseX - this.parent.x;
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
                if (Math.abs(this.x + this.parent.x - simulationArea.mouseX) > Math.abs(this.y + this.parent.y - simulationArea.mouseY)) {
                    this.prev = 'x';
                } else {
                    this.prev = 'y';
                }
            }
        } else if (simulationArea.mouseDown && !simulationArea.selected) {
            simulationArea.selected = this.clicked = this.hover;
            updated |= this.clicked;
            // this.wasClicked |= this.clicked;
            this.prev = 'a';
        } else if (!simulationArea.mouseDown) {
            if (this.clicked) simulationArea.selected = false;
            this.clicked = false;
            this.count = 0;
        }

        if (this.clicked && !this.wasClicked) {
            this.wasClicked = true;
            // this.drag();
            if(!simulationArea.shiftDown&&simulationArea.multipleObjectSelections.contains(this)){
                for(var i=0;i<simulationArea.multipleObjectSelections.length;i++){
                    simulationArea.multipleObjectSelections[i].startDragging();
                }
            }

            if (this.type == 2) {
                if (simulationArea.shiftDown) {
                    simulationArea.lastSelected = undefined;
                    if (simulationArea.multipleObjectSelections.contains(this)) {
                        simulationArea.multipleObjectSelections.clean(this);
                    } else {
                        simulationArea.multipleObjectSelections.push(this);
                    }
                } else {
                    simulationArea.lastSelected = this;
                }
            }
        }

        if (this.wasClicked && !this.clicked) {
            this.wasClicked = false;

            if (simulationArea.mouseX == this.absX() && simulationArea.mouseY == this.absY()) {
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
            // return;
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
            // return;

            if (flag == 0 && (this.y + this.parent.y - simulationArea.mouseY) != 0) {
                y = y1;
                flag = 2;
            } else if ((this.x + this.parent.x - simulationArea.mouseX) != 0 && flag == 1) {
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

            if (simulationArea.lastSelected == this) simulationArea.lastSelected = undefined;
        }



        // return;
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

        // if (this.clicked && this.type == 2 && simulationArea.lastSelected == undefined) simulationArea.lastSelected = this;
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


    this.prevx = this.absX();
    this.prevy = this.absY();

}
