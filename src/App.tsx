import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import React from "react";
import "./App.css";
import Converter from "./components/Converter";
import WalletWrapper from "./components/WalletWrapper";

interface AppProps {}

const network = clusterApiUrl(WalletAdapterNetwork.Mainnet);

const App: React.FC<AppProps> = () => {
  return (
    <div className="App">
    <WalletWrapper network={network}>
      <Converter network={network} />
    </WalletWrapper>
    </div>
  );
};

export default App;
