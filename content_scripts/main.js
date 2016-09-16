WhatsLang.content = {}
WhatsLang.content.whatslang_container_id = 'whatslang-container';

WhatsLang.content.TextModel = function(text) {
  var _this = this;
  _this.translating = false;
  _this.text         = text;
  _this.old_text     = '';
  _this.translated_text = '';
  _this.set_text = function(text) {
    _this.old_text = _this.text;
    _this.text     = text;
  };

  _this.set_translated_text = function(text) {
    _this.translated_text = text;
    _this.on_change(_this);
  }

  _this.present = function() {
    return _this.text.trim().length > 0;
  }

  _this.changed = function() {
    return _this.old_text !== _this.text;
  }

  _this.on_change = function() {};

  _this.translate = function() {
    if (!_this.translating) {
      _this.set_translated_text("Translating...");
      _this.translating = true
    }

    WhatsLang.debounced_function(function() {
      chrome.runtime.sendMessage({action: 'translate', params: {word: _this.text}}, function(response) {
        _this.set_translated_text(response.translated_text);
      });
      _this.translating = false
    })
  }
}

WhatsLang.content.View = function(model){
  var _this = this;
  var container_id = WhatsLang.content.whatslang_container_id;
  var _translating = false;

  _this.model = model;

  _this.model.on_change = function(text_model) {
    if (text_model.present()) {
      _this.set_text(text_model.translated_text);
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
    _this.$el.show().position({
      my: "left bottom",
      at: "left top-10",
      of: _this.$target,
      collision: "flip"
    });
  }

  _init();
  return this;
}

var whastlang_text = new WhatsLang.content.TextModel("");
var whastlang_view = new WhatsLang.content.View(whastlang_text);

$('body').on('keypress', 'div[contenteditable], input[type=text]', function(event) {
  var $this = $(this);

  if (event.which == 13) {
    if (whastlang_text.translating) {
      event.preventDefault();
      return false;
    } else {
      var translated_text = whastlang_text.translated_text;
      $this.val(translated_text).text(translated_text);
    }
  }
});

$('body').on('keyup', 'div[contenteditable], input[type=text]', function(event) {
  var $this = $(this);
  var word_to_translate = $this.val() || $this.text();

  whastlang_view.$target = $this;
  whastlang_text.set_text(word_to_translate);

  if (!whastlang_text.changed()) return;
  if (!whastlang_text.present()) {
    whastlang_view.hide();
    return
  }

  whastlang_text.translate();
})