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

    (Maybe later, optional) If you're going to change images, please install [ImageMagick](https://imagemagick.org/script/download.php).

2. Install global Node modules:

    ```bash
    npm install -g bunyan gulp@4
    ```

3. Create the root folder.

    Create a folder `/js` for the project. 
    
    You can also use another directory as the root, then change the paths below: replace `/js` with your root.

4. Clone the tutorial server into it:

    ```bash
    cd /js
    git clone https://github.com/javascript-tutorial/server
    git clone https://github.com/javascript-tutorial/engine server/modules/engine
    ```

    Please note, there are two clone commands. That's not a typo: `modules/engine` is cloned from another repository.
    
    And please don't forget this when updating, `modules/engine` needs to be fetched and merged too.

5. Clone the tutorial text into it.

    The repository starts with the language code, e.g for the French version `fr.javascript.info`, for Russian – `ru.javascript.info` etc.

    The English version is `en.javascript.info`.
    
    The tutorial text repository should go into the `repo` subfolder, like this:

    ```bash
    cd /js/server/repo
    git clone https://github.com/javascript-tutorial/en.javascript.info
    ```

6. Run the site

    Install local NPM modules:

    ```bash
    cd /js/server
    npm install
    ```

    Run the site with the `./edit` command with the language argument. Above we cloned `en` tutorial, so:

    ```bash
    ./edit en
    ```

    This will import the tutorial from `/js/server/repo/en.javascript.info` and start the server.

    Wait a bit while it reads the tutorial from the disk and builds static assets.

    Then access the site at `http://127.0.0.1:3000`.

    > To change the port, set the `PORT` environment variable:
    > ```bash
    > # Runs the server at http://127.0.0.1:8080
    > PORT=8080 ./edit en
    > ```
    > For Windows, read the note about environment variables below.

7. Edit the tutorial

    As you edit text files in the tutorial text repository (cloned at step 5),
    the webpage will reload automatically.


# Windows: Environment variables

For Windows, to pass environment variables, such as `PORT`, you can install `npm i -g cross-env` and prepend calls with `cross-env`, like this:

```bash
cd /js/server
cross-env PORT=8080 ./edit en
```

In the examples below, the commands are without `cross-env`, prepend it please, if you're on Windows.

Alternatively, you can use other Windows-specific ways to set environment variables, such as a separate `set PORT=8080` command.

# Change server language

The server uses English by default for navigation and design.

You can set another language it with the second argument of `edit`.

E.g. if you cloned `ru` tutorial, it makes sense to use `ru` locale for the server as well:

```bash
cd /js/server
./edit ru ru
```

Please note, the server must support that language. There must be corresponding locale files for that language in the code of the server, otherwise it exists with an error. As of now, `ru`, `en`, `zh`, `tr`, `ko` and `ja` are fully supported.

# Translating images

Please don't translate SVG files manually.

They are auto-generated from the English variant, with the text phrases substituted from `images.yml` file in the repository root, such as <https://github.com/javascript-tutorial/ru.javascript.info/blob/master/images.yml>. 

So you need to translate the content of `images.yml` and re-generate the SVGs using a script.

Here are the steps to translate images.

**Step 1.** Create `images.yml` with translations in the repository root.

An example of such file (in Russian): https://github.com/javascript-tutorial/ru.javascript.info/blob/master/images.yml

