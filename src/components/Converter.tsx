import fetch from "cross-fetch";
import { ChangeEvent, useState } from "react";
import { Commitment, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface ConverterProps {
  network: string;
}

export const Converter: React.FC<ConverterProps> = ({ network }) => {
  const wallet = useWallet();

  const { connection } = useConnection();

  const [amountFrom, setAmountFrom] = useState<number>(1);
  const [amountTo, setAmountTo] = useState<number>(1);

  const onAmountFromChange = (event: ChangeEvent<any>) => {
    setAmountFrom(event.target.value);
  };
  const onAmountToChange = (event: ChangeEvent<any>) => {
    setAmountTo(event.target.value);
  };

  const amountToSend = amountFrom * 1e9;

  const swapTokens = async () => {
    const { data } = await (
      await fetch(
        `https://quote-api.jup.ag/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s&amount=${amountToSend}&slippage=0.5&feeBps=1`
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
    }
  };

  return (
    <div>
      <h1 className="mb-25">Convert</h1>
      <h2 className="mb-25">$SOL to $YAKU</h2>
      {!wallet.connected && <WalletMultiButton />}
      <div className="mt-25 mb-25">
        <label>From:</label>
        <div className="input">
          <input onChange={onAmountFromChange} value={amountFrom} />
          <div className="token">$SOL</div>
        </div>
      </div>
      <div className="mb-25">
        <label>To:</label>
        <div className="input">
          <input onChange={onAmountToChange} value={amountFrom * 2954.8} />
          <div className="token">$YAKU</div>
        </div>
      </div>
      <div className="mt-50 mb-50">
        <div className="mb-25">Transaction Settings</div>
        <div className="mb-25">Slippage Tolerance: 0.5%</div>
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
