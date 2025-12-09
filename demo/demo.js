let defaultStylesheet = [
  {
    selector: 'node',
    style: {
      'text-wrap': 'wrap',
    }
  }
];

let stylesheetCheminfo = [
  {
    selector: 'node',
    style: {
      'background-color': '#f032e6',
      'width': 60,
      'height': 30,
      'shape': 'rectangle'
    }
  },
  {
    selector: 'edge',
    style: {
      'line-color': '#f032e6'
    }
  }
];


let stylesheetCrime = [
  {
    selector: 'node',
    style: {
      'background-color': '#911eb4',
    }
  },
  {
    selector: 'edge',
    style: {
      'line-color': '#911eb4'
    }
  }
];

let stylesheetRome = [
  {
    selector: 'node',
    style: {
      'background-color': '#e6194B',
    }
  },
  {
    selector: 'edge',
    style: {
      'line-color': '#e6194B'
    }
  }
];

let stylesheetWater = [
  {
    selector: 'node',
    style: {
      'background-color': '#1BA1E2',
      'width': 60,
      'height': 30,
      'shape': 'rectangle',
      'border-width': '1px',
      'border-color': 'darkblue',
      'text-valign': 'center',
      'label': 'data(label)',
      'text-wrap': 'wrap' 
    }
  },
  {
    selector: 'node:selected, edge:selected',
    style: {
      'underlay-color': '#FFCCCB',
      'underlay-padding': '5px',
      'underlay-opacity': '1'
    }
  },
  {
    selector: 'edge',
    style: {
      'line-color': 'lightblue'
    }
  }
];

let cy1 = window.cy1 = cytoscape({
  container: document.getElementById('cy1'),
  style: defaultStylesheet,
  elements: sample0,
/*   layout: {name: "fcose", idealEdgeLength: 75}, */
});

let cy2 = window.cy2 = cytoscape({
  container: document.getElementById('cy2'),
  style: defaultStylesheet
});

cy1.layout({ name: "fcose", animate: true, animationDuration: 500, stop: () => {
  cy2.add(sample0);
  cy2.layout({ name: "preset", positions: (node) => {return cy1.getElementById(node.id()).position()}, animate: false, animationDuration: 500 }).run();
}}).run();

// Sample File Changer
let sampleFileNames = {
  "sample1" : sample1,
  "sample2" : sample2,
  "sample3" : sample3,
  "sample4" : sample4,    
  "sample5" : sample5,
  "water_network" : water_network,
  "glycolysis" : glycolysis,
  "tca_cycle" : tca_cycle,
  "cheminfo" : cheminfo,
  "crime" : crime,
  "rome" : rome
};

let sampleName = "";

// file operations - samples
document.getElementById("samples").addEventListener("change", function (event) {
  let sample = event.target.value;
  let json = sampleFileNames[sample];
  sampleName = sample;

  loadSample(json, sample);
});

let loadSample = function (json, sampleName) {
  cy1.remove(cy1.elements());
  cy2.remove(cy2.elements());

  if (sampleName && (sampleName == "glycolysis" || sampleName == "tca_cycle")) {
    if (sampleName == "glycolysis"){
      cy1.style(cytoscapeSbgnStylesheet(cytoscape, "bluescale"));
      cy2.style(cytoscapeSbgnStylesheet(cytoscape, "bluescale"));
    } else {
      cy1.style(cytoscapeSbgnStylesheet(cytoscape, "purple_green"));
      cy2.style(cytoscapeSbgnStylesheet(cytoscape, "purple_green"));
    }
    cy1.json({ elements: json });
    cy2.json({ elements: json });
    cy1.nodes().forEach(node => {
      if (!node.data('stateVariables'))
        node.data('stateVariables', []);
      if (!node.data('unitsOfInformation'))
        node.data('unitsOfInformation', []);
    });
    cy2.nodes().forEach(node => {
      if (!node.data('stateVariables'))
        node.data('stateVariables', []);
      if (!node.data('unitsOfInformation'))
        node.data('unitsOfInformation', []);
    });
    document.getElementById('idealEdgeLength').value = 200;
  } else if (sampleName && sampleName == "cheminfo") {
    cy1.style(stylesheetCheminfo);
    cy1.json({ elements: json });
    cy2.style(stylesheetCheminfo);
    cy2.json({ elements: json });
  } else if (sampleName && sampleName == "crime") {
    cy1.style(stylesheetCrime);
    cy1.json({ elements: json });
    cy2.style(stylesheetCrime);
    cy2.json({ elements: json });
  } else if (sampleName && sampleName == "rome") {
    cy1.style(stylesheetRome);
    cy1.json({ elements: json });
    cy2.style(stylesheetRome);
    cy2.json({ elements: json });
  } else if (sampleName && sampleName == "water_network") {
    cy1.style(stylesheetWater);
    cy1.json({ elements: json });
    cy2.style(stylesheetWater);
    cy2.json({ elements: json });
  } else {
    cy1.style(defaultStylesheet);
    cy1.json({ elements: json });
    cy2.style(defaultStylesheet);
    cy2.json({ elements: json });
  }

  cy1.layout({ name: "fcose", animate: true, animationDuration: 500, stop: () => {
    cy2.layout({ name: "preset", positions: (node) => {return cy1.getElementById(node.id()).position()}, animate: true, animationDuration: 500 }).run();
  }}).run();
};

