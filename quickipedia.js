class Shortest_Path {

    constructor(first, last) {
        this.first = first; this.last = last;
        this.map1 = new Map(); this.map2 = new Map();
        this.maps = [this.map1, this.map2];
        this.state = {
            "switched": 0,
            "current_tree": 0,
            "depth": 0,
            "opposite_tree": 1
        }
    }

    async setup() {
        let first_id = await this.node_id(this.first);
        let last_id = await this.node_id(this.last);
        this.map1.set(first_id, ({depth: 0, parents: []}));
        this.map2.set(last_id, ({depth: 0, parents: []}));
        this.map1_leaves = [first_id]; this.map2_leaves = [last_id];
        this.leaves = [this.map1_leaves, this.map2_leaves];
    }

    set_map(node) {
        if (!this.maps[this.state.current_tree].has(node)) {
            this.maps[this.state.current_tree].set(node, ({depth: this.state.depth}))
        }
    }

    switch_side() {
        this.state.switched++; // number of times sides have switched
        this.state.current_tree = this.state.switched%2; // for current map
        this.state.opposite_tree = (this.state.switched-1)%2; // for opposite map
        this.state.depth = Math.floor(this.state.switched/2); // descendant depth
    }

    async node_id(title) {
        let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&titles=" + title);
        let json = await node.json();
        return json.query.pages[0].pageid;
    }

    async node_children(id) {
        let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&generator=links&format=json&formatversion=2&gpllimit=500&pageids=" + id);
        let json = await node.json();
        /*
        console.dir(json.query.pages.map(page => page.title), 
        {'maxArrayLength': 5}
        );
        */
        return json.query.pages.map(page => page.pageid);
    }
    

    async completes(node) {
        return this.maps[this.state.opposite_tree].has(node);
    }

    async traverse(node) {
        await this.setup();
        while (this.state.switched < 5) {
            let leaves = this.leaves[this.state.current_tree];
            this.leaves[this.state.current_tree] = [];
            console.log("has Obama: ", leaves.indexOf(534366) != -1, (this.state))
            // console.log("current leaves: ", leaves)

            // check if any current leaves connect to opposite tree
            for (const leaf of leaves) {
                if (this.maps[this.state.opposite_tree].has(leaf)) {
                    return this.state.depth + this.maps[this.state.opposite_tree].get(leaf).depth;
                }
            }
            // otherwise grow current tree and switch sides
            for (const leaf of leaves) {
                console.log(leaf, this.state)
                this.set_map(leaf);
                this.leaves[this.state.current_tree] = 
                this.leaves[this.state.current_tree].concat(
                    (await this.node_children(leaf)).filter(child => child !== undefined));
                // console.log(this.leaves[this.state.current_tree], {'maxArrayLength': 5})

            }
            this.switch_side();
        }
    }

    async path_len() {
        return await this.traverse(this.first, this.maps, this.state);
    }
}


async function run_tests() {
let shortest = new Shortest_Path("Donald Trump", "Sonia Sotomayor");

console.log(await shortest.path_len());

}
run_tests();
