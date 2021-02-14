// This module is for rendering a png image of the meme graph
// which can be sent to discord or rendered online

import D3Node = require('d3-node');
import fs = require('fs');
import canvasModule = require('canvas'); // supports node-canvas v1 & v2.x
import os = require('os');
import path = require('path');

const options = { canvasModule: canvasModule };
const d3n = new D3Node(options); // pass it node-canvas

import Meme, { IMeme } from './models/meme.model';

// Format from http://bl.ocks.org/jose187/4733747
// Given Memes, convert to graph format.
const memesToDag = async (memes: IMeme[]) => {
    const memeIDToInt: Map<string, number> = new Map();
    let counter = 0;

    let parsedMemes = memes.map((meme) => {
        return {
            name: meme.name,
            uid: meme._id,
            edges: meme.edges,
            display: false,
        };
    });

    parsedMemes.map((meme) => {
        if (meme.edges?.length > 0 ?? false) {
            meme.display = true;
            meme.edges.map((edge) => {
                const targetMeme = parsedMemes.find((item) => item.uid == edge);
                if (targetMeme === undefined) {
                    console.log(meme.uid);
                    console.log(meme.edges);
                } else {
                    targetMeme.display = true;
                }
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

function tempFile(name = 'temp_file', data = '', encoding = 'utf8') {
    return new Promise((resolve, reject) => {
        const tempPath = path.join(os.tmpdir(), 'janule-');
        fs.mkdtemp(tempPath, (err, folder) => {
            if (err) return reject(err);

            const file_name = path.join(folder, name);

            fs.writeFile(file_name, data, encoding, (error_file) => {
                if (error_file) return reject(error_file);

                resolve(file_name);
            });
        });
    });
}

function paint(canvas, root = '') {
    return Meme.collection
        .find()
        .toArray()
        .then(async (documents) => {
            // Source: https://bl.ocks.org/jodyphelan/5dc989637045a0f48418101423378fbd

            const WIDTH = 800;
            const HEIGHT = 600;

            const obj = await memesToDag(documents);

            const d3 = d3n.d3;
            const context = canvas.getContext('2d');
            var simulation = d3
                .forceSimulation()
                .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
                .force('x', d3.forceX(WIDTH / 2).strength(0.1))
                .force('y', d3.forceY(HEIGHT / 2).strength(0.1))
                .force('charge', d3.forceManyBody().strength(-50))
                .force(
                    'link',
                    d3
                        .forceLink()
                        .strength(1)
                        .id(function (d) {
                            return d.group;
                        }),
                )
                .alphaTarget(0)
                .alphaDecay(0.05);

            function tick() {
                const COLOR_GRAY = '#E1E5E5';
                context.save();
                console.log('######## TICK');

                context.clearRect(0, 0, WIDTH, HEIGHT);

                obj.links.forEach(function (d) {
                    context.beginPath();
                    context.moveTo(d.source.x, d.source.y);
                    context.lineTo(d.target.x, d.target.y);
                    context.strokeStyle = COLOR_GRAY;
                    context.stroke();
                });

                // Draw the nodes
                const radius = 2;
                obj.nodes.forEach(function (d, i) {
                    context.beginPath();
                    context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
                    context.fillStyle = COLOR_GRAY;
                    context.fill();

                    context.fillText(d.name, d.x + 2, d.y + 2);
                });

                context.restore();
            }

            simulation.nodes(obj.nodes).on('tick', tick);
            simulation.force('link').links(obj.links);

            for (var i = 0; i < 20; i++) {
                simulation.tick();
            }

            // TODO: Race condition here, sometimes graph is written to file
            // before simulation is ran???
            return Promise.resolve();
        });
}

export const renderToFile = async () => {
    const canvas = d3n.createCanvas(960, 500);
    let paintPromise = paint(canvas);
    await paintPromise;

    return tempFile('temp-image.png').then(async (path: string) => {
        // Draw on your canvas, then output canvas to png

        canvas.pngStream().pipe(fs.createWriteStream(path));
        console.log('wrote ' + path);
        return path;
    });
};
