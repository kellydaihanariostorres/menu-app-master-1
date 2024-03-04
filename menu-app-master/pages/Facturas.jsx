import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView } from 'react-native';

export default class Facturas extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      facturas: [],
    };
  }

  componentDidMount() {
    this.getFacturas();
  }

  getFacturas = () => {
    this.setState({ loading: true });
    fetch('https://localhost:7284/api/factura')
      .then(res => res.json())
      .then(data => {
        this.setState({
          facturas: data,
          loading: false
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView horizontal>
          <View>
            <View style={styles.row}>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>#</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>FECHA DE COMPRA</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>IVA</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>SUBTOTAL</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>TOTAL</Text>
            </View>
            <FlatList
              contentContainerStyle={styles.tableGroupDivider}
              data={this.state.facturas}
              renderItem={({ item, index }) => (
                <TouchableOpacity>
                  <View style={styles.row}>
                    <Text style={[styles.item, { flex: 1 }]}>{index + 1}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.fechaCompra}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.ivaCompra}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.subtotal}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.total}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a9a9a9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 10,
    marginHorizontal: 10,
  },
  item: {
    flex: 1,
    textAlign: 'center',
  },
  tableHeader: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    paddingVertical: 5,
  },
  tableGroupDivider: {
    backgroundColor: '#dcdcdc',
  },
});
