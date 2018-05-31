import * as React from 'react';
import { Cola, store } from 'koa-cola/client';
var loadSuccess = store.loadSuccess;
// 这里没有使用decorator的方式export组件，是因为组件使用的stateless的方式，只有使用class的方式才能使用decorator
@Cola({
  initData : {
    hello : () => {
      return Promise.resolve('Wow koa-cola!');
    }
  },
  mapDispatchToProps : dispatch => {
    return {
      onClick : () => {
        dispatch(loadSuccess('hello', 'Wow koa-cola and bundle work!'));
      }
    }
  }
})
export default class App extends React.Component<any, any> {
  render(){
    return <div>
      <h1>{ this.props.hello }</h1>
      <button onClick={this.props.onClick}>check bundle if work</button>
    </div>
  }
}
