var WhatsLang = window.WhatsLang || {};
chrome.runtime.onMessage.addListener(function(request, sender, response) {
  actions[request.action](request.params);
});

var actions = {
  translate: function(params) {
    Translator().translate(params.word, {success: response});
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
    console.log("translating... " + word);

    var options = {
      url: "https://translate.googleapis.com/translate_a/single?dt=t&dt=bd",
      data: {
        client: 'gtx',
        q: word,
        sl: options.sl,
        tl: options.tl,
        dj: 1
      },
      dataType: 'json',
      success: function on_success(data) {
        var parsed_data = _parse_data(data);
        options.success && options.success.call(this, parsed_data);
      },
      error: function(xhr, status, e) {
        options.error && options.error.call(this, {e: e, xhr: xhr});
      }
    };

    $.ajax(options);
  }

  return {
    translate: _translate
  }
}

WhatsLang.config = {
  _set_to_default: function() {
    var translate_default_options = WhatsLang.config.translate_default_options;
    chrome.storage.local({translate_options: translate_default_options});
  },
  _init: function() {
    WhatsLang.config._set_to_default();
    WhatsLang.config._bind_events();
  },
  _bind_events: function() {
    chrome.storage.local.onChanged(function(changes) {
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