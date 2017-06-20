//helper fn
function extract(obj) {
    return obj.saveObject();
}

//fn to create save data
function backUp(){
        var data={};
        data["inputs"] = globalScope.inputs.map(extract);
        data["constants"] = globalScope.constants.map(extract);
        data["TTYs"] = globalScope.TTYs.map(extract);
        data["keyboards"] = globalScope.keyboards.map(extract);
        data["bitSelectors"] = globalScope.bitSelectors.map(extract);
        data["outputs"] = globalScope.outputs.map(extract);
        data["allNodes"] = globalScope.allNodes.map(extract);
        data["andGates"] = globalScope.andGates.map(extract);
        data["orGates"] = globalScope.orGates.map(extract);
        data["multiplexers"] = globalScope.multiplexers.map(extract);
        data["adders"] = globalScope.adders.map(extract);
        data["splitters"] = globalScope.splitters.map(extract);
        data["notGates"] = globalScope.notGates.map(extract);
        data["triStates"] = globalScope.triStates.map(extract);
        data["rams"] = globalScope.rams.map(extract);
        data["sevenseg"] = globalScope.sevenseg.map(extract);
        data["hexdis"] = globalScope.hexdis.map(extract);
        data["grounds"] = globalScope.grounds.map(extract);
        data["powers"] = globalScope.powers.map(extract);
        data["clocks"] = globalScope.clocks.map(extract);
        data["flipflops"] = globalScope.flipflops.map(extract);
        data["subCircuits"] = globalScope.subCircuits.map(extract);
        data["NandGates"] = globalScope.nandGates.map(extract);

        data["norGates"] = globalScope.norGates.map(extract);


        data["XorGates"]=globalScope.xorGates.map(extract);
        data["XnorGates"]=globalScope.xnorGates.map(extract);


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
