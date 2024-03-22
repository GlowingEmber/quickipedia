class Shortest_Path {

    constructor(first, last) {
        this.first = first; this.last = last;
        this.map1 = new Map(); this.map2 = new Map();
        this.state = {
            "switched": 0,
            "current_map": 0,
            "depth": 0,
            "opposite_map": 1
        }
        this.map1.set(first, ({depth: 0, parents: []})); this.switch_side(this.state);
        this.map2.set(last, ({depth: 0, parents: []})); this.switch_side(this.state);
        this.maps = [this.map1, this.map2];
        this.to_check = [first];
    }

    async node_children(title) {
        let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&titles=" + title)
        let json = await node.json();
        return json.query.pages[0].links;
    }

    async completes(node) {
        return this.maps[this.state.opposite_map].has(node);
    }

    async traverse(node) {
        if (await this.completes(node)) {
            return this.maps[this.state.current_map].get(node).depth + this.maps[this.state.opposite_map].get(node).depth;
        }
        let children = await this.node_children(node);
        for (const child of children) {
            if (await this.completes(child.title)) {
                return this.state.depth + this.maps[this.state.opposite_map].get(child.title).depth;
            }
            this.set_map(child.title);
            // this.maps[this.state.current_map].set(child.title, this.state.depth);
        }
    }

    set_map(node) {
        if (!this.maps[this.state.current_map].has(node)) {
            this.maps[this.state.current_map].set(node, ({depth: this.state.depth}))
        }
    }

    switch_side() {
        this.state.switched++; // number of times sides have switched
        this.state.current_map = this.state.switched%2; // for current map
        this.state.opposite_map = (this.state.switched-1)%2; // for opposite map
        this.state.depth = Math.floor(this.state.switched/2); // descendant depth
    }

    async path_len() {
        return await this.traverse(this.first, this.maps, this.state);
    }
}


async function run_tests() {
let shortest = new Shortest_Path("Donald Trump", "Donald Trump");
let shortest2 = new Shortest_Path("Donald Trump", "Barack Obama");
let shortest3 = new Shortest_Path("Donald Trump", "Greta Thunberg");

console.log("Trump->Trump", await shortest.path_len());
console.log("Trump->Obama", await shortest2.path_len());
console.log("Trump->Thunberg", await shortest3.path_len());
}
run_tests();
