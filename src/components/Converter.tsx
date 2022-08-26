import fetch from "cross-fetch";
import { ChangeEvent, useEffect, useState } from "react";
import { Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface ConverterProps {
  network: string;
}

export const Converter: React.FC<ConverterProps> = () => {
  // Wallet Connection
  const wallet = useWallet();
  const { connection } = useConnection();

  const [amount, setAmount] = useState<number>(1);
  const [debouncedPrice, setDebouncedPrice] = useState<number>(amount);
  const [price, setPrice] = useState([]);

  const [tokenFrom, setTokenFrom] = useState<string>("SOL");
  const [tokenTo, setTokenTo] = useState<string>("YAKU");

  const [slippage, setSlippage] = useState<number>(0.5);

  const onAmountChange = (event: ChangeEvent<any>) => {
    setAmount(event.target.value);
  };

  const onSlippageChange = (event: ChangeEvent<any>) => {
    setSlippage(event.target.value);
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedPrice(amount);
    }, 100);

    return () => {
      clearTimeout(timerId);
    };
  }, [amount]);

  useEffect(() => {
    const getPrice = async () => {
      const response = await fetch(
        `https://price.jup.ag/v1/price?id=${tokenFrom}&vsToken=${tokenTo}`
      );
      const newPrice = await response.json();
      setPrice(newPrice.data.price);
    };
    getPrice();
  }, [tokenFrom, tokenTo]);

  // useEffect(() => {
  //   const search = async () => {
  //     const { data } = await axios.get("https://en.wikipedia.org/w/api.php", {
  //       params: {
  //         action: "query",
  //         list: "search",
  //         origin: "*",
  //         format: "json",
  //         srsearch: debouncedPrice,
  //       },
  //     });
  //     setPrice(data.query.search);
  //   };
  //   search();
  // }, [debouncedPrice]);

  console.log(price);

  const updatedPrice = price;

  const swapTokens = async () => {};

  return (
    <div>
      <h1 className="mb-25">Convert</h1>
      {!wallet.connected && <WalletMultiButton />}
      <h3 className="mt-25 mb-25">
        ${tokenFrom} to ${tokenTo}
      </h3>

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
            value={updatedPrice}
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
