//load AndGate fn
function loadAnd(data, scope) {
    var v = new AndGate(data["x"], data["y"], scope, data["inputs"], data["dir"], data["bitWidth"]);
    v.output1 = replace(v.output1, data["output1"]);
    for (var i = 0; i < data["inputs"]; i++) v.inp[i] = replace(v.inp[i], data["inp"][i]);
}

//AndGate - (x,y)-position , scope - circuit level, inputLength - no of nodes, dir - direction of gate
function AndGate(x, y, scope, inputLength, dir, bitWidth = undefined) {
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);
    this.scope = scope;
    this.id = 'and' + uniqueIdCounter;
    uniqueIdCounter++;
    this.element = new Element(x, y, "and", 25, this);
    this.inp = [];
    this.direction = dir;
    this.nodeList = [];
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
    scope.andGates.push(this);

    //fn to create save Json Data of object
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            inputs: this.inputs,
            inp: this.inp.map(findNode),
            output1: findNode(this.output1),
            dir: this.direction,
            bitWidth: this.bitWidth,
        }
        return data;
    }

    // checks if the module has enough information to resolve
    this.isResolvable = function() {

        for (var i = 0; i < inputLength; i++)
            if (this.inp[i].value == undefined) return false;
        return true;
    }

    //resolve output values based on inputData
    this.resolve = function() {
        var result = this.inp[0].value;
        if (this.isResolvable() == false) {
            return;
        }
        for (var i = 1; i < inputLength; i++)
            result = result & (this.inp[i].value);
        this.output1.value = result;
        this.scope.stack.push(this.output1);
    }

    //fn to draw
    this.draw = function() {

        ctx = simulationArea.context;

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black"; //("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        var xx = this.element.x;
        var yy = this.element.y;

        moveTo(ctx, -10, -20, xx, yy, this.direction);
        lineTo(ctx, 0, -20, xx, yy, this.direction);
        arc(ctx, 0, 0, 20, (-Math.PI / 2), (Math.PI / 2), xx, yy, this.direction);
        lineTo(ctx, -10, 20, xx, yy, this.direction);
        lineTo(ctx, -10, -20, xx, yy, this.direction);
        ctx.closePath();

        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";ctx.fill();
        ctx.stroke();

        //for debugging
        if (this.element.b.hover)
            console.log(this, this.id);
    }

    //fn to delete object
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        this.scope.andGates.clean(this);
    }
}
function loadNand(data, scope) {
    var v = new NandGate(data["x"], data["y"], scope, data["inputs"], data["dir"], data["bitWidth"]);
    v.output1 = replace(v.output1, data["output1"]);
    for (var i = 0; i < data["inputs"]; i++) v.inp[i] = replace(v.inp[i], data["inp"][i]);
}
function NandGate(x, y, scope, inputLength, dir, bitWidth = undefined) {
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);
    this.scope = scope;
    this.id = 'and' + uniqueIdCounter;
    uniqueIdCounter++;
    this.element = new Element(x, y, "and", 25, this);
    this.inp = [];
    this.direction = dir;
    this.nodeList = [];
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

    this.output1 = new Node(30, 0, 1, this);
    scope.nandGates.push(this);

    //fn to create save Json Data of object
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            inputs: this.inputs,
            inp: this.inp.map(findNode),
            output1: findNode(this.output1),
            dir: this.direction,
            bitWidth: this.bitWidth,
        }
        return data;
    }

    // checks if the module has enough information to resolve
    this.isResolvable = function() {

        for (var i = 0; i < inputLength; i++)
            if (this.inp[i].value == undefined) return false;
        return true;
    }

    //resolve output values based on inputData
    this.resolve = function() {
        var result = this.inp[0].value;
        if (this.isResolvable() == false) {
            return;
        }
        for (var i = 1; i < inputLength; i++)
            result = result & (this.inp[i].value);
        result = ((~result >>> 0) << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
        // console.log("NAND %d\n",result);
        this.output1.value = result;
        this.scope.stack.push(this.output1);
    }

    //fn to draw
    this.draw = function() {

        ctx = simulationArea.context;

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black"; //("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        var xx = this.element.x;
        var yy = this.element.y;

        moveTo(ctx, -10, -20, xx, yy, this.direction);
        lineTo(ctx, 0, -20, xx, yy, this.direction);
        arc(ctx, 0, 0, 20, (-Math.PI / 2), (Math.PI / 2), xx, yy, this.direction);
        lineTo(ctx, -10, 20, xx, yy, this.direction);
        lineTo(ctx, -10, -20, xx, yy, this.direction);
        ctx.closePath();

        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this))ctx.fillStyle = "rgba(255, 255, 32,0.5)" ;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        arc(ctx, 25, 0, 5, 0,  2 * (Math.PI), xx, yy, this.direction);
        ctx.stroke();
        //for debugging
        if (this.element.b.hover)
            console.log(this, this.id);
    }

    //fn to delete object
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        this.scope.nandGates.clean(this);
    }
}


function loadMultiplexer(data, scope) {
    var v = new Multiplexer(data["x"], data["y"], scope, data["dir"], data["bitWidth"], data["controlSignalSize"]);
    v.output1 = replace(v.output1, data["output1"]);
    v.controlSignalInput = replace(v.controlSignalInput, data["controlSignalInput"]);
    for (var i = 0; i < v.inp.length; i++) v.inp[i] = replace(v.inp[i], data["inp"][i]);
}

