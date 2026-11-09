import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const Frame: React.FC<{n:number}> = ({n}) => <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width={n} height="10" fill="#D72832"/></svg>;
console.log(renderToStaticMarkup(<Frame n={7}/>));
