import React, { Component } from 'react';
import SearchBar from '../../components/SearchBar';
import SearchResults from '../../components/SearchResultslist';

class SearchComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: []
    };
  }

  // Esta función maneja el clic en un resultado de búsqueda
  handleClick = (result) => {
    this.props.handleSuggestionClick(result); // Llama a la función handleSuggestionClick en el componente padre con el resultado seleccionado
    this.setState({ results: [] });
  };

  render() {
    const styles = {
      searchContainer: {
        padding: '-5px',
        width: '30%',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: '-250px',
        minWidth: '500px',
        marginTop: '10px',
        height: "auto !important" 
      },
      search: {
        height: '1vh',
      }
    };

    return (
      <div style={styles.search}>
        <div style={styles.searchContainer}>
          <SearchBar setResults={results => this.setState({ results })} />
          <SearchResults results={this.state.results} handleClick={this.handleClick} />
        </div>
      </div>
    );
  }
}

export default SearchComponent;
