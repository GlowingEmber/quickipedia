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

console.log(testdata.maps);

document.querySelector(".generate")
    .addEventListener("click", () => generate());

// const color = d3.scaleOrdinal(d3.schemeCategory10);

const tree = {
  nodes: [],
  edges: []
}
console.log("map 0", testdata.maps[0],
  "maps 1", testdata.maps[1]
)

for (let x = 0; x < 2; x++) {
  Object.keys(testdata.maps[x]).forEach((key) => {
    let page = testdata.maps[x][key];
    tree.nodes.push({title: page.title, id: page.id});
    if (page.depth > 0) {
      tree.edges.push({
        source: page.ancestry.at(-2),
        target: page.ancestry.at(-1)
      })
    }
})
}
/*
const tree = {
  nodes: [
    // dummy values
    {
      id: "Natalia Hopkins",
      selected: true
    },
    {
      id: "Aaron Hopkins",
      selected: true
    },
    {
      id: "Iris Shi",
      selected: true
    },
    {
      id: "State of Israel",
    },
    {
      id: "United States of America",
    },
    {
      id: "Robert F. Kennedy, Jr",
    },
    {
      id: "Kethan Raman",
    },
    {
      id: "Darwin Smith",
    },
    {
      id: "Islamic Emirate of Afghanistan",
    },
    {
      id: "2023 Invasion of Santa Monica",
    },
    {
      id: "BingBongBamboo",
    },
    {
      id: "Ethan Hopkins",
    },
    {
      id: "PewDiePie",
    },
    {
      id: "MrBeast",
    },
    {
      id: "Yom Kippur War",
    },
    {
      id: "Brat",
    },
  ],
  edges: [
    {
      source: "Natalia Hopkins",
      target: "Aaron Hopkins",
      selected: true, 
    },
    {
      source: "Natalia Hopkins",
      target: "Iris Shi",
      selected: true, 
    },
    {
      source: "Natalia Hopkins",
      target: "State of Israel",
    },
    {
      source: "Natalia Hopkins",
      target: "United States of America",
    },
    {
      source: "Natalia Hopkins",
      target: "Robert F. Kennedy, Jr",
    },
    {
      source: "Natalia Hopkins",
      target: "Kethan Raman",
    },
    {
      source: "Natalia Hopkins",
      target: "Darwin Smith",
    },
    {
      source: "Aaron Hopkins",
      target: "Islamic Emirate of Afghanistan",
    },
    {
      source: "Aaron Hopkins",
      target: "2023 Invasion of Santa Monica",
    },
    {
      source: "Aaron Hopkins",
      target: "BingBongBamboo",
    },
    {
      source: "Iris Shi",
      target: "Ethan Hopkins",
    },
    {
      source: "Iris Shi",
      target: "PewDiePie",
    },
    {
      source: "Iris Shi",
      target: "MrBeast",
    },
    {
      source: "Iris Shi",
      target: "Yom Kippur War",
    },
    {
      source: "Iris Shi",
      target: "Brat",
    },
  ],
};

*/

const sim = d3
  .forceSimulation()
  .force("edge", d3.forceLink().id((d) => d.id))
  .force("manybody", d3.forceManyBody().strength(-300))
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
  .attr("r", 5)
  // .attr("fill", d => d.selected ? "#3366CC" : "black")

const pagelink = svg
  .append("g")
  .attr("class", "pagelink")
  .selectAll("text")
  .data(tree.nodes)
  .enter()
  .append("text")
  .text(d => d.title)


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
