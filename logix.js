data={};
scale=1;
var b1;
var width;
var height;
function setup() {
  width = window.innerWidth*scale;
  height = window.innerHeight*scale;
  b1=new Button(300,300,20,"rgba(255,255,255,1)", "rgba(255,255,0,1)");
  simulationArea.setup();

}


window.onresize = setup;

window.addEventListener('orientationchange', setup);

var simulationArea = {
    canvas: document.getElementById("simulationArea"),
    selected: false,
    setup: function() {
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(update, 20);
        window.addEventListener('mousemove', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseX = (e.clientX - rect.left)*scale;
            simulationArea.mouseY = (e.clientY - rect.top)*scale;
            console.log(simulationArea.mouseX,simulationArea.mouseY);
        });
        window.addEventListener('mousedown', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseDownX = (e.clientX - rect.left)*scale;
            simulationArea.mouseDownY = (e.clientY - rect.top)*scale;
            simulationArea.mouseDown = true;
        });
        window.addEventListener('touchstart', function(e) {
            var rect = simulationArea.canvas.getBoundingClientRect();

            simulationArea.mouseDownX = (e.touches[0].clientX-rect.left)*scale;
            simulationArea.mouseDownY = (e.touches[0].clientY-rect.top)*scale;
            simulationArea.mouseX = (e.touches[0].clientX- rect.left)*scale;
            simulationArea.mouseY = (e.touches[0].clientY- rect.top)*scale;
            console.log(simulationArea.mouseDownX+":"+simulationArea.mouseDownY);
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
            simulationArea.mouseDownX = (e.clientX - rect.left)*scale;
            simulationArea.mouseDownY = (e.clientY - rect.top)*scale;
            simulationArea.mouseDown = false;
        });
        window.addEventListener('touchmove', function (e) {
           var rect = simulationArea.canvas.getBoundingClientRect();
            simulationArea.mouseX = (e.touches[0].clientX- rect.left)*scale;
            simulationArea.mouseY = (e.touches[0].clientY- rect.top)*scale;
        })
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function update() {
    simulationArea.clear();
    b1.update();

}




function Button(x, y, radius, color1, color2) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color1 = color1;
    this.color2 = color2;
    this.clicked = false;

    this.update = function() {

        // console.log((this.clicked || (this.isHover() && !simulationArea.selected)));
        if (this.clicked || (this.isHover() && !simulationArea.selected)) {

            console.log("check");
            var ctx = simulationArea.context;
            ctx.fillStyle = this.color2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
        } else {

            var ctx = simulationArea.context;
            ctx.fillStyle =this.color1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.closePath();

            ctx.fill();
        }

    }
    this.updatePosition = function() {
        if (simulationArea.mouseDown && (this.clicked)) {
            this.x = simulationArea.mouseX;
            this.y = simulationArea.mouseY;
            return true;
        } else if (simulationArea.mouseDown && !simulationArea.selected) {
            simulationArea.selected = this.clicked = this.hover = this.isClicked();
            return this.clicked;
        } else {
            if (this.clicked) simulationArea.selected = false;
            this.clicked = false;
        }
        return false;
    }
    this.isClicked = function() {
        if (Math.pow(this.x - simulationArea.mouseDownX, 2) + Math.pow(this.y - simulationArea.mouseDownY, 2) < Math.pow(this.radius * 3, 2)) {
            return true;
        }
        return false;
    }
    this.isHover = function() {
        if (Math.pow(this.x - simulationArea.mouseX, 2) + Math.pow(this.y - simulationArea.mouseY, 2) < Math.pow(this.radius * 2, 2)) {
            return true;
        }
        return false;
    }
}


function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}



// document.getElementById("playButton").addEventListener("click", play);
