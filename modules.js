//AndGate - (x,y)-position , scope - circuit level, inputLength - no of nodes, dir - direction of gate
function AndGate(x, y, scope, dir, inputLength, bitWidth = undefined) {
    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.setDimensions(15, 20);
    this.inp = [];

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

    //fn to create save Json Data of object
    this.customSave = function() {
        var data = {
            constructorParamaters: [this.direction, this.inputs, this.bitWidth],
            nodes: {
                inp: this.inp.map(findNode),
                output1: findNode(this.output1)
            },

        }
        return data;
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
    this.customDraw = function() {

        ctx = simulationArea.context;

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black"; //("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        var xx = this.x;
        var yy = this.y;

        moveTo(ctx, -10, -20, xx, yy, this.direction);
        lineTo(ctx, 0, -20, xx, yy, this.direction);
        arc(ctx, 0, 0, 20, (-Math.PI / 2), (Math.PI / 2), xx, yy, this.direction);
        lineTo(ctx, -10, 20, xx, yy, this.direction);
        lineTo(ctx, -10, -20, xx, yy, this.direction);
        ctx.closePath();

        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.fill();
        ctx.stroke();

    }

}

function NandGate(x, y, scope, dir, inputLength, bitWidth = undefined) {
    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.setDimensions(15, 20);
    this.inp = [];


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

    //fn to create save Json Data of object
    this.customSave = function() {
        var data = {

            constructorParamaters: [this.direction, this.inputs, this.bitWidth],
            nodes: {
                inp: this.inp.map(findNode),
                output1: findNode(this.output1)
            },
        }
        return data;
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
        this.output1.value = result;
        this.scope.stack.push(this.output1);
    }

    //fn to draw
    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        var xx = this.x;
        var yy = this.y;

        moveTo(ctx, -10, -20, xx, yy, this.direction);
        lineTo(ctx, 0, -20, xx, yy, this.direction);
        arc(ctx, 0, 0, 20, (-Math.PI / 2), (Math.PI / 2), xx, yy, this.direction);
        lineTo(ctx, -10, 20, xx, yy, this.direction);
        lineTo(ctx, -10, -20, xx, yy, this.direction);
        ctx.closePath();

        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.5)";
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        arc(ctx, 25, 0, 5, 0, 2 * (Math.PI), xx, yy, this.direction);
        ctx.stroke();


    }
}

