export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper("isStringNotEmpty", function (stringtotest) {
    return stringtotest.length > 0;
  });

  Handlebars.registerHelper("removeMarkup", function (text) {
    const markup = /<(.*?)>/gi;
    return new Handlebars.SafeString(text.replace(markup, ""));
  });

  Handlebars.registerHelper("removeStyling", function (text) {
    const styling = /style="[^"]+"/gi;
    return new Handlebars.SafeString(text.replace(styling, ""));
  });

  Handlebars.registerHelper("keepMarkup", function (text) {
    return new Handlebars.SafeString(text);
  });

  Handlebars.registerHelper("localizeabbr", function (text) {
    return game.i18n.localize(text + "ABBR");
  });

  // If is not equal
  Handlebars.registerHelper("ifne", function (v1, v2, options) {
    if (v1 !== v2) return options.fn(this);
    else return options.inverse(this);
  });

  // if not
  Handlebars.registerHelper("ifn", function (v1, options) {
    if (!v1) return options.fn(this);
    else return options.inverse(this);
  });

  // if equal
  Handlebars.registerHelper("ife", function (v1, v2, options) {
    if (v1 === v2) return options.fn(this);
    else return options.inverse(this);
  });

  // if greater
  Handlebars.registerHelper("ifgt", function (v1, v2, options) {
    if (v1 > v2) return options.fn(this);
    else return options.inverse(this);
  });

  // if all true
  Handlebars.registerHelper("ifat", function (...args) {
    // remove handlebar options
    let options = args.pop();
    return args.indexOf(false) === -1 ? options.fn(this) : options.inverse(this);
  });

  // Times
  Handlebars.registerHelper("times", function (n, block) {
    var accum = "";
    for (var i = 0; i < n; ++i) accum += block.fn(i);
    return accum;
  });

  Handlebars.registerHelper("and", function (val1, val2) {
    return val1 && val2;
  });

  Handlebars.registerHelper("getLabel", function (category, type) {
    return game.i18n.localize("OMEGA.label." + category + "." + "type");
  });

  Handlebars.registerHelper("getCheckboxIcon", function (value) {
    if (value) return "fas fa-square";
    return "far fa-square";
  });

  Handlebars.registerHelper("isNotEmptyString", function (value) {
    if (value === null) return false;
    if (value === "") return false;
    return true;
  });

  Handlebars.registerHelper("isNotEmptyString", function (value) {
    if (value === null) return false;
    if (value === "") return false;
    return true;
  });

}
