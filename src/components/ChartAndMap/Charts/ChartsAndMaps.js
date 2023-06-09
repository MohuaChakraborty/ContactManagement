import React, { useState, useEffect } from 'react';
import "./Charts.css";

import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent
} from '@mui/material';


// import './App.css';
import Map from '../../ChartAndMap/Map/Map';
import Table from '../Table/Table';
import InfoBox from '../InfoBox/InfoBox';
import { sortData, prettyPrintStat } from '../util';
import LineGraph from '../LineGraph';
import "leaflet/dist/leaflet.css";


const ChartsAndMaps = () => {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(2);
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState('cases')

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
          ));
          const sortedData = sortData(data)
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        })
    }
    getCountriesData()
  }, []);
  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);
    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter(countryCode === 'worldwide' ? [34.80746, -40.4796] : [data.countryInfo.lat, data.countryInfo.long] )
        setMapZoom(2);
      })
  }

  return (
    <div className="flex items-center justify-center p-2">
      <div className="container mt-4">
        <div className="app">
          <div className='app_left'>
            <div className="app_header text-center">
              <h1><b>COVID-19 TRACKER </b></h1>
              <FormControl className="app_dropdown">
                <Select variant="outlined" onChange={onCountryChange} value={country}>
                  <MenuItem value="worldwide">Worldwide</MenuItem>
                  {
                    countries.map(country => (
                      <MenuItem key={country.name} value={country.value}>{country.name}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </div>
            <div className="app_stats">
              <InfoBox isRed={true} active={casesType === 'cases'} onClick={e => setCasesType('cases')} title='Coronavirus cases' total={prettyPrintStat(countryInfo.cases)}
                cases={prettyPrintStat(countryInfo.todayCases)} />
              <InfoBox isRed={false} active={casesType === 'recovered'} onClick={e => setCasesType('recovered')} title='Recovered' total={prettyPrintStat(countryInfo.recovered)}
                cases={prettyPrintStat(countryInfo.todayRecovered)} />
              <InfoBox isRed={true} active={casesType === 'deaths'} onClick={e => setCasesType('deaths')} title='Deaths' total={prettyPrintStat(countryInfo.deaths)}
                cases={prettyPrintStat(countryInfo.todayDeaths)} />

            </div>
            <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom} />
          </div>
          <Card className='app_right'>
            <CardContent>
              <h3>Live Content by Country</h3>
              <Table countries={tableData} />
              <h3 className='app_graphTitle'>Worldwide new {casesType}</h3>
              <LineGraph className='app_graph' casesType={casesType} />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>

  );
}

export default ChartsAndMaps;