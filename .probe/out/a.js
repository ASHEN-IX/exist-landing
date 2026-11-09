"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = require("react-dom/server");
const Frame = ({ n }) => (0, jsx_runtime_1.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "10", height: "10", children: (0, jsx_runtime_1.jsx)("rect", { width: n, height: "10", fill: "#D72832" }) });
console.log((0, server_1.renderToStaticMarkup)((0, jsx_runtime_1.jsx)(Frame, { n: 7 })));