// file operations - file upload
document.getElementById("openFile").addEventListener("click", function () {
  document.getElementById("inputFile").click();
});

document.getElementById("inputFile").addEventListener("change", function (e) {
  let file = e.target.files[0];
  if (!file) {
    alert("Failed to load file");
  }
  let content = e.target.result;
  let fileExtension = file.name.split('.').pop();
  let reader = new FileReader();
  reader.onload = function (e) {
    inputFileHelper(cy1, content, fileExtension);
    //inputFileHelper(cy2, content, fileExtension);
  };
  reader.readAsText(file);
  document.getElementById("inputFile").value = null;
  document.getElementById("samples").value = "";
});

let inputFileHelper = function(cy, content, fileExtension){
  cy.remove(cy.elements());
  if (fileExtension == "graphml" || fileExtension == "xml") {
    cy.graphml({ layoutBy: 'fcose' });
    cy.style(defaultStylesheet);
    cy.graphml(content);
    cy.nodes().forEach((node, i) => {
      node.data("fakeID", "n" + i);
    });
  } else if (fileExtension == "json") {
    cy.json({elements: JSON.parse(content)});
    cy.style(defaultStylesheet);
    cy.nodes().forEach((node, i) => {
      node.data("fakeID", "n" + i);
    });
    cy.layout({name: "fcose"}).run();
  } else { 
    let lines = content.split('\n');
    let nodesSet = new Set();
    for (let line = 0; line < lines.length; line++) {
      let nodes = lines[line].split(' ');
      if(!nodesSet.has(nodes[0])){
        let node1 = cy.add([
          { group: 'nodes', data: { id: nodes[0] }, position: { x: 100, y: 100 } }
        ]);
        nodesSet.add(nodes[0]);
      }
      if(!nodesSet.has(nodes[1])){
        let node1 = cy.add([
          { group: 'nodes', data: { id: nodes[1] }, position: { x: 100, y: 100 } }
        ]);
        nodesSet.add(nodes[1]);
      }
    }
    for (let line = 0; line < lines.length; line++) {
      let nodes = lines[line].split(' ');
      let node1 = cy.getElementById(nodes[0]);
      let node2 = cy.getElementById(nodes[1]);
      let edge = cy.add([
        { group: 'edges', data: { id: nodes[0] + '_' + nodes[1], source: node1.id(), target: node2.id() } }
      ]);
    }
  }
};

// file operations - image download
/* document.getElementById("savePNG").addEventListener("click", function () {
  let pngContent = cy.png({ output: "blob", scale: 2, bg: "#ffffff", full: false });
  saveAs(pngContent, "graph.png");
});

document.getElementById("saveJPG").addEventListener("click", function () {
  let jpgContent = cy.jpg({ output: "blob", scale: 2, full: false });
  saveAs(jpgContent, "graph.jpg");
});

document.getElementById("saveSVG").addEventListener("click", function () {
  let svgContent = cy.svg({scale: 2, full: false});
  let blob = new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"});
  saveAs(blob, "graph.svg");
}); */

document.getElementById('clearButton').addEventListener('click', clearCanvas);

// layout operations
// randomize layout
document.getElementById("randomizeButton").addEventListener("click", async function () {
  cy1.layout({ name: "random", animate: true, animationDuration: 500, stop: () => {
    cy2.layout({ name: "preset", positions: (node) => {return cy1.getElementById(node.id()).position()}, animate: true, animationDuration: 500 }).run();
  }}).run();
});

