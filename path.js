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
            "current_tree": 0,
            "depth": 0,
            "opposite_tree": 1
        }
    }

    async setup() {
        let first_id = await this.node_id(this.first);
        let last_id = await this.node_id(this.last);
        let first_page = new Page(first_id, 0, [first_id]);
        let last_page = new Page(last_id, 0, [last_id]);
        this.map1.set(first_id, first_page);
        this.map2.set(last_id, last_page);
        // each tree starts out with one leaf each (the root of each)
        this.tree_leaves = [[first_page], [last_page]];
    }

    ///////////////////////
    /// MAIN
    ///////////////////////

    async path() {
        await this.setup();
        while (this.state.switches < config.MAX_DISTANCE) {
            let leaves = this.tree_leaves[this.state.current_tree];

            // check if any current leaves connect to opposite tree
            for (const leaf of leaves) {
                this.set_map(leaf.id, leaf.ancestry);
                if (this.maps[this.state.opposite_tree].has(leaf.id)) {
                    return {
                        "distance": this.state.depth + this.maps[this.state.opposite_tree].get(leaf.id).depth,
                        "path": await this.combined_paths(leaf.ancestry, this.maps[this.state.opposite_tree].get(leaf.id).ancestry)
                    }
                }
            }

            // otherwise grow current tree and switch sides
            for (const leaf of leaves) {
                console.log(leaf.id, leaf.ancestry);
                this.tree_leaves[this.state.current_tree] = (await this.node_children(leaf.id))
                                                            .filter(child => child !== undefined)
                                                            .map((child_id) => 
                                                                new Page(child_id, this.state.depth + 1, leaf.ancestry.concat(child_id)));

            }
            this.switch_side();
        }
        return {"distance": -1, "path": []};
    }

    ///////////////////////
    /// HELPERS
    ///////////////////////

    set_map(node, ancestry) {
        if (!this.maps[this.state.current_tree].has(node)) {
            this.maps[this.state.current_tree].set(node, new Page(node, this.state.depth, ancestry));
        }
    }

    async combined_paths(path1, path2) {
        let ids = path1.concat(path2);
        // return await this.node_title(ids[1]);
        return await Promise.all(ids.map(async id => await this.node_title(id)));
    }

    switch_side() {
        this.state.switches++;
        this.state.current_tree = this.state.switches%2;
        this.state.opposite_tree = Number(!Boolean(this.state.current_tree));
        this.state.depth = Math.floor(this.state.switches/2);
    }

    async node_id(title) {
        let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&titles=" + title);
        let json = await node.json();
        return json.query.pages[0].pageid;
    }

    async node_title(id) {
        let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&pageids=" + id);
        let json = await node.json();
        return json.query.pages[0].title;
    }

    async node_children(id) {
        let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&generator=links&format=json&formatversion=2&gpllimit=500&pageids=" + id);
        let json = await node.json();
        return json.query.pages.map(page => page.pageid);
    }
}

async function run() {
    let shortest = new Subgraph("Donald Trump", "Barack Obama");
    let path = await shortest.path();
    console.log(path);
}
run();
