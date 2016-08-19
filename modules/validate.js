exports.patterns = {
  webpageUrl: /^https?:\/\/([^\s/?.#-]+\.?)+(\/[^\s]*)?$/,
  phone: /[-+0-9()# ]{6,}/,
  email: /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/,
  singleword: /^\s*\S+\s*$/,
  doubleword: /^\s*(\S+\s*){1,2}$/,
  time: /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/
};

