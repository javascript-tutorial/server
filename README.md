# Tutorial Server

Hi everyone!

This is a standalone server for the javascript tutorial https://javascript.info.

You can use it to run the tutorial locally and translate it into your language.

Windows, Unix systems and macOS are supported. For Windows, you'll need to call scripts with ".cmd" extension, that are present in the code alongside with Unix versions.

# Installation

1. Install [Git](https://git-scm.com/downloads) and [Node.js](https://nodejs.org).

    These are required to update and run the project.
    For Windows just download and install, otherwise use standard OS install tools (packages or whatever convenient).

    Please use Node.js 10+.

    (Maybe later, optional) If you're going to change images, please install [GraphicsMagick](http://www.graphicsmagick.org/).

2. Install global Node modules:

    ```bash
    npm install -g bunyan gulp@4
    ```

3. Create the root folder.

    Create a folder `/js` for the project. If you use another directory as the root, adjust the paths below.

4. Clone the tutorial server into it:

    ```bash
    cd /js
    git clone https://github.com/javascript-tutorial/server
    git clone https://github.com/javascript-tutorial/engine server/modules/engine
    ```

    Please note, there are two clone commands. That's not a typo: `modules/engine` is cloned from another repository.

5. Clone the tutorial text into it.

    The repository starts with the language code, e.g for the French version `fr.javascript.info`, for Russian – `ru.javascript.info` etc.

    The English version is `en.javascript.info`.

    ```bash
    cd /js
    git clone https://github.com/javascript-tutorial/en.javascript.info
    ```

6. Run the site

    Install local modules:

    ```bash
    cd /js/server
    npm install
    ```

    Run the site with the same language. Above we cloned `en` tutorial, so:

    ```bash
    ./edit en
    ```

    This will import the tutorial from `/js/en.javascript.info` and start the server.

    Wait a bit while it reads the tutorial from the disk and builds static assets.

    Then access the site at `http://127.0.0.1:3000`.**[Change Server Port](#change-server-port)**

7. Edit the tutorial

    As you edit text files in the tutorial text repository (cloned at step 5),
    the webpage will reload automatically.


# Change server language

The server uses English by default for navigation and design.

You can set another language it with the second argument of `edit`.

E.g. if you cloned `ru` tutorial, it makes sense to use `ru` locale for the server as well:

```bash
cd /js/server
./edit ru ru
```

Please note, the server must support that language. There must be corresponding locale files for that language in the code of the server, otherwise it exists with an error. As of now, `ru`, `en`, `zh`, `tr` and `ja` are fully supported.

# Change Server Port

The server uses port `3000` by default.

In case, if you want to change the port, you can change it by setting environment variable PORT to required port.

for port `5000`:

```bash
cd /js/server
PORT=5000 ./edit en
```

# Translating images

The text in SVG pictures can be translated as well.

There's a special script for that. It takes `images.yml` from the repository root, like <https://github.com/javascript-tutorial/ru.javascript.info/blob/master/images.yml>, and then replaces strings in all svgs according to its content.

Here are the steps to translate images.

**Step 1.** Create `images.yml` with translations in the repository root.

The file format is "YAML", it's quite easy to understand:

```yaml
code-style.svg:  # image file name
  "No space":    # English string
    text: "Без пробелов" # translation
    position: "center" # (optional) "center" or "right" - to position the translated string, details later
```

**Step 2.** Setup git upstream (if you haven't yet) and pull latest changes:

```bash
cd /js/zh.javascript.info # in the tutorial folder
git remote add upstream https://github.com/javascript-tutorial/en.javascript.info
git fetch upstream master
```

**Step 3.** Run the translation task:
```bash
cd /js/server # in the server folder
# adjust NODE_LANG to your language
NODE_LANG=zh glp engine:koa:tutorial:figuresTranslate
```

This script checks out all SVG images from `upstream` and replaces the strings according to `images.yml`.

**Step 4.** Then you'll need `git add/commit/push` the translated SVGs, as a part of the normal translation flow. You may want to open the translated SVGs directly in the browser to check them before doing so.


> The `--image` parameter allows to translate a single image:
> ```bash
> # replace strings only in try-catch-flow.svg
> NODE_LANG=zh glp engine:koa:tutorial:figuresTranslate --image try-catch-flow.svg
> ```


> For Windows: `npm i -g cross-env` and prepend the call with `cross-env` to pass environment variables, like this:
>
> ```bash
> cd /js/server
> cross-env NODE_LANG=zh...
> ```


## The "overflowing text" problem

The translated string may become longer than the original.

The replacement script only operates on strings, not other graphics, so a long translated string may not fit the picture.

If you notice that, you usually can adjust the translation to make it shorter. Besides, most pictures have some extra space for longer text, so a slight increase doesn't harm.

If your translated string absolutely must be longer and doesn't fit, let me know, I can adjust the picture.

## Positioning


 By default, the translated string replaces the original one, in exactly the same place of the image:

```
| hello world (before)
| 你好世界  (after translation)
```

Sometimes that's not good, e.g. if the string needs to be centered in a vertical diagram.

The `position: "center"` in `images.yml` centers the translated string, so that it will replace the original one and stay "in the middle" of the surrounding context:
```
     |
hello world
  你好世界
     |
```

The `position: "right"` makes sure that the translated string sticks to the same right edge:
```
hello world |
    你好世界 |
```

P.S In order for positioning to work, you need to have ImageMagick installed: <https://imagemagick.org/script/download.php> (or use packages for Linux/MacOS).

## Helper script: extract strings

The task to get all strings from an image as YAML (for translation, to add to `images.yml`):

```bash
cd /js/server
NODE_LANG=zh npm run gulp engine:koa:tutorial:imageYaml --image hello.svg
```


# Dev mode

If you'd like to edit the server code (assuming you're familiar with Node.js), *not* the tutorial text, then there are two steps to do.

First, run the command that imports (and caches) the tutorial:

```bash
cd /js/server
NODE_LANG=en TUTORIAL_ROOT=/js/en.javascript.info npm run gulp engine:koa:tutorial:import
```

> For Windows: `npm i -g cross-env` and prepend the call with `cross-env` to pass environment variables, like this:
>    ```bash
>    cd /js/server
>    cross-env NODE_LANG=en...
>    ```

In the code above, `NODE_LANG` sets server language, while `TUTORIAL_ROOT` is the full path to tutorial repo, by default is `/js/$NODE_LANG.javascript.info`.

Afterwards, call `./dev <server language>` to run the server:

```bash
cd /js/server
./dev en
```

Running `./dev` uses the tutorial that was imported and cached by the previous command.

It does not "watch" tutorial text, but it reloads the server after code changes.

Again, that's for developing the server code itself, not writing the tutorial.

# Troubleshooting

Please ensure you have Node.js version 10+ (`node -v` shows the version).

If it still doesn't work – [file an issue](https://github.com/javascript-tutorial/server/issues/new). Please mention OS and Node.js version.

Please pull the very latest git code and install latest NPM modules before publishing an issue.

--
Yours,
Ilya Kantor
iliakan@javascript.info
