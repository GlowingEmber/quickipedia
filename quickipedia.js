let adjacentPages = (title) => {
    fetch(
       "https://en.wikipedia.org/w/api.php?action=query&format=json&titles=" + title
        ,{
            method: "GET",
        }
    )
.then((response) => response.json())
.then((json_obj) => {
    console.log(json_obj)
})}

adjacentPages("Donald Trump");

// node wikiferrari.js
// time node wikiferrari.js > /dev/null 2>&1
