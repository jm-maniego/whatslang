var WhatsLang = window.WhatsLang || {};
WhatsLang.debounce = function(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      func.apply(context, args);
    }, wait);
  }
}
WhatsLang.debounced_function = WhatsLang.debounce(function(callback){
  callback.apply(this, arguments);
}, 250)