function Multiplexer(x, y, scope, dir, bitWidth = undefined, controlSignalSize = undefined) {
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);

    this.controlSignalSize = controlSignalSize || parseInt(prompt("Enter control signal bitWidth"), 10);
    this.inputSize = 1 << this.controlSignalSize;
    this.scope = scope;
    this.id = 'Multiplexer' + uniqueIdCounter;
    this.nodeList = [];
    uniqueIdCounter++;
    this.element = new Element(x, y, "Multiplexer", 20, this, 5 * (this.inputSize));
    this.inp = [];
    this.direction = dir;

    //variable inputLength , node creation

    for (var i = 0; i < this.inputSize; i++) {
        var a = new Node(-20, +10 * (i - this.inputSize / 2), 0, this);
        this.inp.push(a);
    }


    this.output1 = new Node(20, 0, 1, this);
    this.controlSignalInput = new Node(0, 5 * this.inputSize, 0, this, this.controlSignalSize);
    scope.multiplexers.push(this);

    //fn to create save Json Data of object
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            inputs: this.inputs,
            inp: this.inp.map(findNode),
            output1: findNode(this.output1),
            controlSignalInput: findNode(this.controlSignalInput),
            dir: this.direction,
            bitWidth: this.bitWidth,
            controlSignalSize: this.controlSignalSize,
        }
        return data;
    }

    // checks if the module has enough information to resolve
    this.isResolvable = function() {
        return this.controlSignalInput.value !== undefined && this.inp[this.controlSignalInput.value].value !== undefined;
    }

    //resolve output values based on inputData
    this.resolve = function() {

        if (this.isResolvable() == false) {
            return;
        }
        this.output1.value = this.inp[this.controlSignalInput.value].value;
        this.scope.stack.push(this.output1);
    }

    //fn to draw
    this.draw = function() {

        ctx = simulationArea.context;

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black"; //("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        var xx = this.element.x;
        var yy = this.element.y;

        rect2(ctx, -20, -5 * this.inputSize - 10, 40, 10 * this.inputSize + 10, xx, yy, this.direction);
        ctx.closePath();

        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this) || simulationArea.multipleObjectSelections.contains(this))ctx.fillStyle="rgba(255, 255, 32,0.8)";
         ctx.fill();
        ctx.stroke();

        //for debugging
        if (this.element.b.hover)
            console.log(this, this.id);
    }

    //fn to delete object
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        this.scope.multiplexers.clean(this);
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
    this.bitWidth = 1;
    this.element = new Element(x, y, "SevenSegmentDisplay", 30, this, 50);
    this.scope = scope;
    this.nodeList = [];
    this.g = new Node(-20, -50, 0, this);
    this.f = new Node(-10, -50, 0, this);
    this.a = new Node(+10, -50, 0, this);
    this.b = new Node(+20, -50, 0, this);
    this.e = new Node(-20, +50, 0, this);
    this.d = new Node(-10, +50, 0, this);
    this.c = new Node(+10, +50, 0, this);
    this.dot = new Node(+20, +50, 0, this);
    this.direction = "left";
    scope.sevenseg.push(this);

    this.isResolvable = function() {
        return false;
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

        }
        return data;
    }
    this.drawSegment = function(x1, y1, x2, y2, color) {
        if (color == undefined) color = "grey";
        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        xx = this.element.x;
        yy = this.element.y;
        moveTo(ctx, x1, y1, xx, yy, this.direction);
        lineTo(ctx, x2, y2, xx, yy, this.direction);
        ctx.closePath();
        ctx.stroke();
    }

    this.draw = function() {
        ctx = simulationArea.context;

        var xx = this.element.x;
        var yy = this.element.y;

        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        rect(ctx, xx - 30, yy - 50, 60, 100)
        ctx.fillStyle = "white";

        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(100, 100, 100,0.5)";ctx.fill();
        ctx.stroke();

        this.drawSegment(18, -3, 18, -38, ["grey", "red"][this.b.value]);
        this.drawSegment(18, 3, 18, 38, ["grey", "red"][this.c.value]);
        this.drawSegment(-18, -3, -18, -38, ["grey", "red"][this.f.value]);
        this.drawSegment(-18, 3, -18, 38, ["grey", "red"][this.e.value]);
        this.drawSegment(-17, -38, 17, -38, ["grey", "red"][this.a.value]);
        this.drawSegment(-17, 0, 17, 0, ["grey", "red"][this.g.value]);
        this.drawSegment(-15, 38, 17, 38, ["grey", "red"][this.d.value]);

        ctx.beginPath();
        ctx.strokeStyle = ["black", "red"][this.dot.value];
        rect(ctx, xx + 20, yy + 40, 2, 2);
        ctx.stroke();
    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        scope.sevenseg.clean(this);
    }
}

function loadHexDisplay(data, scope) {
    var v = new HexDisplay(data["x"], data["y"], scope);
    v.inp = replace(v.inp, data["inp"]);

}

function HexDisplay(x, y, scope = globalScope) {
    // this.bitWidth=undefined;
    this.element = new Element(x, y, "SevenSegmentDisplay", 30, this, 50);
    this.scope = scope;
    this.nodeList = [];
    this.inp = new Node(0, -50, 0, this, 4);
    this.direction = "left";
    scope.hexdis.push(this);

    this.isResolvable = function() {
        return false;
    }

    this.resolve = function() {
        //dummy function
    }
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            inp: findNode(this.inp),

        }
        return data;
    }
    this.drawSegment = function(x1, y1, x2, y2, color) {
        if (color == undefined) color = "grey";
        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        xx = this.element.x;
        yy = this.element.y;

        moveTo(ctx, x1, y1, xx, yy, this.direction);
        lineTo(ctx, x2, y2, xx, yy, this.direction);
        ctx.closePath();
        ctx.stroke();
    }

    this.draw = function() {
        ctx = simulationArea.context;

        var xx = this.element.x;
        var yy = this.element.y;

        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        rect(ctx, xx - 30, yy - 50, 60, 100)
        ctx.fillStyle = "white";

        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(100, 100, 100,0.5)";ctx.fill();
        ctx.stroke();
        var a = b = c = d = e = f = g = 0;
        switch (this.inp.value) {
            case 0:
                a = b = c = d = e = f = 1;
                break;
            case 1:
                b = c = 1;
                break;
            case 2:
                a = b = g = e = d = 1;
                break;
            case 3:
                a = b = g = c = d = 1;
                break;
            case 4:
                f = g = b = c = 1;
                break;
            case 5:
                a = f = g = c = d = 1;
                break;
            case 6:
                a = f = g = e = c = d = 1;
                break;
            case 7:
                a = b = c = 1;
                break;
            case 8:
                a = b = c = d = e = g = f = 1;
                break;
            case 9:
                a = f = g = b = c = 1;
                break;
            case 0xA:
                a = f = b = c = g = e = 1;
                break;
            case 0xB:
                f = e = g = c = d = 1;
                break;
            case 0xC:
                a = f = e = d = 1;
                break;
            case 0xD:
                b = c = g = e = d = 1;
                break;
            case 0xE:
                a = f = g = e = d = 1;
                break;
            case 0xF:
                a = f = g = e = 1;
                break;
            default:

        }
        this.drawSegment(18, -3, 18, -38, ["grey", "red"][b]);
        this.drawSegment(18, 3, 18, 38, ["grey", "red"][c]);
        this.drawSegment(-18, -3, -18, -38, ["grey", "red"][f]);
        this.drawSegment(-18, 3, -18, 38, ["grey", "red"][e]);
        this.drawSegment(-17, -38, 17, -38, ["grey", "red"][a]);
        this.drawSegment(-17, 0, 17, 0, ["grey", "red"][g]);
        this.drawSegment(-15, 38, 17, 38, ["grey", "red"][d]);

    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        scope.hexdis.clean(this);
    }
}

