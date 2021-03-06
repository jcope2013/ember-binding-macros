import Ember from 'ember';

function parseSpecifier(spec) {
  if (!spec) {
    return null;
  }
  var match;
  var normal = spec.replace(/\s+/g, '');
  if ((match = normal.match(/^(.+)<>(.+)$/))) {
    return {
      oneWay: false,
      from: match[1],
      to: match[2]
    };
  } else if ((match = normal.match(/^(.+)>(.+)$/))) {
    return {
      oneWay: true,
      from: match[1],
      to: match[2]
    };
  } else if ((match = normal.match(/^(.+)<(.+)$/))) {
    return {
      oneWay: true,
      from: match[2],
      to: match[1]
    };
  } else {
    throw new Error("invalid property binding specifier '"+ spec + "'");
  }
}

function bindingsFor(obj) {
  var meta = Ember.meta(obj);
  if (!meta.propertyBindings) {
    meta.propertyBindings = [];
  }
  return meta.propertyBindings;
}

export function bindProperties(object, from, to, isOneWay) {
  var bindings = bindingsFor(object);
  var binding = Ember.Binding.from(from).to(to);
  if (isOneWay) {
    binding.oneWay();
  }
  binding.connect(object);
  bindings.push(binding);
}

export default Ember.Mixin.create({
  init() {
    this._super.apply(this, arguments);
    var specifiers = this.get('propertyBindings') || [];

    specifiers.forEach(function(specifier) {
      var spec = parseSpecifier(specifier);
      if (spec) {
        bindProperties(this, spec.from, spec.to, spec.oneWay);
      }
    }, this);
  },

  willDestroy() {
    var bindings = bindingsFor(this);
    bindings.forEach(function(binding) {
      binding.disconnect(this);
    }, this);
    this._super.apply(this, arguments);
  }
});
