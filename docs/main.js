/*! For license information please see main.js.LICENSE.txt */
(() => {
  function t(e) {
    return (
      (t =
        "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
          ? function (t) {
              return typeof t;
            }
          : function (t) {
              return t &&
                "function" == typeof Symbol &&
                t.constructor === Symbol &&
                t !== Symbol.prototype
                ? "symbol"
                : typeof t;
            }),
      t(e)
    );
  }
  function e() {
    "use strict";
    e = function () {
      return n;
    };
    var n = {},
      r = Object.prototype,
      o = r.hasOwnProperty,
      i =
        Object.defineProperty ||
        function (t, e, n) {
          t[e] = n.value;
        },
      a = "function" == typeof Symbol ? Symbol : {},
      c = a.iterator || "@@iterator",
      u = a.asyncIterator || "@@asyncIterator",
      l = a.toStringTag || "@@toStringTag";
    function s(t, e, n) {
      return (
        Object.defineProperty(t, e, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        }),
        t[e]
      );
    }
    try {
      s({}, "");
    } catch (t) {
      s = function (t, e, n) {
        return (t[e] = n);
      };
    }
    function h(t, e, n, r) {
      var o = e && e.prototype instanceof v ? e : v,
        a = Object.create(o.prototype),
        c = new S(r || []);
      return i(a, "_invoke", { value: E(t, n, c) }), a;
    }
    function f(t, e, n) {
      try {
        return { type: "normal", arg: t.call(e, n) };
      } catch (t) {
        return { type: "throw", arg: t };
      }
    }
    n.wrap = h;
    var d = {};
    function v() {}
    function p() {}
    function y() {}
    var m = {};
    s(m, c, function () {
      return this;
    });
    var g = Object.getPrototypeOf,
      b = g && g(g(_([])));
    b && b !== r && o.call(b, c) && (m = b);
    var w = (y.prototype = v.prototype = Object.create(m));
    function x(t) {
      ["next", "throw", "return"].forEach(function (e) {
        s(t, e, function (t) {
          return this._invoke(e, t);
        });
      });
    }
    function L(e, n) {
      function r(i, a, c, u) {
        var l = f(e[i], e, a);
        if ("throw" !== l.type) {
          var s = l.arg,
            h = s.value;
          return h && "object" == t(h) && o.call(h, "__await")
            ? n.resolve(h.__await).then(
                function (t) {
                  r("next", t, c, u);
                },
                function (t) {
                  r("throw", t, c, u);
                }
              )
            : n.resolve(h).then(
                function (t) {
                  (s.value = t), c(s);
                },
                function (t) {
                  return r("throw", t, c, u);
                }
              );
        }
        u(l.arg);
      }
      var a;
      i(this, "_invoke", {
        value: function (t, e) {
          function o() {
            return new n(function (n, o) {
              r(t, e, n, o);
            });
          }
          return (a = a ? a.then(o, o) : o());
        },
      });
    }
    function E(t, e, n) {
      var r = "suspendedStart";
      return function (o, i) {
        if ("executing" === r) throw new Error("Generator is already running");
        if ("completed" === r) {
          if ("throw" === o) throw i;
          return { value: void 0, done: !0 };
        }
        for (n.method = o, n.arg = i; ; ) {
          var a = n.delegate;
          if (a) {
            var c = O(a, n);
            if (c) {
              if (c === d) continue;
              return c;
            }
          }
          if ("next" === n.method) n.sent = n._sent = n.arg;
          else if ("throw" === n.method) {
            if ("suspendedStart" === r) throw ((r = "completed"), n.arg);
            n.dispatchException(n.arg);
          } else "return" === n.method && n.abrupt("return", n.arg);
          r = "executing";
          var u = f(t, e, n);
          if ("normal" === u.type) {
            if (((r = n.done ? "completed" : "suspendedYield"), u.arg === d))
              continue;
            return { value: u.arg, done: n.done };
          }
          "throw" === u.type &&
            ((r = "completed"), (n.method = "throw"), (n.arg = u.arg));
        }
      };
    }
    function O(t, e) {
      var n = e.method,
        r = t.iterator[n];
      if (void 0 === r)
        return (
          (e.delegate = null),
          ("throw" === n &&
            t.iterator.return &&
            ((e.method = "return"),
            (e.arg = void 0),
            O(t, e),
            "throw" === e.method)) ||
            ("return" !== n &&
              ((e.method = "throw"),
              (e.arg = new TypeError(
                "The iterator does not provide a '" + n + "' method"
              )))),
          d
        );
      var o = f(r, t.iterator, e.arg);
      if ("throw" === o.type)
        return (e.method = "throw"), (e.arg = o.arg), (e.delegate = null), d;
      var i = o.arg;
      return i
        ? i.done
          ? ((e[t.resultName] = i.value),
            (e.next = t.nextLoc),
            "return" !== e.method && ((e.method = "next"), (e.arg = void 0)),
            (e.delegate = null),
            d)
          : i
        : ((e.method = "throw"),
          (e.arg = new TypeError("iterator result is not an object")),
          (e.delegate = null),
          d);
    }
    function T(t) {
      var e = { tryLoc: t[0] };
      1 in t && (e.catchLoc = t[1]),
        2 in t && ((e.finallyLoc = t[2]), (e.afterLoc = t[3])),
        this.tryEntries.push(e);
    }
    function j(t) {
      var e = t.completion || {};
      (e.type = "normal"), delete e.arg, (t.completion = e);
    }
    function S(t) {
      (this.tryEntries = [{ tryLoc: "root" }]),
        t.forEach(T, this),
        this.reset(!0);
    }
    function _(t) {
      if (t) {
        var e = t[c];
        if (e) return e.call(t);
        if ("function" == typeof t.next) return t;
        if (!isNaN(t.length)) {
          var n = -1,
            r = function e() {
              for (; ++n < t.length; )
                if (o.call(t, n)) return (e.value = t[n]), (e.done = !1), e;
              return (e.value = void 0), (e.done = !0), e;
            };
          return (r.next = r);
        }
      }
      return { next: k };
    }
    function k() {
      return { value: void 0, done: !0 };
    }
    return (
      (p.prototype = y),
      i(w, "constructor", { value: y, configurable: !0 }),
      i(y, "constructor", { value: p, configurable: !0 }),
      (p.displayName = s(y, l, "GeneratorFunction")),
      (n.isGeneratorFunction = function (t) {
        var e = "function" == typeof t && t.constructor;
        return (
          !!e && (e === p || "GeneratorFunction" === (e.displayName || e.name))
        );
      }),
      (n.mark = function (t) {
        return (
          Object.setPrototypeOf
            ? Object.setPrototypeOf(t, y)
            : ((t.__proto__ = y), s(t, l, "GeneratorFunction")),
          (t.prototype = Object.create(w)),
          t
        );
      }),
      (n.awrap = function (t) {
        return { __await: t };
      }),
      x(L.prototype),
      s(L.prototype, u, function () {
        return this;
      }),
      (n.AsyncIterator = L),
      (n.async = function (t, e, r, o, i) {
        void 0 === i && (i = Promise);
        var a = new L(h(t, e, r, o), i);
        return n.isGeneratorFunction(e)
          ? a
          : a.next().then(function (t) {
              return t.done ? t.value : a.next();
            });
      }),
      x(w),
      s(w, l, "Generator"),
      s(w, c, function () {
        return this;
      }),
      s(w, "toString", function () {
        return "[object Generator]";
      }),
      (n.keys = function (t) {
        var e = Object(t),
          n = [];
        for (var r in e) n.push(r);
        return (
          n.reverse(),
          function t() {
            for (; n.length; ) {
              var r = n.pop();
              if (r in e) return (t.value = r), (t.done = !1), t;
            }
            return (t.done = !0), t;
          }
        );
      }),
      (n.values = _),
      (S.prototype = {
        constructor: S,
        reset: function (t) {
          if (
            ((this.prev = 0),
            (this.next = 0),
            (this.sent = this._sent = void 0),
            (this.done = !1),
            (this.delegate = null),
            (this.method = "next"),
            (this.arg = void 0),
            this.tryEntries.forEach(j),
            !t)
          )
            for (var e in this)
              "t" === e.charAt(0) &&
                o.call(this, e) &&
                !isNaN(+e.slice(1)) &&
                (this[e] = void 0);
        },
        stop: function () {
          this.done = !0;
          var t = this.tryEntries[0].completion;
          if ("throw" === t.type) throw t.arg;
          return this.rval;
        },
        dispatchException: function (t) {
          if (this.done) throw t;
          var e = this;
          function n(n, r) {
            return (
              (a.type = "throw"),
              (a.arg = t),
              (e.next = n),
              r && ((e.method = "next"), (e.arg = void 0)),
              !!r
            );
          }
          for (var r = this.tryEntries.length - 1; r >= 0; --r) {
            var i = this.tryEntries[r],
              a = i.completion;
            if ("root" === i.tryLoc) return n("end");
            if (i.tryLoc <= this.prev) {
              var c = o.call(i, "catchLoc"),
                u = o.call(i, "finallyLoc");
              if (c && u) {
                if (this.prev < i.catchLoc) return n(i.catchLoc, !0);
                if (this.prev < i.finallyLoc) return n(i.finallyLoc);
              } else if (c) {
                if (this.prev < i.catchLoc) return n(i.catchLoc, !0);
              } else {
                if (!u)
                  throw new Error("try statement without catch or finally");
                if (this.prev < i.finallyLoc) return n(i.finallyLoc);
              }
            }
          }
        },
        abrupt: function (t, e) {
          for (var n = this.tryEntries.length - 1; n >= 0; --n) {
            var r = this.tryEntries[n];
            if (
              r.tryLoc <= this.prev &&
              o.call(r, "finallyLoc") &&
              this.prev < r.finallyLoc
            ) {
              var i = r;
              break;
            }
          }
          i &&
            ("break" === t || "continue" === t) &&
            i.tryLoc <= e &&
            e <= i.finallyLoc &&
            (i = null);
          var a = i ? i.completion : {};
          return (
            (a.type = t),
            (a.arg = e),
            i
              ? ((this.method = "next"), (this.next = i.finallyLoc), d)
              : this.complete(a)
          );
        },
        complete: function (t, e) {
          if ("throw" === t.type) throw t.arg;
          return (
            "break" === t.type || "continue" === t.type
              ? (this.next = t.arg)
              : "return" === t.type
              ? ((this.rval = this.arg = t.arg),
                (this.method = "return"),
                (this.next = "end"))
              : "normal" === t.type && e && (this.next = e),
            d
          );
        },
        finish: function (t) {
          for (var e = this.tryEntries.length - 1; e >= 0; --e) {
            var n = this.tryEntries[e];
            if (n.finallyLoc === t)
              return this.complete(n.completion, n.afterLoc), j(n), d;
          }
        },
        catch: function (t) {
          for (var e = this.tryEntries.length - 1; e >= 0; --e) {
            var n = this.tryEntries[e];
            if (n.tryLoc === t) {
              var r = n.completion;
              if ("throw" === r.type) {
                var o = r.arg;
                j(n);
              }
              return o;
            }
          }
          throw new Error("illegal catch attempt");
        },
        delegateYield: function (t, e, n) {
          return (
            (this.delegate = { iterator: _(t), resultName: e, nextLoc: n }),
            "next" === this.method && (this.arg = void 0),
            d
          );
        },
      }),
      n
    );
  }
  function n(t, e, n, r, o, i, a) {
    try {
      var c = t[i](a),
        u = c.value;
    } catch (t) {
      return void n(t);
    }
    c.done ? e(u) : Promise.resolve(u).then(r, o);
  }
  var r =
    '<span id="loading-animation" class="loading loading-dots loading-sm translate-y-2"></span>';
  function o() {
    var t = new Date(),
      e = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: !0,
        timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    return new Intl.DateTimeFormat("en-US", e).format(t);
  }
  function i(t) {
    var e = document.getElementById(t);
    e && (e.innerHTML = e.textContent);
  }
  function a() {
    var t;
    return (
      (t = e().mark(function t(n, o) {
        var a, c, u, l, s, h;
        return e().wrap(function (t) {
          for (;;)
            switch ((t.prev = t.next)) {
              case 0:
                return (
                  (t.next = 2),
                  fetch("https://calciferwebapp.azurewebsites.net/ask", {
                    method: "POST",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ question: n }),
                  })
                );
              case 2:
                (a = t.sent), (c = a.body.getReader()), (u = new TextDecoder());
              case 5:
                return (t.next = 8), c.read();
              case 8:
                if (((l = t.sent), (s = l.value), !l.done)) {
                  t.next = 13;
                  break;
                }
                return t.abrupt("break", 17);
              case 13:
                (h = u.decode(s)),
                  (e = o),
                  (f = h),
                  (d = void 0),
                  (v = void 0),
                  (d = document.getElementById(e)),
                  (v = document.getElementById("chat-container")),
                  d &&
                    ((d.innerHTML = ""
                      .concat(d.textContent)
                      .concat(f)
                      .concat(r)),
                    (v.scrollTop = v.scrollHeight)),
                  (t.next = 5);
                break;
              case 17:
                i(o);
              case 18:
              case "end":
                return t.stop();
            }
          var e, f, d, v;
        }, t);
      })),
      (a = function () {
        var e = this,
          r = arguments;
        return new Promise(function (o, i) {
          var a = t.apply(e, r);
          function c(t) {
            n(a, o, i, c, u, "next", t);
          }
          function u(t) {
            n(a, o, i, c, u, "throw", t);
          }
          c(void 0);
        });
      }),
      a.apply(this, arguments)
    );
  }
  (document.getElementById("init-agent-datetime").innerHTML = o()),
    document.addEventListener("DOMContentLoaded", function () {
      var t = document.getElementById("chat-form"),
        e = document.getElementById("input-text"),
        n = document.getElementById("chat-container");
      t.addEventListener("submit", function (t) {
        if ((t.preventDefault(), e.value.trim())) {
          "user",
            (l = e.value),
            "chat-bubble-primary",
            (s = '\n      <div class="chat '
              .concat(
                "chat-end",
                '">\n          <div class="chat-header">\n            <time class="text-xs opacity-50">'
              )
              .concat(
                o(),
                '</time>\n          </div>\n          <div class="chat-bubble '
              )
              .concat("chat-bubble-primary", '">')
              .concat(l, "</div>\n      </div>")),
            n.insertAdjacentHTML("beforeend", s),
            (n.scrollTop = n.scrollHeight);
          var i =
            ((c = Date.now().toString(36)),
            (u =
              '\n      <div class="chat chat-start">\n          <div class="chat-header">\n            <time class="text-xs opacity-50">'
                .concat(o(), '</time>\n          </div>\n          <div id= "')
                .concat(c, '" class="chat-bubble">\n            ')
                .concat(r, "\n          </div>\n      </div>")),
            n.insertAdjacentHTML("beforeend", u),
            (n.scrollTop = n.scrollHeight),
            c);
          !(function (t, e) {
            a.apply(this, arguments);
          })(e.value, i),
            (e.value = "");
        }
        var c, u, l, s;
      });
    });
})();
