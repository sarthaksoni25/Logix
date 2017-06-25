//wire object
function Wire(node1, node2, scope) {

    this.objectType = "Wire";
    //if data changes
    this.updateData = function() {
        this.node1 = node1;
        this.scope = scope;
        this.node2 = node2;
        this.type = "horizontal";
        this.x1 = this.node1.absX();
        this.y1 = this.node1.absY();
        this.x2 = this.node2.absX();
        this.y2 = this.node2.absY();
        if (this.x1 == this.x2) this.type = "vertical";
    }

    this.updateData();
    this.scope.wires.push(this);

    //to check if nodes are disconnected
    this.checkConnections = function() {
        var check = !node1.connections.contains(node2) || !node2.connections.contains(node1);
        if (check) this.delete();
        return check;
    }


    this.update = function() {

        if(this.node1.absX()==this.node2.absX()){
            this.x1=this.x2=this.node1.absX();
            this.type="vertical";
        }
        else if(this.node1.absY()==this.node2.absY()){
            this.y1=this.y2=this.node1.absY();
            this.type="horizontal";
        }

        var updated = false;
        if (wireToBeChecked && this.checkConnections()) {
            this.delete();
            return;
        } // SLOW , REMOVE
        if (simulationArea.shiftDown==false&&simulationArea.mouseDown == true && simulationArea.selected == false && this.checkWithin(simulationArea.mouseDownX, simulationArea.mouseDownY)) {
            simulationArea.selected = true;
            simulationArea.lastSelected = this;
            var n = new Node(simulationArea.mouseDownX, simulationArea.mouseDownY, 2, this.scope.root);
            this.converge(n);
            n.clicked = true;
            n.wasClicked = true;
            updated = true;
        }
        if (simulationArea.lastSelected == this) {
            // console.log("HITT");
        }

        if (this.node1.deleted || this.node2.deleted) this.delete(); //if either of the nodes are deleted
        if (simulationArea.mouseDown == false) {
            if (this.type == "horizontal") {
                if (node1.absY() != this.y1) {
                    // if(this.checkConnections()){this.delete();return;}
                    var n = new Node(node1.absX(), this.y1, 2, this.scope.root);
                    this.converge(n);
                    updated = true;
                } else if (node2.absY() != this.y2) {
                    // if(this.checkConnections()){this.delete();return;}
                    var n = new Node(node2.absX(), this.y2, 2, this.scope.root);
                    this.converge(n);
                    updated = true;
                }
            } else if (this.type == "vertical") {
                if (node1.absX() != this.x1) {
                    // if(this.checkConnections()){this.delete();return;}
                    var n = new Node(this.x1, node1.absY(), 2, this.scope.root);
                    this.converge(n);
                    updated = true;
                } else if (node2.absX() != this.x2) {
                    // if(this.checkConnections()){this.delete();return;}
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
        var color;
        if (this.node1.value == undefined||this.node2.value == undefined)
            color = "red";
        else if (this.node1.bitWidth == 1)
            color = ["red", "DarkGreen", "Lime"][this.node1.value + 1];
        else
            color = "black";
        drawLine(ctx, this.node1.absX(), this.node1.absY(), this.node2.absX(), this.node2.absY(), color, 3);
    }

    // checks if node lies on wire
    this.checkConvergence = function(n) {
        return this.checkWithin(n.absX(), n.absY());
    }
    // fn checks if coordinate lies on wire
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

    //add intermediate node between these 2 nodes
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
