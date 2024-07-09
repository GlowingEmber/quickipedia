
/*
async function tests(id) {
    let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&generator=links&format=json&gpllimit=500&formatversion=2&pageids=" + id)
    let json = await node.json();
    console.log(json.query.pages.map(page => page));
    return json.query.pages.map(page => page.pageid);
}

*/

let arr = [
    undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, 662,
    664,       698,       1210,      1461,      1770,      1773,
    1774,      1965,      1966,      1967,      1968,      1969,
    1970,      1971,      2219,      2569,      3356,      3747,
    4882,      5407,      6859,      7271,      8182,      8205,
    9228,      9277,      9767,      9917,      10979,     11479,
    11955,     12667,     13077,     13256,     13765,     13774,
    15043,     15641,     15770,     15992,     16421,     16634,
    16772,     18285,     18896,     18959]
function tests(arr) {
    return arr;
}

async function run_tests() {
console.log(tests(arr.filter(child => child !== undefined)));
}

run_tests();