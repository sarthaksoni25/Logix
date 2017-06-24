//helper fn
function extract(obj) {
    return obj.saveObject();
}

//fn to create save data
function backUp() {
    var data = {};
    data["allNodes"] = globalScope.allNodes.map(extract);

    for (var i = 0; i < moduleList.length; i++) {
        data[moduleList[i]] = globalScope[moduleList[i]].map(extract);
    }


    data["nodes"] = []
    for (var i = 0; i < globalScope.nodes.length; i++)
        data["nodes"].push(globalScope.allNodes.indexOf(globalScope.nodes[i]));
    // console.log(data);
    return data

}

function Save() {
    var data = backUp();
    data["title"] = prompt("EnterName:");
    data["timePeriod"] = simulationArea.timePeriod;

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

function loadModule(data, scope) {
    console.log(data);
    obj = new window[data["objectType"]](data["x"], data["y"], scope, ...data.customData["constructorParamaters"] || []);
    obj.label = data["label"];
    obj.labelDirection = data["labelDirection"] || oppositeDirection[fixDirection[obj.direction]];
    obj.fixDirection();
    if (data.customData["values"])
        for (prop in data.customData["values"]) {
            obj[prop] = data.customData["values"][prop];
        }
    if (data.customData["nodes"])
        for (node in data.customData["nodes"]) {
            var n = data.customData["nodes"][node]
            if (n instanceof Array) {
                for (var i = 0; i < n.length; i++) {
                    obj[node][i] = replace(obj[node][i], n[i]);
                }
            } else {
                obj[node] = replace(obj[node], n);
            }
        }

}

function load(scope, data) {
    // console.log(data);
    data["allNodes"].map(function(x) {
        return loadNode(x, scope)
    });

    for (var i = 0; i < data["allNodes"].length; i++)
        constructNodeConnections(scope.allNodes[i], data["allNodes"][i]);

    for (var i = 0; i < moduleList.length; i++) {
        if (data[moduleList[i]]) {
            if (moduleList[i] == "SubCircuit") {
                for (var j = 0; j < data[moduleList[i]].length; j++)
                    loadSubCircuit(data[moduleList[i]][j], scope);
            } else {
                for (var j = 0; j < data[moduleList[i]].length; j++)
                    loadModule(data[moduleList[i]][j], scope);
            }
        }
    }

    scope.wires.map(function(x) {
        x.updateData()
    });
}
