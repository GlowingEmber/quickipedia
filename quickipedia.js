async function node_children(title) {
    let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&titles=" + title)
    let json = await node.json();
    return json.query.pages[0].links;
}

async function completes(node, maps, a) {
    return maps[a.opposite].has(node);
}

async function traverse(node, maps, a) {
    if (await completes(node, maps, a)) {
        return maps[0].get(node) + maps[1].get(node);
    }
    let children = await node_children(node);
    for (const child of children) {
        maps[a.current].set(child.title, a.descendent);
        if (await completes(child.title, maps, a)) {
            return maps[0].get(child.title) + maps[1].get(child.title);
        }
    }
}

function switch_side(a) {
    a.switched++; // number of times sides have switched
    a.current = a.switched%2; // current map
    a.opposite = (a.switched-1)%2; // opposite map
    a.descendent = Math.floor(a.switched/2); // descendent depth
}

async function path(first, last) {
    let map1 = new Map(); let map2 = new Map();
    let a = {
        "switched": 0,
        "current:": 0,
        "descendent": 0,
        "opposite": 1
    }
    map1.set(first, a.descendent); switch_side(a);
    map2.set(last, a.descendent); switch_side(a);
    let maps = [map1, map2];
    return await traverse(first, maps, a);
}



async function run_tests() {
console.log("Trump->Trump", await path("Donald Trump", "Donald Trump"));
console.log("Trump->Obama", await path("Donald Trump", "Barack Obama"));
console.log("Trump->Thunberg", await path("Donald Trump", "Greta Thunberg"));
}
run_tests();
// time node quickipedia.js > /dev/null 2>&1

// current
// 01234567
// 01010101

// opposite
// 01234567
// 10101010

// descendent
// 01234567
// 00112233
