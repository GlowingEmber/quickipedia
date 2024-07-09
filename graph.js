import * as Path from "./path.js";

document.querySelector(".generate")
    .addEventListener("click", () => generate());

function generate() {
    console.log("generating path");
    Path.run();
}

const svg = d3.select("#graphSVG");
const width = svg.attr("width");
const height = svg.attr("height");
// const color = d3.scaleOrdinal(d3.schemeCategory10);

const tree = {
  nodes: [
    {
      id: 1,
    },
    {
      id: 2,
    },
    {
      id: 3,
    },
    {
      id: 4,
    },
    {
      id: 5,
    },
    {
      id: 6,
    },
    {
      id: 7,
    },
    {
      id: 8,
    },
    {
      id: 9,
    },
    {
      id: 10,
    },
    {
      id: 11,
    },
    {
      id: 12,
    },
    {
      id: 13,
    },
    {
      id: 14,
    },
    {
      id: 15,
    },
    {
      id: 16,
    },
  ],
  edges: [
    {
      source: 1,
      target: 2,
    },
    {
      source: 1,
      target: 3,
    },
    {
      source: 1,
      target: 4,
    },
    {
      source: 1,
      target: 5,
    },
    {
      source: 1,
      target: 6,
    },
    {
      source: 1,
      target: 7,
    },
    {
      source: 1,
      target: 8,
    },
    {
      source: 2,
      target: 9,
    },
    {
      source: 2,
      target: 10,
    },
    {
      source: 2,
      target: 11,
    },
    {
      source: 3,
      target: 12,
    },
    {
      source: 3,
      target: 13,
    },
    {
      source: 4,
      target: 14,
    },
    {
      source: 4,
      target: 15,
    },
    {
      source: 5,
      target: 16,
    },
  ],
};

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

const node = svg
  .append("g")
  .attr("class", "node")
  .selectAll("g")
  .data(tree.nodes)
  .enter()
  .append("circle")
  .attr("r", 8)
  .attr("fill", "#fff");

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
