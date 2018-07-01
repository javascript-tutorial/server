# Tutorial server

Hi everyone!

This is a standalone server for the javascript tutorial https://javascript.info.

You can use it to run the tutorial locally and translate it into your language.

# Installation

1. Install [Git](https://git-scm.com/downloads) and [Node.JS](https://nodejs.org).

    These are required to update and run the project.
    
    (Maybe later, optional) If you're going to change images, please install [GraphicsMagick](http://www.graphicsmagick.org/).
        
    For non-Windows OS use standard install tools (packages or whatever convenient).

2. Create the root folder.

    Create a folder `/js` for the project. You can use any other directory as well, just adjust the paths below.

3. Clone the tutorial server into it:

    ```
    cd /js
    git clone https://github.com/iliakan/javascript-tutorial-server
    ```

4. Clone the tutorial text into it.

    The text repository has "-language" at the end, e.g:
    ```
    cd /js
    git clone https://github.com/iliakan/javascript-tutorial-ru
    ```

4. Install global modules:

    ```
    npm install -g bunyan gulp
    ```

5. Run the site

    Run the site with the language:
    ```
    cd /js/javascript-tutorial-server
    ./edit en
    ```

    Wait for a couple of seconds as it reads the tutorial from disk and builds static assets.

    Then access the site at `http://127.0.0.1:3000`.

6. Edit the tutorial

    The files are editable in the tutorial text folder (step 4).
    As you edit text files, the webpage gets reloaded automatically, so it's handy
    to split the screen at two sides: put the browser onn the left 50% and edit in the right 50%%.
    
# TroubleShooting

If something doesn't work -- [file an issue](https://github.com/iliakan/javascript-tutorial-server/issues/new).

--  
Yours,  
Ilya Kantor 