function loadOr(data, scope) {
    var v = new OrGate(data["x"], data["y"], scope, data["inputs"], data["dir"], data["bitWidth"]);
    v.output1 = replace(v.output1, data["output1"]);
    for (var i = 0; i < data["inputs"]; i++) v.inp[i] = replace(v.inp[i], data["inp"][i]);
}

function OrGate(x, y, scope = globalScope, inputs = 2, dir = 'left', bitWidth = undefined) {
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);

    this.id = 'or' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.direction = dir;
    this.element = new Element(x, y, "or", 25, this);
    this.nodeList = [];
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
        // console.log(this.scope.allNodes);
        var data = {
            x: this.element.x,
            y: this.element.y,
            inputs: this.inputs,
            inp: this.inp.map(findNode),
            output1: findNode(this.output1),
            dir: this.direction,
            bitWidth: this.bitWidth,
        }
        return data;
    }
    this.isResolvable = function() {

        for (var i = 0; i < this.inputs; i++)
            if (this.inp[i].value == undefined) return false;
        return true;
    }
    this.resolve = function() {
        var result = this.inp[0].value;
        if (this.isResolvable() == false) {
            return;
        }
        for (var i = 1; i < this.inputs; i++)
            result = result | (this.inp[i].value);
        this.output1.value = result;
        this.scope.stack.push(this.output1);
    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;

        var xx = this.element.x;
        var yy = this.element.y;
        ctx.beginPath();
        ctx.fillStyle = "white";

        moveTo(ctx, -10, -20, xx, yy, this.direction);
        bezierCurveTo(0, -20, +15, -10, 20, 0, xx, yy, this.direction);
        bezierCurveTo(0 + 15, 0 + 10, 0, 0 + 20, -10, +20, xx, yy, this.direction);
        bezierCurveTo(0, 0, 0, 0, -10, -20, xx, yy, this.direction);
        ctx.closePath();
        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";ctx.fill();
        ctx.stroke();

        if (this.element.b.isHover())
            console.log(this, this.id);
    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        scope.orGates.clean(this);
    }
}

function loadNot(data, scope) {
    var v = new NotGate(data["x"], data["y"], scope, data["dir"], data["bitWidth"]);
    v.output1 = replace(v.output1, data["output1"]);
    v.inp1 = replace(v.inp1, data["inp1"]);
}

function NotGate(x, y, scope, dir, bitWidth = undefined) {
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);

    this.id = 'not' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.element = new Element(x, y, "not", 15, this);
    this.nodeList = [];
    this.direction = dir;
    this.inp1 = new Node(-10, 0, 0, this);
    this.output1 = new Node(20, 0, 1, this);
    scope.notGates.push(this);
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: findNode(this.output1),
            inp1: findNode(this.inp1),
            dir: this.direction,
            bitWidth: this.bitWidth,
        }
        return data;
    }

    this.isResolvable = function() {
        return this.inp1.value != undefined;
    }

    this.resolve = function() {
        if (this.isResolvable() == false) {
            return;
        }
        this.output1.value = ((~this.inp1.value >>> 0) << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
        this.scope.stack.push(this.output1);
    }

    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;

        var xx = this.element.x;
        var yy = this.element.y;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 32,1)";
        moveTo(ctx, -10, -10, xx, yy, this.direction);
        lineTo(ctx, 10, 0, xx, yy, this.direction);
        lineTo(ctx, -10, 10, xx, yy, this.direction);
        ctx.closePath();
        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        arc(ctx, 15, 0, 5, 2 * (Math.PI), 0, xx, yy, this.direction);
        ctx.stroke();
        if (this.element.b.isHover())
            console.log(this, this.id);
    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        scope.notGates.clean(this);
    }

}

function loadTriState(data, scope) {
    var v = new TriState(data["x"], data["y"], scope, data["dir"], data["bitWidth"]);
    v.output1 = replace(v.output1, data["output1"]);
    v.inp1 = replace(v.inp1, data["inp1"]);
    v.state = replace(v.state, data["state"]);
}

