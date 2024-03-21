class Shortest_Path {

    async node_children(title) {
        let node = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=links&pllimit=max&format=json&formatversion=2&titles=" + title)
        let json = await node.json();
        return json.query.pages[0].links;
    }

    async completes(node, maps, state) {
        return maps[state.opposite_map].has(node);
    }

    async traverse(node, maps, state) {
        if (await this.completes(node, maps, state)) {
            return maps[0].get(node) + maps[1].get(node);
        }
        let children = await this.node_children(node);
        for (const child of children) {
            if (await this.completes(child.title, maps, state)) {
                return state.depth + maps[1].get(child.title);
            }
            maps[state.current_map].set(child.title, state.depth);
        }
    }

    switch_side(state) {
        state.switched++; // number of times sides have switched
        state.current_map = state.switched%2; // for current map
        state.opposite_map = (state.switched-1)%2; // for opposite map
        state.depth = Math.floor(state.switched/2); // descendant depth
    }

    async path(first, last) {
        let map1 = new Map(); let map2 = new Map();
        let state = {
            "switched": 0,
            "current_map:": 0,
            "depth": 0,
            "opposite_map": 1
        }
        map1.set(first, state.depth); this.switch_side(state);
        map2.set(last, state.depth); this.switch_side(state);
        let maps = [map1, map2];
        return await this.traverse(first, maps, state);
    }
}


async function run_tests() {
let shortest = new Shortest_Path();
console.log("Trump->Trump", await shortest.path("Donald Trump", "Donald Trump"));
console.log("Trump->Obama", await shortest.path("Donald Trump", "Barack Obama"));
console.log("Trump->Thunberg", await shortest.path("Donald Trump", "Greta Thunberg"));
}
run_tests();
