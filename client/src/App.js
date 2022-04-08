import React, { useState, useEffect } from "react";
import Web3 from "web3";

import "./App.css";

function App() {
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const connectWallet = async (e) => {
    e.preventDefault();
    await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    setIsLoggedIn(true);
    window.ethereum.on("accountsChanged", (accounts) => {
      setAccount(accounts[0]);
    });
  };

  const disconnectWallet = (e) => {
    e.preventDefault();
    setAccount("");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const web = new Web3(window.ethereum);
        setWeb3(web);
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  return (
    <nav className='navbar navbar-expand-sm bg-dark navbar-dark'>
      <div className='container-fluid'>
        <ul className='navbar-nav'>
          <li className='nav-item'>
            <a className='nav-link active' href='#'>
              NFT Collectible
            </a>
          </li>
        </ul>
        <div className='d-flex justify-content-center align-content-center'>
          <small className='p-2 small text-white'>{account}</small>
          {isLoggedIn ? (
            <button
              className='p-2 btn btn-primary'
              type='button'
              onClick={disconnectWallet}
            >
              Logout
            </button>
          ) : (
            <button
              className='p-2 btn btn-primary'
              type='button'
              onClick={connectWallet}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default App;