function TriState(x, y, scope, dir, bitWidth = undefined) {
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);

    this.id = 'not' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.element = new Element(x, y, "triState", 15, this);
    this.nodeList = [];
    this.direction = dir;
    this.inp1 = new Node(-10, 0, 0, this);
    this.output1 = new Node(10, 0, 1, this);
    this.state = new Node(0, 0, 0, this, 1);
    scope.triStates.push(this);
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: findNode(this.output1),
            inp1: findNode(this.inp1),
            state: findNode(this.state),
            dir: this.direction,
            bitWidth: this.bitWidth,
        }
        return data;
    }
    this.newBitWidth = function(bitWidth) {
        this.inp1.bitWidth = bitWidth;
        this.output1.bitWidth = bitWidth;
        this.bitWidth = bitWidth;
    }

    this.isResolvable = function() {
        return this.inp1.value != undefined && this.state.value !== undefined;
    }

    this.resolve = function() {
        if (this.isResolvable() == false) {
            return;
        }
        if (this.state.value == 1) {
            this.output1.value = this.inp1.value; //>>>0)<<(32-this.bitWidth))>>>(32-this.bitWidth);
            this.scope.stack.push(this.output1);
        } else {
            this.output1.value = undefined;
        }
    }

    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;

        var xx = this.element.x;
        var yy = this.element.y;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 32,1)";
        moveTo(ctx, -10, -10, xx, yy, this.direction);
        lineTo(ctx, 10, 0, xx, yy, this.direction);
        lineTo(ctx, -10, 10, xx, yy, this.direction);
        ctx.closePath();
        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";ctx.fill();
        ctx.stroke();
        if (this.element.b.isHover())
            console.log(this, this.id);
    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        scope.triStates.clean(this);
    }

}

function loadAdder(data, scope) {
    var v = new Adder(data["x"], data["y"], scope, data["dir"], data["bitWidth"]);
    v.inpA = replace(v.inpA, data["inpA"]);
    v.inpB = replace(v.inpB, data["inpB"]);
    v.carryIn = replace(v.carryIn, data["carryIn"]);
    v.carryOut = replace(v.carryOut, data["carryOut"]);
    v.sum = replace(v.sum, data["sum"]);
}

function Adder(x, y, scope, dir, bitWidth = undefined) {
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);

    this.id = 'Adder' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.element = new Element(x, y, "not", 20, this);
    this.direction = dir;
    this.nodeList = [];
    this.inpA = new Node(-20, -10, 0, this, this.bitWidth);
    this.inpB = new Node(-20, 0, 0, this, this.bitWidth);
    this.carryIn = new Node(-20, 10, 0, this, 1);
    this.sum = new Node(20, 0, 1, this, this.bitWidth);
    this.carryOut = new Node(20, 10, 1, this, 1);

    scope.adders.push(this);
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            inpA: findNode(this.inpA),
            inpB: findNode(this.inpB),
            carryIn: findNode(this.carryIn),
            carryOut: findNode(this.carryOut),
            sum: findNode(this.sum),
            dir: this.direction,
            bitWidth: this.bitWidth,
        }
        return data;
    }

    this.isResolvable = function() {
        return this.inpA.value != undefined && this.inpB.value != undefined;
    }

    this.resolve = function() {
        if (this.isResolvable() == false) {
            return;
        }
        var carryIn = this.carryIn.value;
        if (carryIn == undefined) carryIn = 0;
        var sum = this.inpA.value + this.inpB.value + carryIn;
        this.sum.value = ((sum) << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
        this.carryOut.value = sum >>> (this.bitWidth);
        this.scope.stack.push(this.carryOut);
        this.scope.stack.push(this.sum);
    }

    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        var xx = this.element.x;
        var yy = this.element.y;
        ctx.beginPath();
        rect(ctx, xx - 20, yy - 20, 40, 40);
        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";ctx.fill();
        ctx.stroke();

        if (this.element.b.isHover())
            console.log(this, this.id);
    }
    this.delete = function() {

        simulationArea.lastSelected = undefined;
        scope.adders.clean(this);
    }

}

function loadRam(data, scope) {
    var v = new Ram(data["x"], data["y"], scope, data["dir"], data["data"]);
    v.memAddr = replace(v.memAddr, data["memAddr"]);
    v.dataOut = replace(v.dataOut, data["dataOut"]);
}

function Ram(x, y, scope, dir, data = undefined) {

    this.id = 'Ram' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.element = new Element(x, y, "not", 30, this);
    this.direction = dir;
    this.nodeList = [];
    this.memAddr = new Node(-30, 0, 0, this, 4);
    this.data = data || prompt("Enter data").split(' ').map(function(x) {
        return parseInt(x, 16);
    });
    console.log(this.data);
    this.dataOut = new Node(30, 0, 1, this, 8);

    scope.rams.push(this);
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            memAddr: findNode(this.memAddr),
            dataOut: findNode(this.dataOut),
            dir: this.direction,
            data: this.data,
        }
        return data;
    }
    this.dblclick = function() {
        this.data = prompt("Enter data").split(' ').map(function(x) {
            return parseInt(x, 16);
        });
    }
    this.isResolvable = function() {
        return this.memAddr.value != undefined;
    }

    this.resolve = function() {
        if (this.isResolvable() == false) {
            return;
        }
        this.dataOut.value = this.data[this.memAddr.value];
        this.scope.stack.push(this.dataOut);
    }

    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        var xx = this.element.x;
        var yy = this.element.y;
        ctx.beginPath();
        rect(ctx, xx - 30, yy - 30, 60, 60);
        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";ctx.fill();
        ctx.stroke();

        if (this.element.b.isHover())
            console.log(this, this.id);
    }
    this.delete = function() {

        simulationArea.lastSelected = undefined;
        scope.rams.clean(this);
    }

}

function loadSplitter(data, scope) {
    var v = new Splitter(data["x"], data["y"], scope, data["dir"], data["bitWidth"], data["bitWidthSplit"]);
    v.inp1 = replace(v.inp1, data["inp1"]);
    for (var i = 0; i < v.outputs.length; i++) v.outputs[i] = replace(v.outputs[i], data["outputs"][i]);
}

