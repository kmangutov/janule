import { Models } from './types';

// Format from http://bl.ocks.org/jose187/4733747
// Given Memes, convert to graph format.
const memesToDag = async (memes) => {
    var memeIDToInt = {};
    var counter = 0;

    let parsedMemes = memes.map((meme) => {
        return {
            name: meme.name,
            uid: meme._id,
            edges: meme.edges as Array<string>,
            display: false,
        };
    });

    parsedMemes.map((meme) => {
        if (meme.edges?.length > 0 ?? false) {
            meme.display = true;
            meme.edges.map((edge) => {
                const targetMeme = parsedMemes.find((item) => item.uid == edge);
                targetMeme.display = true;
            });
        }
    });
    parsedMemes = parsedMemes.filter((item) => item.display);

    // Each node must have an integer index. Make a list of nodes and use counter to create an index.
    // Node name should be the meme text, so we must also keep a Uuid map to build edge graph.
    var nodes = [];
    parsedMemes.forEach((meme) => {
        var newMemeIntId = counter++;
        memeIDToInt[meme.uid] = newMemeIntId;
        nodes.push({
            name: meme.name,
            group: newMemeIntId,
        });
    });

    // Now we can build the edge graph, resolving Uuids to integer indicies created earlier.
    var links = [];
    parsedMemes.forEach((meme) => {
        if (meme.edges) {
            meme.edges.forEach((edge) => {
                links.push({
                    source: memeIDToInt[meme.uid],
                    target: memeIDToInt[edge],
                    weight: 1,
                });
            });
        }
    });

    const obj = { nodes: nodes, links: links };
    return obj;
};

export const webServer = async (models: Models) => {
    const { Meme } = models;

    var path = require('path');
    const express = require('express');
    const app = express();
    const port = 8080;

    app.use(express.static(path.join(__dirname, 'web')));
    app.get('/nodes', (req, res) => {
        Meme.collection
            .find()
            .toArray()
            .then(async (documents) => {
                const obj = await memesToDag(documents);
                res.send(JSON.stringify(obj));
            });
    });
    app.listen(port);
    console.log('Web server started');
};
