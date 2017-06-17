function addAnd() {
    var a = new AndGate(200, 150, globalScope, prompt("No of inputs:"), 'left');
}

function addPower() {
    var p = new Power(200, 150);
}

function addGround() {
    var g = new Ground(200, 150);
}

function addOr() {
    var or = new OrGate(200, 150, globalScope, prompt("No of inputs:"));
}

function addNot() {
    var a = new NotGate(200, 150, globalScope, 'left');
}

function addTriState() {
    var a = new TriState(200, 150, globalScope, 'left');
}

function addInput() {
    var a = new Input(200, 150, globalScope, 'left');
}

function addOutput() {
    var a = new Output(200, 150, globalScope, 'right');
}

function addFlipflop() {
    var a = new FlipFlop(200, 150, globalScope, 'left');
}
function addTTY() {
    var a = new TTY(200, 150, globalScope, 'left');
}
function addKeyboard() {
    var a = new Keyboard(200, 150, globalScope, 'left');
}

function addMultiplexer() {
    var a = new Multiplexer(200, 150, globalScope, 'left');
}

function addClock() {
    var a = new Clock(200, 150, globalScope, 'left');
}

function addSevenSeg() {
    var a = new SevenSegDisplay(400, 150);
}

function addHexDis() {
    var a = new HexDisplay(400, 150);
}

function addAdder() {
    var a = new Adder(400, 150, globalScope, 'left');
}

function addRam() {
    var a = new Ram(400, 150, globalScope, 'left');
}

function addSubCircuit() {
    var a = new SubCircuit(400, 150);
}

function addSplitter() {
    var a = new Splitter(400, 400, globalScope, 'left');
}

function addBitSelector() {
    var a = new BitSelector(400, 300, globalScope, "left", bitWidth = undefined,selectorBitWidth=undefined)
}

function addConstantVal() {
    var a = new ConstantVal(200, 150, globalScope, 'left');
}
function addNand(){
    var a = new NandGate(200, 150, globalScope, prompt("No of inputs:"), 'left');
}
function plot()
{
  c = document.getElementById("plot"),
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  setTimeout(function(){
    context.clearRect(0,0,c.width,c.height);
  },10000);
  context = c.getContext("2d");
  context.fillStyle = 'black';
  context.fillRect(0, 0, c.width, c.height);
  context.fillStyle = 'white';
  context.fillRect(0, 0, c.width, 30);
  var time = simulationArea.timePlot;
  context.font="20px Georgia";
  context.fillStyle = 'black';
  context.fillText("Time",2,20);
  for(var i=1;i<10;i++)
  {
    context.fillText(Math.round(time/10)*i+"ms",(c.width-30)/10*i+30,20);
  }
  for(var i=0;i<globalScope.outputs.length;i++)
  {
    context.moveTo(30,2*(30+i*15));
    var arr=globalScope.outputs[i].plotValue;
    arr.push([time,arr[arr.length-1][1]])
      for(var j=0;j<globalScope.outputs[i].plotValue.length-1;j++)
      {
          context.strokeStyle = 'white';
          if(globalScope.outputs[i].plotValue[j][1]==1 && globalScope.outputs[i].bitWidth==1)
          {
            context.lineTo(30+(arr[j][0]/time)*(c.width-30),2*(25+i*15));
            context.lineTo(30+(arr[j+1][0]/time)*(c.width-30),2*(25+i*15));
            context.lineTo(30+(arr[j+1][0]/time)*(c.width-30),2*(30+i*15));
            context.stroke();
          }
          else if(globalScope.outputs[i].bitWidth==1) {
            context.lineTo(30+(arr[j+1][0]/time)*(c.width-30),2*(30+i*15));
            context.stroke();
          }
          else {
            context.moveTo(30+(arr[j+1][0]/time)*(c.width-30),55+30*i);
            context.lineTo(30+(arr[j+1][0]/time)*(c.width-30)-10,2*(25+i*15));
            context.lineTo(30+(arr[j][0]/time)*(c.width-30)+10,2*(25+i*15));
            context.lineTo(30+(arr[j][0]/time)*(c.width-30),55+30*i);
            context.lineTo(30+(arr[j][0]/time)*(c.width-30)+10,2*(30+i*15));
            context.lineTo(30+(arr[j+1][0]/time)*(c.width-30)-10,2*(30+i*15));
            context.lineTo(30+(arr[j+1][0]/time)*(c.width-30),55+30*i);
            mid = (60+((arr[j+1][0]+arr[j][0])/time)*(c.width-30))/2;
            context.font="12px Georgia";
            context.fillStyle = 'yellow';
            context.fillText(arr[j][1],mid,57+30*i);
            context.stroke();
          }
      }
  }

}

document.getElementById("powerButton").addEventListener("click", addPower);
document.getElementById("bitSelectorButton").addEventListener("click", addBitSelector);
document.getElementById("groundButton").addEventListener("click", addGround);
document.getElementById("andButton").addEventListener("click", addAnd);
document.getElementById("multiplexerButton").addEventListener("click", addMultiplexer);
document.getElementById("orButton").addEventListener("click", addOr);
document.getElementById("notButton").addEventListener("click", addNot);
document.getElementById("triStateButton").addEventListener("click", addTriState);
document.getElementById("inputButton").addEventListener("click", addInput);
document.getElementById("outputButton").addEventListener("click", addOutput);
document.getElementById("adderButton").addEventListener("click", addAdder);
document.getElementById("ramButton").addEventListener("click", addRam);
document.getElementById("clockButton").addEventListener("click", addClock);
document.getElementById("flipflopButton").addEventListener("click", addFlipflop);
document.getElementById("TTYButton").addEventListener("click", addTTY);
document.getElementById("sevenSegButton").addEventListener("click", addSevenSeg);
document.getElementById("hexButton").addEventListener("click", addHexDis);
document.getElementById("subCircuitButton").addEventListener("click", addSubCircuit);
document.getElementById("saveButton").addEventListener("click", Save);
document.getElementById("splitterButton").addEventListener("click", addSplitter);
document.getElementById("constantValButton").addEventListener("click", addConstantVal);
document.getElementById("NAND").addEventListener("click", addNand);
document.getElementById("keyboardButton").addEventListener("click", addKeyboard);
document.getElementById("plotButton").addEventListener("click", plot);
