import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';
import { Redactor } from './redactor';

const App = () => {
    return (
        <HashRouter>
            <Route path="/:roomId?" component={Redactor} />
        </HashRouter>
    )
}

ReactDOM.render(<App />, document.getElementById('app'));