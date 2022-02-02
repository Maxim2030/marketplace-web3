import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import Marketplace from "./../abis/Marketplace.json";
import Navbar from "./Navbar";
import Main from "./Main";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      console.log("Modern browser");
      window.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
      } catch (err) {
        console.error("err= >", err);
      }
    } else if (window.web3) {
      console.log("Legacy browser");
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("Non-Ethereum browser detected! Install Metamask");
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    // console.log("accounts =>", accounts);
    this.setState({ account: accounts[0] });

    // console.log("Marketplace.abi => ", Marketplace.abi);
    const networkId = await web3.eth.net.getId();

    const networkData = Marketplace.networks[networkId];
    if (!networkData) {
      alert("marketplace contract not deploye to detrected network");
      return;
    }

    // console.log(
    //   `Marketplace.networks.${networkId}.address => `,
    //   Marketplace.networks[networkId].address
    // );

    const abi = Marketplace.abi;
    const address = Marketplace.networks[networkId].address;

    const marketplace = web3.eth.Contract(abi, address);
    console.log("marketplace => ", marketplace);
    this.setState({ marketplace });

    const productCount = await marketplace.methods.productCount().call();
    console.log("productCount => ", productCount);
    this.setState({ productCount });

    for (let i = 1; i <= productCount; i++) {
      const product = await marketplace.methods.products(i).call();
      this.setState({
        products: [...this.state.products, product],
      });
    }
    // console.log("products => ", this.state.products);
    this.setState({ loading: false });
  }

  async createProduct(name, price) {
    console.log("[createProduct] name => ", name);
    console.log("[createProduct] price => ", price);
    this.setState({ loading: true });
    this.state.marketplace.methods
      .createProduct(name, price)
      .send({ from: this.state.account })
      .once("receipt", (receipt) => {
        console.log("[createProduct] receipt => ", receipt);
        this.setState({ loading: false });
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      productCount: 0,
      products: [],
      loading: true,
    };

    this.createProduct = this.createProduct.bind(this);
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              {this.state.loading ? (
                <p>Loading...</p>
              ) : (
                <Main
                  createProduct={this.createProduct}
                  products={this.state.products}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
