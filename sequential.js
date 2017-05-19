function clockTick() {
    for (var i = 0; i < globalScope.clocks.length; i++)
        globalScope.clocks[i].toggleState(); //tick clock!
    if (globalScope.clocks.length) {
        play(); // simulate
    }
}

function FlipFlop(x, y, scope, dir,bitWidth) {
    this.bitWidth=bitWidth;
    this.bitWidth=parseInt(prompt("Enter bitWidth"),10);
    this.direction = dir;
    this.id = 'FlipFlip' + uniqueIdCounter;
    uniqueIdCounter++;
    this.scope = scope;
    this.element = new Element(x, y, "FlipFlip", 40, this);
    this.clockInp = new Node(-20, -10, 0, this,1);
    this.dInp = new Node(-20, +10, 0, this);
    this.qOutput = new Node(20, -10, 1, this);
    this.masterState = 0;
    this.slaveState = 0;
    this.prevClockState = 0;
    scope.flipflops.push(this);
    this.wasClicked = false;
    this.nodeList=[[this.clockInp,this.dInp,this.qOutput]];
    this.newBitWidth=function(bitWidth){
        this.bitWidth=bitWidth;
        this.dInp.bitWidth=bitWidth;
        this.qOutput.bitWidth=bitWidth;
    }
    this.isResolvable = function() {
        return true;
    }
    this.resolve = function() {
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
    this.output1 = new Node(10, 0, 1, this,1);
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
