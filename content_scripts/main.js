WhatsLang.content = {}
WhatsLang.content.whatslang_container_id = 'whatslang-container';

WhatsLang.content.WhatsLangDialog = function(){
  var _this = this;
  var container_id = WhatsLang.content.whatslang_container_id;
  var _translating = false;

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

  _this.setText = function(text){
    return _this.$el.text(text) && this;
  }

  _this.update_text = function(text) {
    if (!_translating) {
      _this.setText('Translating...');
      _translating = true;
    }

    WhatsLang.debounced_function(function() {
      chrome.runtime.sendMessage({action: 'translate', params: {word: text}}, function(response) {
        _this.setText(response.translated_text);
        _translating = false;
      });
    })
  }

  _init();
  return this;
}

var $whatslang_container = new WhatsLang.content.WhatsLangDialog();

$('body').on('keyup', 'div[contenteditable], textarea, input[type=text]', function() {
  var $this = $(this);
  var word_to_translate = $this.val() || $this.text();
  $whatslang_container.update_text(word_to_translate);
})