The file format is [YAML](https://learnxinyminutes.com/docs/yaml/).

Here's a quote:

```yaml
code-style.svg:  # image file name
  "No space":    # English string
    text: "Без пробелов" # translation
    position: "center" # (optional) "center" or "right" - to position the translated string
```

As you can see, for each image file (such as `code-style.svg`), there go English phrases (such as `"No space"`).

For each phrase, there's the translated `text` and the text `position` (not always needed, details will come soon).

You can make a small file with only one image for the start. 

**Step 2.** Setup git upstream (if you haven't yet) and pull latest changes from English version:

```bash
cd /js/server/repo/zh.javascript.info # in the tutorial folder

git remote add upstream https://github.com/javascript-tutorial/en.javascript.info

git fetch upstream master
```

**Step 3.** Run the translation task:

```bash
cd /js/server # in the server folder

# adjust NODE_LANG to your language

NODE_LANG=zh npm run gulp -- engine:koa:tutorial:figuresTranslate
```

This script checks out all SVG images from `upstream` (English version) and replaces the strings inside them according to `images.yml`. So they become translated.

The new translated SVGs are the tutorial folder now, but not committed yet. 

You can see them with `git status`.

Take a moment to open and check them, e.g. in Chrome browser, just to ensure that the translation looks good.

P.S. If an image appears untranslated on refresh, force the browser to "reload without cache" ([hotkeys](https://en.wikipedia.org/wiki/Wikipedia:Bypass_your_cache#Bypassing_cache)).

**Step 4.** Then you'll need to `git add/commit/push` the translated SVGs, as a part of the normal translation flow. 

...And voilà! SVGs are translated!

> Normally, the translation script looks for all images listed in `images.yml`.
> To translate a single image, use the `--image` parameter of the script:
> ```bash
> # replace strings only in try-catch-flow.svg
> NODE_LANG=zh npm run gulp -- engine:koa:tutorial:figuresTranslate --image try-catch-flow.svg
> ```


## Positioning

By default, the translated string replaces the original one, starting in exactly the same place of the image.

Before the translation:

```
| hello world
```

After the translation (`你` is at the same place where `h` was, the string is left-aligned):

```
| 你好世界    
```

Sometimes that's not good, e.g. if the string needs to be centered, e.g. like this:

```
     |
hello world
     |
```

(The "hello world" is centered between two `|`).

Then, if we just replace the string, it would become:

```
     |
你好世界
     |
```

As we can see, the new phrase is shorter. We should move it to the right a bit. 

The `position: "center"` in `images.yml` does exactly that. 

It centers the translated string, so that it will replace the original one and stay "in the middle" of the surrounding context.

Here's the text with `position: "center"`, centered as it should be:
```
   |
你好世界
   |
```

The `position: "right"` makes sure that the translated string sticks to the same right edge:
```
hello world |
    你好世界 |
```

That's also useful for images when we expect the text to stick to the right.

P.S In order for positioning to work, you need to have ImageMagick installed: <https://imagemagick.org/script/download.php> (or use packages for Linux or homebrew/macports for MacOS).

## Helper script: extract strings

The task to get all strings from an image as YAML (for translation, to add to `images.yml`):

```bash
cd /js/server # in the server folder

NODE_LANG=zh npm run gulp -- engine:koa:tutorial:imageYaml --image code-style.svg
```

It extracts all text lines. Useful for debugging, when the translation doesn't "catch up", because the SVG text has an extra space or so.

## The "overflowing text" problem

The replacement script only operates on strings, not other graphics, so a long translated string may not fit the picture. 

Most pictures have some extra space for longer text, so a slight increase doesn't harm. 

If the translated text is much longer, please try to change it, make it shorter to fit. 

If the translated text absolutely must be longer and doesn't fit, let me know, we'll see how to adjust the picture.

# Dev mode

If you'd like to edit the server code (assuming you're familiar with Node.js), *not* the tutorial text, then there are two steps to do.

First, run the command that imports (and caches) the tutorial:

```bash
cd /js/server
NODE_LANG=en npm run gulp engine:koa:tutorial:import
```

> For Windows: `npm i -g cross-env` and prepend the call with `cross-env` to pass environment variables, like this:
>    ```bash
>    cd /js/server
>    cross-env NODE_LANG=en...
>    ```

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

## Linux: inotify and monitored files

The server's tools use [inotify](https://en.wikipedia.org/wiki/Inotify) by default on Linux to monitor directories for changes. In some cases there may be too many items to monitor.

_*!* Samples code below work correctly for Ubuntu_.

You can get your current inotify files watch limit by:

```sh
$> cat /proc/sys/fs/inotify/max_user_watches
```

When this limit is not enough to monitor all files, you have to increase the limit for the server to work properly.

You can set a new limit temporary by:

```sh
$> sudo sysctl fs.inotify.max_user_watches=524288
$> sudo sysctl -p
```

It is very important that you refer to the documentation for your operating system to change this parameter permanently.

--<br>Yours,<br>Ilya Kantor<br>iliakan@javascript.info

