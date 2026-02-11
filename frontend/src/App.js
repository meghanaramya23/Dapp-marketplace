import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";
import "./App.css";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);
    const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    setContract(c);
  };

  const loadItems = async () => {
    if (!contract) return;
    const data = await contract.getItems();
    const mapped = data.map((it) => ({
      id: Number(it.id),
      name: it.name,
      price: ethers.formatEther(it.price),
      seller: it.seller
    }));
    setItems(mapped);
  };

  const handleList = async () => {
    if (!contract || !name || !price) return;
    try {
      setStatus("⏳ Listing item...");
      const tx = await contract.listItem(name, ethers.parseEther(price));
      await tx.wait();
      setStatus("✅ Item listed");
      setName("");
      setPrice("");
      loadItems();
    } catch (e) {
      setStatus("❌ Listing failed");
    }
  };

  const handleBuy = async (id, priceEth) => {
    if (!contract) return;
    try {
      setStatus("⏳ Buying item...");
      const tx = await contract.buyItem(id, {
        value: ethers.parseEther(priceEth)
      });
      await tx.wait();
      setStatus("✅ Purchase complete");
      loadItems();
    } catch (e) {
      setStatus("❌ Purchase failed");
    }
  };

  const handleWithdraw = async () => {
    if (!contract) return;
    try {
      setStatus("⏳ Withdrawing...");
      const tx = await contract.withdraw();
      await tx.wait();
      setStatus("✅ Withdraw complete");
    } catch (e) {
      setStatus("❌ Withdraw failed");
    }
  };

  useEffect(() => {
    if (contract) loadItems();
  }, [contract]);

  return (
    <div className="app-root">
      <div className="card">
        <h1>🛒 Decentralized Marketplace</h1>

        {!account ? (
          <button className="btn-main" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <>
            <p className="account">
              {account.slice(0, 6)}...{account.slice(-4)}
            </p>

            <div className="form">
              <input
                className="input"
                placeholder="Item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Price in ETH"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <button className="btn-main" onClick={handleList}>
                List Item
              </button>
            </div>

            <button className="btn-secondary" onClick={handleWithdraw}>
              Withdraw (owner)
            </button>

            <div className="items-grid">
              {items.map((it) => (
                <div className="item-card" key={it.id}>
                  <h3>{it.name}</h3>
                  <p>{it.price} ETH</p>
                  <p>Seller: {it.seller.slice(0, 6)}...</p>
                  <button
                    className="btn-buy"
                    onClick={() => handleBuy(it.id, it.price)}
                  >
                    Buy
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="status">{status}</p>
      </div>
    </div>
  );
}

export default App;

