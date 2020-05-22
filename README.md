# Don't let your memes be dreams

**janule** is a [Discord](https://discord.com/) bot which helps with meme storage.

# __Please run `npm run-scripts all` before committing!__

## Developer environment setup

1. ```npm install```

2. Set up `config.json` with Discord token and Mongodb/mlab.com url

3. ```npm run-scripts start```

## Installing dependencies

`npm install <package name>`

For "dev" dependencies (like `prettier`), use `--save-dev`.

FYI We're using Node v13.3.0

## `prettier` file formatting

This will clean up everything in `src/`:

`npm run-script clean`

See:
 * https://prettier.io/docs/en/options.html
 * https://prettier.io/docs/en/configuration.html

## Build

`npm run-script build`

## Architecture

![Image of the architecture](images/architecture/architecture.png)

## Run!

`npm run-script start`