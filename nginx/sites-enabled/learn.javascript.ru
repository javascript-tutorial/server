# Main host
# For home dev I use in DNS: javascript.in

server {

  listen 80;

  server_name javascript.in localhost;

  # do we really need these urls secure?
  #if ($scheme = http) {
  #  rewrite ^/ebook($|/.*) https://$host$request_uri permanent;
  #  rewrite ^/courses/signup($|/.*) https://$host$request_uri permanent;
  #}

  access_log  /var/log/nginx/learn.javascript.ru.log main;

  root         <%=root%>/public;

  # js.cx
  add_header X-Frame-Options SAMEORIGIN;
  add_header X-Content-Type-Options nosniff;

  include "partial/error-pages";

  # zip for plunk
  location ^~ /tutorial/zipview/ {
    include "partial/proxy-3000";
  }

  # no . and folder/ -> try folder/index.html first, then @node
  location ~ ^(?<uri_no_dot>[^.]*?)/$ {
    try_files $uri_no_dot/index.html @node;
  }

  # no . and not folder/ -> @node
  location ~ ^[^.]*$ {
    if (-f <%=root%>/.maintenance) {
      return 503;
    }
    include "partial/proxy-3000";
  }

  location @node {
    if (-f <%=root%>/.maintenance) {
      return 503;
    }

    include "partial/proxy-3000";
  }

  include "partial/javascript-static";

}

