WhatsLang.content = {}
WhatsLang.content.whatslang_container_id = 'whatslang-container';

WhatsLang.content.TextModel = function(text) {
  var _this = this;
  _this.text = text;
  _this.set_text = function(text) {
    _this.text = text;
    _this.onchanged.call(this, text);
  };

  _this.onchanged = function() {};
}

WhatsLang.content.View = function(model){
  var _this = this;
  var container_id = WhatsLang.content.whatslang_container_id;
  var _translating = false;

  _this.model = model;

  _this.templates = {
    container: function() {
      _this.$el = $('<div>', {id: container_id});
      return _this.$el;
    }
  }

  var _init = function() {
    var $container = _this.templates.container();
    $('body').prepend($container);
  }

  _this.set_text = function(text){
    return _this.$el.text(text) && this;
  }

  _this.model.onchanged = function(text) {
    _this.set_text(text);
  }

  _init();
  return this;
}

var whastlang_text = new WhatsLang.content.TextModel("");
var whastlang_view = new WhatsLang.content.View(whastlang_text);

$('body').on('keyup', 'div[contenteditable], textarea, input[type=text]', function() {
  var $this = $(this);
  var word_to_translate = $this.val() || $this.text();
  if (!$this.data('translating')) {
    whastlang_text.set_text("Translating...");
    $this.data('translating', true);
  }

  WhatsLang.debounced_function(function() {
    chrome.runtime.sendMessage({action: 'translate', params: {word: word_to_translate}}, function(response) {
      whastlang_text.set_text(response.translated_text);
      $this.data('translating', false);
    });
  })
})