function Multiplexer(x, y, scope, dir, bitWidth = undefined, controlSignalSize = undefined) {

    CircuitElement.call(this, x, y, scope, dir, bitWidth);

    this.controlSignalSize = controlSignalSize || parseInt(prompt("Enter control signal bitWidth"), 10);
    this.inputSize = 1 << this.controlSignalSize;

    this.setDimensions(20, 5 * (this.inputSize));
    this.upDimensionY = 5 * (this.inputSize + 2);
    this.inp = [];

    //variable inputLength , node creation

    for (var i = 0; i < this.inputSize; i++) {
        var a = new Node(-20, +10 * (i - this.inputSize / 2), 0, this);
        this.inp.push(a);
    }

    this.output1 = new Node(20, 0, 1, this);
    this.controlSignalInput = new Node(0, 5 * this.inputSize, 0, this, this.controlSignalSize);

    //fn to create save Json Data of object
    this.customSave = function() {
        var data = {
            constructorParamaters: [this.direction, this.bitWidth, this.controlSignalSize],
            nodes: {
                inp: this.inp.map(findNode),
                output1: findNode(this.output1),
                controlSignalInput: findNode(this.controlSignalInput)
            },
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

}

function XorGate(x, y, scope = globalScope, dir = "RIGHT", inputs = 2, bitWidth = undefined) {
    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.setDimensions(15, 20);

    this.inp = [];
    this.inputs = inputs;
    if (inputs % 2 == 1) {
        for (var i = 0; i < inputs / 2 - 1; i++) {
            var a = new Node(-20, -10 * (i + 1), 0, this);
            this.inp.push(a);
        }
        var a = new Node(-20, 0, 0, this);
        this.inp.push(a);
        for (var i = inputs / 2 + 1; i < inputs; i++) {
            var a = new Node(-20, 10 * (i + 1 - inputs / 2 - 1), 0, this);
            this.inp.push(a);
        }
    } else {
        for (var i = 0; i < inputs / 2; i++) {
            var a = new Node(-20, -10 * (i + 1), 0, this);
            this.inp.push(a);
        }
        for (var i = inputs / 2; i < inputs; i++) {
            var a = new Node(-20, 10 * (i + 1 - inputs / 2), 0, this);
            this.inp.push(a);
        }
    }
    this.output1 = new Node(20, 0, 1, this);

    this.customSave = function() {
        // console.log(this.scope.allNodes);
        var data = {
            constructorParamaters: [this.direction, this.inputs, this.bitWidth],
            nodes: {
                inp: this.inp.map(findNode),
                output1: findNode(this.output1)
            },
        }
        return data;
    }
    this.resolve = function() {
        var result = this.inp[0].value;
        if (this.isResolvable() == false) {
            return;
        }
        for (var i = 1; i < this.inputs; i++)
            result = result ^ (this.inp[i].value);

        this.output1.value = result;
        this.scope.stack.push(this.output1);
    }
    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;

        var xx = this.x;
        var yy = this.y;
        ctx.beginPath();
        ctx.fillStyle = "white";
        moveTo(ctx, -10, -20, xx, yy, this.direction);
        bezierCurveTo(0, -20, +15, -10, 20, 0, xx, yy, this.direction);
        bezierCurveTo(0 + 15, 0 + 10, 0, 0 + 20, -10, +20, xx, yy, this.direction);
        bezierCurveTo(0, 0, 0, 0, -10, -20, xx, yy, this.direction);
        // arc(ctx, 0, 0, -20, (-Math.PI / 2), (Math.PI / 2), xx, yy, this.direction);
        ctx.closePath();
        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        arc(ctx, -35, 0, 25, 1.70 * (Math.PI), 0.30 * (Math.PI), xx, yy, this.direction);
        ctx.stroke();


    }
}

function XnorGate(x, y, scope = globalScope, dir = "RIGHT", inputs = 2, bitWidth = undefined) {
    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.setDimensions(15, 20);

    this.inp = [];
    this.inputs = inputs;
    if (inputs % 2 == 1) {
        for (var i = 0; i < inputs / 2 - 1; i++) {
            var a = new Node(-20, -10 * (i + 1), 0, this);
            this.inp.push(a);
        }
        var a = new Node(-20, 0, 0, this);
        this.inp.push(a);
        for (var i = inputs / 2 + 1; i < inputs; i++) {
            var a = new Node(-20, 10 * (i + 1 - inputs / 2 - 1), 0, this);
            this.inp.push(a);
        }
    } else {
        for (var i = 0; i < inputs / 2; i++) {
            var a = new Node(-20, -10 * (i + 1), 0, this);
            this.inp.push(a);
        }
        for (var i = inputs / 2; i < inputs; i++) {
            var a = new Node(-20, 10 * (i + 1 - inputs / 2), 0, this);
            this.inp.push(a);
        }
    }
    this.output1 = new Node(30, 0, 1, this);

    this.customSave = function() {
        var data = {
            constructorParamaters: [this.direction, this.inputs, this.bitWidth],
            nodes: {
                inp: this.inp.map(findNode),
                output1: findNode(this.output1)
            },
        }
        return data;
    }
    this.resolve = function() {
        var result = this.inp[0].value;
        if (this.isResolvable() == false) {
            return;
        }
        for (var i = 1; i < this.inputs; i++)
            result = result ^ (this.inp[i].value);
        result = ((~result >>> 0) << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
        this.output1.value = result;
        this.scope.stack.push(this.output1);
    }
    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;

        var xx = this.x;
        var yy = this.y;
        ctx.beginPath();
        ctx.fillStyle = "white";
        moveTo(ctx, -10, -20, xx, yy, this.direction);
        bezierCurveTo(0, -20, +15, -10, 20, 0, xx, yy, this.direction);
        bezierCurveTo(0 + 15, 0 + 10, 0, 0 + 20, -10, +20, xx, yy, this.direction);
        bezierCurveTo(0, 0, 0, 0, -10, -20, xx, yy, this.direction);
        // arc(ctx, 0, 0, -20, (-Math.PI / 2), (Math.PI / 2), xx, yy, this.direction);
        ctx.closePath();
        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        arc(ctx, -35, 0, 25, 1.70 * (Math.PI), 0.30 * (Math.PI), xx, yy, this.direction);
        ctx.stroke();
        ctx.beginPath();
        arc(ctx, 25, 0, 5, 0, 2 * (Math.PI), xx, yy, this.direction);
        ctx.stroke();

    }
}

function SevenSegDisplay(x, y, scope = globalScope) {
    CircuitElement.call(this, x, y, scope, "RIGHT", 1);
    this.fixedBitWidth = true;
    this.directionFixed = true;
    this.setDimensions(30, 50);

    this.g = new Node(-20, -50, 0, this);
    this.f = new Node(-10, -50, 0, this);
    this.a = new Node(+10, -50, 0, this);
    this.b = new Node(+20, -50, 0, this);
    this.e = new Node(-20, +50, 0, this);
    this.d = new Node(-10, +50, 0, this);
    this.c = new Node(+10, +50, 0, this);
    this.dot = new Node(+20, +50, 0, this);
    this.direction = "RIGHT";

    this.customSave = function() {
        var data = {

            nodes: {
                g: findNode(this.g),
                f: findNode(this.f),
                a: findNode(this.a),
                b: findNode(this.b),
                d: findNode(this.d),
                e: findNode(this.e),
                c: findNode(this.c),
                d: findNode(this.d),
                dot: findNode(this.dot)
            },
        }
        return data;
    }
    this.customDrawSegment = function(x1, y1, x2, y2, color) {
        if (color == undefined) color = "grey";
        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        xx = this.x;
        yy = this.y;
        moveTo(ctx, x1, y1, xx, yy, this.direction);
        lineTo(ctx, x2, y2, xx, yy, this.direction);
        ctx.closePath();
        ctx.stroke();
    }

    this.customDraw = function() {
        ctx = simulationArea.context;

        var xx = this.x;
        var yy = this.y;

        this.customDrawSegment(18, -3, 18, -38, ["grey", "red"][this.value]);
        this.customDrawSegment(18, 3, 18, 38, ["grey", "red"][this.c.value]);
        this.customDrawSegment(-18, -3, -18, -38, ["grey", "red"][this.f.value]);
        this.customDrawSegment(-18, 3, -18, 38, ["grey", "red"][this.e.value]);
        this.customDrawSegment(-17, -38, 17, -38, ["grey", "red"][this.a.value]);
        this.customDrawSegment(-17, 0, 17, 0, ["grey", "red"][this.g.value]);
        this.customDrawSegment(-15, 38, 17, 38, ["grey", "red"][this.d.value]);

        ctx.beginPath();
        ctx.strokeStyle = ["black", "red"][this.dot.value];
        rect(ctx, xx + 20, yy + 40, 2, 2);
        ctx.stroke();
    }
}

function HexDisplay(x, y, scope = globalScope) {
    CircuitElement.call(this, x, y, scope, "RIGHT", 4);
    this.directionFixed = true;
    this.fixedBitWidth = true;
    this.setDimensions(30, 50);

    this.inp = new Node(0, -50, 0, this, 4);
    this.direction = "RIGHT";

    this.customSave = function() {
        var data = {


            nodes: {
                inp: findNode(this.inp)
            },

        }
        return data;
    }
    this.customDrawSegment = function(x1, y1, x2, y2, color) {
        if (color == undefined) color = "grey";
        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        xx = this.x;
        yy = this.y;

        moveTo(ctx, x1, y1, xx, yy, this.direction);
        lineTo(ctx, x2, y2, xx, yy, this.direction);
        ctx.closePath();
        ctx.stroke();
    }

    this.customDraw = function() {
        ctx = simulationArea.context;

        var xx = this.x;
        var yy = this.y;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
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
        this.customDrawSegment(18, -3, 18, -38, ["grey", "red"][b]);
        this.customDrawSegment(18, 3, 18, 38, ["grey", "red"][c]);
        this.customDrawSegment(-18, -3, -18, -38, ["grey", "red"][f]);
        this.customDrawSegment(-18, 3, -18, 38, ["grey", "red"][e]);
        this.customDrawSegment(-17, -38, 17, -38, ["grey", "red"][a]);
        this.customDrawSegment(-17, 0, 17, 0, ["grey", "red"][g]);
        this.customDrawSegment(-15, 38, 17, 38, ["grey", "red"][d]);

    }
}

function OrGate(x, y, scope = globalScope, dir = "RIGHT", inputs = 2, bitWidth) {
    // Calling base class constructor
    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.setDimensions(15, 20);
    // Inherit base class prototype

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

    this.customSave = function() {
        var data = {

            constructorParamaters: [this.direction, this.inputs, this.bitWidth],

            nodes: {
                inp: this.inp.map(findNode),
                output1: findNode(this.output1)
            },
        }
        return data;
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

    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;

        var xx = this.x;
        var yy = this.y;
        ctx.beginPath();
        ctx.fillStyle = "white";

        moveTo(ctx, -10, -20, xx, yy, this.direction);
        bezierCurveTo(0, -20, +15, -10, 20, 0, xx, yy, this.direction);
        bezierCurveTo(0 + 15, 0 + 10, 0, 0 + 20, -10, +20, xx, yy, this.direction);
        bezierCurveTo(0, 0, 0, 0, -10, -20, xx, yy, this.direction);
        ctx.closePath();
        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.fill();
        ctx.stroke();



    }

}

function NotGate(x, y, scope, dir, bitWidth = undefined) {

    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.setDimensions(15, 15);

    this.inp1 = new Node(-10, 0, 0, this);
    this.output1 = new Node(20, 0, 1, this);
    this.customSave = function() {
        var data = {
            constructorParamaters: [this.direction, this.bitWidth],
            nodes: {
                output1: findNode(this.output1),
                inp1: findNode(this.inp1)
            },
        }
        return data;
    }

    this.resolve = function() {
        if (this.isResolvable() == false) {
            return;
        }
        this.output1.value = ((~this.inp1.value >>> 0) << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
        this.scope.stack.push(this.output1);
    }

    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        var xx = this.x;
        var yy = this.y;
        ctx.beginPath();
        ctx.fillStyle = "white";
        moveTo(ctx, -10, -10, xx, yy, this.direction);
        lineTo(ctx, 10, 0, xx, yy, this.direction);
        lineTo(ctx, -10, 10, xx, yy, this.direction);
        ctx.closePath();
        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        arc(ctx, 15, 0, 5, 2 * (Math.PI), 0, xx, yy, this.direction);
        ctx.stroke();

    }

}

function TriState(x, y, scope, dir, bitWidth = undefined) {
    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.setDimensions(15, 15);

    this.inp1 = new Node(-10, 0, 0, this);
    this.output1 = new Node(20, 0, 1, this);
    this.state = new Node(0, 0, 0, this, 1);
    this.customSave = function() {
        var data = {
            constructorParamaters: [this.direction, this.bitWidth],
            nodes: {
                output1: findNode(this.output1),
                inp1: findNode(this.inp1),
                state: findNode(this.state)
            },
        }
        return data;
    }
    this.newBitWidth = function(bitWidth) {
        this.inp1.bitWidth = bitWidth;
        this.output1.bitWidth = bitWidth;
        this.bitWidth = bitWidth;
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

    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;

        var xx = this.x;
        var yy = this.y;
        ctx.beginPath();
        ctx.fillStyle = "white";
        moveTo(ctx, -10, -15, xx, yy, this.direction);
        lineTo(ctx, 20, 0, xx, yy, this.direction);
        lineTo(ctx, -10, 15, xx, yy, this.direction);
        ctx.closePath();
        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.fill();
        ctx.stroke();

    }

}

function Adder(x, y, scope, dir, bitWidth = undefined) {

    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.setDimensions(20, 20);

    this.inpA = new Node(-20, -10, 0, this, this.bitWidth);
    this.inpB = new Node(-20, 0, 0, this, this.bitWidth);
    this.carryIn = new Node(-20, 10, 0, this, 1);
    this.sum = new Node(20, 0, 1, this, this.bitWidth);
    this.carryOut = new Node(20, 10, 1, this, 1);

    this.customSave = function() {
        var data = {
            constructorParamaters: [this.direction, this.bitWidth],
            nodes: {
                inpA: findNode(this.inpA),
                inpB: findNode(this.inpB),
                carryIn: findNode(this.carryIn),
                carryOut: findNode(this.carryOut),
                sum: findNode(this.sum)
            },
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
        console.log(this.sum.value);
        this.carryOut.value = sum >>> (this.bitWidth);
        this.scope.stack.push(this.carryOut);
        this.scope.stack.push(this.sum);
    }

}

function Ram(x, y, scope, dir, data = undefined) {

    CircuitElement.call(this, x, y, scope, dir, 1);
    this.fixedBitWidth = true;
    this.setDimensions(30, 30);

    this.memAddr = new Node(-30, 0, 0, this, 4);
    this.data = data || prompt("Enter data").split(' ').map(function(x) {
        return parseInt(x, 16);
    });
    console.log(this.data);
    this.dataOut = new Node(30, 0, 1, this, 8);

    this.customSave = function() {
        var data = {
            constructorParamaters: [this.direction, this.data],
            nodes: {
                memAddr: findNode(this.memAddr),
                dataOut: findNode(this.dataOut)
            },

        }
        return data;
    }
    this.dblclick = function() {
        this.data = prompt("Enter data").split(' ').map(function(x) {
            return parseInt(x, 16);
        });
    }

    this.resolve = function() {
        if (this.isResolvable() == false) {
            return;
        }
        this.dataOut.value = this.data[this.memAddr.value];
        this.scope.stack.push(this.dataOut);
    }

}

function Splitter(x, y, scope, dir, bitWidth = undefined, bitWidthSplit = undefined) {

    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.rectangleObject = false;

    this.bitWidthSplit = bitWidthSplit || prompt("Enter bitWidth Split").split(' ').map(function(x) {
        return parseInt(x, 10);
    });
    this.splitCount = this.bitWidthSplit.length;

    this.setDimensions(10, (this.splitCount - 1) * 10 + 10);
    this.yOffset = (this.splitCount / 2 - 1) * 20;

    this.inp1 = new Node(-10, 10 + this.yOffset, 0, this, this.bitWidth);

    this.outputs = [];
    for (var i = 0; i < this.splitCount; i++)
        this.outputs.push(new Node(20, i * 20 - this.yOffset - 20, 0, this, this.bitWidthSplit[i]));
    this.customSave = function() {
        var data = {

            constructorParamaters: [this.direction, this.bitWidth, this.bitWidthSplit],
            nodes: {
                outputs: this.outputs.map(findNode),
                inp1: findNode(this.inp1)
            },
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

    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ["black", "brown"][((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) + 0];
        ctx.lineWidth = 3;

        var xx = this.x;
        var yy = this.y;
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


    }

}

function Input(x, y, scope, dir, bitWidth) {

    // Call base class constructor
    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.state = 0;
    this.state = bin2dec(this.state); // in integer format
    this.output1 = new Node(this.bitWidth * 10, 0, 1, this);
    this.wasClicked = false;
    this.directionFixed = true;
    this.setWidth(this.bitWidth * 10);
    this.rectangleObject = true; // Trying to make use of base class draw

    this.customSave = function() {
        var data = {
            nodes: {
                output1: findNode(this.output1)
            },
            values: {
                state: this.state
            },
            constructorParamaters: [this.direction, this.bitWidth]
        }
        return data;
    }

    this.resolve = function() {
        this.output1.value = this.state;
        this.scope.stack.push(this.output1);
    }

    // Check if override is necessary!!
    this.newBitWidth = function(bitWidth) {
        this.bitWidth = bitWidth; //||parseInt(prompt("Enter bitWidth"),10);
        this.setWidth(this.bitWidth * 10);
        this.state = 0;
        this.output1.bitWidth = bitWidth;
        if (this.direction == "RIGHT") {
            this.output1.x = 10 * this.bitWidth;
            this.output1.leftx = 10 * this.bitWidth;
        } else if (this.direction == "LEFT") {
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

    // Not sure if its okay to remove commented code...VERIFY!
    this.customDraw = function() {

        // ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;
        var xx = this.x;
        var yy = this.y;

        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.textAlign = "center";
        var bin = dec2bin(this.state, this.bitWidth);
        for (var k = 0; k < this.bitWidth; k++)
            fillText(ctx, bin[k], xx - 10 * this.bitWidth + 10 + (k) * 20, yy + 5);
        ctx.fill();


    }


    this.newDirection = function(dir) {
        if (dir == this.direction) return;
        this.direction = dir;
        this.output1.refresh();
        if (dir == "RIGHT" || dir == "LEFT") {
            this.output1.leftx = 10 * this.bitWidth;
            this.output1.lefty = 0;
        } else {
            this.output1.leftx = 10; //10*this.bitWidth;
            this.output1.lefty = 0;
        }

        this.output1.refresh();
        this.labelDirection = oppositeDirection[this.direction];
    }

    this.findPos = function() {
        return Math.round((simulationArea.mouseX - this.x + 10 * this.bitWidth) / 20.0);
    }
}

function Ground(x, y, scope = globalScope, bitWidth = undefined) {
    CircuitElement.call(this, x, y, scope, "RIGHT", bitWidth);
    this.rectangleObject = false;
    this.setDimensions(20, 20);
    this.directionFixed = true;
    this.output1 = new Node(0, -10, 1, this);

    this.output1.value = this.state;

    this.wasClicked = false;
    this.resolve = function() {
        this.output1.value = 0;
        this.scope.stack.push(this.output1);
    }
    this.customSave = function() {
        var data = {
            nodes: {
                output1: findNode(this.output1)
            },
            constructorParamaters: [this.bitWidth],
        }
        return data;
    }

    this.customDraw = function() {

        ctx = simulationArea.context;

        ctx.beginPath();
        ctx.strokeStyle = ["black", "brown"][((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) + 0];
        ctx.lineWidth = 3;

        var xx = this.x;
        var yy = this.y;

        moveTo(ctx, 0, -10, xx, yy, this.direction);
        lineTo(ctx, 0, 0, xx, yy, this.direction);
        moveTo(ctx, -10, 0, xx, yy, this.direction);
        lineTo(ctx, 10, 0, xx, yy, this.direction);
        moveTo(ctx, -6, 5, xx, yy, this.direction);
        lineTo(ctx, 6, 5, xx, yy, this.direction);
        moveTo(ctx, -2.5, 10, xx, yy, this.direction);
        lineTo(ctx, 2.5, 10, xx, yy, this.direction);
        ctx.stroke();
    }
}

function Power(x, y, scope = globalScope, bitWidth = undefined) {

    CircuitElement.call(this, x, y, scope, "RIGHT", bitWidth);
    this.directionFixed = true;
    this.rectangleObject = false;
    this.setDimensions(15, 15);
    this.output1 = new Node(0, 20, 1, this);
    this.output1.value = this.state;
    this.wasClicked = false;
    this.resolve = function() {
        this.output1.value = ~0 >>> (32 - this.bitWidth);
        this.scope.stack.push(this.output1);
    }
    this.customSave = function() {
        var data = {


            nodes: {
                output1: findNode(this.output1)
            },
            constructorParamaters: [this.bitWidth],
        }
        return data;
    }

    this.customDraw = function() {

        ctx = simulationArea.context;

        var xx = this.x;
        var yy = this.y;

        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;
        ctx.fillStyle = "green";
        moveTo(ctx, 0, 0, xx, yy, this.direction);
        lineTo(ctx, -10, 10, xx, yy, this.direction);
        lineTo(ctx, 10, 10, xx, yy, this.direction);
        lineTo(ctx, 0, 0, xx, yy, this.direction);
        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.fill();
        moveTo(ctx, 0, 10, xx, yy, this.direction);
        lineTo(ctx, 0, 20, xx, yy, this.direction);
        ctx.stroke();

    }
}

function Output(x, y, scope, dir, bitWidth) {
    // Calling base class constructor

    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.directionFixed = true;
    this.setDimensions(this.bitWidth * 10, 10);
    this.inp1 = new Node(this.bitWidth * 10, 0, 0, this);

    this.customSave = function() {
        var data = {
            nodes: {
                inp1: scope.allNodes.indexOf(this.inp1)
            },
            constructorParamaters: [this.direction, this.bitWidth],
        }
        return data;
    }

    this.newBitWidth = function(bitWidth) {

        this.state = undefined;
        this.inp1.bitWidth = bitWidth;
        this.bitWidth = bitWidth;
        this.setWidth(10 * this.bitWidth);

        if (this.direction == "RIGHT") {
            this.inp1.x = 10 * this.bitWidth;
            this.inp1.leftx = 10 * this.bitWidth;
        } else if (this.direction == "LEFT") {
            this.inp1.x = -10 * this.bitWidth;
            this.inp1.leftx = 10 * this.bitWidth;
        }
    }

    this.customDraw = function() {
        this.state = this.inp1.value;
        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ["blue","red"][+(this.inp1.value==undefined)];
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        var xx = this.x;
        var yy = this.y;

        rect2(ctx, -10 * this.bitWidth, -10, 20 * this.bitWidth, 20, xx, yy, "RIGHT");
        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this))
            ctx.fillStyle = "rgba(255, 255, 32,0.8)";

        ctx.fill();
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

    }


    this.newDirection = function(dir) {
        if (dir == this.direction) return;
        this.direction = dir;
        this.inp1.refresh();
        if (dir == "RIGHT" || dir == "LEFT") {
            this.inp1.leftx = 10 * this.bitWidth;
            this.inp1.lefty = 0;
        } else {
            this.inp1.leftx = 10; //10*this.bitWidth;
            this.inp1.lefty = 0;
        }

        this.inp1.refresh();
        this.labelDirection = oppositeDirection[this.direction];
    }
}

function BitSelector(x, y, scope, dir, bitWidth = undefined, selectorBitWidth = undefined) {

    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.setDimensions(20, 20);
    this.selectorBitWidth = selectorBitWidth || parseInt(prompt("Enter Selector bitWidth"), 10);
    this.rectangleObject = false;
    this.inp1 = new Node(-20, 0, 0, this, this.bitWidth);
    this.output1 = new Node(20, 0, 1, this, 1);
    this.bitSelectorInp = new Node(0, 20, 0, this, this.selectorBitWidth);

    this.customSave = function() {
        var data = {

            nodes: {
                inp1: scope.allNodes.indexOf(this.inp1),
                output1: scope.allNodes.indexOf(this.output1),
                bitSelectorInp: scope.allNodes.indexOf(this.bitSelectorInp)
            },
            constructorParamaters: [this.direction, this.bitWidth, this.selectorBitWidth],
        }
        return data;
    }

    this.newBitWidth = function(bitWidth) {
        this.inp1.bitWidth = bitWidth;
    }

    this.resolve = function() {
        this.output1.value = extractBits(this.inp1.value, this.bitSelectorInp.value + 1, this.bitSelectorInp.value + 1); //(this.inp1.value^(1<<this.bitSelectorInp.value))==(1<<this.bitSelectorInp.value);
        this.scope.stack.push(this.output1);
    }

    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ["blue", "red"][(this.state === undefined) + 0];
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        var xx = this.x;
        var yy = this.y;
        rect(ctx, xx - 20, yy - 20, 40, 40);
        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.fill();
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
}

function saveasimg() {
    //window.open(simulationArea.canvas.toDataURL('image/png'));
    var gh = simulationArea.canvas.toDataURL('image/png');
    var name = prompt("Enter imagename");
    if (name != null) {
        var filename = name;
        var anchor = document.createElement('a');
        anchor.href = gh;
        anchor.download = filename + '.png';
    }
    anchor.click()
}

function ConstantVal(x, y, scope, dir, bitWidth = undefined, state = undefined) {
    this.state = state || prompt("Enter value");
    CircuitElement.call(this, x, y, scope, dir, this.state.length);
    this.setDimensions(10 * this.state.length, 10);
    this.bitWidth = bitWidth || this.state.length;
    this.directionFixed = true;
    this.rectangleObject = false;

    this.output1 = new Node(this.bitWidth * 10, 0, 1, this);
    this.wasClicked = false;
    this.label = "";
    this.customSave = function() {
        var data = {
            nodes: {
                output1: findNode(this.output1)
            },
            constructorParamaters: [this.direction, this.bitWidth, this.state],
        }
        return data;
    }
    this.resolve = function() {
        this.output1.value = bin2dec(this.state);
        this.scope.stack.push(this.output1);
    }
    this.dblclick = function() {
        this.state = prompt("Re enter the value");
        console.log(this.state);
        this.newBitWidth(this.state.toString().length);
        console.log(this.state, this.bitWidth);
    }
    this.newBitWidth = function(bitWidth) {
        this.bitWidth = bitWidth; //||parseInt(prompt("Enter bitWidth"),10);
        this.output1.bitWidth = bitWidth;
        this.setDimensions(10 * this.bitWidth, 10);
        if (this.direction == "RIGHT") {
            this.output1.x = 10 * this.bitWidth;
            this.output1.leftx = 10 * this.bitWidth;
        } else if (this.direction == "LEFT") {
            this.output1.x = -10 * this.bitWidth;
            this.output1.leftx = 10 * this.bitWidth;
        }
    }
    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        ctx.lineWidth = 0.5;
        var xx = this.x;
        var yy = this.y;

        rect2(ctx, -10 * this.bitWidth, -10, 20 * this.bitWidth, 20, xx, yy, "RIGHT");
        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.textAlign = "center";
        var bin = this.state; //dec2bin(this.state,this.bitWidth);
        for (var k = 0; k < this.bitWidth; k++)
            fillText(ctx, bin[k], xx - 10 * this.bitWidth + 10 + (k) * 20, yy + 5);
        ctx.fill();

    }
    this.newDirection = function(dir) {
        if (dir == this.direction) return;
        this.direction = dir;
        this.output1.refresh();
        if (dir == "RIGHT" || dir == "LEFT") {
            this.output1.leftx = 10 * this.bitWidth;
            this.output1.lefty = 0;
        } else {
            this.output1.leftx = 10; //10*this.bitWidth;
            this.output1.lefty = 0;
        }

        this.output1.refresh();
        this.labelDirection = oppositeDirection[this.direction];
    }
}

function NorGate(x, y, scope = globalScope, dir = "RIGHT", inputs = 2, bitWidth = undefined) {

    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    this.rectangleObject = false;
    this.setDimensions(15, 20);

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

    this.customSave = function() {
        var data = {
            constructorParamaters: [this.direction, this.inputs, this.bitWidth],
            nodes: {
                inp: this.inp.map(findNode),
                output1: findNode(this.output1)
            },
        }
        return data;
    }
    this.resolve = function() {
        var result = this.inp[0].value;
        if (this.isResolvable() == false) {
            return;
        }
        for (var i = 1; i < this.inputs; i++)
            result = result | (this.inp[i].value);
        result = ((~result >>> 0) << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
        this.output1.value = result
        this.scope.stack.push(this.output1);
    }
    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.lineWidth = 3;

        var xx = this.x;
        var yy = this.y;
        ctx.beginPath();
        ctx.fillStyle = "white";

        moveTo(ctx, -10, -20, xx, yy, this.direction);
        bezierCurveTo(0, -20, +15, -10, 20, 0, xx, yy, this.direction);
        bezierCurveTo(0 + 15, 0 + 10, 0, 0 + 20, -10, +20, xx, yy, this.direction);
        bezierCurveTo(0, 0, 0, 0, -10, -20, xx, yy, this.direction);
        ctx.closePath();
        if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.5)";
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        arc(ctx, 25, 0, 5, 0, 2 * (Math.PI), xx, yy, this.direction);
        ctx.stroke();
        //for debugging
    }
}

function DigitalLed(x, y, scope) {
    // Calling base class constructor

    CircuitElement.call(this, x, y, scope, "UP",1);
    this.rectangleObject=false;
    this.setDimensions(10,10);
    this.inp1 = new Node(-40, 0, 0, this,1);
    this.directionFixed=true;
    this.fixedBitWidth=true;

    this.customSave = function() {
        var data = {
            nodes:{inp1: scope.allNodes.indexOf(this.inp1)},
        }
        return data;
    }

    this.customDraw = function() {

        ctx = simulationArea.context;

        var xx = this.x;
        var yy = this.y;

        ctx.strokeStyle = "#e3e4e5";
        ctx.lineWidth=3;
        ctx.beginPath();
        moveTo(ctx, -20, 0, xx, yy, this.direction);
        lineTo(ctx, -40, 0, xx, yy, this.direction);
        ctx.stroke();

        ctx.strokeStyle = "#d3d4d5";
        ctx.fillStyle = ["rgba(227,228,229,0.8)","rgba(249,24,43,0.8)"][this.inp1.value||0];
        ctx.lineWidth = 1;

        ctx.beginPath();

        moveTo(ctx, -15, -9, xx, yy, this.direction);
        lineTo(ctx, 0, -9, xx, yy, this.direction);
        arc(ctx, 0, 0, 9, (-Math.PI / 2), (Math.PI / 2), xx, yy, this.direction);
        lineTo(ctx, -15, 9, xx, yy, this.direction);
        lineTo(ctx,-18,12,xx,yy,this.direction);
        arc(ctx,0,0,Math.sqrt(468),((Math.PI/2) + Math.acos(12/Math.sqrt(468))),((-Math.PI/2) - Math.asin(18/Math.sqrt(468))),xx,yy,this.direction);
        lineTo(ctx, -15, -9, xx, yy, this.direction);
        ctx.stroke();
        if ((this.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        ctx.fill();

    }
}
