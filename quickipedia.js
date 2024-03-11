async function node_children(title) {
    let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&titles=" + title)
    let json = await node.json();
    return json.query.pages[0].links;
}

let map1 = new Map(); let map2 = new Map();
let switched = current = opposite = descendent = 0;

async function completes(node, maps, opposite) {
    return maps[opposite].has(node);
}

async function traverse(node, maps, current, opposite, switched) {
    if (await completes(node, maps, opposite)) {
        return map1.get(node) + map2.get(node);
    }
    let children = await node_children(node);
    for (const child of children) {
        maps[current].set(child.title, descendent);
        if (await completes(child.title, maps, opposite)) {
            return map1.get(child.title) + map2.get(child.title);
        }
    }
}

function switch_side() {
    switched++; // number of times sides have switched
    current = switched%2; // current map
    opposite = (switched+1)%2; // opposite map
    descendent = Math.floor(switched/2); // descendent depth
}

async function path(first, last) {
    map1.set(first, descendent); switch_side();
    map2.set(last, descendent); switch_side();
    let maps = [map1, map2];
    return await traverse(first, maps, current, opposite, switched);
}

async function run_tests() {
console.log("Trump->Trump", await path("Donald Trump", "Donald Trump"));
console.log("Trump->Obama", await path("Donald Trump", "Barack Obama"));
}
run_tests();
// time node quickipedia.js > /dev/null 2>&1
