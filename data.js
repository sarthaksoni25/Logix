//helper fn
function extract(obj) {
    return obj.saveObject();
}

//fn to create save data
function backUp(){
        var data={};
        data["allNodes"] = globalScope.allNodes.map(extract);

        for(var i=0;i<moduleList.length;i++){
            data[moduleList[i]]=globalScope[moduleList[i]].map(extract);
        }


        data["nodes"] = []
        for (var i = 0; i < globalScope.nodes.length; i++)
            data["nodes"].push(globalScope.allNodes.indexOf(globalScope.nodes[i]));
        // console.log(data);
        return data

}

function Save() {
    var data=backUp();
    data["title"]=prompt("EnterName:");
    data["timePeriod"]=simulationArea.timePeriod;

    //covnvert to text
    data = JSON.stringify(data)
    console.log(data);

    var http = new XMLHttpRequest();
    http.open("POST", "./index.php", true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var params = "data=" + data; // send the data
    http.send(params);
    http.onload = function() {
        window.location.hash = http.responseText; // assign hash key
    }
}

function loadModule(data,scope){
    console.log(data);
    obj=new window[data["objectType"]](data["x"],data["y"],scope,...data.customData["constructorParamaters"]||[]);
    if(data.customData["values"])
    for(prop in data.customData["values"]){
        obj[prop]=data.customData["values"][prop];
    }
    if(data.customData["nodes"])
    for(node in data.customData["nodes"]){
        var n=data.customData["nodes"][node]
        if(n instanceof Array){
            for(var i=0;i<n.length;i++){
                obj[node][i]=replace(obj[node][i], n[i]);
            }
        }
        else{
            obj[node]=replace(obj[node], n);
        }
    }
}

function load(scope,data){
    // console.log(data);
    data["allNodes"].map(function(x) {
        return loadNode(x, scope)
    });

    for (var i = 0; i < data["allNodes"].length; i++)
        constructNodeConnections(scope.allNodes[i], data["allNodes"][i]);

    for(var i=0;i<moduleList.length;i++){
        if(data[moduleList[i]]){
            if(moduleList[i]=="SubCircuit"){
                for(var j=0;j<data[moduleList[i]].length;j++)
                    loadSubCircuit(data[moduleList[i]][j],scope);
            }else{
            for(var j=0;j<data[moduleList[i]].length;j++)
                loadModule(data[moduleList[i]][j],scope);
            }
        }
    }

    scope.wires.map(function(x) {
        x.updateData()
    });
}

function load3(scope, data) {

    data["allNodes"].map(function(x) {
        return loadNode(x, scope)
    });
    for (var i = 0; i < data["allNodes"].length; i++)
        constructNodeConnections(scope.allNodes[i], data["allNodes"][i]);
    if (data["inputs"]) data["inputs"].map(function(x) {
        return loadInput(x, scope);
    });
    if (data["constants"]) data["constants"].map(function(x) {
        return loadConstantVal(x, scope);
    });
    if (data["TTYs"]) data["TTYs"].map(function(x) {
        return loadTTY(x, scope);
    });
    if (data["keyboards"]) data["keyboards"].map(function(x) {
        return loadKeyboard(x, scope);
    });
    if (data["bitSelectors"]) data["bitSelectors"].map(function(x) {
        return loadBitSelector(x, scope);
    });
    if (data["outputs"]) data["outputs"].map(function(x) {
        return loadOutput(x, scope);
    });
    if (data["NandGates"]) data["NandGates"].map(function(x) {
        return loadNand(x, scope);
    });
    if (data["andGates"]) data["andGates"].map(function(x) {
        return loadAnd(x, scope);
    });
    if (data["multiplexers"]) data["multiplexers"].map(function(x) {
        return loadMultiplexer(x, scope);
    });
    if (data["rams"]) data["rams"].map(function(x) {
        return loadRam(x, scope);
    });
    if (data["splitters"]) data["splitters"].map(function(x) {
        return loadSplitter(x, scope);
    });
    if (data["adders"]) data["adders"].map(function(x) {
        return loadAdder(x, scope);
    });
    if (data["clocks"]) data["clocks"].map(function(x) {
        return loadClock(x, scope);
    });
    if (data["flipflops"]) data["flipflops"].map(function(x) {
        return loadFlipFlop(x, scope);
    });
    if (data["orGates"]) data["orGates"].map(function(x) {
        return loadOr(x, scope);
    });
    if (data["notGates"]) data["notGates"].map(function(x) {
        return loadNot(x, scope);
    });
    if (data["triStates"]) data["triStates"].map(function(x) {
        return loadTriState(x, scope);

    });
    if (data["sevenseg"]) data["sevenseg"].map(function(x) {
        return loadSevenSegmentDisplay(x, scope);
    });
    if (data["hexdis"]) data["hexdis"].map(function(x) {
        return loadHexDisplay(x, scope);
    });
    if (data["powers"]) data["powers"].map(function(x) {
        return loadPower(x, scope);
    });
    if (data["grounds"]) data["grounds"].map(function(x) {
        return loadGround(x, scope);
    });
    if (data["subCircuits"]) data["subCircuits"].map(function(x) {
        return loadSubCircuit(x, scope);
    });

    if (data["norGates"]) data["norGates"].map(function(x) {
        return loadNor(x, scope);
    });
    if (data["XorGates"]) data["XorGates"].map(function(x) {
        return loadXor(x, scope);
    });
    if (data["XnorGates"]) data["XnorGates"].map(function(x) {
        return loadXnor(x, scope);

    });
    scope.wires.map(function(x) {
        x.updateData()
    });
}


//fn to load from data
function load2(scope, data) {

    data["allNodes"].map(function(x) {
        return loadNode(x, scope)
    });
    for (var i = 0; i < data["allNodes"].length; i++)
        constructNodeConnections(scope.allNodes[i], data["allNodes"][i]);

    if (data["Input"]) data["Input"].map(function(x) {
        return loadInput(x, scope);
    });
    if (data["ConstantVal"]) data["ConstantVal"].map(function(x) {
        return loadConstantVal(x, scope);
    });
    if (data["TTY"]) data["TTY"].map(function(x) {
        return loadTTY(x, scope);
    });
    if (data["Keyboard"]) data["Keyboard"].map(function(x) {
        return loadKeyboard(x, scope);
    });
    if (data["BitSelector"]) data["BitSelector"].map(function(x) {
        return loadBitSelector(x, scope);
    });
    if (data["Output"]) data["Output"].map(function(x) {
        return loadOutput(x, scope);
    });
    if (data["NandGate"]) data["NandGate"].map(function(x) {
        return loadNand(x, scope);
    });
    if (data["AndGate"]) data["AndGate"].map(function(x) {
        return loadAnd(x, scope);
    });
    if (data["Multiplexer"]) data["Multiplexer"].map(function(x) {
        return loadMultiplexer(x, scope);
    });
    if (data["Ram"]) data["Ram"].map(function(x) {
        return loadRam(x, scope);
    });
    if (data["Splitter"]) data["Splitter"].map(function(x) {
        return loadSplitter(x, scope);
    });
    if (data["Adder"]) data["Adder"].map(function(x) {
        return loadAdder(x, scope);
    });
    if (data["Clock"]) data["Clock"].map(function(x) {
        return loadClock(x, scope);
    });
    if (data["FlipFlop"]) data["FlipFlop"].map(function(x) {
        return loadFlipFlop(x, scope);
    });
    if (data["OrGate"]) data["OrGate"].map(function(x) {
        return loadOr(x, scope);
    });
    if (data["NotGate"]) data["NotGate"].map(function(x) {
        return loadNot(x, scope);
    });
    if (data["TriState"]) data["TriState"].map(function(x) {
        return loadTriState(x, scope);

    });
    if (data["SevenSegDisplay"]) data["SevenSegDisplay"].map(function(x) {
        return loadSevenSegmentDisplay(x, scope);
    });
    if (data["HexDisplay"]) data["HexDisplay"].map(function(x) {
        return loadHexDisplay(x, scope);
    });
    if (data["Power"]) data["Power"].map(function(x) {
        return loadPower(x, scope);
    });
    if (data["Ground"]) data["Ground"].map(function(x) {
        return loadGround(x, scope);
    });
    if (data["SubCircuit"]) data["SubCircuit"].map(function(x) {
        return loadSubCircuit(x, scope);
    });

    if (data["NorGate"]) data["NorGate"].map(function(x) {
        return loadNor(x, scope);
    });
    if (data["XorGate"]) data["XorGate"].map(function(x) {
        return loadXor(x, scope);
    });
    if (data["XnorGate"]) data["XnorGate"].map(function(x) {
        return loadXnor(x, scope);

    });
    scope.wires.map(function(x) {
        x.updateData()
    });
}