function Splitter(x, y, scope, dir, bitWidth = undefined, bitWidthSplit = undefined) {
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);

    this.bitWidthSplit = bitWidthSplit || prompt("Enter bitWidth Split").split(' ').map(function(x) {
        return parseInt(x, 10);
    });
    this.splitCount = this.bitWidthSplit.length;
    this.id = 'Splitter' + uniqueIdCounter;
    uniqueIdCounter++;
    this.nodeList = [];
    this.scope = scope;

    this.element = new Element(x, y, "Splitter", 10, this, (this.splitCount - 1) * 10 + 10);
    this.yOffset = (this.splitCount / 2 - 1) * 20;
    this.direction = dir;
    this.inp1 = new Node(-10, 10 + this.yOffset, 0, this, this.bitWidth);

    this.outputs = [];
    for (var i = 0; i < this.splitCount; i++)
        this.outputs.push(new Node(20, i * 20 - this.yOffset - 20, 0, this, this.bitWidthSplit[i]));
    scope.splitters.push(this);
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            outputs: this.outputs.map(findNode),
            bitWidthSplit: this.bitWidthSplit,
            inp1: findNode(this.inp1),
            dir: this.direction,
            bitWidth: this.bitWidth,
        }
        return data;
    }

    this.isResolvable = function() {
        var resolvable = false;
        if (this.inp1.value !== undefined) resolvable = true;
        var i;
        for (i = 0; i < this.splitCount; i++)
            if (this.outputs[i].value === undefined) break;
        if (i == this.splitCount) resolvable = true;
        return resolvable;
    }

    this.resolve = function() {
        if (this.isResolvable() == false) {
            return;
        }
        if (this.inp1.value !== undefined) {
            var bitCount = 1;
            for (var i = 0; i < this.splitCount; i++) {
                var bitSplitValue = extractBits(this.inp1.value, bitCount, bitCount + this.bitWidthSplit[i] - 1);
                if (this.outputs[i].value != bitSplitValue) {
                    this.outputs[i].value = bitSplitValue;
                    this.scope.stack.push(this.outputs[i]);
                }
                bitCount += this.bitWidthSplit[i];
            }
        } else {
            var n = 0;
            for (var i = this.splitCount - 1; i >= 0; i--) {
                n <<= this.bitWidthSplit[i];
                n += this.outputs[i].value;
            }
            if (this.inp1.value === undefined) {
                this.inp1.value = n;
                this.scope.stack.push(this.inp1);
            } else if (this.inp1.value != n) {
                console.log("CONTENTION");
            }
        }
    }

    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ["black", "brown"][((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) + 0];
        ctx.lineWidth = 3;

        var xx = this.element.x;
        var yy = this.element.y;
        ctx.beginPath();

        // drawLine(ctx, -10, -10, xx, y2, color, width)
        moveTo(ctx, -10, 10 + this.yOffset, xx, yy, this.direction);
        lineTo(ctx, 0, 0 + this.yOffset, xx, yy, this.direction);
        lineTo(ctx, 0, -20 * (this.splitCount - 1) + this.yOffset, xx, yy, this.direction);

        var bitCount = 0;
        for (var i = this.splitCount - 1; i >= 0; i--) {
            moveTo(ctx, 0, -20 * i + this.yOffset, xx, yy, this.direction);
            lineTo(ctx, 20, -20 * i + this.yOffset, xx, yy, this.direction);
            fillText2(ctx, bitCount + ":" + (bitCount + this.bitWidthSplit[this.splitCount - i - 1]), 10, -20 * i + 14 + this.yOffset, xx, yy, this.direction);
            bitCount += this.bitWidthSplit[this.splitCount - i - 1];
        }
        ctx.stroke();
        if (this.element.b.isHover())
            console.log(this, this.id);
    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        scope.splitters.clean(this);

    }

}

function loadInput(data, scope) {

    var v = new Input(data["x"], data["y"], scope, data["dir"], data["bitWidth"]);
    v.output1 = replace(v.output1, data["output1"]);
    v.state = data["state"];
    v.label = data["label"];

}

function Input(x, y, scope, dir, bitWidth = undefined) {

    this.id = 'input' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);
    this.nodeList = [];
    this.direction = dir;
    this.state = 0;
    this.element = new Element(x, y, "input", 10 * this.bitWidth, this, 10);
    this.state = bin2dec(this.state); // in integer format
    this.output1 = new Node(this.bitWidth * 10, 0, 1, this);
    scope.inputs.push(this);
    this.wasClicked = false;
    this.label = "";
    this.setLabel = function() {
        this.label = prompt("Enter Label:");
    }
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: findNode(this.output1),
            dir: this.direction,
            bitWidth: this.bitWidth,
            label: this.label,
            state: this.state,
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
    this.newBitWidth = function(bitWidth) {
        this.bitWidth = bitWidth; //||parseInt(prompt("Enter bitWidth"),10);
        this.state = 0;
        this.output1.bitWidth = bitWidth;
        this.element.b.width = 10 * this.bitWidth;
        if (this.direction == "left") {
            this.output1.x = 10 * this.bitWidth;
            this.output1.leftx = 10 * this.bitWidth;
        } else if (this.direction == "right") {
            this.output1.x = -10 * this.bitWidth;
            this.output1.leftx = 10 * this.bitWidth;
        }
    }
    this.click = function() { // toggle
        var pos = this.findPos();
        if (pos == 0) pos = 1; // minor correction
        if (pos < 1 || pos > this.bitWidth) return;
        this.state ^= (1 << (this.bitWidth - pos));
    }
    // this.update = function() {
    //     var updated = false;
    //     updated |= this.output1.update();
    //     updated |= this.element.update();
    //
    //     if (simulationArea.mouseDown == false)
    //         this.wasClicked = false;
    //
    //     if (simulationArea.mouseDown && !this.wasClicked) { //&& this.element.b.clicked afterwards
    //         if (this.element.b.clicked) {
    //             this.wasClicked = true;
    //             this.toggleState();
    //         }
    //     }
    //     return updated;
    //
    // }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        var xx = this.element.x;
        var yy = this.element.y;

        rect2(ctx, -10 * this.bitWidth, -10, 20 * this.bitWidth, 20, xx, yy, "left");
        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.textAlign = "center";
        var bin = dec2bin(this.state, this.bitWidth);
        for (var k = 0; k < this.bitWidth; k++)
            fillText(ctx, bin[k], xx - 10 * this.bitWidth + 10 + (k) * 20, yy + 5);
        ctx.fill();

        if (this.direction == "left") {
            ctx.beginPath();
            ctx.textAlign = "right";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx - 10 * this.bitWidth - 10, yy + 5, 14);
            ctx.fill();
        } else if (this.direction == "right") {
            ctx.beginPath();
            ctx.textAlign = "left";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx + 10 * this.bitWidth + 10, yy + 5, 14);
            ctx.fill();
        } else if (this.direction == "up") {
            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx, yy + 5 - 25, 14);
            ctx.fill();
        } else if (this.direction == "down") {
            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx, yy + 5 + 25, 14);
            ctx.fill();
        }

    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        scope.inputs.clean(this);

    }
    this.newDirection = function(dir) {
        if (dir == this.direction) return;
        this.output1.refresh();
        if (dir == "left" || dir == "right") {
            this.output1.leftx = 10 * this.bitWidth;
            this.output1.lefty = 0;
        } else {
            this.output1.leftx = 10; //10*this.bitWidth;
            this.output1.lefty = 0;
        }
        this.direction = dir;
        this.output1.refresh();

    }
    this.findPos = function() {
        return Math.round((simulationArea.mouseX - this.element.x + 10 * this.bitWidth) / 20.0);
    }
}

