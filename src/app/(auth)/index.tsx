import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Pressable, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth, useUser } from "@clerk/clerk-expo";
import axios from 'axios';

export default function Home() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [currencies, setCurrencies] = useState([
    { code: 'USD', name: 'Dólar Americano', country: 'Estados Unidos', flag: 'https://flagcdn.com/w320/us.png' },
    { code: 'BRL', name: 'Real Brasileiro', country: 'Brasil', flag: 'https://flagcdn.com/w320/br.png' },
    { code: 'EUR', name: 'Euro', country: 'Zona do Euro', flag: 'https://flagcdn.com/w320/eu.png' },
    { code: 'GBP', name: 'Libra Esterlina', country: 'Reino Unido', flag: 'https://flagcdn.com/w320/gb.png' },
    { code: 'CHF', name: 'Franco Suíço', country: 'Suíça', flag: 'https://flagcdn.com/w320/ch.png' },
    { code: 'CAD', name: 'Dólar Canadense', country: 'Canadá', flag: 'https://flagcdn.com/w320/ca.png' },
  ]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [convertedValue, setConvertedValue] = useState('');
  const [conversionRates, setConversionRates] = useState({});

  useEffect(() => {
    fetchConversionRates();
  }, []);

  useEffect(() => {
    if (inputValue !== '' && fromCurrency && toCurrency) {
      handleConversion();
    } else {
      setConvertedValue('N/A');
    }
  }, [inputValue, fromCurrency, toCurrency]);

  const fetchConversionRates = async () => {
    try {
      const response = await axios.get('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL,CHF-BRL,CAD-BRL,USD-EUR,USD-GBP,USD-CHF,USD-CAD');
      const data = response.data;

      const newRates = {
        'USD-BRL': parseFloat(data.USDBRL.bid),
        'BRL-USD': 1 / parseFloat(data.USDBRL.bid),
        'EUR-BRL': parseFloat(data.EURBRL.bid),
        'BRL-EUR': 1 / parseFloat(data.EURBRL.bid),
        'GBP-BRL': parseFloat(data.GBPBRL.bid),
        'BRL-GBP': 1 / parseFloat(data.GBPBRL.bid),
        'CHF-BRL': parseFloat(data.CHFBRL.bid),
        'BRL-CHF': 1 / parseFloat(data.CHFBRL.bid),
        'CAD-BRL': parseFloat(data.CADBRL.bid),
        'BRL-CAD': 1 / parseFloat(data.CADBRL.bid),
        'USD-EUR': parseFloat(data.USDEUR.bid),
        'EUR-USD': 1 / parseFloat(data.USDEUR.bid),
        'USD-GBP': parseFloat(data.USDGBP.bid),
        'GBP-USD': 1 / parseFloat(data.USDGBP.bid),
        'USD-CHF': parseFloat(data.USDCHF.bid),
        'CHF-USD': 1 / parseFloat(data.USDCHF.bid),
        'USD-CAD': parseFloat(data.USDCAD.bid),
        'CAD-USD': 1 / parseFloat(data.USDCAD.bid),
      };

      setConversionRates(newRates);
    } catch (error) {
      console.error('Erro ao buscar as cotações:', error);
    }
  };

  const handleConversion = () => {
    if (inputValue === '' || isNaN(inputValue)) {
      setConvertedValue('N/A');
      return;
    }

    if (toCurrency === '') {
      setConvertedValue('N/A');
      return;
    }

    const conversionKey = `${fromCurrency}-${toCurrency}`;
    const rate = conversionRates[conversionKey];
    if (rate && inputValue) {
      const result = parseFloat(inputValue) * rate;
      setConvertedValue(result.toFixed(2));
    } else {
      setConvertedValue('Erro na conversão');
    }
  };

  const handlePickerChange = () => {
    setConvertedValue('N/A');
  };

  const handleTextInputChange = (text) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    setInputValue(filteredText);
  };

  // Função para calcular as conversões para tabelas adicionais
  const calculateConversionTable = (rate, values) => {
    return values.map(value => ({
      value: value,
      converted: (value * rate).toFixed(2)
    }));
  };

  const realToUsdRate = conversionRates['BRL-USD'] || 0;
  const realToEurRate = conversionRates['BRL-EUR'] || 0;

  const conversionValues = [1, 5, 10, 50, 100, 1000];

  const realToUsdTable = calculateConversionTable(realToUsdRate, conversionValues);
  const realToEurTable = calculateConversionTable(realToEurRate, conversionValues);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
          <Text style={styles.profileText}>{user?.fullName}</Text>
        </View>
        <Pressable style={styles.logoutButton} onPress={() => signOut()}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </Pressable>
      </View>

      <Image
        source={require('../../../assets/images/logoConversorDeMoedasApp.png')}
        style={styles.logo}
      />

      <View style={styles.conversionContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={fromCurrency}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setFromCurrency(itemValue);
                setToCurrency('');
                handlePickerChange();
              }}
            >
              {currencies.map((currency) => (
                <Picker.Item
                  key={currency.code}
                  label={`${currency.code} (${currency.name})`}
                  value={currency.code}
                />
              ))}
            </Picker>
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.currencyPrefix}>{fromCurrency}</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o valor"
              value={inputValue}
              onChangeText={handleTextInputChange}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={toCurrency}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setToCurrency(itemValue);
                handlePickerChange();
              }}
            >
              <Picker.Item label="Selecione uma moeda" value="" />
              {currencies
                .filter((currency) => currency.code !== fromCurrency)
                .map((currency) => (
                  <Picker.Item
                    key={currency.code}
                    label={`${currency.code} (${currency.name})`}
                    value={currency.code}
                  />
                ))}
            </Picker>
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.currencyPrefix}>{toCurrency ? toCurrency : 'N/A'}</Text>
            <TextInput
              style={styles.input}
              editable={false}
              value={convertedValue || ''}
            />
          </View>
        </View>
      </View>

      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Cotações em relação ao Dólar Americano (USD) em tempo real</Text>
        <View style={styles.table}>
          <Text style={styles.tableHeader}>Moeda</Text>
          <Text style={styles.tableHeader}>País</Text>
          <Text style={styles.tableHeader}>Cotação</Text>
        </View>
        {currencies.filter(currency => currency.code !== 'USD').map((currency) => {
          const rate = conversionRates[`USD-${currency.code}`] || 0;
          return (
            <View key={currency.code} style={styles.tableRow}>
              <View style={styles.tableCellRow}>
                <Image source={{ uri: currency.flag }} style={styles.flag} />
                <Text style={styles.tableCell}>{currency.code}</Text>
              </View>
              <Text style={styles.tableCell}>{currency.country}</Text>
              <Text style={styles.tableCell}>{rate ? `${rate.toFixed(2)} ${currency.code}` : 'N/A'}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Conversões de Real para Dólar</Text>
        <View style={styles.table}>
          <Text style={styles.tableHeader}>Valor (BRL)</Text>
          <Text style={styles.tableHeader}>Valor (USD)</Text>
        </View>
        {realToUsdTable.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{row.value} R$</Text>
            <Text style={styles.tableCell}>{row.converted} USD</Text>
          </View>
        ))}
      </View>

      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Conversões de Real para Euro</Text>
        <View style={styles.table}>
          <Text style={styles.tableHeader}>Valor (BRL)</Text>
          <Text style={styles.tableHeader}>Valor (EUR)</Text>
        </View>
        {realToEurTable.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{row.value} R$</Text>
            <Text style={styles.tableCell}>{row.converted} EUR</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    paddingTop: 15,
    marginTop: -27,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profileText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  logo: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
    marginLeft: 13,
  },
  conversionContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginVertical: 10,
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#e8e8e8',
  },
  picker: {
    height: 50,
    borderRadius: 10,
    borderColor: '#e8e8e8',
    backgroundColor: '#e8e8e8',
    paddingLeft: 5,
  },
  inputBox: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    width: '86%',
    height: 50,
  },
  currencyPrefix: {
    fontSize: 16,
    marginHorizontal: 10,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    width: '100%',
  },
  tableContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  table: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  tableHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  tableCell: {
    fontSize: 14,
    textAlign: 'center',
  },
  tableCellRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    width: 20,
    height: 15,
    marginRight: 8,
  },
});
