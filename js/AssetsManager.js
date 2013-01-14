this.AssetsManager = new function AssetsManager() {

  var ASSETS_LOADED = {},

    LOADING = 0,
    LOADED = 0,
    
    _root = "",
    _length = 0,
    _noCache = false,
    
    _onCompleteCallback = function () {},
    _onProgressCallback = function () {},
    _onErrorCallback = function () {},
    
    _audioElement = document.createElement("audio"),
    _request = new XMLHttpRequest,
    
    _xhrOptions = {
      method: "GET",
      url: "/",
      async: true,
      headers: {},
      responseType: "text",
      mimeType: "",
      data: null
    },

    isArray = Array.isArray || function isArray(o) { 
      return "[object Array]" == Object.prototype.toString.call(o);
    },
    
    extend = function extend(destination) {
      var sources = Array.prototype.slice.call(arguments, 1);
      
      for (var i = 0, source, key; source = sources[i]; i++) {
        if (source == null || "object" != typeof source) continue; 
      
        for (key in source) if (!(key in destination)) {
          destination[key] = source[key];
        }
      }
      
      return destination;
    };

  this.tag = "AssetsManager";
  this.loading = false;
  
  this.root = function root(value) {
    if (0 == arguments.length) return _root;
    else _root = value;
    
    return this;
  };
  
  this.noCache = function noCache(value) {
    if (0 == arguments.length) return _noCache;
    else _noCache = !!value;
    
    return this;
  };
  
  this.xhrOptions = function xhrOptions(key, value) {
    if (0 == arguments.length) {
      return _xhrOptions;
    } else if (1 == arguments.length) {
      if ("string" == typeof key) return _xhrOptions[key];
      _xhrOptions = key;
    } else {
      _xhrOptions[key] = value;
    }
    
    return this;
  };
  
  this.onProgress = function onProgress(f) {
    if (0 == arguments.length) return _onProgressCallback;
    else _onProgressCallback = f;
    
    return this;
  };
  
  this.onError = function onError(f) {
    if (0 == arguments.length) return _onErrorCallback;
    else _onErrorCallback = f;

    return this;
  };
  
  this.load = function load(paths, onCompleteCallback) {
    if (!isArray(paths)) {
      paths = Array.prototype.slice.call(arguments);
      onCompleteCallback = "function" == typeof paths[paths.length - 1] ? paths.pop() : _onCompleteCallback;
    }
    
    var assetsManager = this,
      root = _root,
      noCache = _noCache,
      xhrOptions = _xhrOptions,
      queue = [],
      loaded = 0,
      total = paths.length;
    
    if (0 == total) onCompleteCallback(queue);
    
    this.loading = true;
    
    for (var i = 0; i < total; i++) !function (path, index) {
      var asset = null,
        nocache = noCache ? "?" + Date.now() * Math.random() : "",

        onload = function (e) {
          queue[index] = asset;
          
          if (false !== e) {
            _length += 1;
            ASSETS_LOADED[alias] = asset;
          }

          LOADED += 1;
          
          loaded += 1;
          _onProgressCallback(LOADED, LOADING, path, !e);
          
          if (loaded == total) {
            if (LOADED == LOADING) {
              LOADED = LOADING = 0;
              assetsManager.loading = false;
            }
          
            onCompleteCallback(queue)
          }
        },
        
        onerror = function () {
          asset = null;
          _onErrorCallback(path);
          onload(false);
        },
        
        alias, ext, options;
        
      LOADING += 1;
      
      if ("object" == typeof path) {
        options = path;
        path = options.url;
        
        if ("string" == typeof options.alias) alias = options.alias;
      }
      
      if ("string" == typeof path) {
        path = root + path;
        ext = path.split(".").pop().toUpperCase();
        if (!alias) alias = path.split("/").pop();
      } else {
        onerror();
      }
      
      if (!noCache && alias in ASSETS_LOADED) {
        asset = ASSETS_LOADED[alias];
        onload(false);
      } else if (!options && (ext == "MP3" || ext == "OGG" || ext == "WAV" || ext == "AAC")) {
        if (assetsManager.AUDIO && !!assetsManager.AUDIO_TYPES[ext]) {
          asset = document.createElement("audio");

          asset.addEventListener("canplaythrough", function oncanplaythrough(e) {
            this.removeEventListener("canplaythrough", oncanplaythrough, false);
            onload(e);
          }, false);
          asset.onerror = onerror;
          
          asset.preload = "auto";
          asset.src = path + nocache;
        } else {
          onerror();
        }
      } else if (!options && (ext == "JPEG" || ext == "JPG" || ext == "PNG" || ext == "GIF")) {
        asset = new Image;
        
        asset.onload = onload;
        asset.onerror = onerror;
        
        asset.src = path + nocache;
      } else {
        if (!options) options = {};
        extend(options, xhrOptions);
        
        var xhr = new XMLHttpRequest,
          get = "GET" === options.method,
          data = "";
        
        if (get && "string" == typeof options.data) {
          data = (nocache ? "&" : "?") + options.data;
        }
        
        xhr.open(options.method, path + nocache + data, options.async);
        
        var headers = options.headers;
        for (var header in headers) if (headers.hasOwnProperty(header)) {
          xhr.setRequestHeader(header, headers[header])
        }
        
        if (options.mimeType && xhr.overrideMimeType) {
          xhr.overrideMimeType(options.mimeType);
        }
        
        if (2 == assetsManager.XHR_LEVEL) {
          if (assetsManager.XHR_RESPONSE_TYPES[options.responseType.toUpperCase()]) {
            xhr.responseType = options.responseType;
            
            xhr.onload = function (e) {
              if (200 == this.status) {
                try {
                  asset = this.response || this.responseText;
                  onload(e);
                } catch (oO) {
                  onerror();
                }
              } else {
                onerror();
              }
            };
          } else {
            onerror();
          }
        } else if ("TEXT" !== options.responseType.toUpperCase()) {
          onerror();
        } else {
          xhr.onreadystatechange = function (e) {
            if (4 == this.readyState) {
              if (200 == this.status) {
                asset = this.responseText || this.responseXML;
                onload(e);
              } else {
                onerror();
              }
            }
          };
        }

        xhr.send(get ? null : options.data);
      }
    }(paths[i], i);
    
    return this;
  };
  
  this.get = function get(aliases) {
    if (!isArray(aliases)) aliases = Array.prototype.slice.call(arguments);
    
    if (1 == aliases.length) return ASSETS_LOADED[aliases[0]];
    
    var assetsLoaded = ASSETS_LOADED,
      assets = [];
      
    if (0 == aliases.length) {
      for (var alias in assetsLoaded) aliases.push(alias);
    }
    
    for (var i = 0, l = aliases.length; i < l; i++) {
      assets.push(assetsLoaded[aliases[i]]);
    }
    
    return assets;
  };

  this.length = function length() {
    return _length;
  };
  
  this.isAudioTypeSupported = function isAudioTypeSupported(type) {
    return this.AUDIO ? _audioElement.canPlayType(type) : "";
  };
  
  this.AUDIO = !!_audioElement.canPlayType;
  
  this.AUDIO_TYPES = {
    "OGG": this.isAudioTypeSupported('audio/ogg; codecs="vorbis"'),
    "WAV": this.isAudioTypeSupported('audio/wav; codecs="1"'),
    "MP3": this.isAudioTypeSupported('audio/mpeg;'),
    "AAC": this.isAudioTypeSupported('audio/x-m4a;') || this.isAudioTypeSupported('audio/aac;')
  };
  
  this.isXHRResponseTypeSupported = function isXHRResponseTypeSupported(type) {
    _request.open("GET", "/");

    try {
      _request.responseType = type;
      return _request.responseType === type;
    } catch (oO) {
        return false;
    }
  };
  
  this.XHR_LEVEL = "ArrayBuffer" in window ? 2 : 1;
  
  this.XHR_RESPONSE_TYPES = {
    "TEXT": this.isXHRResponseTypeSupported("text"),
    "ARRAYBUFFER": this.XHR_LEVEL == 2 && this.isXHRResponseTypeSupported("arraybuffer"),
    "BLOB": this.XHR_LEVEL == 2 && this.isXHRResponseTypeSupported("blob"),
    "MOZ-BLOB": this.XHR_LEVEL == 2 && this.isXHRResponseTypeSupported("moz-blob"),
    "JSON": this.XHR_LEVEL == 2 && this.isXHRResponseTypeSupported("json"),
    "DOCUMENT": this.XHR_LEVEL == 2 && this.isXHRResponseTypeSupported("document")
  };
  
  this.isImage = function isImage(o) {
    return "[object HTMLImageElement]" == Object.prototype.toString.call(o);
  };
  
  this.isCanvas = function isCanvas(o) {
    return "[object HTMLCanvasElement]" == Object.prototype.toString.call(o);
  };
  
  this.isAudio = function isAudio(o) {
    return "[object HTMLAudioElement]" == Object.prototype.toString.call(o);
  };
  
  this.toString = function toString() {
    return "[AssetsManager]";
  };

};