function loadGround(data, scope) {
    var v = new Ground(data["x"], data["y"], scope, data["bitWidth"]);
    v.output1 = replace(v.output1, data["output1"]);
}


function Ground(x, y, scope = globalScope, bitWidth = undefined) {
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);

    this.id = 'ground' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.nodeList = [];
    this.element = new Element(x, y, "ground", 20, this);
    this.output1 = new Node(0, -10, 1, this);

    this.output1.value = this.state;
    scope.grounds.push(this);
    console.log(this);
    this.wasClicked = false;
    this.resolve = function() {
        this.output1.value = 0;
        this.scope.stack.push(this.output1);
    }
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: findNode(this.output1),
            bitWidth: this.bitWidth,
        }
        return data;
    }

    this.draw = function() {

        ctx = simulationArea.context;

        ctx.beginPath();
        ctx.strokeStyle = ["black", "brown"][((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) + 0];
        ctx.lineWidth = 3;

        var xx = this.element.x;
        var yy = this.element.y;

        moveTo(ctx, 0, -10, xx, yy, this.direction);
        lineTo(ctx, 0, 0, xx, yy, this.direction);
        moveTo(ctx, -10, 0, xx, yy, this.direction);
        lineTo(ctx, 10, 0, xx, yy, this.direction);
        moveTo(ctx, -6, 5, xx, yy, this.direction);
        lineTo(ctx, 6, 5, xx, yy, this.direction);
        moveTo(ctx, -2.5, 10, xx, yy, this.direction);
        lineTo(ctx, 2.5, 10, xx, yy, this.direction);
        ctx.stroke();

        if (this.element.b.hover)
            console.log(this, this.id);
    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        scope.grounds.clean(this);
    }
}

function loadPower(data, scope) {
    var v = new Power(data["x"], data["y"], scope, data["bitWidth"]);
    v.output1 = replace(v.output1, data["output1"]);
}

function Power(x, y, scope = globalScope, bitWidth = undefined) {
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);

    this.id = 'power' + uniqueIdCounter;
    this.scope = scope;
    uniqueIdCounter++;
    this.nodeList = [];
    this.element = new Element(x, y, "power", 15, this);
    this.output1 = new Node(0, 20, 1, this);
    this.output1.value = this.state;
    scope.powers.push(this);
    this.wasClicked = false;
    this.resolve = function() {

        this.output1.value = ~0 >>> (32 - this.bitWidth);
        this.scope.stack.push(this.output1);
    }
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: findNode(this.output1),
            bitWidth: this.bitWidth,
        }
        return data;
    }

    this.draw = function() {

        ctx = simulationArea.context;

        var xx = this.element.x;
        var yy = this.element.y;

        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;
        ctx.fillStyle = "green";
        moveTo(ctx, 0, 0, xx, yy, this.direction);
        lineTo(ctx, -10, 10, xx, yy, this.direction);
        lineTo(ctx, 10, 10, xx, yy, this.direction);
        lineTo(ctx, 0, 0, xx, yy, this.direction);
        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";ctx.fill();
        moveTo(ctx, 0, 10, xx, yy, this.direction);
        lineTo(ctx, 0, 20, xx, yy, this.direction);
        ctx.stroke();

        // this.element.draw();
        // this.output1.draw();
        if (this.element.b.hover)
            console.log(this, this.id);
    }
    this.delete = function() {
        // this.output1.delete();
        simulationArea.lastSelected = undefined;
        scope.powers.clean(this);
    }
}

function loadOutput(data, scope) {

    var v = new Output(data["x"], data["y"], scope, data["dir"], data["bitWidth"]);
    v.inp1 = replace(v.inp1, data["inp1"]);
    v.label = data["label"];
}

