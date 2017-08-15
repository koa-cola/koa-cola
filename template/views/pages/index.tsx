import * as React from 'react';
var { asyncConnect, store } = require('koa-cola/dist/client').Decorators.view;
var loadSuccess = store.loadSuccess;
// 这里没有使用decorator的方式export组件，是因为组件使用的stateless的方式，只有使用class的方式才能使用decorator
export default asyncConnect([
  {
    key : 'hello',
    promise : () => {
      return Promise.resolve('Wow koa-cola!');
    }
  }
], null, dispatch => {
  return {
    onClick : () => {
      dispatch(loadSuccess('hello', 'Wow koa-cola again!'));
    }
  }
})(Index)
function Index({hello, onClick}){
  return <div>
    <h1>{ hello }</h1>
    <button onClick={onClick}>click me</button>
  </div>
}
