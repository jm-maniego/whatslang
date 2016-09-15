var WhatsLang = window.WhatsLang || {};

WhatsLang.config = {
  _set_to_default: function() {
    var translate_default_options = WhatsLang.config.translate_default_options;
    chrome.storage.local.set({translate_options: translate_default_options});
  },
  init: function() {
    WhatsLang.config._set_to_default();
    WhatsLang.config._bind_events();
  },
  _bind_events: function() {
    chrome.storage.onChanged.addListener(function(changes) {
      for (key in changes) {
        var storageChange = changes[key];
        WhatsLang.config.translate_options[key] = storageChange.newValue;
      }
    })
  },
  translate_default_options: {
    sl: "auto", // Source language
    tl: "en"
  },
  translate_options: {
    sl: "auto",
    tl: "en"
  }
}

chrome.runtime.onInstalled.addListener(function(details) {
  WhatsLang.config.init();
})

chrome.runtime.onMessage.addListener(function(request, sender, response) {
  actions[request.action].call(this, request.params, response);
  return true;
});

var actions = {
  translate: function(params, response) {
    Translator().translate.call(this, params.word, {success: response});
  }
}

function Translator() {
  var _this = this;

  var _parse_data = function(data) {
    console.log('parsing data', data);

    var translated_text = data.sentences[0].trans;
    return {
      translated_text: translated_text
    }
  }

  var _translate = function(word, options) {
    $.extend(options, WhatsLang.config.translate_options);
    console.log("translating... " + word);
    console.log("translate options:", options)
    var ajax_options = {
      url: "https://translate.googleapis.com/translate_a/single?dt=t&dt=bd",
      data: {
        client: 'gtx',
        q: word,
        sl: options.sl,
        tl: options.tl,
        dj: 1
      },
      dataType: 'json',
      success: function (data) {
        var parsed_data = _parse_data(data);
        options.success && options.success(parsed_data);
      },
      error: function(xhr, status, e) {
        options.error && options.error({e: e, xhr: xhr});
      }
    };

    $.ajax(ajax_options);
  }

  return {
    translate: _translate
  }
}