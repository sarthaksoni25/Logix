function clockTick() {
    globalScope.clockTick();
    play()
    updateCanvas=true;
    toBeUpdated = true;
    scheduleUpdate();
}

function loadFlipFlop(data, scope) {
    var v = new FlipFlop(data["x"], data["y"], scope, data["dir"], data["bitWidth"]);
    v.clockInp = replace(v.clockInp, data["clockInp"]);
    v.dInp = replace(v.dInp, data["dInp"]);
    v.qOutput = replace(v.qOutput, data["qOutput"]);
    v.reset = replace(v.reset, data["reset"]);
    v.en = replace(v.en, data["en"]);
}

function FlipFlop(x, y, scope, dir, bitWidth) {
    CircuitElement.call(this, x, y, scope, dir, bitWidth);
    // this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10);
    // this.direction = dir;
    // this.id = 'FlipFlip' + uniqueIdCounter;
    // uniqueIdCounter++;
    // this.scope = scope;
    // this.nodeList = [];
    // this.element = new Element(x, y, "FlipFlip", 20, this);
    this.directionFixed=true;
    this.setDimensions(20,20);
    this.rectangleObject=true;
    this.clockInp = new Node(-20, +10, 0, this, 1);
    this.dInp = new Node(-20, -10, 0, this);
    this.qOutput = new Node(20, -10, 1, this);
    this.reset = new Node(10, 20, 0, this, 1);
    this.en = new Node(-10, 20, 0, this, 1);
    this.masterState = 0;
    this.slaveState = 0;
    this.prevClockState = 0;

    // scope.flipflops.push(this);
    // this.wasClicked = false;
    this.newBitWidth = function(bitWidth) {
        this.bitWidth = bitWidth;
        this.dInp.bitWidth = bitWidth;
        this.qOutput.bitWidth = bitWidth;
    }
    this.isResolvable = function() {
        if(this.reset.value==1)return true;
        if (this.dInp.value == undefined) return true;
        else if (this.en.value != undefined) return true;
        return false;
    }
    this.resolve = function() {
        if (this.reset.value == 1) {

            this.masterState = this.slaveState = 0;

            if (this.qOutput.value != this.slaveState) {
                this.qOutput.value = this.slaveState;
                this.scope.stack.push(this.qOutput);
            }
            return;
        }

        if (this.en.value == 0) {
            if (this.qOutput.value != this.slaveState) {
                this.qOutput.value = this.slaveState;
                this.scope.stack.push(this.qOutput);
                // console.log("hit", this.slaveState);
                this.prevClockState = this.clockInp.value;
            }
            return;
        }

        if (this.clockInp.value == this.prevClockState) {
            if (this.clockInp.value == 0 && this.dInp.value != undefined) {
                this.masterState = this.dInp.value;
            }
        } else if (this.clockInp.value != undefined) {
            if (this.clockInp.value == 1) {
                this.slaveState = this.masterState;
            } else if (this.clockInp.value == 0 && this.dInp.value != undefined) {
                this.masterState = this.dInp.value;
            }
            this.prevClockState = this.clockInp.value;
        }

        if (this.qOutput.value != this.slaveState) {
            this.qOutput.value = this.slaveState;
            this.scope.stack.push(this.qOutput);
        }
    }
    this.customSave = function() {
        var data = {
            nodes:{
            clockInp: findNode(this.clockInp),
            dInp: findNode(this.dInp),
            qOutput: findNode(this.qOutput),
            reset: findNode(this.reset),
            en: findNode(this.en)},
            constructorParamaters:[this.direction,this.bitWidth]

        }
        return data;
    }
    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        var xx = this.x;
        var yy = this.y;
        // rect(ctx, xx - 20, yy - 20, 40, 40);
        moveTo(ctx, -20, 5, xx, yy, this.direction);
        lineTo(ctx, -15, 10, xx, yy, this.direction);
        lineTo(ctx, -20, 15, xx, yy, this.direction);


        // if ((this.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "20px Georgia";
        ctx.fillStyle = "green";
        ctx.textAlign = "center";
        fillText(ctx, this.slaveState.toString(16), xx, yy + 5);
        ctx.stroke();

    }
}

function loadTTY(data, scope) {
    var v = new TTY(data["x"], data["y"], scope, data["dir"], data["rows"],data["cols"]);
    v.clockInp = replace(v.clockInp, data["clockInp"]);
    v.asciiInp = replace(v.asciiInp, data["asciiInp"]);
    v.reset = replace(v.reset, data["reset"]);
    v.en = replace(v.en, data["en"]);
}

