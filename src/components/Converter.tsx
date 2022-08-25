import fetch from "cross-fetch";
import { ChangeEvent, useState } from "react";
import { Commitment, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface ConverterProps {
  network: string;
}

export const Converter: React.FC<ConverterProps> = () => {
  const wallet = useWallet();

  const { connection } = useConnection();

  const [amount, setAmount] = useState<number>(1);
  const [slippage, setSlippage] = useState<number>(0.5);

  const [tokenFrom, setTokenFrom] = useState<string>("SOL");
  const [tokenTo, setTokenTo] = useState<string>("COSMIC");

  const onAmountChange = (event: ChangeEvent<any>) => {
    setAmount(event.target.value);
  };
  const onSlippageChange = (event: ChangeEvent<any>) => {
    setSlippage(event.target.value);
  };

  const amountToSend = amount * 1e9;

  const retrieveRouteMap = async () => {
    const indexedRouteMap = await (
      await fetch("https://quote-api.jup.ag/v1/indexed-route-map")
    ).json();
    return indexedRouteMap;
  };

  const indexedRouteMap = retrieveRouteMap();
  console.log(indexedRouteMap);

  const swapTokens = async () => {
    const { data } = await (
      await fetch(
        `https://quote-api.jup.ag/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s&amount=${amountToSend}&slippage=${slippage}&feeBps=1`
      )
    ).json();
    const routes = data;

    const transactions = await (
      await fetch("https://quote-api.jup.ag/v1/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: routes[0],
          userPublicKey: wallet.publicKey!.toBase58(),
          wrapUnwrapSOL: true,
          feeAccount: "6vEHAWe3ubJLY8cqWS82wYwXtzrt7FA4dVnGnFfjM9DB",
        }),
      })
    ).json();

    const { setupTransaction, swapTransaction, cleanupTransaction } =
      transactions;

    for (let serializedTransaction of [
      setupTransaction,
      swapTransaction,
      cleanupTransaction,
    ].filter(Boolean)) {
      const transaction = Transaction.from(
        Buffer.from(serializedTransaction, "base64")
      );
      const txid = await wallet.sendTransaction(transaction, connection, {
        skipPreflight: true,
      });
      console.log(`https://solscan.io/tx/${txid}`);
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txid,
      });
    }
  };

  return (
    <div>
      <h1 className="mb-25">Convert</h1>
      <h3 className="mb-25">
        ${tokenFrom} to ${tokenTo}
      </h3>
      {!wallet.connected && <WalletMultiButton />}
      <div className="mt-25 mb-25">
        <label>From:</label>
        <div className="input">
          <input
            className="token-input"
            onChange={onAmountChange}
            value={amount}
          />
          <div className="token">${tokenFrom}</div>
        </div>
      </div>
      <div className="mb-25">
        <label>To:</label>
        <div className="input">
          <input
            className="token-input"
            onChange={onAmountChange}
            value={amount * 2954.8}
          />
          <div className="token">${tokenTo}</div>
        </div>
      </div>
      <div className="mt-50 mb-50">
        <div className="mb-25">
          <h4>Transaction Settings</h4>
        </div>
        <div className="slippage mb-25">
          Slippage Tolerance:
          <div className="slippage-input-group">
            <input
              className="slippage-input"
              onChange={onSlippageChange}
              value={slippage}
            />
            <div className="ml-10">%</div>
          </div>
        </div>
        <div className="mb-25">Allowance: Exact Amount</div>
        <div className="mb-25">Swap Fee: 0.01%</div>
      </div>
      <button className="convert-button" onClick={swapTokens}>
        Convert
      </button>
    </div>
  );
};

export default Converter;
