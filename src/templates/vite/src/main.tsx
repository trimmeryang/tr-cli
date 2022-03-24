import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import routes from './router/index';

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <Switch>
                {routes.map((route) => (
                    <Route exact key={route.path} {...route} />
                ))}
            </Switch>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);
