let defaultStylesheet = [
  {
    selector: 'node',
    style: {
      'text-wrap': 'wrap',
    }
  }
];

let cy1 = window.cy1 = cytoscape({
  container: document.getElementById('cy1'),
  style: defaultStylesheet,
  //layout: {name: "fcose", idealEdgeLength: 75}
});

let cy2 = window.cy2 = cytoscape({
  container: document.getElementById('cy2'),
  style: defaultStylesheet,
  //layout: {name: "fcose", idealEdgeLength: 75}
});

// Sample File Changer
let sampleFileNames = {
  "graph1" : graph1,
  "graph2" : graph2,
  "graph3" : graph3,
  "graph4" : graph4,    
  "graph5" : graph5,
  "graph6" : graph6
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
  cy1.json({ elements: json });
  cy2.json({ elements: json });
  cy1.layout({ "name": "random", idealEdgeLength: 75, animate: false, fit: true}).run();
  setTimeout(async function() {
    cy2.layout({ "name": "preset", idealEdgeLength: 75, fit: true}).run();
  }, 50);
};

document.getElementById('clearButton').addEventListener('click', clearCanvas);

// layout operations
// randomize layout

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

  let result = await uggly.generateConstraints({cy: cy1, imageData: imageData, subset: subset, idealEdgeLength: idealEdgeLength, slopeThreshold: slopeThreshold, connectionTolerance: connectionTolerance});
  let constraints = result.constraints;
  let applyIncremental = result.applyIncremental;

  await applyLayoutFcose(constraints, applyIncremental, applyPolishing);
  setTimeout(async function() {
    await applyLayoutCola(constraints, applyIncremental, applyPolishing);
  }, 1500);
  
  document.getElementById("layoutButton").disabled = false;
  document.getElementById("layoutButton").innerHTML = 'Apply Layout';
});

async function applyLayoutFcose(constraints, applyIncremental, applyPolishing) {
  let randomize = true;
  let initialEnergyOnIncremental = 0.3;

  let idealEdgeLength = parseFloat(document.getElementById('idealEdgeLength').value);

  // call fCoSE layout
  callFcoseLayout(randomize, idealEdgeLength, initialEnergyOnIncremental, constraints, applyIncremental, applyPolishing);
}

async function applyLayoutCola(constraints, applyIncremental, applyPolishing) {
  let randomize = true;
  let initialEnergyOnIncremental = 0.3;

  let idealEdgeLength = parseFloat(document.getElementById('idealEdgeLength').value);

  let constraintsCoLa = convertToColaConstraints(constraints);  // convert constraints to CoLa format

  // call CoLa layout
  callColaLayout(randomize, idealEdgeLength, initialEnergyOnIncremental, constraintsCoLa, applyIncremental, applyPolishing);
}

function convertToColaConstraints(constraints) {
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
          colaVerticalAlignment.push({node: cy2.getElementById(nodeId)});
        });
        colaConstraints.alignment.vertical.push(colaVerticalAlignment);
      });
    }

    if (constraints.alignmentConstraint.horizontal) {
      colaConstraints.alignment.horizontal = [];
      constraints.alignmentConstraint.horizontal.forEach(horizontalAlignment => {
        let colaHorizontalAlignment = [];
        horizontalAlignment.forEach(nodeId => {
          colaHorizontalAlignment.push({node: cy2.getElementById(nodeId)});
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
        colaConstraint = {"axis": "x", "left": cy2.getElementById(constraint.left), "right": cy2.getElementById(constraint.right), "gap": constraint.gap? constraint.gap : cy2.getElementById(constraint.left).width() / 2 + cy2.getElementById(constraint.right).width() / 2 + 50, "equality": false};
      } else {
        colaConstraint = {"axis": "y", "left": cy2.getElementById(constraint.top), "right": cy2.getElementById(constraint.bottom), "gap": constraint.gap? constraint.gap : cy2.getElementById(constraint.top).height() / 2 + cy2.getElementById(constraint.bottom).height() / 2 + 50, "equality": false};
      }
      colaConstraints.gapInequalities.push(colaConstraint);
    });
  }

  // process fixed node constraints - cola gets fixed nodes by looking their locked status
  if (constraints.fixedNodeConstraint) {
    constraints.fixedNodeConstraint.forEach(constraint => {
      cy2.getElementById(constraint.nodeId).lock();
    });
  }

  return colaConstraints;
}

function callFcoseLayout(randomize, idealEdgeLength, initialEnergyOnIncremental, constraints, applyIncremental, applyPolishing) {
  cy1.layout({
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
        cy1.layout({
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

function callColaLayout(randomize, idealEdgeLength, initialEnergyOnIncremental, constraints, applyIncremental, applyPolishing) {
  cy2.layout({
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
        cy2.layout({
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
      cy2.nodes().unlock();
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