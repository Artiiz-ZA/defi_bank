import { Tabs, Tab } from "react-bootstrap";
import React, { Component } from "react";
import bank from "../bank_logo.png";
import Web3 from "web3";
import bankOfArtiiz from "../abis/bankOfArtiiz.json";
import Token from "../abis/Token.json";
import "./App.css";

class App extends Component {
  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);

      // Check connected Network ID
      const netId = await web3.eth.net.getId();

      // TODO: There is an issue where Metamask requires you to connect to the site for account info, this is done manually in metamask for now
      // Get account
      const accounts = await web3.eth.getAccounts();

      // Set states if logged in
      if (typeof accounts[0] !== "undefined") {
        const balance = await web3.eth.getBalance(accounts[0]);
        this.setState({ account: accounts[0], balance, web3 });
      } else {
        window.alert("Please login with Metamask to use the Bank!");
      }

      try {
        // Web3 Token and Bank Creation
        const token = new web3.eth.Contract(
          Token.abi,
          Token.networks[netId].address
        );
        const bank = new web3.eth.Contract(
          bankOfArtiiz.abi,
          bankOfArtiiz.networks[netId].address
        );
        const bankAddress = bankOfArtiiz.networks[netId].address;
        const bankBalance = await bank.methods
          .getFundsInvested(accounts[0])
          .call();

        // Set bank states
        this.setState({ token, bank, bankAddress, bankBalance });
      } catch (e) {
        console.log("Error", e);
        window.alert(
          " Bank of Artiiz Contracts are not deployed on this network. Please change your newtork in Metamask!"
        );
      }
    } else {
      window.alert("Please install Metamask to use the Bank!");
    }
  }

  async deposit(amount) {
    try {
      await this.state.bank.methods.deposit().send({
        value: this.state.web3.utils.toWei(amount).toString(),
        from: this.state.account,
      });

      // Set state value
      this.state.balance = amount;

      window.alert("Successfully Deposited " + amount.toString());
    } catch (e) {
      console.log("Error", e);
      window.alert("Error depositing funds to the Bank!");
    }
  }

  async withdraw(e) {
    // TODO: Move this into the button logic
    e.preventDefault();

    try {
      await this.state.bank.methods
        .withdraw()
        .send({ from: this.state.account });

      // Set state value
      this.state.balance = 0;

      window.alert(
        "Successfully Withdrew " + this.state.bankBalance / 10 ** 18 + " ETH"
      );
      // TODO: Add amount of interest paid out to message
    } catch (e) {
      console.log("Error", e);
      window.alert("Error withdrawing funds from the Bank!");
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      web3: "undefined",
      account: "",
      token: null,
      bank: null,
      balance: 0,
      bankAddress: null,
      bankBalance: 0,
    };
  }

  render() {
    return (
      <div className="text-monospace">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={bank} className="App-logo" alt="logo" height="32" />
            <b>Bank of Artiiz</b>
          </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
          <br></br>
          <h1>Welcome to the Bank of Artiiz</h1>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                  <Tab eventKey="deposit" title="Deposit">
                    <div>
                      <br></br>
                      How much would you like to Deposit?
                      <br></br>
                      (minimum deposit is 0.01 ETH)
                      <br></br>
                      (maximum of 1 deposit per account at any given time)
                      <br></br>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          let amount = this.depositAmount.value;
                          this.deposit(amount);
                          this.state.bankBalance = amount;
                        }}
                      >
                        <div className="form-group mr-sm-2">
                          <br></br>
                          <input
                            id="depositAmount"
                            step="0.01"
                            type="number"
                            className="form-control form-control-md"
                            placeholder="amount in ETH ..."
                            min="0.01"
                            required
                            ref={(input) => {
                              this.depositAmount = input;
                            }}
                          ></input>
                        </div>
                        <button type="submit" className="btn btn-primary">
                          DEPOSIT FUNDS
                        </button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="withdraw" title="Withdraw">
                    <div>
                      <br></br>
                      You have {this.state.bankBalance / 10 ** 18} ETH invested
                      that you can withdraw.
                      <br></br>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={(e) => this.withdraw(e)}
                      >
                        WITHDRAW
                      </button>
                    </div>
                  </Tab>
                  <Tab
                    eventKey="checkAccrued"
                    title="Check Accrued Interest"
                  ></Tab>
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
