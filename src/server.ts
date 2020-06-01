import { Models } from './types';

// Format from http://bl.ocks.org/jose187/4733747
// Given Memes, convert to graph format. 
const memesToDag = async (memes) => {
    var nodeUuidToNameMap = {}
    var memeToInt = {}
    var counter = 0

    // Each node must have an integer index. Make a list of nodes and use counter to create an index.
    // Node name should be the meme text, so we must also keep a Uuid map to build edge graph.
    var nodes = []
    memes.forEach((meme) => {
        nodeUuidToNameMap[meme._id] = meme.name

        var newMemeIntId = counter++
        memeToInt[meme.name] = newMemeIntId
        nodes.push({
            "name": meme.name,
            "group": newMemeIntId
        })
    });

    // Now we can build the edge graph, resolving Uuids to integer indicies created earlier.
    var links = []
    memes.forEach(meme => {
        if (meme.edges) {
            meme.edges.forEach((edge) => {
                links.push({
                    "source": memeToInt[meme.name],
                    "target": memeToInt[nodeUuidToNameMap[edge]],
                    "weight": 1
                })
            });
        }
    });

    const obj = {"nodes": nodes, "links": links}
    return obj
}

export const webServer = async (
    models: Models,
) => {
    const { Meme } = models;

    var path = require('path');
    const express = require( "express" );
    const app = express();
    const port = 8080;

    app.use(express.static(path.join(__dirname, 'web')));
    app.get('/nodes', (req, res) => {
        Meme.collection
                    .find()
                    .toArray()
                    .then(async (documents) => {
                        const obj = await memesToDag(documents)
                        res.send(JSON.stringify(obj))
                    });
        
    });
    app.listen(port);
    console.log('Web server started')
};