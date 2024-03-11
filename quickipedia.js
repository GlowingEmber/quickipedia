async function node(title) {
    let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&titles=" + title)
    let json = await node.json();
    return json.query.pages[0].title;
}

async function children(title) {
    let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&titles=" + title)
    let json = await node.json();
    return json.query.pages[0].links;
}

let map1 = new Map(); let map2 = new Map();

async function completes(node, iter) {
    let maps = [map1, map2];
    let opposite = (iter+1) % 2;
    return maps[opposite].has(node);
    /*
        let ends = [first, last];
        let current = iter % 2;


    if (maps[opposite].has(node)) {
        console.log(map1.get(node) + map2.get(node));
    }
    else {
        let f_res = await children(first);
        f_res.forEach((child) => {
            maps[current].set(child.title, iter);
        });
    }
    */

}

async function add_children() {

}

async function path(first, last) {
    let iter = 0;
    map1.set(await node(first), Math.floor(iter/2)); iter++;
    map2.set(await node(last), Math.floor(iter/2)); iter++;
    let f_res = await children(first); let l_res = await children(last);
    //console.log(map1.has("Donald Trump"))
    if (!(await completes(first, iter))) {
        for (let x = 0; x < f_res.length; x++) {
            if (await completes(f_res[x].title, iter)) {
                console.log(f_res[x].title)
            }
        }
    }
}    
path("Donald Trump", "Barack Obama");
// time node quickipedia.js > /dev/null 2>&1
