import React, { Component } from 'react';
import "./Result.css";

class SearchResult extends Component {
  render() {
    const { result, handleClick } = this.props;
    return (
      <div className="search-result" onClick={() => handleClick(result)}>
        <div>{result.idProducto}</div>
        <div>{result.nombreProducto}</div>
        <div>{result.precioProducto}</div>
        <div>{result.marcaProducto}</div>
        <div>{result.clasificacionProducto}</div>
      </div>
    );
  }
}

export default SearchResult;
