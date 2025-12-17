# SketchLay

SketchLay is a user-guided force-directed graph layout approach that enables intuitive control over layout generation by letting users specify their desired structure through freehand sketches (e.g., rectangular, L-shaped). The method leverages a well-established image analysis technique, skeletonization (i.e., medial axis transform), to interpret the sketch and uses the extracted structural information to guide force-directed layout algorithms with placement constraint support. It works well for small to medium-sized graphs and generates visually effective layouts aligned with user intent.

Click [here](https://sciluna.github.io/sketchlay/demo/index.html) for a demo.

Here is a video tutorial:

https://github.com/user-attachments/assets/6d9c5eab-43dd-4c48-a61c-09ebe3d421a1

## Dependencies
  
  * Cytoscape.js ^3.2.0
  * [Skeleton Tracing](https://github.com/LingDong-/skeleton-tracing)
  * Simplify.js ^1.2.4
  * cytoscape-fcose ^2.2.0 (optional)
  * cytoscape-cola ^2.5.1 (optional)

## Usage instructions

Download the library:
 * via npm: `npm install sketchlay`,
 * via bower: `bower install sketchlay`, or
 * via direct download in the repository (probably from a tag).

Import the library as appropriate for your project:

ES import:

```js
import sketchLay from 'sketchlay';
```

CommonJS require:

```js
const sketchLay = require('sketchlay');
```

For plain HTML/JS, just add the following:
```
<script src="https://unpkg.com/sketchlay/dist/bundle.umd.js"></script>
```

Then to generate the required placement constraints, call 
```js
let result = await sketchLay.generateConstraints({...});
```

## API

`sketchLay.generateConstraints(options)`

To generate the required placement constraints based on the given graph and image data.

When calling the `generateConstraints` function, the following options are supported:

```js
let options = {
  // cy instance that the algorithm will apply (required)
  cy: cyInstance,
  // an ImageData object returned from CanvasRenderingContext2D: getImageData() method (required)
  imageData: imageData, 
  // a cy collection that contains graph elements that the algorithm will apply
  // if it is undefined, then algorithm applies to whole graph
  subset: undefined,
  // ideal edge length expected between adjacent nodes
  idealEdgeLength: 50,
  // slope threshold to capture the horizontal and vertical line segments more efficiently
  // higher value gives more flexibility
  slopeThreshold: 0.15, 
  // you can provide a number or a function which takes cy as the input and returns a value
  // if it is undefined, then algorithm applies 2 * Math.sqrt(|V|)
  cycleThreshold: undefined,
  // number of pixel amount to accept disconnected consecutive line segments as connected 
  // to better capture loose drawings
  connectionTolerance: 20
};
```

`generateConstraints` function returns a JS object 
```js
{
  constraints: {  // constraints compatible with fCoSE layout algorithm, they need appropriate conversion for CoLa layout
    relativePlacementConstraint: ...,
    alignmentConstraint: ...,
    fixedNodeConstraint: ...
  },
  applyIncremental: true/false  // This is a recommendation whether to apply a second incremental layout after applying a layout with constraints. (see demo)
}
```

After constraints are generated, they can be used as options in a layout algorithm with constraint support such as [fCoSE](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) and [CoLa](https://github.com/cytoscape/cytoscape.js-cola) as shown in the [demo](https://github.com/sciluna/sketchlay/blob/main/demo/demo.js).

## Evaluation
### Performance comparison between fCoSE and CoLa layouts

We provide a detailed analysis of how well our method integrates with the two constraint-aware layout algorithms, [fCoSE](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) and [CoLa](https://github.com/cytoscape/cytoscape.js-cola). To this end, we constructed a dataset by randomly sampling 160 graphs from [Rome graph dataset](https://graphdrawing.unipg.it/data.html) and designed 20 base sketches consisting of consecutive line and curve segments. Each base sketch was then rotated clockwise by 30°, 45°, and 60° to produce variants with different orientations, resulting in a total of 80 distinct sketches. These sketches were then randomly assigned to the 160 graphs, producing 160 graph–sketch pairs. For each pair, we generated placement constraints using our approach and then applied both [fCoSE](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) and [CoLa](https://github.com/cytoscape/cytoscape.js-cola) algorithms in the final layout step. 

We report results on run time performance, soft constraint satisfaction (average edge length, edge crossings, node-node overlaps and node-edge overlaps), and alignment accuracy measured by Chamfer distance between the sketch and the final layout. The graph and sketch dataset, along with the resulting layouts and measurements, can be found at [10.5281/zenodo.17953665](https://doi.org/10.5281/zenodo.17953665).

### User study

We also conducted a user study with 22 participants to complement the quantitative evaluation described above and to assess SketchLay from a user-centric perspective. Since our approach relies on users expressing layouts through sketching, we aim to evaluate how effectively the system supports conveying intended sketches, how well the generated layouts meet user expectations across different sketch types and layout algorithms, and whether users’ perceptions align with the trends observed in the quantitative results. The study also examines the overall usability and practicality of sketch-based layout generation.

The user study that we applied can be accessed [here](https://docs.google.com/forms/d/e/1FAIpQLSedzTc0razg-GcltWabuHGVv9xQfrrTjzwK1moMx9D9EJAR8A/viewform?usp=header) and the results of 22 participants can be accessed [here](https://docs.google.com/spreadsheets/d/1SyDtDkI11dYf8z4gI5azlILRCaIe-2-ERSSpvH8JNnU/edit?usp=sharing).  

## Credits

Our method uses [Cytoscape.js](https://js.cytoscape.org) for graph visualization and other graph-related operations. [Skeleton Tracing](https://github.com/LingDong-/skeleton-tracing) algorithm is used to extract the skeleton of the user sketch and [simplify-js](https://github.com/mourner/simplify-js) (licensed under the [BSD 2-Clause License](https://github.com/mourner/simplify-js/blob/master/LICENSE)) is used for polyline simplification. [cytoscape-fcose](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) and [cytoscape-cola](https://github.com/cytoscape/cytoscape.js-cola) are used as the layout algorithms with constraint support.

Third-party libraries used in demo: [Bootstrap](https://getbootstrap.com/), [FileSaver.js](https://github.com/eligrey/FileSaver.js/), [cytoscape-graphml](https://github.com/iVis-at-Bilkent/cytoscape.js-graphml), [cytoscape-sbgn-stylesheet](https://github.com/PathwayCommons/cytoscape-sbgn-stylesheet), [cytoscape-svg](https://github.com/kinimesi/cytoscape-svg) 

## Team
[Hasan Balci](https://github.com/hasanbalci) and [Augustin Luna](https://github.com/cannin) of [Luna Lab](https://github.com/sciluna)