// user-guided layout 
document.getElementById("layoutButton").addEventListener("click", async function () {
  document.getElementById("layoutButton").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="sr-only"> Processing...</span>';
  document.getElementById("layoutButton").disabled = true;

  let applyPolishing = document.getElementById('applyPolishing').checked;
  let idealEdgeLength = parseFloat(document.getElementById('idealEdgeLength').value);
  let slopeThreshold = parseFloat(document.getElementById("slopeThreshold").value);
  let connectionTolerance = parseInt(document.getElementById("connectionTolerance").value);
  let imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  let subset = undefined;
  if (cy1.elements(':selected').length > 0) {
    subset = cy1.elements(':selected');
  }

  let result = await sketchLay.generateConstraints({cy: cy1, imageData: imageData, subset: subset, idealEdgeLength: idealEdgeLength, slopeThreshold: slopeThreshold, connectionTolerance: connectionTolerance});
  let constraints = result.constraints;
  let applyIncremental = result.applyIncremental;

  await applyLayoutFcose(cy1, constraints, applyIncremental, applyPolishing);
  setTimeout(async function() {
    await applyLayoutCola(cy2, constraints, applyIncremental, applyPolishing);
  }, 1600); 
});

async function applyLayoutFcose(cy, constraints, applyIncremental, applyPolishing) {
  let randomize = true;
  let initialEnergyOnIncremental = 0.3;

  // if there are selected elements, apply incremental layout on selected elements
  if (cy.elements(':selected').length > 0) {
    randomize = false;
    initialEnergyOnIncremental = 0.1;
  }

  let idealEdgeLength;
  // apply different ideal edge length for these samples
  if (sampleName == "glycolysis" || sampleName == "tca_cycle"){
    idealEdgeLength = function(edge) {
      if(edge.source().degree() == 1 || edge.target().degree() == 1) {
        return 75;
      } else {
        return parseFloat(document.getElementById('idealEdgeLength').value);
      }
    };
  } else {
    idealEdgeLength = parseFloat(document.getElementById('idealEdgeLength').value);
  }

  try {
    callFcoseLayout(cy, randomize, idealEdgeLength, initialEnergyOnIncremental, constraints, applyIncremental, applyPolishing);
  } catch (error) {
    alert("Couldn't process constraints! Please try again!");
  }
}


async function applyLayoutCola(cy, constraints, applyIncremental, applyPolishing) {
  let randomize = true;
  let initialEnergyOnIncremental = 0.3;

  // if there are selected elements, apply incremental layout on selected elements
  if (cy.elements(':selected').length > 0) {
    randomize = false;
    initialEnergyOnIncremental = 0.1;
  }

  let idealEdgeLength;
  // apply different ideal edge length for these samples
  if (sampleName == "glycolysis" || sampleName == "tca_cycle"){
    idealEdgeLength = function(edge) {
      if(edge.source().degree() == 1 || edge.target().degree() == 1) {
        return 75;
      } else {
        return parseFloat(document.getElementById('idealEdgeLength').value);
      }
    };
  } else {
    idealEdgeLength = parseFloat(document.getElementById('idealEdgeLength').value);
  }

  try {
    let constraintsCoLa = convertToColaConstraints(cy, constraints);  // convert constraints to CoLa format
    callColaLayout(cy, randomize, idealEdgeLength, initialEnergyOnIncremental, constraintsCoLa, applyIncremental, applyPolishing);
  } catch (error) {
    alert("Couldn't process constraints! Please try again!");
  }
}

function convertToColaConstraints(cy, constraints) {
  let colaConstraints = {};
  // process alignment constraints - first vertical then horizontal
  let alignmentConstraintExist = false;
  if (constraints.alignmentConstraint && (constraints.alignmentConstraint.vertical || constraints.alignmentConstraint.horizontal)) {
    colaConstraints.alignment = {};
    alignmentConstraintExist = true;
  }
  if (alignmentConstraintExist) {
    if (constraints.alignmentConstraint.vertical) {
      colaConstraints.alignment.vertical = [];
      constraints.alignmentConstraint.vertical.forEach(verticalAlignment => {
        let colaVerticalAlignment = [];
        verticalAlignment.forEach(nodeId => {
          colaVerticalAlignment.push({node: cy.getElementById(nodeId)});
        });
        colaConstraints.alignment.vertical.push(colaVerticalAlignment);
      });
    }

    if (constraints.alignmentConstraint.horizontal) {
      colaConstraints.alignment.horizontal = [];
      constraints.alignmentConstraint.horizontal.forEach(horizontalAlignment => {
        let colaHorizontalAlignment = [];
        horizontalAlignment.forEach(nodeId => {
          colaHorizontalAlignment.push({node: cy.getElementById(nodeId)});
        });
        colaConstraints.alignment.horizontal.push(colaHorizontalAlignment);
      });
    }
  }

  // process relative placement constraints
  if (constraints.relativePlacementConstraint) {
    colaConstraints.gapInequalities = [];
    constraints.relativePlacementConstraint.forEach(constraint => {
      let colaConstraint;  
      if (constraint.left) {
        colaConstraint = {"axis": "x", "left": cy.getElementById(constraint.left), "right": cy.getElementById(constraint.right), "gap": constraint.gap? constraint.gap : cy.getElementById(constraint.left).width() / 2 + cy.getElementById(constraint.right).width() / 2 + 50, "equality": false};
      } else {
        colaConstraint = {"axis": "y", "left": cy.getElementById(constraint.top), "right": cy.getElementById(constraint.bottom), "gap": constraint.gap? constraint.gap : cy.getElementById(constraint.top).height() / 2 + cy.getElementById(constraint.bottom).height() / 2 + 50, "equality": false};
      }
      colaConstraints.gapInequalities.push(colaConstraint);
    });
  }

  // process fixed node constraints - cola gets fixed nodes by looking their locked status
  if (constraints.fixedNodeConstraint) {
    constraints.fixedNodeConstraint.forEach(constraint => {
      cy.getElementById(constraint.nodeId).lock();
    });
  }

  return colaConstraints;
}

