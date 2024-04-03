import React, { Component } from 'react';
import "./SearchResults.css";
import SearchResult from './SearchResult';

class SearchResultsList extends Component {
  render() {
    const { results, handleClick } = this.props;
    return (
      <div className="results-list">
        {results.map((result, index) => (
          <SearchResult
            key={index} 
            result={result} 
            handleClick={handleClick} 
          />
        ))}
      </div>
    );
  }
}

export default SearchResultsList;
