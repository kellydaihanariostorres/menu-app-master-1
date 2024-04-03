import React, { Component } from 'react';
import "./SearchBars.css";

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: ""
    };
  }

  fetchData = (value) => {
    fetch("https://localhost:7284/api/productos")
      .then((response) => response.json())
      .then((json) => {
        const results = json.filter((user) => {
          return (
            value &&
            user &&
            user.nombreProducto &&
            user.nombreProducto.toLowerCase().includes(value)
          );
        });
        this.props.setResults(results);
      });
  };

  handleChange = (value) => {
    this.setState({ input: value });
    this.fetchData(value);
  };

  componentDidUpdate(prevProps) {
    // Limpiar el campo de búsqueda cuando cambian los resultados
    if (prevProps.setResults !== this.props.setResults) {
      this.setState({ input: "" });
    }
  }

  render() {
    return (
      <div className="input-wrapper">
        <input
          placeholder="Buscar producto..."
          value={this.state.input}
          onChange={(e) => this.handleChange(e.target.value)}
        />
      </div>
    );
  }
}

export default SearchBar;
