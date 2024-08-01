import config from "./config.js";

class Page {
    constructor(id, depth, ancestry) {
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
        // let firstID = await this.nodeID(this.first);
        let firstID = await this.wikiRequest("id", this.first);
        // let lastID = await this.nodeID(this.last);
        let lastID = await this.wikiRequest("id", this.last);
        let firstPage = new Page(firstID, 0, [firstID]);
        let lastPage = new Page(lastID, 0, [lastID]);
        this.maps[0].set(firstID, firstPage);
        this.maps[1].set(lastID, lastPage);
        // each tree starts out with one leaf each (the root of each)
        this.treeLeaves = [[firstPage], [lastPage]];
    }

    ///////////////////////
    /// MAIN
    ///////////////////////

    async path() {
        await this.setup();
        while (this.state.switches < config.MAX_DISTANCE) {
            let leaves = this.treeLeaves[this.state.currentTree];

            // CHECK IF ANY CURRENT LEAVES CONNECT TO OPPOSITE TREE
            for (const leaf of leaves) {
                this.mapAdd(leaf.id, leaf.ancestry);
                if (this.maps[this.state.oppositeTree].has(leaf.id)) {
                    return {
                        "distance": this.state.depth + this.maps[this.state.oppositeTree].get(leaf.id).depth,
                        "path": await this.combinePaths(leaf.ancestry.slice(0,-1)
                            , this.maps[this.state.oppositeTree].get(leaf.id).ancestry)
                    }
                }
            }

            // OTHERWISE GROW CURRENT TREE AND SWITCH SIDES
            for (const leaf of leaves) {
                console.log(leaf.id, leaf.ancestry);
                this.pagesSearched++;
                if (this.pagesSearched%config.SEARCH_DISPLAY_INTERVAL===1 && this.pagesSearched>config.SEARCH_DISPLAY_INTERVAL) {
                    console.log(`>${this.pagesSearched-1} pages searched...`);
                }
                const direction = Boolean(this.state.currentTree) ? "parents" : "children";
                this.treeLeaves[this.state.currentTree] = (await this.wikiRequest(direction, leaf.id))
                                                            .filter(child => child !== undefined)
                                                            .map((childID) => 
                                                            new Page(childID, this.state.depth + 1, leaf.ancestry.concat(childID)));
            }
            this.switchSide();
        }
        console.error("Error: Could not find a path within a distance of 6.");
        return {"distance": -1, "path": []};
    }

    ///////////////////////
    /// HELPERS
    ///////////////////////

    mapAdd(node, ancestry) {
        if (!this.maps[this.state.currentTree].has(node)) {
            this.maps[this.state.currentTree].set(node, new Page(node, this.state.depth, ancestry));
        }
    }

    async combinePaths(current, opposite) {
        const ids =  (this.state.oppositeTree ? current.concat(opposite.reverse()) : opposite.concat(current.reverse()));
        return await Promise.all(ids.map(async id => await this.wikiRequest("title", id)));
    }

    switchSide() {
        this.state.switches++;
        this.state.currentTree = this.state.switches%2;
        this.state.oppositeTree = Number(!Boolean(this.state.currentTree));
        this.state.depth = Math.floor(this.state.switches/2);
    }

    ///////////////////////
    /// WIKIMEDIA API
    ///////////////////////

    async wikiJSON(base, params, page) {
        let node = await fetch(base + params + page);
        let json = await node.json();
        return json;
    }

    async wikiRequest(requestType, page) {
        const base = "https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&";
        let params;
        let json;

        switch(requestType) {

            case "children":
                params="generator=links&plnamespace=0&gpllimit=500&pageids=";
                json = await this.wikiJSON(base, params, page);
                return json.query.pages.map(page => page.pageid);
            case "parents":
                params="generator=backlinks&blnamespace=0&gbllimit=500&gblpageid=";
                json = await this.wikiJSON(base, params, page);
                return json.query.pages.map(page => page.pageid);
            case "title":
                params="prop=links&plnamespace=0&pllimit=max&pageids=";
                json = await this.wikiJSON(base, params, page);
                return json.query.pages[0].title;
            case "id":
                params="prop=links&plnamespace=0&pllimit=max&titles=";
                json = await this.wikiJSON(base, params, page);
                return json.query.pages[0].pageid;
        }
    }
}

/*
const shortest = new Subgraph("Donald Trump", "Barack Obama");
const path = await shortest.path();
console.log(path);
*/

export default Subgraph;