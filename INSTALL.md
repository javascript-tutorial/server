
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

You'll also need to install nginx and GraphicsMagick (for image resizing).

For MacPorts, the commands are:

```
sudo port install GraphicsMagick
sudo port install nginx +debug+gzip_static+realip+geoip

sudo port load nginx
```

## 6. npm install

In the directory with javascript-tutorial-server, run:

```
npm install
```

## 7. Configuring Nginx from scratch

If you had no nginx before, then everything is simple.

The logs directory is `/var/log/nginx`.

Create it and set owner/permissions. For a personal computer, can do it like this:

```
mkdir /var/log/nginx
chmod 777 /var/log/nginx
```

Create configs by running:
```
npm --silent run gulp -- config:nginx --prefix /opt/local/etc/nginx --root /js/javascript-tutorial-server --env development --clear
```

Here `--prefix` -- is the directory for nginx config, usually `/etc/nginx`, for MacPorts it's `/opt/local/etc/nginx`.

The `--root` is where the server is located. If you used another path instead of `/js/javascript-tutorial-server`, then change it.

The `--clear` option clears all configs before creating the new ones. That's fine if you had no nginx before.

Also it's recommended to add this line to `/etc/hosts`:
```
127.0.0.1 javascript.in
```

This host name is in the Nginx config already.

## 7.1. Если Nginx у вас уже стоит

If you already have nginx, make a backup of it's config files.

Then execute the prevous section without the `--clear` at the end:

```
npm --silent run gulp -- config:nginx --prefix /opt/local/etc/nginx --root /js/javascript-nodejs --env development
```

The command copies files from the directory `/js/javascript-tutorial-server/nginx` into the folder `--prefix`, but without removing old configs.

So if you had other sites in `sites-enabled`, they will not be removed.

Rerun nginx. Make sure your existing projects work.

## 8. Database

Copy the tutorial repo, for instance `javascript-tutorial-en`

```
cd /js
git clone https://github.com/iliakan/javascript-tutorial-en
```

After that, import it with the command:
```
PLUNK_REMOTE_OFF=1 npm --silent run gulp -- tutorial:import --root /js/javascript-tutorial-en
```

Here `/js/javascript-tutorial-en` -- the directory with the tutorial repository.

`PLUNK_REMOTE_OFF=1` disables automatic uploading of examples to plnkr.co.
That requires to setup a plnkr session, and is not necessary to run the tutorial.

## 9. Run the site

Run the site with the language in `NODE_LANG` variable:
```
NODE_LANG=en ./dev
```

That builds all styles and runs the website.

Please note: Node.JS server is running at `127.0.0.1:3000`, but to get styles and scripts, you should use  `127.0.0.1:80`
Это поднимет сразу и сайт и механизмы автосборки стилей-скриптов и livereload.

Обратите внимание: ходить на сайт нужно через Nginx (обычно порт 80), не напрямую в Node.JS (не будет статики).

Если в `/etc/hosts` есть строка `127.0.0.1 javascript.in`, то адрес будет `http://javascript.in/`.

# TroubleShooting

Если что-то не работает -- [пишите issue](https://github.com/iliakan/javascript-nodejs/issues/new).

