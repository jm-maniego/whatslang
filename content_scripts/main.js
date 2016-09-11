WhatsLang.content = {}
WhatsLang.content.whatslang_container_id = 'whatslang-container';
WhatsLang.content._init = function() {
  // FIXME: Shadow DOM
  var whatslang_container_id = WhatsLang.content.whatslang_container_id;
  var $container = $('#' + whatslang_container_id);
  if ($container.length === 0) {
    $('body').prepend($('<div>', {id: whatslang_container_id}));
  }
}

WhatsLang.content._init();
var $whatslang_container = $('#' + WhatsLang.content.whatslang_container_id);

$('body').on('keyup', 'div[contenteditable], textarea, input[type=text]', function() {
  var $this = $(this);
  if (!$whatslang_container.data('translating')) {
    $whatslang_container.data('translating', true).html('Translating...');
  }

  WhatsLang.debounced_function(function() {
    var word_to_translate = $this.val() || $this.text();
    chrome.runtime.sendMessage({action: 'translate', params: {word: word_to_translate}}, function(response) {
      $whatslang_container.data('translating', false).html(response.translated_text);
    });
  })
})