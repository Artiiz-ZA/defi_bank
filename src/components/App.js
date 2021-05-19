import { Tabs } from 'react-bootstrap';
import React, { Component } from 'react';
import bank from '../bank_logo.png';
import './App.css';

//TODO - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {

    //check if MetaMask exists

      //assign to values to variables: web3, netId, accounts

      //check if account is detected, then load balance&setStates, elsepush alert

      //in try block load contracts

    //if MetaMask not exists push alert
  }

  async deposit(amount) {
    //check if this.state.bankOfArtiiz is ok
      //in try block call bankOfArtiiz deposit();
  }

  async withdraw(e) {
    //prevent button from default click
    //check if this.state.bankOfArtiiz is ok
    //in try block call bankOfArtiiz withdraw();
  }

  constructor(props) {
    super(props);
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      bankOfArtiiz: null,
      balance: 0,
      bankOfArtiizAddress: null
    };
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={bank} className="App-logo" alt="logo" height="32"/>
          <b>Bank of Artiiz</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>{/*add welcome msg*/}</h1>
          <h2>{/*add user address*/}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                {/*add Tab deposit*/}
                {/*add Tab withdraw*/}
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;