function TTY(x, y, scope, dir,rows,cols) {
    CircuitElement.call(this, x, y, scope, dir, 1);
    this.directionFixed=true;
    this.fixedBitWidth=true;
    this.cols=cols||parseInt(prompt("Enter cols:"));
    this.rows=rows||parseInt(prompt("Enter rows:"));

    this.elementWidth=Math.max(40,Math.ceil(this.cols/2)*20);
    this.elementHeight=Math.max(40,Math.ceil(this.rows*15/20)*20);
    this.setWidth(this.elementWidth/2);
    this.setHeight(this.elementHeight/2);
    // this.element = new Element(x, y, "TTY",this.elementWidth/2, this,this.elementHeight/2);

    this.clockInp = new Node(-this.elementWidth/2, this.elementHeight/2-10, 0, this, 1);
    this.asciiInp = new Node(-this.elementWidth/2, this.elementHeight/2-30, 0, this,7);
    // this.qOutput = new Node(20, -10, 1, this);
    this.reset = new Node(30-this.elementWidth/2, this.elementHeight/2, 0, this, 1);
    this.en = new Node(10-this.elementWidth/2, this.elementHeight/2, 0, this, 1);
    // this.masterState = 0;
    // this.slaveState = 0;
    this.prevClockState = 0;

    this.data="";
    this.buffer="";
    // this.newBitWidth = function(bitWidth) {
    //
    // }
    // this.dblclick=function(){
    //
    // }
    this.isResolvable = function() {
        if(this.reset.value==1)return true;
        else if (this.en.value == 0) return false;
        else if (this.clockInp.value == undefined) return false;
        else if(this.asciiInp.value==undefined)return false;
        return true;
    }
    this.resolve = function() {
        if (this.reset.value == 1) {
            this.data="";
            return;
        }
        if (this.en.value == 0) {
            this.buffer="";
            return;
        }

        if (this.clockInp.value == this.prevClockState) {
            if (this.clockInp.value == 0 ) {
                this.buffer = String.fromCharCode(this.asciiInp.value);
            }
        } else if (this.clockInp.value != undefined) {
            if (this.clockInp.value == 1) {
                this.data=this.data+this.buffer;
                if(this.data.length>this.cols*this.rows)
                    this.data=this.data.slice(1);
            } else if (this.clockInp.value == 0 ) {
                this.buffer = String.fromCharCode(this.asciiInp.value);
            }
            this.prevClockState = this.clockInp.value;
        }

    }
    this.customSave = function() {
        var data = {
            nodes:{
            clockInp: findNode(this.clockInp),
            asciiInp: findNode(this.asciiInp),
            reset: findNode(this.reset),
            en: findNode(this.en)},
            constructorParamaters:[this.direction,this.rows,this.cols],
        }
        return data;
    }
    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        var xx = this.x;
        var yy = this.y;
        // rect(ctx, xx - this.elementWidth/2, yy - this.elementHeight/2, this.elementWidth, this.elementHeight);

        moveTo(ctx, -this.elementWidth/2, this.elementHeight/2-15, xx, yy, this.direction);
        lineTo(ctx, 5-this.elementWidth/2, this.elementHeight/2-10, xx, yy, this.direction);
        lineTo(ctx, -this.elementWidth/2, this.elementHeight/2-5, xx, yy, this.direction);


        // if ((this.b.hover&&!simulationArea.shiftDown)|| simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this))
        //     ctx.fillStyle = "rgba(255, 255, 32,0.8)";
        // ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.textAlign = "center";
        var startY=-7.5*this.rows+3;
        for(var i=0;i<this.data.length;i+=this.cols){

            var lineData=this.data.slice(i,i+this.cols);
            lineData+=' '.repeat(this.cols-lineData.length);
            fillText3(ctx, lineData, 0, startY+(i/this.cols)*15+9,xx,yy,fontSize=15,font="Courier New",textAlign="center");
        }
        ctx.stroke();

    }
    // this.delete = function() {
    //     simulationArea.lastSelected = undefined;
    //     scope.TTYs.clean(this);
    //
    // }
    // this.newDirection=function(){
    //
    // }
}

function loadKeyboard(data, scope) {
    var v = new Keyboard(data["x"], data["y"], scope, data["dir"], data["bufferSize"]);
    v.clockInp = replace(v.clockInp, data["clockInp"]);
    v.asciiOutput = replace(v.asciiOutput, data["asciiOutput"]);
    v.reset = replace(v.reset, data["reset"]);
    v.en = replace(v.en, data["en"]);
    v.available = replace(v.available, data["available"]);
}

