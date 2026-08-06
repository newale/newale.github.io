(function () {
  "use strict";

  var VERT = "attribute vec2 aPos;" +
    "void main(){gl_Position=vec4(aPos,0.0,1.0);}";

  var FRAG =
    "precision mediump float;" +
    "uniform vec2 uRes;" +
    "uniform float uTime;" +
    "uniform vec3 uColorA;" +
    "uniform vec3 uColorB;" +
    "float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}" +
    "float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);" +
    "float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));" +
    "vec2 u=f*f*(3.0-2.0*f);" +
    "return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;}" +
    "float fbm(vec2 p){float v=0.0;float amp=0.5;" +
    "for(int i=0;i<5;i++){v+=amp*noise(p);p*=2.0;amp*=0.5;}return v;}" +
    "void main(){" +
    "vec2 uv=gl_FragCoord.xy/uRes.xy;" +
    "vec2 p=uv;p.x*=uRes.x/uRes.y;" +
    "vec2 q=vec2(fbm(p*1.6+uTime*0.05),fbm(p*1.6+vec2(5.2,1.3)-uTime*0.04));" +
    "vec2 r=vec2(fbm(p*1.6+4.0*q+vec2(1.7,9.2)+uTime*0.03),fbm(p*1.6+4.0*q+vec2(8.3,2.8)-uTime*0.025));" +
    "float f=fbm(p*1.6+4.0*r);" +
    "vec3 color=mix(uColorA,uColorB,clamp(f*f*2.0,0.0,1.0));" +
    "float vign=smoothstep(1.15,0.1,length((uv-vec2(0.32,0.42))*vec2(1.0,1.35)));" +
    "float alpha=clamp(0.5+f*0.7,0.0,1.0)*vign;" +
    "gl_FragColor=vec4(color,alpha);}";

  function hexToRgb(hex) {
    hex = hex.trim().replace("#", "");
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var num = parseInt(hex, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }

  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    return {
      a: hexToRgb(cs.getPropertyValue("--color-accent") || "#0088b0"),
      b: hexToRgb(cs.getPropertyValue("--color-accent-2") || "#d6006c")
    };
  }

  function initCanvas(canvas) {
    var gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false }) ||
      canvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);

    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, FRAG);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(program, "uRes");
    var uTime = gl.getUniformLocation(program, "uTime");
    var uColorA = gl.getUniformLocation(program, "uColorA");
    var uColorB = gl.getUniformLocation(program, "uColorB");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var colors = readColors();
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var raf = null;
    var visible = true;

    function resize() {
      var w = Math.round(canvas.clientWidth * dpr);
      var h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function render(t) {
      raf = null;
      if (!visible) return;
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform3f(uColorA, colors.a[0], colors.a[1], colors.a[2]);
      gl.uniform3f(uColorB, colors.b[0], colors.b[1], colors.b[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduceMotion) raf = requestAnimationFrame(render);
    }

    function start() {
      if (raf === null) raf = requestAnimationFrame(render);
    }

    render(0);

    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        colors = readColors();
        start();
      });
    }

    window.addEventListener("resize", start);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
      }).observe(canvas);
    }
  }

  function init() {
    var canvases = document.querySelectorAll("canvas.hero-shader");
    for (var i = 0; i < canvases.length; i++) initCanvas(canvases[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
