import fetch from "cross-fetch";
import { AnchorProvider } from "@project-serum/anchor";
import { ChangeEvent, useState } from "react";
import { Commitment, Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface ConverterProps {
  network: string;
}

export const Converter: React.FC<ConverterProps> = ({ network }) => {
  const wallet = useWallet();

  const [amountFrom, setAmountFrom] = useState<number>(1);
  const [amountTo, setAmountTo] = useState();

  const onAmountFromChange = (event: ChangeEvent<any>) => {
    setAmountFrom(event.target.value);
  };

  const onAmountToChange = (event: ChangeEvent<any>) => {
    setAmountTo(event.target.value);
  };

  const options: { preflightCommitment: Commitment } = {
    preflightCommitment: "processed",
  };

  const getConnectionProvider = () => {
    const connection = new Connection(network, options.preflightCommitment);
    const provider = new AnchorProvider(connection, wallet as any, options);
    return provider;
  };
  const provider = getConnectionProvider();

  // const retrieveRouteMap = async () => {
  //   // retrieve indexed routed map
  //   const indexedRouteMap = await (
  //     await fetch("https://quote-api.jup.ag/v1/indexed-route-map")
  //   ).json();
  //   const getMint = (index: string) => {indexedRouteMap["mintKeys"][index];
  //   const getIndex = (mint: any) => {indexedRouteMap["mintKeys"].indexOf(mint);

  //   // generate route map by replacing indexes with mint addresses
  //   var generatedRouteMap = {};
  //   Object.keys(indexedRouteMap["indexedRouteMap"]).forEach((key, index) => {
  //     generatedRouteMap[getMint(key)] = indexedRouteMap["indexedRouteMap"][
  //       key
  //     ].map((index: string) => getMint(index));
  //   });

  //   // list all possible input tokens by mint Address
  //   const allInputMints = Object.keys(generatedRouteMap);

  //   // list tokens can swap by mint addressfor SOL
  //   const swappableOutputForSol =
  //     generatedRouteMap["So11111111111111111111111111111111111111112"];
  //   // console.log({ allInputMints, swappableOutputForSol })
  // };

  // const routeMap = retrieveRouteMap();

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
          <input onChange={onAmountToChange} value={amountTo} />
          <div className="token">$YAKU</div>
        </div>
      </div>
      <div className="mt-50 mb-50">
        <div className="mb-25">Transaction Settings</div>
        <div className="mb-25">Slippage Tolerance: </div>
        <div className="mb-25">Allowance: </div>
        <div className="mb-25">Swap Fee: </div>
      </div>
      <button className="convert-button">Convert</button>
    </div>
  );
};

export default Converter;
