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
        this.map1 = new Map(); this.map2 = new Map();
        this.maps = [this.map1, this.map2];
        this.state = {
            "switches": 0,
            "currentTree": 0,
            "depth": 0,
            "oppositeTree": 1
        }
    }

    async setup() {
        let firstID = await this.nodeID(this.first);
        let lastID = await this.nodeID(this.last);
        let firstPage = new Page(firstID, 0, [firstID]);
        let lastPage = new Page(lastID, 0, [lastID]);
        this.map1.set(firstID, firstPage);
        this.map2.set(lastID, lastPage);
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
                // console.log(leaf.id, leaf.ancestry);
                this.mapAdd(leaf.id, leaf.ancestry);
                if (this.maps[this.state.oppositeTree].has(leaf.id)) {
                    console.log(
                        {
                            "tree1or2": this.state.currentTree + 1,
                            "viaLeaf": `${await this.nodeTitle(leaf.id)} ${leaf.id}`,
                            "withAncestry": leaf.ancestry
                        }
                    );
                    return {
                        "distance": this.state.depth + this.maps[this.state.oppositeTree].get(leaf.id).depth,
                        "path": await this.combinedPaths(leaf.ancestry.slice(0,-1)
                            , this.maps[this.state.oppositeTree].get(leaf.id).ancestry)
                    }
                }
            }

            // OTHERWISE GROW CURRENT TREE AND SWITCH SIDES
            for (const leaf of leaves) {
                console.log(leaf.id, leaf.ancestry);
                this.treeLeaves[this.state.currentTree] = (await this.adjacentNodes(leaf.id))
                                                            .filter(child => child !== undefined)
                                                            .map((childID) => 
                                                            new Page(childID, this.state.depth + 1, leaf.ancestry.concat(childID)));
            }
            this.switchSide();
        }
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

    async combinedPaths(path1, path2) {
        const ids = path1.concat(path2);
        return await Promise.all(ids.map(async id => await this.nodeTitle(id)));
    }

    switchSide() {
        this.state.switches++;
        this.state.currentTree = this.state.switches%2;
        this.state.oppositeTree = Number(!Boolean(this.state.currentTree));
        this.state.depth = Math.floor(this.state.switches/2);
    }

    ///////////////////////
    /// HELPERS
    ///////////////////////

    async nodeID(title) {
        const node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&titles=" + title);
        const json = await node.json();
        return json.query.pages[0].pageid;
    }

    async nodeTitle(id) {
        const node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&pageids=" + id);
        const json = await node.json();
        return json.query.pages[0].title;
    }

    async nodeChildren(id) {
        let nodes = await fetch("https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&generator=links&plnamespace=0&gpllimit=500&pageids=" + id);
        let json = await nodes.json();
        return json.query.pages.map(page => page.pageid);
    }

    async nodeParents(id) {
        let nodes = await fetch("https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&generator=backlinks&blnamespace=0&gbllimit=500&gblpageid=" + id);
        let json = await nodes.json();
        return json.query.pages.map(page => page.pageid);
    }

    async adjacentNodes(id) {
        const base = "https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&";
        // use parent nodes if current tree is tree2; use children nodes if current tree is tree1
        const params = Boolean(this.state.currentTree)
            ? "generator=backlinks&blnamespace=0&gbllimit=500&gblpageid="
            : "generator=links&plnamespace=0&gpllimit=500&pageids=";
        const nodes = await fetch(base + params + id);
        const json = await nodes.json();
        return json.query.pages.map(page => page.pageid);
    }
}

async function run() {
    const shortest = new Subgraph("Donald Trump", "Sonia Sotomayor");
    const path = await shortest.path();
    console.log(path);
}
run();
