
Документация на русском - см. INSTALL.ru.md (Russian docs -- see INSTALL.ru.md).

# Up and running locally

## 1. OS

The site works under MacOS and Unix systems, but not on Windows, because many 3rd party modules are not compatible with Windows.

## 2. Create the folder

Create a folder `/js` for the project. You can use any other directory as well, just adjust the paths below.

## 3. Install and run Node.JS and MongoDB

Node.JS – the last version from [https://nodejs.org](https://nodejs.org).

MongoDB - can be either 2.6+ or newer.

Use packages for Linux, [MacPorts](http://www.macports.org/install.php) or [Homebrew](http://brew.sh) for Mac.

Если через MacPorts, то:
```
sudo port install mongodb
sudo port load mongodb
```

## 3. Клонируйте репозитарий

Предположу, что Git у вас уже стоит и вы умеете им пользоваться.

Клонируйте только ветку `master` движка:
```
cd /js
git clone -b master --single-branch https://github.com/iliakan/javascript-nodejs
```


## 4. Глобальные модули

Поставьте глобальные модули:

```
npm install -g mocha bunyan gulp nodemon
```

Чтобы автоматически ставилась переменная `NODE_PATH`, для запуска `gulp` далее используется команда: `npm --silent run gulp --`.

На практике для удобства используется alias:
```
alias glp="npm --silent run gulp -- "
```

Или же можно запускать gulp как: `NODE_PATH=./handlers:./modules gulp`.

## 5. Системные пакеты

Для работы также нужны Nginx, GraphicsMagick и ImageMagick (обычно используется GM, он лучше, но иногда IM).

Под Macports команды такие:

```
sudo port install ImageMagick GraphicsMagick
sudo port install nginx +debug+gzip_static+realip+geoip

sudo port load nginx
```

## 6. npm install

В директории, в которую клонировали, запустите:

```
npm install
```

## 7. Конфигурация Nginx с нуля

Если в системе ранее не стоял nginx, то поставьте его.

Логи nginx пишет в директорию `/var/log/nginx`.

Если её нет, то нужно создать и поставить пермишны/владельца. Например, если компьютер – ваш личный, то запустить от рута:
```
mkdir /var/log/nginx
chmod 777 /var/log/nginx
```

Cтавим настройки для сайта запуском:
```
npm --silent run gulp -- config:nginx --prefix /opt/local/etc/nginx --root /js/javascript-nodejs --env development --clear
```

Здесь `--prefix` -- место для конфигов nginx, обычно `/etc/nginx`, в случае MacPorts это `/opt/local/etc/nginx`.
В параметр `--root` запишите место установки сайта.

В `--root` находится путь к движку: если вы использовали другой путь для сайта, вместо `/js/javascript-nodejs`, то измените его.

Опция `--clear` полностью удалит старые конфиги nginx.

Также рекомендуется в `/etc/hosts` добавить строку:
```
127.0.0.1 javascript.in
```

Такое имя хоста стоит в конфигурации Nginx.

## 7.1. Если Nginx у вас уже стоит

Если уже есть nginx, то сделайте резервную копию всех его конфигов.

После этого выполните предыдущую секцию без `--clear` в команде:

```
npm --silent run gulp -- config:nginx --prefix /opt/local/etc/nginx --root /js/javascript-nodejs --env development
```

Такая команда скопирует файлы из директории `/js/javascript-nodejs/nginx` в указанную директорию `--prefix`, но без перезаписывания.
 При копировании используется небольшая шаблонизация конфигов, т.е. это не просто `cp`, но структура файлов остаётся такой же.

Основные конфиги будут перезаписаны, но в `sites-enabled` останутся и будут подключены и другие сайты.

Перезапустите Nginx. Проверьте, что ваши предыдущие проекты работают.


## 8. База

Клонируйте ветку учебника, например `ru`:
```
cd /js
git clone -b ru --single-branch https://github.com/iliakan/javascript-tutorial
```

После клонирования импортируйте учебник в базу командой:
```
PLUNK_REMOTE_OFF=1 npm --silent run gulp -- tutorial:import --root /js/javascript-tutorial
```

Здесь `/js/javascript-tutorial` -- директория с репозитарием учебника.

`PLUNK_REMOTE_OFF=1` отключает автоматическую загрузку примеров из учебников на сервис plnkr.co.
Она требует настройки сессии на plnkr.co и нужна при публикации учебника.
Для запуска проекта она не нужна, особенно если вас интересуют другие модули.

## 9. Запуск сайта

Запуск сайта в режиме разработки:
```
NODE_LANG=ru ./dev
```

Это поднимет сразу и сайт и механизмы автосборки стилей-скриптов и livereload.

Обратите внимание: ходить на сайт нужно через Nginx (обычно порт 80), не напрямую в Node.JS (не будет статики).

Если в `/etc/hosts` есть строка `127.0.0.1 javascript.in`, то адрес будет `http://javascript.in/`.

# TroubleShooting

Если что-то не работает -- [пишите issue](https://github.com/iliakan/javascript-nodejs/issues/new).

