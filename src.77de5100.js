// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"MyObject.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function getBuffers(gl, obj) {
  var _vbo = gl.createBuffer();

  var _ibo = gl.createBuffer();

  if (!_vbo || !_ibo) {
    return null;
  }

  var flatten_vertices = flatten(obj.vertices);
  var flatten_indices = flatten(obj.indices);
  var buff = {
    vbo: _vbo,
    ibo: _ibo,
    count: flatten_indices.length
  };
  gl.bindBuffer(gl.ARRAY_BUFFER, buff.vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten_vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff.ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(flatten_indices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return buff;
}

exports.getBuffers = getBuffers;

function flatten(arr) {
  return arr.reduce(function (acc, x) {
    return acc.concat(x);
  });
}
},{}],"hexagon.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function getHexagon(length) {
  return {
    vertices: getVertices(length),
    indices: getIndicese(length)
  };
}

exports.getHexagon = getHexagon;

function getVertices(length) {
  var th = 1.0 / length;
  var tw2 = th / Math.sqrt(3);
  var tw = tw2 * 2;
  var arr = [];

  for (var i = -length; i <= length; i++) {
    var absi = Math.abs(i);
    var y = th * i;
    var x = tw2 * absi - 2.0 / Math.sqrt(3);
    var n = length * 2 + 1 - absi;

    for (var j = 0; j < n; j++) {
      arr.push([x, y]);
      x += tw;
    }
  }

  return arr;
}

function triangles(top, bottom, n) {
  var t = top;
  var b = bottom;
  var arr = [];

  for (var i = 0; i < n; i++) {
    arr.push([t, b, b + 1]);
    t++;
    b++;
  }

  return arr;
}

function getIndicese(length) {
  var index = 0;
  var num_triangles = length;
  var arr = [];

  for (var i = 0; i < length; i++) {
    var next_index = index + length + i + 1;
    arr = arr.concat(triangles(next_index + 1, index, num_triangles++));
    arr = arr.concat(triangles(index, next_index, num_triangles));
    index = next_index;
  }

  for (var i = 0; i < length; i++) {
    var next_index = index + 2 * length - i + 1;
    arr = arr.concat(triangles(next_index, index, num_triangles--));
    arr = arr.concat(triangles(index + 1, next_index, num_triangles));
    index = next_index;
  }

  return arr;
}
},{}],"index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var MyObject_1 = require("./MyObject");

var hexagon_1 = require("./hexagon");

var gl;

window.onload = function () {
  var c = document.getElementById("webgl");
  var width = c.width;
  var height = c.height;

  var _gl = c.getContext("webgl");

  if (!_gl) {
    alert("ERROR: WebGL API is not available");
    return;
  }

  gl = _gl;
  glInit(width, height);
  var vs = "\n    attribute vec2 xy;\n    varying float r;\n    void main(void) {\n        gl_Position = vec4(xy, 0.0, 1.0);\n        r = sqrt(max(1.0 - dot(xy, xy), 0.0));\n    }";
  var fs = "precision mediump float;\n    varying float r;\n    void main(void) {\n        gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * r, 1.0);\n    }";

  var _program = create_program(vs, fs);

  if (!_program) {
    console.log("ERROR: failed to create a program.");
    return;
  }

  var program = _program;
  var location = gl.getAttribLocation(program, "xy");
  gl.enableVertexAttribArray(location);
  var hexagon = hexagon_1.getHexagon(16);

  var _buff = MyObject_1.getBuffers(gl, hexagon);

  if (!_buff) {
    console.log("ERROR: failed to create a buffer.");
    return;
  }

  var buff = _buff;
  gl.bindBuffer(gl.ARRAY_BUFFER, buff.vbo);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff.ibo);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  gl.drawElements(gl.TRIANGLES, buff.count, gl.UNSIGNED_SHORT, 0);
  gl.flush();
  console.log("DONE.");
};

function glInit(width, height) {
  gl.viewport(0, 0, width, height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function create_program(vs, fs) {
  var _program = gl.createProgram();

  if (!_program) {
    return null;
  }

  var program = _program;
  gl.attachShader(program, create_shader(vs, gl.VERTEX_SHADER));
  gl.attachShader(program, create_shader(fs, gl.FRAGMENT_SHADER));
  gl.linkProgram(program);

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.useProgram(program);
    return program;
  } else {
    alert(gl.getProgramInfoLog(program));
    return null;
  }
}

function create_shader(code, shader_type) {
  var _shader = gl.createShader(shader_type);

  if (!_shader) {
    return null;
  }

  var shader = _shader;
  gl.shaderSource(shader, code);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  } else {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
}
},{"./MyObject":"MyObject.ts","./hexagon":"hexagon.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "34047" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/src.77de5100.map