function Output(x, y, scope, dir, bitWidth = undefined) {

    this.scope = scope;
    this.id = 'output' + uniqueIdCounter;
    uniqueIdCounter++;
    this.direction = dir;
    this.prevDir = dir;
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);

    this.element = new Element(x, y, "output", 10 * this.bitWidth, this, 10);
    this.nodeList = [];
    this.inp1 = new Node(this.bitWidth * 10, 0, 0, this);
    this.state = undefined;
    this.scope.outputs.push(this);

    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            inp1: scope.allNodes.indexOf(this.inp1),
            dir: this.direction,
            bitWidth: this.bitWidth,
            label: this.label,
        }
        return data;
    }
    this.label = "";
    this.newBitWidth = function(bitWidth) {
        // console.log(this.direction);
        this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);
        this.state = undefined;
        this.inp1.bitWidth = bitWidth;
        this.element.b.width = 10 * this.bitWidth;
        if (this.direction == "left") {
            this.inp1.x = 10 * this.bitWidth;
            this.inp1.leftx = 10 * this.bitWidth;
        } else if (this.direction == "right") {
            this.inp1.x = -10 * this.bitWidth;
            this.inp1.leftx = 10 * this.bitWidth;
        }
    }
    this.setLabel = function() {
        this.label = prompt("Enter Label:");
    }
    this.resolve = function() {
        this.state = this.inp1.value;
    }

    this.isResolvable = function() {
        return this.inp1.value != undefined;
    }

    this.draw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ["blue", "red"][(this.state === undefined) + 0];
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        var xx = this.element.x;
        var yy = this.element.y;

        rect2(ctx, -10 * this.bitWidth, -10, 20 * this.bitWidth, 20, xx, yy, "left");
        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "20px Georgia";
        ctx.fillStyle = "green";
        ctx.textAlign = "center";
        if (this.state === undefined)
            var bin = 'x'.repeat(this.bitWidth);
        else
            var bin = dec2bin(this.state, this.bitWidth);
        for (var k = 0; k < this.bitWidth; k++)
            fillText(ctx, bin[k], xx - 10 * this.bitWidth + 10 + (k) * 20, yy + 5);
        ctx.stroke();


        if (this.direction == "left") {
            ctx.beginPath();
            ctx.textAlign = "right";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx - 10 * this.bitWidth - 10, yy + 5, 14);
            ctx.fill();
        } else if (this.direction == "right") {
            ctx.beginPath();
            ctx.textAlign = "left";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx + 10 * this.bitWidth + 10, yy + 5, 14);
            ctx.fill();
        } else if (this.direction == "up") {
            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx, yy + 5 - 25, 14);
            ctx.fill();
        } else if (this.direction == "down") {
            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx, yy + 5 + 25, 14);
            ctx.fill();
        }
    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        this.scope.outputs.clean(this);
    }
    this.newDirection = function(dir) {
        if (dir == this.direction) return;
        this.inp1.refresh();
        if (dir == "left" || dir == "right") {
            this.inp1.leftx = 10 * this.bitWidth;
            this.inp1.lefty = 0;
        } else {
            this.inp1.leftx = 10; //10*this.bitWidth;
            this.inp1.lefty = 0;
        }

        this.direction = dir;
        this.inp1.refresh();

    }
}

function loadBitSelector(data, scope) {

    var v = new BitSelector(data["x"], data["y"], scope, data["dir"], data["bitWidth"],data["selectorBitWidth"]);
    v.inp1 = replace(v.inp1, data["inp1"]);
    v.output1 = replace(v.output1, data["output1"]);
    v.bitSelectorInp = replace(v.bitSelectorInp, data["bitSelectorInp"]);
    // v.label = data["label"];
}

function BitSelector(x, y, scope, dir, bitWidth = undefined,selectorBitWidth=undefined) {

    this.scope = scope;
    this.id = 'output' + uniqueIdCounter;
    uniqueIdCounter++;
    this.direction = dir;
    this.prevDir = dir;
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);
    this.selectorBitWidth = selectorBitWidth || parseInt(prompt("Enter Selector bitWidth"), 10);

    this.element = new Element(x, y, "output", 20, this);
    this.nodeList = [];
    this.inp1 = new Node(-20, 0, 0, this,this.bitWidth);
    this.output1 = new Node(20, 0, 1, this,1);
    this.bitSelectorInp = new Node(0, 20, 0, this,this.selectorBitWidth);
    this.scope.bitSelectors.push(this);

    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            inp1: scope.allNodes.indexOf(this.inp1),
            output1: scope.allNodes.indexOf(this.output1),
            bitSelectorInp: scope.allNodes.indexOf(this.bitSelectorInp),
            // : scope.allNodes.indexOf(this.output1),
            dir: this.direction,
            bitWidth: this.bitWidth,
            selectorBitWidth: this.selectorBitWidth,
            // label: this.label,
        }
        return data;
    }

    this.newBitWidth = function(bitWidth) {
        this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);
            this.inp1.bitWidth = bitWidth;
    }


    this.resolve = function() {
        this.output1.value=extractBits(this.inp1.value, this.bitSelectorInp.value+1, this.bitSelectorInp.value+1);//(this.inp1.value^(1<<this.bitSelectorInp.value))==(1<<this.bitSelectorInp.value);
        this.scope.stack.push(this.output1);

    }

    this.isResolvable = function() {
        return this.inp1.value != undefined&&this.bitSelectorInp.value!=undefined;
    }

    this.draw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ["blue", "red"][(this.state === undefined) + 0];
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        var xx = this.element.x;
        var yy = this.element.y;
        rect(ctx, xx - 20, yy - 20, 40, 40);
        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "20px Georgia";
        ctx.fillStyle = "green";
        ctx.textAlign = "center";
        if (this.bitSelectorInp.value === undefined)
            var bit = 'x';
        else
            var bit = this.bitSelectorInp.value;

        fillText(ctx, bit, xx, yy + 5);
        ctx.stroke();

    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        this.scope.bitSelectors.clean(this);
    }
}


function newBitWidth(obj, bitWidth) {
    if (obj.newBitWidth !== undefined) {
        obj.newBitWidth(bitWidth);
        return;
    }
    obj.bitWidth = bitWidth;
    for (var i = 0; i < obj.nodeList.length; i++)
        obj.nodeList[i].bitWidth = bitWidth;

}

function saveasimg() {
    //window.open(simulationArea.canvas.toDataURL('image/png'));
    var gh = simulationArea.canvas.toDataURL('image/png');
    var name = prompt("Enter imagename");
    if(name!=null){
        var filename = name;
        var anchor  = document.createElement('a');
        anchor.href = gh;
        anchor.download = filename+'.png';
    }
    anchor.click()
}

function loadConstantVal(data, scope) {

    var v = new ConstantVal(data["x"], data["y"], scope, data["dir"], data["bitWidth"],data["state"]);
    v.output1 = replace(v.output1, data["output1"]);
    // v.state = data["state"];
    v.label = data["label"];

}


