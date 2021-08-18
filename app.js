const COLORS = [
    "#a2cffe",
    "#a6e7ff",
    "#74bbfb",
    "#efc5b5",
    "#fbe8ce",
    "#fdee73",
    "#aaffaa",
    "#aefd6c",
    "#a5fbd5",
    "#64bfa4",
    "#c8fd3d",
    "#ffa180",
    "#efc0fe",
    "#ffcfdc",
    "#eeaaff",
    "#bf77f6",
    "#f6cefc",
    "#feff7f"
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
                    background: getColor(node1Owner),
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
                    background: getColor(node2Owner),
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
            length: 300,
        },
        interaction: {
            hideEdgesOnDrag: true,
        },
        physics: {
            solver: "barnesHut",
            barnesHut: {
                gravitationalConstant: -10000,
                avoidOverlap: 1,
            },
            stabilization: {
                enabled: true,
                iterations: 20,
            },
        },
        nodes: {
            shape: "dot",
            color: {
                highlight: {
                    background: "lightgreen",
                },
            },
        },
    });
    network.on('doubleClick', (event) => {
        console.log(event)
        let nodeID = event.nodes[0]
        let node = formattedData.nodes.find(_ => _.id == nodeID)
        let selfNodeIDs = new Set();
        let usedNodeIDs = new Set();
        let owner = node.label.split('-')[0]
        if (node) {
            for (let node of formattedData.nodes) {
                if (node.label.startsWith(owner)) {
                    selfNodeIDs.add(node.id)
                }
            }
            for (let edge of formattedData.links) {
                let aNodeID = edge.from;
                let aNode = formattedData.nodes.find(_ => _.id == aNodeID);
                let bNodeID = edge.to;
                let bNode = formattedData.nodes.find(_ => _.id == bNodeID);
                if (!selfNodeIDs.has(aNodeID) && !selfNodeIDs.has(bNodeID)) {
                    edges.remove({
                        id: edge.id
                    })
                } else {
                    usedNodeIDs.add(aNodeID)
                    usedNodeIDs.add(bNodeID)
                }
            }
            for (let node of formattedData.nodes) {
                if (!usedNodeIDs.has(node.id)) {
                    nodes.remove({
                        id: node.id
                    })
                }
            }
        }
    })
}
draw()