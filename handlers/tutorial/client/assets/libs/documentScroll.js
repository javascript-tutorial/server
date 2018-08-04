/**
 * Объект с информацией о прокрутке в документе
 * @return {object} 
 *  top: сколько пикселей прокручено сверху, верхняя граница видимой части
 *  bottom: top + высота окна, то есть нижняя граница видимой части пикселей низ, 
 *  height: полная высота страницы
 */
function getDocumentScroll() {
  return {
    top: getDocumentScrollTop(),
    bottom: getDocumentScrollBottom(),
    height: getDocumentScrollHeight()
  };
}


function getDocumentScrollTop() {
  var html = document.documentElement;
  var body = document.body;

  var scrollTop = html.scrollTop || body && body.scrollTop || 0;
  scrollTop -= html.clientTop; // IE<8

  return scrollTop;
}

function getDocumentScrollHeight() {
  var scrollHeight = document.documentElement.scrollHeight;
  var clientHeight = document.documentElement.clientHeight;

  scrollHeight = Math.max(scrollHeight, clientHeight);

  return scrollHeight;
}

function getDocumentScrollBottom() {
  return getDocumentScrollTop() + document.documentElement.clientHeight;
}

