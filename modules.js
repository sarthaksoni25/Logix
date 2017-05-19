
//load AndGate fn
function loadAnd(data, scope) {
    var v = new AndGate(data["x"], data["y"], scope, data["inputs"],data["dir"]);
    v.output1 = replace(v.output1, data["output1"]);
    for (var i = 0; i < data["inputs"]; i++) v.inp[i] = replace(v.inp[i], data["inp"][i]);
}

//AndGate - (x,y)-position , scope - circuit level, inputLength - no of nodes, dir - direction of gate
function AndGate(x, y, scope, inputLength, dir,bitWidth=1) {
    this.bitWidth=bitWidth;
    this.bitWidth=parseInt(prompt("Enter bitWidth"),10);
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

        for (var i = 0; i < inputLength; i++)
            if(this.inp[i].value == undefined)return false;
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
    this.bitWidth=1;
    this.element = new Element(x, y, "SevenSegmentDisplay", 30, this,50);
    this.scope = scope;
    this.g = new Node(-20, -50, 0, this);
    this.f = new Node(-10, -50, 0, this);
    this.a = new Node(+10, -50, 0, this);
    this.b = new Node(+20, -50, 0, this);
    this.e = new Node(-20, +50, 0, this);
    this.d = new Node(-10, +50, 0, this);
    this.c = new Node(+10, +50, 0, this);
    this.dot = new Node(+20, +50, 0, this);
    this.direction="left";
    scope.sevenseg.push(this);

    this.isResolvable = function() {
        return false;
        // return this.a.value != undefined && this.b.value != undefined && this.c.value != undefined && this.d.value != undefined && this.e.value != undefined && this.f.value != undefined && this.g.value != undefined && this.dot.value != undefined;
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
        if(color==undefined)color="grey";
        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5 ;
        xx=this.element.x;
        yy=this.element.y;
        moveTo(ctx,x1,y1,xx,yy,this.direction);
        lineTo(ctx,x2,y2,xx,yy,this.direction);
        ctx.closePath();
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

        this.drawSegment(20, -5, 20, -35, ["black", "red"][this.b.value]);
        this.drawSegment(20, 5, 20, 35, ["black", "red"][this.c.value]);
        this.drawSegment(-20, -5, -20, -35, ["black", "red"][this.f.value]);
        this.drawSegment(-20, 5, -20, 35, ["black", "red"][this.e.value]);
        this.drawSegment(-15, -40, 15, -40, ["black", "red"][this.a.value]);
        this.drawSegment(-15, 0, 15, 0, ["black", "red"][this.g.value]);
        this.drawSegment(-15, 40, 15, 40, ["black", "red"][this.d.value]);

        ctx.beginPath();
        ctx.strokeStyle = ["black", "red"][this.dot.value];
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

function OrGate(x, y, scope = globalScope, inputs = 2,dir='left',bitWidth=1) {
    this.bitWidth=bitWidth;
    this.bitWidth=parseInt(prompt("Enter bitWidth"),10);
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

        for (var i = 0; i < this.inputs; i++)
            if(this.inp[i].value == undefined)return false;
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

function NotGate(x, y, scope, dir,bitWidth=1) {
    this.bitWidth=bitWidth;
    this.bitWidth=parseInt(prompt("Enter bitWidth"),10);
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
        return this.inp1.value != undefined;
    }

    this.resolve = function() {
        if (this.isResolvable() == false) {
            return;
        }
        this.output1.value = ((~this.inp1.value>>>0)<<(32-this.bitWidth))>>>(32-this.bitWidth);
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

function Splitter(x, y, scope, dir,bitWidth=1) {
    this.bitWidth=bitWidth;
    this.bitWidth=parseInt(prompt("Enter bitWidth"),10);
    this.bitWidthSplit=prompt("Enter bitWidth Split").split(' ').map(function(x){return parseInt(x,10);});
    this.id = 'Splitter' + uniqueIdCounter;
    uniqueIdCounter++;
    this.flip=-1;
    this.scope = scope;
    this.element = new Element(x, y, "Splitter", 10, this,this.bitWidthSplit.length*10+10);
    this.yOffset=(this.bitWidthSplit.length/2-1)*20;
    this.direction=dir;
    this.inp1 = new Node(-10, 10+this.yOffset, 0, this,this.bitWidth);

    this.outputs = [];
    for(var i=0;i<this.bitWidthSplit.length;i++)
        this.outputs.push(new Node(10, -i*20+this.yOffset, 1, this,this.bitWidthSplit[i]));


    this.nodeList=[[this.inp1],this.outputs];
    scope.splitters.push(this);
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
        return this.inp1.value != undefined;
    }

    this.resolve = function() {
        if (this.isResolvable() == false) {
            return;
        }
        var bitCount=1;
        for(var i=0;i<this.bitWidthSplit.length;i++){
            this.outputs[i].value=extractBits(this.inp1.value,bitCount,bitCount+this.bitWidthSplit[i]-1);
            bitCount+=this.bitWidthSplit[i];
            this.scope.stack.push(this.outputs[i]);
        }
    }
    this.update = function() {
        var updated = false;
        // updated |= this.output1.update();
        for (var j = 0; j < this.bitWidthSplit.length; j++) {
            updated |= this.outputs[j].update();
        }
        updated |= this.inp1.update();
        updated |= this.element.update();
        return updated;
    }

    this.draw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ["black", "brown"][(this.element.b.hover||simulationArea.lastSelected==this) + 0];
        ctx.lineWidth = 3 ;

        var xx = this.element.x;
        var yy = this.element.y+this.yOffset;
        ctx.beginPath();

        // drawLine(ctx, -10, -10, xx, y2, color, width)
        moveTo(ctx,-10,10,xx,yy,this.direction);
        lineTo(ctx,0,0,xx,yy,this.direction);
        lineTo(ctx,0,-20*(this.bitWidthSplit.length-1),xx,yy,this.direction);

        for(var i=0;i<this.bitWidthSplit.length;i++){
        moveTo(ctx,0,-20*i,xx,yy,this.direction);
        lineTo(ctx,10,-20*i,xx,yy,this.direction);
        }
        // arc(ctx,5,2*(Math.PI),0,xx,yy,this.direction,15,0);
        // ctx.closePath();
        // if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();
        // ctx.beginPath();
        // arc(ctx,15,0,5,2*(Math.PI),0,xx,yy,this.direction);
        // ctx.stroke();
        this.inp1.draw();
        for (var j = 0; j < this.bitWidthSplit.length; j++)
            this.outputs[j].draw();
        if (this.element.b.isHover())
            console.log(this,this.id);
    }
    this.delete = function() {
        simulationArea.lastSelected = undefined;
        scope.splitters.clean(this);
        for(var i=0;i<this.nodeList.length;i++)
            for(var j=0;j<this.nodeList[i].length;j++)
                console.log(this.nodeList[i][j].delete());

    }

}

function loadInput(data, scope) {

    var v = new Input(data["x"], data["y"], scope,data["dir"]);
    v.output1 = replace(v.output1, data["output1"]);
}

function Input(x, y, scope, dir,bitWidth=1) {
    // this.func=Input;
    // [x, y, scope, dir] = list;

    this.id = 'input' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    // this.list=list;
    this.bitWidth=bitWidth;
    this.direction=dir;
    this.element = new Element(x, y, "input", 15, this);
    this.prevDir = dir;
    this.state = prompt("Enter value:");
    this.bitWidth=this.state.length;
    this.state=bin2dec(this.state);// in integer format
    console.log(this.state);
    this.output1 = new Node(10, 0, 1, this);
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
    this.toggleState = function(pos) {
        var binary = dec2bin(this.state);
        var newBin;
        // bin[pos] = ((parseInt(bin[pos])+1)%2).toString();
        if(binary[pos]==="0")
            newBin = binary.slice(0,pos) + "1" + binary.slice(pos+1) ;

        else
            newBin = binary.slice(0,pos) + "0" + binary.slice(pos+1) ;


        console.log(newBin);
        this.state = bin2dec(newBin);
        this.draw();
        // this.state = (this.state + 1) % 2;
        // this.output1.value = this.state;

    }
    this.update = function() {
        var updated = false;
        updated |= this.output1.update();
        updated |= this.element.update();

        if (simulationArea.mouseDown == false)
            this.wasClicked = false;

        if (simulationArea.mouseDown && !this.wasClicked && simulationArea.lock==="locked") {//&& this.element.b.clicked afterwards
            if(this.isClicked());
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

        rect2(ctx,-20*this.bitWidth+10,-10,20*this.bitWidth,20,xx,yy,"left");
        this.checkNodeDirection();
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "20px Georgia";
        ctx.fillStyle = "green";
        var bin = dec2bin(this.state);
        for(var k=0;k<this.bitWidth;k++)
          fillText(ctx,bin[k], xx-20*this.bitWidth+15+(k)*20, yy + 5);
        ctx.stroke();

        this.element.draw();
        this.output1.draw();

    }
    this.delete = function() {
        this.output1.delete();
        simulationArea.lastSelected = undefined;
        scope.inputs.clean(this);

    }
    this.checkNodeDirection = function(){
      if(this.prevDir!==this.direction)
      {
        if(this.direction==="right"){
          this.output1.leftx = 20*this.bitWidth-10;
          this.output1.lefty = 0;
          this.prevDir=this.direction;
          this.output1.refresh();
        }
        else if(this.direction==="left"){
          this.output1.leftx=10;
          this.output1.lefty = 0;
          this.prevDir=this.direction;
          this.output1.refresh();
        }
        else if(this.direction==="up"){
            this.output1.leftx=10;
            this.output1.lefty=-10*(this.bitWidth-1);
            this.prevDir=this.direction;
            this.output1.refresh();
          }
        else if(this.direction==="down"){
            this.output1.leftx=10;
            this.output1.lefty=-10*(this.bitWidth-1);
            this.prevDir=this.direction;
            this.output1.refresh();
          }
      }

    }
    this.isClicked = function(){
        var xx=this.element.x;
        var yy=this.element.y;
        if(simulationArea.mouseX<=xx+10 && simulationArea.mouseX>=xx-20*this.bitWidth+10 && simulationArea.mouseY<=yy+10 && simulationArea.mouseY>=yy-10){
          this.checkRegion();
          return true;
        }

        else {
          return false;
        }
    }
    this.checkRegion = function(){

      for(var i=0;i<this.bitWidth;i++)
      {
        var xx=this.element.x;
        var yy=this.element.y;
        if(simulationArea.mouseX<=xx-20*this.bitWidth+15+i*20+10 && simulationArea.mouseX>=xx-20*this.bitWidth+15+i*20-10){
          this.toggleState(i);
        }
      }
    }
}
function loadGround(data, scope) {
    var v = new Ground(data["x"], data["y"], scope);
    v.output1 = replace(v.output1, data["output1"]);
}

function Ground(x, y, scope = globalScope,bitWidth=1) {
    this.bitWidth=bitWidth;
    this.bitWidth=parseInt(prompt("Enter bitWidth"),10);
    this.id = 'ground' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.element = new Element(x, y, "ground", 20, this);
    this.output1 = new Node(0, -10, 1, this);

    this.output1.value = this.state;
    scope.grounds.push(this);
    console.log(this);
    this.wasClicked = false;
    this.nodeList=[[this.output1]];
    this.resolve = function() {
        this.output1.value = 0;
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
        ctx.strokeStyle = ["black", "brown"][(this.element.b.hover||simulationArea.lastSelected==this) + 0];
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

function Power(x, y, scope = globalScope,bitWidth=1) {
    this.bitWidth=bitWidth;
    this.bitWidth=parseInt(prompt("Enter bitWidth"),10);
    this.id = 'power' + uniqueIdCounter;
    this.scope = scope;
    uniqueIdCounter++;

    this.element = new Element(x, y, "power", 15, this);
    this.output1 = new Node(0, 20, 1, this);
    this.output1.value = this.state;
    scope.powers.push(this);
    this.wasClicked = false;
    this.nodeList=[[this.output1]];
    this.resolve = function() {

        this.output1.value=~0>>>(32-this.bitWidth);
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

function Output(x, y, scope, dir,bitWidth=1) {

    this.scope = scope;
    this.id = 'output' + uniqueIdCounter;
    uniqueIdCounter++;
    this.direction=dir;
    this.prevDir=dir;
    this.bitWidth=bitWidth;
    this.bitWidth=parseInt(prompt("Enter bitWidth"),10);
    this.element = new Element(x, y, "output", 15, this);
    this.inp1 = new Node(10, 0, 0, this);
    this.state = undefined;
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
        return this.inp1.value != undefined;
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
        // arc(ctx,0,0,10,0,2* Math.PI,xx,yy,this.direction);
        rect2(ctx,-20*this.bitWidth+10,-10,20*this.bitWidth,20,xx,yy,"left");
        this.checkNodeDirection();
        if (this.element.b.hover || simulationArea.lastSelected == this) ctx.fill();
        ctx.stroke();

        // ctx.beginPath();
        // ctx.fillStyle = "green";
        // ctx.font = "19px Georgia";
        ctx.beginPath();
        ctx.font = "20px Georgia";
        ctx.fillStyle = "green";

        if (this.state == undefined || this.state == -1 )

            fillText(ctx,"x", xx - 5, yy + 5);
        else{
            // fillText(ctx,dec2bin(this.state), xx - 5, yy + 5);
            bin = dec2bin(this.state);
            for(var k=0;k<bin.length;k++)
              fillText(ctx,bin[k], xx-20*this.bitWidth+15+(k)*20, yy + 5);
            ctx.stroke();
          }
        ctx.stroke();

        this.element.draw();
        this.inp1.draw();
    }
    this.delete = function() {
        this.inp1.delete();
        simulationArea.lastSelected = undefined;
        this.scope.outputs.clean(this);
    }
    this.checkNodeDirection = function(){
        if(this.direction==="right" && this.prevDir!==this.direction){
          this.inp1.leftx = 20*this.bitWidth-10;
          this.inp1.lefty = 0;
          this.prevDir=this.direction;
          this.inp1.refresh();
        }
        else if(this.direction==="left"&& this.prevDir!==this.direction){
          this.inp1.leftx=10;
          this.inp1.lefty = 0;
          this.prevDir=this.direction;
          this.inp1.refresh();
        }
        else if(this.direction==="up"&& this.prevDir!==this.direction){
            this.inp1.leftx=10;
            this.inp1.lefty=-10*(this.bitWidth-1);
            this.prevDir=this.direction;
            this.inp1.refresh();
          }
        else if(this.direction==="down"&& this.prevDir!==this.direction){
            this.inp1.leftx=10;
            this.inp1.lefty=-10*(this.bitWidth-1);
            this.prevDir=this.direction;
            this.inp1.refresh();
          }

    }
}

function newBitWidth(obj,bitWidth){
    if(obj.newBitWidth!==undefined){
        obj.newBitWidth(bitWidth);
        return;
    }
    obj.bitWidth=bitWidth;
    for(var i=0;i<obj.nodeList.length;i++)
        for(var j=0;j<obj.nodeList[i].length;j++)
            obj.nodeList[i][j].bitWidth=bitWidth;

}
// function delete(obj){
//     if(obj.delete!==undefined){
//         obj.delete();
//         return;
//     }
//     for(var i=0;i<obj.nodeList.length;i++)
//         for(var j=0;j<obj.nodeList[i].length;j++)
//             obj.nodeList[i][j].delete();
//     simulationArea.lastSelected = undefined;
//
// }
