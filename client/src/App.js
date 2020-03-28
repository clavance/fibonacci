import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';
import NotFound from './NotFound';
import Fib from './Fib';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <header>
            <br/><br/><br/>
            <Link to="/">Return to Home Page!</Link><br/>
            <Link to="/notfound">Another Test Link</Link><br/>
          </header>

          <div>
            <br/>
            <Route exact path="/" component={Fib} />
            <Route exact path="/notfound" component={NotFound} />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
