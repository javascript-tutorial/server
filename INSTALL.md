
# Up and running locally

## 1. OS

The site works under MacOS and Unix systems, but not on Windows, because many 3rd party modules are not compatible with Windows.

## 2. Create the folder

Create a folder `/js` for the project. You can use any other directory as well, just adjust the paths below.

## 3. Install and run Node.JS and MongoDB

Node.JS – the last version from [https://nodejs.org](https://nodejs.org).

MongoDB - can be either 2.6+ or newer.

Use packages for Linux, [MacPorts](http://www.macports.org/install.php) or [Homebrew](http://brew.sh) for Mac.

If you have macports then:
```
sudo port install mongodb
sudo port load mongodb
```

## 3. Clone the tutorial server

Hopefully, you have Git installed and running.

Clone the tutorial server:

```
cd /js
git clone https://github.com/iliakan/javascript-tutorial-server
```

## 4. Install global modules

Install these:

```
npm install -g mocha bunyan gulp nodemon
```

To set up `NODE_PATH` environment variable, further on we use an alias for running `gulp`:

```
alias glp="npm --silent run gulp -- "
```

Or, without the alias, you can run gulp as: `NODE_PATH=./handlers:./modules gulp ...`.

Or like this: `npm --silent run gulp -- ...`.

## 5. System packages

You'll also need to install GraphicsMagick (for image resizing).

For MacPorts, the commands are:

```
sudo port install GraphicsMagick
```

## 6. npm install

In the directory with javascript-tutorial-server, run:

```
npm install
```


## 7. Run the site

Run the site with the language in `NODE_LANG` variable:
```
./dev en
```

Then access the site at `http://127.0.0.1`.

If you have `127.0.0.1 javascript.local` in `/etc/hosts`, then the address will be `http://javascript.local`.

Wait for a couple of seconds to build static assets.

## 10. Run in "Edit" mode

In "Edit" mode the engine watches the tutorial directory, instantly picks the changes and reloads the page. Good for editing.

```
./edit en
```


# TroubleShooting

If something doesn't work -- [file an issue](https://github.com/iliakan/javascript-tutorial-server/issues/new).

