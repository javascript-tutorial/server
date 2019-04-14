// client-side locale example
// can be used as require('client/test') from server-side
// and from client side too
const t = require('engine/i18n/t');

t.i18n.add('test', require('../../locales/' + require('config').lang + '.yml'));

console.log(t('test.ilya_kantor'));
