WhatsLang.content = {}
WhatsLang.content.whatslang_container_id = 'whatslang-container';

WhatsLang.content.TextModel = function(text) {
  var _this = this;
  _this.text = text;
  _this.set_text = function(text) {
    _this.text = text;
    _this.onchanged(_this);
  };

  _this.present = function() {
    return _this.text.trim().length > 0;
  }

  _this.onchanged = function() {};
}

WhatsLang.content.View = function(model){
  var _this = this;
  var container_id = WhatsLang.content.whatslang_container_id;
  var _translating = false;

  _this.model = model;

  _this.model.onchanged = function(text_model) {
    if (text_model.present()) {
      _this.set_text(text_model.text);
      _this.show();
    } else {
      _this.hide();
    }
  }

  _this.templates = {
    container: function() {
      _this.$el = $('<div>', {id: container_id});
      return _this.$el;
    }
  }

  var _init = function() {
    var $container = _this.templates.container();
    _this.hide();
    $('body').prepend($container);
  }

  _this.set_text = function(text){
    return _this.$el.text(text) && this;
  }

  _this.hide = function() {
    _this.$el.hide();
  }

  _this.show = function() {
    _this.$el.position({
      my: "left bottom",
      at: "left top-10",
      of: _this.$target,
      collision: "flip"
    }).show();
  }

  _init();
  return this;
}

var whastlang_text = new WhatsLang.content.TextModel("");
var whastlang_view = new WhatsLang.content.View(whastlang_text);

$('body').on('keyup', 'div[contenteditable], textarea, input[type=text]', function() {
  var $this = $(this);
  var word_to_translate = $this.val() || $this.text();
  whastlang_view.$target = $this;
  if (!$this.data('translating')) {
    whastlang_text.set_text("Translating...");
    $this.data('translating', true);
  }

  WhatsLang.debounced_function(function() {
    chrome.runtime.sendMessage({action: 'translate', params: {word: word_to_translate}}, function(response) {
      whastlang_text.set_text(response.translated_text);
    });
    $this.data('translating', false);
  })
})