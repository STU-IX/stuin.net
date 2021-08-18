const COLORS = [
    "#FFFFFF",
    "#FF0000",
    "#FFFF00",
    "#00FF00",
    "#00FFFF",
    "#FF00FF",
    "#FF6347",
    "#98FB98",
    "#E0FFFF",
    "#B0E0E6",
    "#EE82EE",
    "#FFC0CB",
    "#F5F5DC",
    "#FFF8DC",
    "#FAF0E6",
    "#FFFAFA"
]

async function draw() {
    let url = new URL('/connection.data', location.protocol + "//" + location.host + "/")
    let links = (await fetch(url).then(r => r.text())).split('\n').map(_ => _.split('\t')).map(link => {
        link[0] = link[0].trim()
        link[1] = link[1].trim()
        return link
    }).filter(link => link[0] && link[1])

    let formattedData = {
        nodes: [],
        // {
        //     "id" : "1.1.1.1",
        //     "label" : "1.1.1.1",
        // }
        links: [],
        // {
        //     "from" : "1.1.1.1",
        //     "to" : "8.8.8.8",
        // },
        colors: {}
    }

    let counter = []

    let getColor = (node) => {
        if (!Object.keys(formattedData.colors).includes(node)) {
            formattedData.colors[node] = COLORS.pop()
        }
        return formattedData.colors[node]
    }

    var i = 0;
    for (let link of links) {
        let node1 = link[0]
        let node2 = link[1]
        let node1Owner = node1.split('-')[0]
        let node2Owner = node2.split('-')[0]


        if (!formattedData.nodes.find(_ => _.label == node1)) {
            counter.push([node1, 0])
            formattedData.nodes.push({
                "id": i++,
                "label": node1,
                "color": {
                    background :getColor(node1Owner),
                    color: getColor(node1Owner)
                },
            })
        }

        if (!formattedData.nodes.find(_ => _.label == node2)) {
            counter.push([node2, 0])
            formattedData.nodes.push({
                "id": i++,
                "label": node2,
                "color": {
                    background :getColor(node2Owner),
                    color: getColor(node2Owner)
                },
            })
        }

        if (node1Owner != node2Owner) {
            counter.find(_ => _[0] == node1)[1]++
            counter.find(_ => _[0] == node2)[1]++
        }

        formattedData.links.push({
            "from": formattedData.nodes.find(_ => _.label == node1).id,
            "to": formattedData.nodes.find(_ => _.label == node2).id,
            "label": ``,
        })
    }

    console.log(counter.sort((a, b) => {
        return b[1] - a[1]
    }))


    const nodes = new vis.DataSet(formattedData.nodes);
    const edges = new vis.DataSet(formattedData.links);

    const nodesView = new vis.DataView(nodes);
    const edgesView = new vis.DataView(edges);

    let network = new vis.Network(document.getElementById("network"), {
        nodes: nodesView,
        edges: edgesView,
    }, {
        edges: {
            length: 200
        },
        physics: {
            barnesHut: {
                avoidOverlap: 0.05
            }
        }
    });
}
draw()