function callFcoseLayout(cy, randomize, idealEdgeLength, initialEnergyOnIncremental, constraints, applyIncremental, applyPolishing) {
  cy.layout({
    name: "fcose",
    randomize: randomize,
    idealEdgeLength: idealEdgeLength,
    animationDuration: 1000,
    fixedNodeConstraint: constraints.fixedNodeConstraint.length != 0 ? constraints.fixedNodeConstraint : undefined,
    relativePlacementConstraint: constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined,
    alignmentConstraint: constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined,
    initialEnergyOnIncremental: initialEnergyOnIncremental,
    stop: () => {      
      if (applyIncremental && applyPolishing) {
        cy.layout({
          name: "fcose",
          randomize: false,
          animationDuration: 500,
          idealEdgeLength: idealEdgeLength,
          fixedNodeConstraint: constraints.fixedNodeConstraint.length != 0 ? constraints.fixedNodeConstraint : undefined,
          initialEnergyOnIncremental: 0.05
        }).run();
      }
    }
  }).run();
};

function callColaLayout(cy, randomize, idealEdgeLength, initialEnergyOnIncremental, constraints, applyIncremental, applyPolishing) {
  cy.layout({
    name: "cola",
    randomize: randomize,
    animate: true,
    handleDisconnected: false,
    maxSimulationTime: 1500,
    convergenceThreshold: 0.01,
    //nodeSpacing: 20,
    edgeLength: idealEdgeLength,
    alignment: constraints.alignment,
    gapInequalities: constraints.gapInequalities,
    unconstrIter: 10,
    userConstIter: 15,
    allConstIter: 20,
    stop: () => {
      if (applyIncremental && applyPolishing) {
        cy.layout({
          name: "cola",
          randomize: false,
          animate: true,
          handleDisconnected: false,
          maxSimulationTime: 500,
          convergenceThreshold: 0.01,
          //nodeSpacing: 20,
          edgeLength: idealEdgeLength,
          //alignment: constraints.alignment,
          gapInequalities: constraints.gapInequalities,
          allConstIter: 1
        }).run();
      }
      cy.nodes().unlock();
      document.getElementById("layoutButton").disabled = false;
      document.getElementById("layoutButton").innerHTML = 'Apply Layout';
    }
  }).run();
};

function loadImage(imagePath) {
  let ctx = canvas.getContext('2d');

  //Loading of the home test image - img1
  let img = new Image();

  //drawing of the test image - img1
  img.onload = function () {
      //draw background image
      ctx.drawImage(img, 0, 0);
  };

  img.src = imagePath;
}

document.getElementById('infoButton').addEventListener('mouseover', function() {
  document.getElementById('infoTooltip').style['visibility'] = 'visible';
});

document.getElementById('infoButton').addEventListener('mouseout', function() {
  document.getElementById('infoTooltip').style['visibility'] = 'hidden';
});

// download drawing
document.getElementById("downloadCanvas").addEventListener("click", async function () {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'drawing.png';

  link.click();
});

// download drawing
document.getElementById("uploadImage").addEventListener("click", async function () {
  loadImage("drawing.png");
});

document.getElementById("runTest").addEventListener("click", async function () {
  sketchLay.runTest();
});

cy1.on("select", (event) => {
  let evtTarget = event.target;
  cy2.getElementById(evtTarget.id()).select();
});

cy1.on("unselect", (event) => {
  let evtTarget = event.target;
  cy2.getElementById(evtTarget.id()).unselect();
});

cy2.on("select", (event) => {
  let evtTarget = event.target;
  cy1.getElementById(evtTarget.id()).select();
});

cy2.on("unselect", (event) => {
  let evtTarget = event.target;
  cy1.getElementById(evtTarget.id()).unselect();
});