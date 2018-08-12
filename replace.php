<?php

$files = glob("**/*.js");
foreach($files as $file) {
  echo "$file\n"; 
  $content = file_get_contents($file);

  $replaced = str_replace($search, $replace, $content);

  file_put_contents($file, $content);
}

$search = [
  "require('textUtil",
  "require('i18n",
  "require('log",
  "require('localStorage",
  "require('serverPug",
  "require('momentWithLocale"
];

$replace = [
 "require('@jsengine/text-utils",
 "require('@jsengine/i18n",
 "require('@jsengine/log",
 "require('@jsengine/local-storage",
 "require('@jsengine/server-pug",
 "require('@jsengine/moment-with-locale"
];
