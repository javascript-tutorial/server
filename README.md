# Движок javascript.ru на javascript

Всем привет!

А это исходный код для движка сайта [https://learn.javascript.ru](https://learn.javascript.ru) на платформе Node.JS.

<!--
[![Build Status](https://travis-ci.org/iliakan/javascript-nodejs.svg?branch=master)](https://travis-ci.org/iliakan/javascript-nodejs)
-->

## Что делаем?

* Сайт по JavaScript и смежным технологиям (AJAX, COMET, Browser APIs...)
* Сайт достаточно посещаемый: порядка 1-1.5 млн просмотров в месяц.
* Сайт быстрый, генерация страницы до 100мс, лучше до 50мс.
* Сайт пока на русском, на английском сделаем потом.
* Сайт для разработчиков, да, кстати, они не пользуются старыми и страшными IE.

Профиль юзера на AngularJS, в остальном не SPA, так как контент-сайт.

## Что в опен-сорсе?

В опен-сорсе весь код сайта, включая такие аспекты как:

<ul>
<li>Общая архитектура приложения.</li>
<li>Авторизация, включая через Facebook/Google/VKontakte/Яндекс/Github.</li>
<li>Элементы e-магазина, включая приём оплаты Paypal/Webmoney/PayAnyWay, через Я.Деньги и другими способами.</li>
<li>Отправка почты через Mandrill API с обработкой webhook со статусом.</li>
<li>Транслоадинг и не использующая память/диск (через потоки) загрузка картинок на сервис http://imgur.com.</li>
<li>Логгер.</li>
<li>Шаблонизация с Jade + BEM.</li>
<li>Система сборки на Webpack.</li>
<li>...</li>
</ul>

Многие модули из него можно взять и выделить в отдельные проекты, было бы желание.

Также в опен-сорсе &ndash; текст учебника JavaScript.
Правда, он в другом репозитории [https://github.com/iliakan/javascript-tutorial](https://github.com/iliakan/javascript-tutorial), здесь только код.

Для установки dev-среды см. [INSTALL.md](https://github.com/iliakan/javascript-tutorial-server/blob/master/Install.md).

## ♡

Пишите в issues, если есть о чём.

