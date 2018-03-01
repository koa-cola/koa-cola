import * as React from 'react';
import { render } from 'react-dom'
var {createProvider} = require('koa-cola/client');

var Provider = createProvider([
    require('../api/controllers/IndexController').default,
],{
    'simple' : require('./pages/simple').default,
'cola' : require('./pages/cola').default,
'multiChildren' : require('./pages/multiChildren').default,
'autoLoadFromPages1' : require('./pages/autoLoadFromPages1').default,
'headerAndBundle' : require('./pages/headerAndBundle').default,
'pageProps' : require('./pages/pageProps').default,
'subPages/subPage' : require('./pages/subPages/subPage').default,
} 
    , require('../config/reduxMiddlewares').reduxMiddlewares
);

render(<Provider />, document.getElementById('app'))