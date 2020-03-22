import React, {Component} from 'react';
import axios from 'axios';

class Fib extends Component {
  state = {
    listIndices: [],
    values: {},
    index: ''
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndices();
  }

  // async because it fetches data
  // nginx routes /api/ requests to express backend
  async fetchValues() {
    const values = await axios.get('/api/values/current');
    this.setState({ values: values.data }); //get values, set state
  }

  async fetchIndices() {
    const listIndices = await axios.get('/api/values/current');
    this.setState({
        listIndices: listIndices.data
    });
  }

// amend to avoid duplicates...
// async fetchIndices() {
//   const listIndices = await axios.get('/api/values/all');
//   this.setState({
//       listIndices: listIndices.data
//   });
// }


handleSubmit = async (event) => {
  event.preventDefault();
  await axios.post('/api/values', {
    index: this.state.index
  });
  this.setState({ index:'' });
}

// this pulls data out of postgres (which returns a list)
  // renderAllIndices() {
  //   return this.state.listIndices.map(({ number })=> number).join(', ');
  // }
renderAllIndices() {
  var entries = "";
  for (let key in this.state.listIndices) {
    entries+=key+", ";
  }
  return entries.slice(0,-2);
}

// this pulls data out of redis (which returns an object)
  renderValues() {
    const entries = [];
    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key}, the corresponding Fibonacci value is {this.state.values[key]}
        </div>
      );
    }

    console.log("values:", this.state.values)
    return entries;
  }


  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter index:</label>
          <input
            value={this.state.index}
            onChange={event => this.setState({index: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>List of all previously requested indices:</h3>
        {this.renderAllIndices()}

        <h3>All calculated values:</h3>
        {this.renderValues()}

      </div>
    )
  }
}

export default Fib;