function ConstantVal(x, y, scope, dir, bitWidth = undefined,state=undefined) {
    this.id = 'input' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.bitWidth = bitWidth;
    this.nodeList = [];
    this.direction = dir;
    this.state = state||prompt("Enter value");
    this.bitWidth = this.state.toString().length;
    this.element = new Element(x, y, "input", 10 * this.bitWidth, this, 10);
    this.output1 = new Node(this.bitWidth * 10, 0, 1, this);
    scope.constants.push(this);
    this.wasClicked = false;
    this.label = "";
    this.setLabel = function() {
        this.label = prompt("Enter Label:");
    }
    this.saveObject = function() {
        var data = {
            x: this.element.x,
            y: this.element.y,
            output1: findNode(this.output1),
            dir: this.direction,
            bitWidth: this.bitWidth,
            label: this.label,
            state: this.state,
        }
        return data;
    }
    this.isResolvable = function() {
        return true;
    }
    this.resolve = function() {
        this.output1.value = bin2dec(this.state);
        this.scope.stack.push(this.output1);
    }
    this.dblclick = function() {
        this.state =  prompt("Re enter the value");
        console.log(this.state);
        this.newBitWidth(this.state.toString().length);
        console.log(this.state,this.bitWidth);
    }
    this.newBitWidth = function(bitWidth) {
        this.bitWidth = bitWidth; //||parseInt(prompt("Enter bitWidth"),10);
        this.output1.bitWidth = bitWidth;
        this.element.b.width = 10 * this.bitWidth;
        if (this.direction == "left") {
            this.output1.x = 10 * this.bitWidth;
            this.output1.leftx = 10 * this.bitWidth;
        } else if (this.direction == "right") {
            this.output1.x = -10 * this.bitWidth;
            this.output1.leftx = 10 * this.bitWidth;
        }
    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        ctx.lineWidth = 0.5;
        var xx = this.element.x;
        var yy = this.element.y;

        rect2(ctx, -10 * this.bitWidth, -10, 20 * this.bitWidth, 20, xx, yy, "left");
        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.textAlign = "center";
        var bin = this.state;//dec2bin(this.state,this.bitWidth);
        for (var k = 0; k < this.bitWidth; k++)
            fillText(ctx, bin[k], xx - 10 * this.bitWidth + 10 + (k) * 20, yy + 5);
        ctx.fill();

        if (this.direction == "left") {
            ctx.beginPath();
            ctx.textAlign = "right";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx - 10 * this.bitWidth - 10, yy + 5, 14);
            ctx.fill();
        } else if (this.direction == "right") {
            ctx.beginPath();
            ctx.textAlign = "left";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx + 10 * this.bitWidth + 10, yy + 5, 14);
            ctx.fill();
        } else if (this.direction == "up") {
            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx, yy + 5 - 25, 14);
            ctx.fill();
        } else if (this.direction == "down") {
            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            fillText(ctx, this.label, xx, yy + 5 + 25, 14);
            ctx.fill();
        }

    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        scope.constants.clean(this);

    }
    this.newDirection = function(dir) {
        if (dir == this.direction) return;
        this.output1.refresh();
        if (dir == "left" || dir == "right") {
            this.output1.leftx = 10 * this.bitWidth;
            this.output1.lefty = 0;
        } else {
            this.output1.leftx = 10; //10*this.bitWidth;
            this.output1.lefty = 0;
        }
        this.direction = dir;
        this.output1.refresh();

    }
    // this.findPos = function() {
    //     return Math.round((simulationArea.mouseX - this.element.x + 10 * this.bitWidth) / 20.0);
    // }
}

function loadNor(data, scope) {
    var v = new NorGate(data["x"], data["y"], scope, data["inputs"], data["dir"], data["bitWidth"]);
    v.output1 = replace(v.output1, data["output1"]);
    for (var i = 0; i < data["inputs"]; i++) v.inp[i] = replace(v.inp[i], data["inp"][i]);
}

function NorGate(x, y, scope = globalScope, inputs = 2, dir = 'left', bitWidth = undefined) {
    this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);

    this.id = 'nor' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.direction = dir;
    this.element = new Element(x, y, "nor", 25, this);
    this.nodeList = [];
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
    this.output1 = new Node(30, 0, 1, this);
    scope.norGates.push(this);

    this.saveObject = function() {
        // console.log(this.scope.allNodes);
        var data = {
            x: this.element.x,
            y: this.element.y,
            inputs: this.inputs,
            inp: this.inp.map(findNode),
            output1: findNode(this.output1),
            dir: this.direction,
            bitWidth: this.bitWidth,
        }
        return data;
    }
    this.isResolvable = function() {

        for (var i = 0; i < this.inputs; i++)
            if (this.inp[i].value == undefined) return false;
        return true;
    }
    this.resolve = function() {
        var result = this.inp[0].value;
        if (this.isResolvable() == false) {
            return;
        }
        for (var i = 1; i < this.inputs; i++)
            result = result | (this.inp[i].value);
        result = ((~result >>> 0) << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
        this.output1.value=result
        this.scope.stack.push(this.output1);
    }
    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;

        var xx = this.element.x;
        var yy = this.element.y;
        ctx.beginPath();
        ctx.fillStyle = "white";

        moveTo(ctx, -10, -20, xx, yy, this.direction);
        bezierCurveTo(0, -20, +15, -10, 20, 0, xx, yy, this.direction);
        bezierCurveTo(0 + 15, 0 + 10, 0, 0 + 20, -10, +20, xx, yy, this.direction);
        bezierCurveTo(0, 0, 0, 0, -10, -20, xx, yy, this.direction);
        ctx.closePath();
        if ((this.element.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this))ctx.fillStyle = "rgba(255, 255, 32,0.5)" ;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        arc(ctx, 25, 0, 5, 0,  2 * (Math.PI), xx, yy, this.direction);
        ctx.stroke();
        //for debugging
        if (this.element.b.hover)
            console.log(this, this.id);
    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        scope.norGates.clean(this);
    }
}
