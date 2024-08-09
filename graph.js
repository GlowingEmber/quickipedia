// import * as Path from "./path.js";
import testdata from "./testdata.json" with {type: "json"};

/*
function generate() {
    console.log("generating path");
    Path.run();
}
*/


const svg = d3.select("#graphSVG");
const width = svg.attr("width");
const height = svg.attr("height");

document.querySelector(".generate")
    .addEventListener("click", () => generate());

// const color = d3.scaleOrdinal(d3.schemeCategory10);

const tree = {
  nodes: [],
  edges: []
}

const added = new Set();

for (let x = 0; x < 2; x++) {
  Object.keys(testdata.maps[x]).forEach((key) => {
    let page = testdata.maps[x][key];
    if (!added.has(page.id)) {
      added.add(page.id);
      let json = {};
      
      if (testdata.path.includes(page.title)) {
      json.selected = true;
      }
      json.title = page.title; json.id = page.id;
      tree.nodes.push(json);
      console.log(json)

      if (page.ancestry.length > 1) {
        tree.edges.push({
          source: page.ancestry.at(-2),
          target: page.ancestry.at(-1)
        })
      }
    }
})}

const sim = d3
  .forceSimulation()
  .force("edge", d3.forceLink().id((d) => d.id))
  .force("manybody", d3.forceManyBody().strength(-400))
  .force("center", d3.forceCenter(width/2, height/2));

const edge = svg
  .append("g")
  .attr("class", "edge")
  .selectAll("line")
  .data(tree.edges)
  .enter()
  .append("line")
  // .attr("stroke", d => d.selected ? "#3366CC" : "black")


const node = svg
  .append("g")
  .attr("class", "node")
  .selectAll("g")
  .data(tree.nodes)
  .enter()
  .append("circle")
  .attr("r", d => d.selected ? 10 : 4)
  // .attr("r", 5)
  // .attr("fill", d => d.selected ? "#3366CC" : "black")
  .on('click', function(d) {
    // window.location.href=`https://en.wikipedia.org/wiki/${d.title}`;
    window.open(`https://en.wikipedia.org/wiki/${d.title}`, '_blank')//.focus()
  })

const pagelink = svg
  .append("g")
  .attr("class", "pagelink")
  .selectAll("text")
  .data(tree.nodes)
  .enter()
  .append("text")
  .text(d => d.title)
  .attr("font-size", d => d.selected ? "15px" : "10px")
  .attr("font-weight", d => d.selected ? "bold" : "normal")


node.call(d3.drag()
    .on("start", dragStart)
    .on("drag", dragContinue)
    .on("end", dragEnd));

sim.nodes(tree.nodes).on("tick", () => {
  edge
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);
  node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  pagelink
      .attr("x", (d) => d.x+3)
      .attr("y", (d) => d.y-10);
});

sim.force("edge").links(tree.edges);

///////////////////////
/// INTERACTION
///////////////////////

function dragStart(d) {
  if (!d3.event.active) sim.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragContinue(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragEnd(d) {
  if (!d3.event.active) { sim.alphaTarget(0) };
  d.fx = null;
  d.fy = null;
}
