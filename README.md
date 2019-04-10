# Tutorial server

Hi everyone!

This is a standalone server for the javascript tutorial https://javascript.info.

You can use it to run the tutorial locally and translate it into your language.

Windows, Unix-systems and MacOS are supported. For Windows, you'll need to call scripts with ".cmd" extension, that are present in the code alongside with Unix versions. 

# Installation

1. Install [Git](https://git-scm.com/downloads) and [Node.JS](https://nodejs.org).

    These are required to update and run the project.
    For Windows just download and install, otherwise use standard OS install tools (packages or whatever convenient).
    
    Please use Node.JS 10+. 
    
    (Maybe later, optional) If you're going to change images, please install [GraphicsMagick](http://www.graphicsmagick.org/).

2. Install global Node modules:

    ```
    npm install -g bunyan gulp
    ```

3. Create the root folder.

    Create a folder `/js` for the project. If you use another directory as the root, adjust the paths below.

4. Clone the tutorial server into it:

    ```
    cd /js
    git clone https://github.com/iliakan/javascript-tutorial-server
    git clone https://github.com/iliakan/jsengine javascript-tutorial-server/modules/jsengine
    ```

    Please note, there are two clone commands. That's not a typo: `modules/jsengine` is cloned from another repository.

5. Clone the tutorial text into it.

    The text repository ends with the language code, e.g for the French version `...-fr`, for Russian – `...-ru` etc.
    
    E.g. for the English version:
    ```
    cd /js
    git clone https://github.com/iliakan/javascript-tutorial-en
    ```

6. Run the site

    Install local modules:

    ```
    cd /js/javascript-tutorial-server
    npm install
    ```
    
    Run the site with the same language. Above we cloned `en` tutorial, so:

    ```
    ./edit en
    ```

    This will import the tutorial from `/js/javascript-tutorial-en` and start the server.

    Wait a bit while it reads the tutorial from the disk and builds static assets.

    Then access the site at `http://127.0.0.1:3000`.

7. Edit the tutorial

    As you edit text files in the tutorial text repository (cloned at step 5), 
    the webpage will reload automatically. 

    
# Change server language

The server uses English by default for navigation and design.

You can set another language it with the second argument of `edit`.

E.g. if you cloned `ru` tutorial, it makes sense to use `ru` locale for the server as well:

```
cd /js/javascript-tutorial-server
./edit ru ru
```

Please note, the server must support that language. There must be corresponding locale files for that language in the code of the server, otherwise it exists with an error. As of now, `ru`, `en`, `zh` and `ja` are fully supported.
    
# Dev mode

If you'd like to edit the server code (assuming you're familiar with Node.js), *not* the tutorial text, then there are two steps to do.

First, run the command that imports (and caches) the tutorial:

```
cd /js/javascript-tutorial-server
NODE_LANG=en TUTORIAL_ROOT=/js/javascript-tutorial-en npm run gulp jsengine:koa:tutorial:import
``` 

In the code above, `NODE_LANG` sets server language, while `TUTORIAL_ROOT` is the full path to tutorial repo, by default is `/js/javascript-tutorial-$NODE_LANG`.

Afterwards, call `./dev <server language>` to run the server:

```
cd /js/javascript-tutorial-server
./dev en
```

Running `./dev` uses the tutorial that was imported and cached by the previous command. 

It does not "watch" tutorial text, but it reloads the server after code changes.
 
Again, that's for developing the server code itself, not writing the tutorial.
    
# Troubleshooting

If you have a very old copy of the English tutorial, please rename `1-js/05-data-types/09-destructuring-assignment/1-destructuring-assignment` to `1-js/05-data-types/09-destructuring-assignment/1-destruct-user`.

Please ensure you have Node.js version 10+ (`node -v` shows the version).

If it still doesn't work – [file an issue](https://github.com/iliakan/javascript-tutorial-server/issues/new). Please mention OS and Node.js version, 

Please pull the very latest git code and install latest NPM modules before publishing an issue.

--  
Ilya Kantor 
iliakan@javascript.info
