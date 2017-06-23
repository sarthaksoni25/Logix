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

        // data["inputs"] = globalScope.inputs.map(extract);
        // data["constants"] = globalScope.constants.map(extract);
        // data["TTYs"] = globalScope.TTYs.map(extract);
        // data["keyboards"] = globalScope.keyboards.map(extract);
        // data["bitSelectors"] = globalScope.bitSelectors.map(extract);
        // data["outputs"] = globalScope.outputs.map(extract);
        //
        // data["andGates"] = globalScope.andGates.map(extract);
        // data["orGates"] = globalScope.orGates.map(extract);
        // data["multiplexers"] = globalScope.multiplexers.map(extract);
        // data["adders"] = globalScope.adders.map(extract);
        // data["splitters"] = globalScope.splitters.map(extract);
        // data["notGates"] = globalScope.notGates.map(extract);
        // data["triStates"] = globalScope.triStates.map(extract);
        // data["rams"] = globalScope.rams.map(extract);
        // data["sevenseg"] = globalScope.sevenseg.map(extract);
        // data["hexdis"] = globalScope.hexdis.map(extract);
        // data["grounds"] = globalScope.grounds.map(extract);
        // data["powers"] = globalScope.powers.map(extract);
        // data["clocks"] = globalScope.clocks.map(extract);
        // data["flipflops"] = globalScope.flipflops.map(extract);
        // data["subCircuits"] = globalScope.subCircuits.map(extract);
        // data["NandGates"] = globalScope.nandGates.map(extract);
        //
        // data["norGates"] = globalScope.norGates.map(extract);


        // data["XorGates"]=globalScope.xorGates.map(extract);
        // data["XnorGates"]=globalScope.xnorGates.map(extract);


        data["nodes"] = []
        for (var i = 0; i < globalScope.nodes.length; i++)
            data["nodes"].push(globalScope.allNodes.indexOf(globalScope.nodes[i]));
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


//fn to load from data
function load(scope, data) {

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
