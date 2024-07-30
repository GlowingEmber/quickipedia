import * as process from 'node:process';

if (process.argv.length <= 3) {
    console.error('Error: Expected 2 arguments.');
    process.exit(1);
}

const parameters = {
    children: ['-c', '--children'],
    backlinks: ['-b', '--backlinks'],
    title: ['-t', '--title'],
    id: ['-i', '--id'],
}

for (let arg = 3; arg < process.argv.length; arg++) {
    if (!Object.values(parameters).flat().includes(process.argv[arg])) {
        console.error(`Error: Unexpected argument ${process.argv[arg]}.`);
        process.exit(1);
    }
}

let flags = {};
for (const p in parameters) {
    flags[p] = parameters[p].reduce((count, param) => count || process.argv.includes(param), false);
}

const flagCount = Object.values(flags).reduce((count, flag) => count + flag, 0);
if (flagCount > 1) {
    console.error('Error: Expected at most one flag.');
    process.exit(1);
}
// console.log(flags);

async function wikiJSON(base, params, page) {
    let node = await fetch(base + params + page);
    let json = await node.json();
    return json;
}

class Request {

    async get(page) {
        const base = "https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&";
        let params;
        let json;

        switch(true) {

            case flags.children:
                params="generator=links&plnamespace=0&gpllimit=500&pageids=";
                json = await wikiJSON(base, params, page);
                return json.query.pages.map(page => page.pageid);
            case flags.backlinks:
                params="generator=backlinks&blnamespace=0&gbllimit=500&gblpageid=";
                json = await wikiJSON(base, params, page);
                return json.query.pages.map(page => page.pageid);
            case flags.title:
                params="prop=links&plnamespace=0&pllimit=max&pageids=";
                json = await wikiJSON(base, params, page);
                return json.query.pages[0].title;
            case flags.id:
                params="prop=links&plnamespace=0&pllimit=max&titles=";
                json = await wikiJSON(base, params, page);
                return json.query.pages[0].pageid;
        }
    }
}

let test = await (new Request()).get(process.argv[2]);
console.log(test);