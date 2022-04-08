import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { create as ipfsHttpClient } from "ipfs-http-client";
import "./App.css";
import { abi, address } from "./contracts/NFTCollectible";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
let web3;
let nftCollectible;
function App() {
  const [account, setAccount] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [image, setImage] = useState(undefined);
  const [nfts, setNfts] = useState([]);

  const nameEl = useRef(null);
  const descEl = useRef(null);

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

    getOwnedNFT(accounts[0]);
  };

  const disconnectWallet = (e) => {
    e.preventDefault();
    setAccount("");
    setIsLoggedIn(false);
    setNfts([]);
  };

  const getImage = (e) => {
    setImage(e.target.files[0]);
  };

  const mintNFT = async (result) => {
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`;

    const tokenId = await nftCollectible.methods
      .mint(uri)
      .send({ from: account });
    console.log(tokenId);

    getOwnedNFT(account);
  };

  const uploadToIPFS = async (e) => {
    e.preventDefault();
    const name = nameEl.current.value;
    const description = descEl.current.value;
    if (
      name !== "" &&
      description !== "" &&
      image !== undefined &&
      account !== ""
    ) {
      //upload image to IPFS

      let uploadedImage;
      try {
        const result = await client.add(image);
        uploadedImage = `https://ipfs.infura.io/ipfs/${result.path}`;
      } catch (err) {
        console.log("Uploading image to IPFS error");
        return;
      }
      let result;
      //upload metadata to IPFS
      try {
        result = await client.add(
          JSON.stringify({ name, description, image: uploadedImage })
        );
      } catch (err) {
        console.log("Uploading metadata to IPFS error");
        return;
      }

      mintNFT(result);
    }
  };

  const getOwnedNFT = async (account) => {
    const totalNumberOfNft = await nftCollectible.methods
      .getTotalMinted()
      .call();
    let result = [];
    for (let i = 1; i <= totalNumberOfNft; i++) {
      const getOwner = await nftCollectible.methods.ownerOf(i).call();
      if (getOwner === account) {
        const uri = await nftCollectible.methods.tokenURI(i).call();
        console.log(uri);
        const response = await fetch(uri);
        const { name, description, image } = await response.json();
        result.push({ name, description, image });
      }
    }
    console.log(result);
    setNfts(result);
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      try {
        web3 = new Web3(window.ethereum);
        nftCollectible = new web3.eth.Contract(abi, address);
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  return (
    <>
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
      <form>
        <div className='mb-3 mt-3'>
          <label htmlFor='name' className='form-label'>
            이름:
          </label>
          <input type='text' className='form-control' id='name' ref={nameEl} />
        </div>
        <div className='mb-3'>
          <label htmlFor='description' className='form-label'>
            설명:
          </label>
          <input
            type='text'
            className='form-control'
            id='description'
            ref={descEl}
          />
        </div>
        <div className='mb-3'>
          <label className='form-label' htmlFor='customFile'>
            이미지:
          </label>
          <input
            type='file'
            className='form-control'
            id='customFile'
            onChange={getImage}
          />
        </div>
        <button
          type='button'
          className='btn btn-primary'
          onClick={uploadToIPFS}
        >
          Submit
        </button>
      </form>
      <div className='container'>
        <div className='row'>
          {nfts.map((nft, index) => {
            return (
              <div className='col-md-4' key={index}>
                <div className='card' style={{ width: "400px" }}>
                  <img alt='image' className='img-circle' src={nft.image} />
                  <h3 className='m-b-xs'>
                    <strong>{nft.name}</strong>
                  </h3>

                  <p className='font-bold'>{nft.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default App;
