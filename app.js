import * as process from 'node:process';
import Subgraph from "./path.js";

if (process.argv.length !== 4) {
    console.error(`Error: Expected 2 arguments.`);
    process.exit(1);
}

const shortest = new Subgraph(process.argv[2], process.argv[3]);
console.log(await shortest.path());