function Keyboard(x, y, scope, dir,bufferSize) {
    CircuitElement.call(this, x, y, scope, dir, 1);
    this.directionFixed=true;
    this.fixedBitWidth=true;

    this.bufferSize=bufferSize||parseInt(prompt("Enter buffer size:"));
    this.elementWidth=Math.max(80,Math.ceil(this.bufferSize/2)*20);
    this.elementHeight=40;//Math.max(40,Math.ceil(this.rows*15/20)*20);
    this.setWidth(this.elementWidth/2);
    this.setHeight(this.elementHeight/2);

    this.clockInp = new Node(-this.elementWidth/2, this.elementHeight/2-10, 0, this, 1);
    this.asciiOutput = new Node(30, this.elementHeight/2, 1, this,7);
    this.available = new Node(10, this.elementHeight/2, 1, this,1);
    this.reset = new Node(-10, this.elementHeight/2, 0, this, 1);
    this.en = new Node(-30, this.elementHeight/2, 0, this, 1);
    this.prevClockState = 0;
    this.buffer="";
    this.bufferOutValue=undefined;
    // this.newBitWidth = function(bitWidth) {
    //
    // }
    // this.dblclick=function(){
    //
    // }
    this.keyDown=function(key){
        this.buffer+=key;
        if(this.buffer.length>this.bufferSize)
            this.buffer=this.buffer.slice(1);
        console.log(key)

    }
    this.isResolvable = function() {
        if(this.reset.value==1)return true;
        else if (this.en.value == 0) return false;
        else if (this.clockInp.value == undefined) return false;
        return true;
    }
    this.resolve = function() {
        if (this.reset.value == 1) {
            this.buffer="";
            return;
        }
        if (this.en.value == 0) {
            return;
        }

        if(this.bufferOutValue!==undefined&&this.available.value!=1){
            this.available.value=1;//this.bufferOutValue;
            this.scope.stack.push(this.available);
        }
        else if(this.available.value!=0){
            this.available.value=0;//this.bufferOutValue;
            this.scope.stack.push(this.available);
        }

        if (this.clockInp.value == this.prevClockState) {
            if (this.clockInp.value == 0 ) {
                if (this.buffer.length) {
                    this.bufferOutValue=this.buffer[0].charCodeAt(0);
                }
                else{
                    this.bufferOutValue=undefined;
                }
            }
        } else if (this.clockInp.value != undefined) {

            if (this.clockInp.value == 1&&this.buffer.length) {
                if(this.bufferOutValue==this.buffer[0].charCodeAt(0)){// WHY IS THIS REQUIRED ??
                    this.buffer=this.buffer.slice(1);
                }
            }
            else{
                if (this.buffer.length) {
                    this.bufferOutValue=this.buffer[0].charCodeAt(0);
                }
                else{
                    this.bufferOutValue=undefined;
                }
            }
            this.prevClockState = this.clockInp.value;
        }

        if(this.asciiOutput.value!=this.bufferOutValue){
            this.asciiOutput.value=this.bufferOutValue;
            this.scope.stack.push(this.asciiOutput);
        }

    }
    this.customSave = function() {
        var data = {
            nodes:{
            clockInp: findNode(this.clockInp),
            asciiOutput: findNode(this.asciiOutput),
            available: findNode(this.available),
            reset: findNode(this.reset),
            en: findNode(this.en)},
            constructorParamaters:[this.direction,this.bufferSize]
        }
        return data;
    }
    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        var xx = this.x;
        var yy = this.y;
        moveTo(ctx, -this.elementWidth/2, this.elementHeight/2-15, xx, yy, this.direction);
        lineTo(ctx, 5-this.elementWidth/2, this.elementHeight/2-10, xx, yy, this.direction);
        lineTo(ctx, -this.elementWidth/2, this.elementHeight/2-5, xx, yy, this.direction);

        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.textAlign = "center";
        var lineData=this.buffer+' '.repeat(this.bufferSize-this.buffer.length);
        fillText3(ctx, lineData, 0,+5,xx,yy,fontSize=15,font="Courier New",textAlign="center");
        ctx.stroke();
    }
}

function loadClock(data, scope) {
    var v = new Clock(data["x"], data["y"], scope, data["dir"]);
    v.output1 = replace(v.output1, data["output1"]);

}

function Clock(x, y, scope, dir) {
    CircuitElement.call(this, x, y, scope, dir, 1);
    this.fixedBitWidth=true;
    this.output1 = new Node(10, 0, 1, this, 1);
    this.state = 0;
    this.output1.value = this.state;
    this.wasClicked = false;
    this.interval = null;
    this.customSave = function() {
        var data = {
            nodes:{output1: findNode(this.output1)},
            constructorParamaters:[this.direction],

        }
        return data;
    }

    this.resolve = function() {
        this.output1.value = this.state;
        this.scope.stack.push(this.output1);
    }

    this.toggleState = function() { //toggleState
        this.state = (this.state + 1) % 2;
        this.output1.value = this.state;
    }
    this.click=this.toggleState;

    this.customDraw = function() {

        ctx = simulationArea.context;
        ctx.strokeStyle = ("rgba(0,0,0,1)");
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        var xx = this.x;
        var yy = this.y;

        ctx.beginPath();
        ctx.strokeStyle = ["DarkGreen", "Lime"][this.state];
        ctx.lineWidth = 2;
        if (this.state == 0) {
            moveTo(ctx, -6, 0, xx, yy, this.direction);
            lineTo(ctx, -6, 6, xx, yy, this.direction);
            lineTo(ctx, 0, 6, xx, yy, this.direction);
            lineTo(ctx, 0, -6, xx, yy, this.direction);
            lineTo(ctx, 6, -6, xx, yy, this.direction);
            lineTo(ctx, 6, 0, xx, yy, this.direction);

        } else {
            moveTo(ctx, -6, 0, xx, yy, this.direction);
            lineTo(ctx, -6, -6, xx, yy, this.direction);
            lineTo(ctx, 0, -6, xx, yy, this.direction);
            lineTo(ctx, 0, 6, xx, yy, this.direction);
            lineTo(ctx, 6, 6, xx, yy, this.direction);
            lineTo(ctx, 6, 0, xx, yy, this.direction);
        }
        ctx.stroke();

    }
}
