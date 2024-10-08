import config from "./config.js";

class Page {
    constructor(title, id, depth, ancestry) {
        this.title = title;
        this.id = id;
        this.depth = depth;
        this.ancestry = ancestry;
    }
}

class Subgraph {

    ///////////////////////
    /// SETUP
    ///////////////////////

    constructor(first, last) {
        this.first = first; this.last = last;
        this.maps = [new Map(), new Map()];
        this.state = {
            "switches": 0,
            "currentTree": 0,
            "depth": 0,
            "oppositeTree": 1
        }
        this.pagesSearched = 0;
    }

    async setup() {
        let firstReq = (await this.wikiRequest("id", this.first));
        let lastReq = (await this.wikiRequest("id", this.last));
        let firstPage = new Page(firstReq.title, firstReq.id, 0, [firstReq.id]);
        let lastPage = new Page(lastReq.title, lastReq.id, 0, [lastReq.id]);
        this.maps[0].set(firstReq.id, firstPage);
        this.maps[1].set(lastReq.id, lastPage);
        this.treeLeaves = [[firstPage], [lastPage]];
    }

    ///////////////////////
    /// ALTERNATING BFS
    ///////////////////////

    async path() {
        await this.setup();
        while (this.state.switches < config.MAX_DISTANCE) {
            let leaves = this.treeLeaves[this.state.currentTree];

            // CHECK IF ANY CURRENT LEAVES CONNECT TO OPPOSITE TREE
            for (const leaf of leaves) {
                this.mapAdd(leaf.title, leaf.id, leaf.ancestry);
                if (this.maps[this.state.oppositeTree].has(leaf.id)) {
                    return JSON.stringify({
                        "distance": this.state.depth + this.maps[this.state.oppositeTree].get(leaf.id).depth,
                        "path": await this.combinePaths(leaf.ancestry.slice(0,-1)
                            , this.maps[this.state.oppositeTree].get(leaf.id).ancestry),
                        "maps": [Object.fromEntries(this.maps[0]), Object.fromEntries(this.maps[1])]
                    })
                }
            }

            // OTHERWISE GROW CURRENT TREE AND SWITCH SIDES
            for (const leaf of leaves) {
                this.pagesSearched++;
                if (this.pagesSearched%config.SEARCH_DISPLAY_INTERVAL===1 && this.pagesSearched>config.SEARCH_DISPLAY_INTERVAL) {
                    // console.log(`>${this.pagesSearched-1} pages searched...`);
                }
                const direction = Boolean(this.state.currentTree) ? "parents" : "children";
                this.treeLeaves[this.state.currentTree] = 
                (await this.wikiRequest(direction, leaf.id))
                    .filter(child => child.id !== undefined)
                    .map((child) => 
                    new Page(child.title, child.id, this.state.depth + 1, leaf.ancestry.concat(child.id)));
            }
            this.switchSide();
        }
        console.error("Error: Could not find a path within a distance of 6.");
        return {"distance": -1, "path": []};
    }

    ///////////////////////
    /// HELPERS
    ///////////////////////

    mapAdd(title, node, ancestry) {
        if (!this.maps[this.state.currentTree].has(node)) {
            this.maps[this.state.currentTree].set(node, new Page(title, node, this.state.depth, ancestry));
        }
    }

    async combinePaths(current, opposite) {
        const ids =  (this.state.oppositeTree
            ? current.concat(opposite.reverse())
            : opposite.concat(current.reverse()));
        return await Promise.all(ids.map(async id => (await this.wikiRequest("title", id)).title));
    }

    switchSide() {
        this.state.switches++;
        this.state.currentTree = this.state.switches%2;
        this.state.oppositeTree = Number(!(this.state.currentTree));
        this.state.depth = Math.floor(this.state.switches/2);
    }

    ///////////////////////
    /// API CALLS
    ///////////////////////

    async wikiRequest(requestType, page) {
        const base = "https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&";
        let params;

        switch(requestType) {
            case "children":
                params="generator=links&plnamespace=0&gpllimit=500&pageids=";
                break;
            case "parents":
                params="generator=backlinks&blnamespace=0&gbllimit=500&gblpageid=";
                break;
            case "title":
                params="prop=links&plnamespace=0&pllimit=max&pageids=";
                break;
            case "id":
                params="prop=links&plnamespace=0&pllimit=max&titles=";
                break;
            default:
                console.error("Error: Incorrect request type.");
                break;
        }
        let response = await fetch(base + params + page)
        let json = await response.json();
        let pages = await json.query.pages;
        // console.log(pages)
        if (requestType === "title" || requestType === "id") {return {"title": pages[0].title, "id": pages[0].pageid}}
        else {return pages.map(page => ({"title": page.title, "id": page.pageid}));};
        /*
        if (requestType === "title" || requestType === "id") {return {"title": pages[0].title, "id": pages[0].pageid}}
        else {return pages.map(page => ({"title": page.title, "id": page.pageid}) )}
        */
    }
}

export default Subgraph;