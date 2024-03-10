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

let e_map = s_map = new Map();

async function path(first, last) {
    let it = 0;
    s_map.set(await node(first), Math.floor(it/2)); it++;
    e_map.set(await node(last), Math.floor(it/2)); it++;
    let f_res = await children(first); let l_res = await children(last);
    //console.log(map1.has("Donald Trump"))
    console.log(s_map.get("Donald Trump"))
    console.log(e_map.get("Barack Obama"))
}

async function compare() {

}
path("Donald Trump", "Barack Obama");
// time node quickipedia.js > /dev/null 2>&1
