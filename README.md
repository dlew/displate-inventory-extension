# displate-inventory-extension

Browser extension that improves information/display for Displate limited editions.

Icon by [MD Badsha Meah](https://freeicons.io/profile/3335) on [freeicons.io](https://freeicons.io)

## Development

First, you have to use a Linux/Mac operating system with [nvm](https://github.com/nvm-sh/nvm) installed.

Then, you can get the project compiling:

```
$ nvm use
$ npm install
$ npm run watch
```

Then, use "load unpacked" extension targeting the `dist` folder.

(The `watch` command will automatically recompile on changes, but you'll need to reload the extension in Chrome/Firefox
to see changes there.)

## Release

Run `$ npm run zip` and upload `output/extension.zip` to the various stores.
