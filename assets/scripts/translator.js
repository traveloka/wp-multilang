String.prototype.xsplit = function (_regEx) {
  // Most browsers can do this properly, so let them work, they'll do it faster
  if ('a~b'.split(/(~)/).length === 3) {
    return this.split(_regEx);
  }

  if (!_regEx.global) {
    _regEx = new RegExp(_regEx.source, 'g' + (_regEx.ignoreCase ? 'i' : ''));
  }

  // IE (and any other browser that can't capture the delimiter)
  // will, unfortunately, have to be slowed down
  var start = 0, arr = [];
  var result;
  while ((result = _regEx.exec(this)) !== null) {
    arr.push(this.slice(start, result.index));
    if (result.length > 1) arr.push(result[1]);
    start = _regEx.lastIndex;
  }
  if (start < this.length) arr.push(this.slice(start));
  if (start === this.length) arr.push(''); //delim at the end
  return arr;
};

var wpm_translator = {

  string_to_ml_array: function (text) {

    if( Object.prototype.toString.call(text) !== '[object String]' ) {
      return text;
    }

    var split_regex = /(<!--:[a-z]{2}-->|<!--:-->|\[:[a-z]{2}\]|\[:\]|\{:[a-z]{2}\}|\{:\})/gi;
    var blocks = text.xsplit(split_regex);

    if (typeof blocks !== 'object' || !Object.keys(blocks).length)
      return text;

    if (Object.keys(blocks).length === 1) {
      return blocks[0];
    }

    var results = {},
      languages = wpm_translator_params.languages,
      j = languages.length;

    while (j--) {
      results[languages[j]] = '';
    }

    var clang_regex = /<!--:([a-z]{2})-->/gi;
    var blang_regex = /\[:([a-z]{2})\]/gi;
    var slang_regex = /\{:([a-z]{2})\}/gi; // @since 3.3.6 swirly brackets
    var lang = false;
    var matches;
    for (var i = 0; i < blocks.length; ++i) {
      var b = blocks[i];
      if (!b.length) continue;
      matches = clang_regex.exec(b);
      clang_regex.lastIndex = 0;
      if (matches !== null) {
        lang = matches[1];
        continue;
      }
      matches = blang_regex.exec(b);
      blang_regex.lastIndex = 0;
      if (matches !== null) {
        lang = matches[1];
        continue;
      }
      matches = slang_regex.exec(b);
      slang_regex.lastIndex = 0;
      if (matches !== null) {
        lang = matches[1];
        continue;
      }
      if (b === '<!--:-->' || b === '[:]' || b === '{:}') {
        lang = false;
        continue;
      }
      if (lang) {
        if (typeof(results[lang]) !== 'undefined') {
          results[lang] += b;
        }
        lang = false;
      }
    }

    for (var result in results) {
      if (!results[result].length) {
        delete results[result];
      }
    }

    return results;
  },


  translate_string: function (string, lang) {

    var strings = wpm_translator.string_to_ml_array(string);

    if (typeof strings !== 'object' || !Object.keys(strings).length) {
      return string;
    }

    var languages = wpm_translator_params.languages;

    if (lang) {
      if (typeof(languages[lang]) !== 'undefined') {
        return strings[lang];
      } else {
        return '';
      }
    }

    var language = wpm_translator_params.language,
      default_language = wpm_translator_params.default_language;

    console.log(strings, wpm_translator_params);

    if (typeof(strings[language]) !== 'undefined') {
      return strings[language];
    } else if (typeof(strings[default_language]) !== 'undefined') {
      return strings[default_language];
    } else {
      return '';
    }
  }
};
