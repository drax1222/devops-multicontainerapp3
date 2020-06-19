import React from 'react';
import logo from './logo.svg';
import './App.css';
import MyForm from './Form';
import axios from 'axios';

function App() { 
  const handleClick = async () => {
    const helloResponse = await axios.get('/api/');
    console.log(helloResponse);
  }
  const handleClick2 = async () => {
    const resp = await axios.get('/api/clearredis');
    console.log(resp);
  }
  return (
    <div className="App">
      <div>Kalkulacja odległości pomiędzy dwoma punktami</div>
     <MyForm></MyForm>
     <br/>
     <br/>
     <br/>
     <button onClick={handleClick}>Wyślij testowe zapytanie do serwera</button>
     <button onClick={handleClick2}>Flush redis cache</button>
    </div>
  );
}

export default App;
