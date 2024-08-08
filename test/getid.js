async function node_id(title) {
    let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&titles=" + title);
    let json = await node.json();
    let result = json.query.pages[0];
    console.log(result.title, result.pageid);
}

let pages = [
    "Donald Trump",
    "Barack Obama",
    "Sonia Sotomayor",
]

pages.forEach((page) => node_id(page))