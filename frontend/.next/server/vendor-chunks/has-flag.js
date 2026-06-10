"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/has-flag";
exports.ids = ["vendor-chunks/has-flag"];
exports.modules = {

/***/ "(ssr)/./node_modules/has-flag/index.js":
/*!****************************************!*\
  !*** ./node_modules/has-flag/index.js ***!
  \****************************************/
/***/ ((module) => {

eval("\n\nmodule.exports = (flag, argv = process.argv) => {\n  const prefix = flag.startsWith('-') ? '' : flag.length === 1 ? '-' : '--';\n  const position = argv.indexOf(prefix + flag);\n  const terminatorPosition = argv.indexOf('--');\n  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaGFzLWZsYWcvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWJBLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLENBQUNDLElBQUksRUFBRUMsSUFBSSxHQUFHQyxPQUFPLENBQUNELElBQUksS0FBSztFQUMvQyxNQUFNRSxNQUFNLEdBQUdILElBQUksQ0FBQ0ksVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBSUosSUFBSSxDQUFDSyxNQUFNLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFLO0VBQzNFLE1BQU1DLFFBQVEsR0FBR0wsSUFBSSxDQUFDTSxPQUFPLENBQUNKLE1BQU0sR0FBR0gsSUFBSSxDQUFDO0VBQzVDLE1BQU1RLGtCQUFrQixHQUFHUCxJQUFJLENBQUNNLE9BQU8sQ0FBQyxJQUFJLENBQUM7RUFDN0MsT0FBT0QsUUFBUSxLQUFLLENBQUMsQ0FBQyxLQUFLRSxrQkFBa0IsS0FBSyxDQUFDLENBQUMsSUFBSUYsUUFBUSxHQUFHRSxrQkFBa0IsQ0FBQztBQUN2RixDQUFDIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXFVzZXJcXE9uZURyaXZlXFxEZXNrdG9wXFxpbXRpeG9uXFxmcm9udGVuZFxcbm9kZV9tb2R1bGVzXFxoYXMtZmxhZ1xcaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmbGFnLCBhcmd2ID0gcHJvY2Vzcy5hcmd2KSA9PiB7XG5cdGNvbnN0IHByZWZpeCA9IGZsYWcuc3RhcnRzV2l0aCgnLScpID8gJycgOiAoZmxhZy5sZW5ndGggPT09IDEgPyAnLScgOiAnLS0nKTtcblx0Y29uc3QgcG9zaXRpb24gPSBhcmd2LmluZGV4T2YocHJlZml4ICsgZmxhZyk7XG5cdGNvbnN0IHRlcm1pbmF0b3JQb3NpdGlvbiA9IGFyZ3YuaW5kZXhPZignLS0nKTtcblx0cmV0dXJuIHBvc2l0aW9uICE9PSAtMSAmJiAodGVybWluYXRvclBvc2l0aW9uID09PSAtMSB8fCBwb3NpdGlvbiA8IHRlcm1pbmF0b3JQb3NpdGlvbik7XG59O1xuIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJmbGFnIiwiYXJndiIsInByb2Nlc3MiLCJwcmVmaXgiLCJzdGFydHNXaXRoIiwibGVuZ3RoIiwicG9zaXRpb24iLCJpbmRleE9mIiwidGVybWluYXRvclBvc2l0aW9uIl0sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/has-flag/index.js\n");

/***/ })

};
;