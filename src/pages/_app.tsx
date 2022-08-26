import dynamic from "next/dynamic";
import { useMemo } from "react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { JupiterApiProvider } from "../contexts/JupiterApiProvider";
import type { AppProps } from "next/app";
import "../styles/app.css";

const WalletProvider = dynamic(
  () => import("../contexts/ClientWalletProvider"),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps }: AppProps) {
  const endpoint = useMemo(() => "https://ssc-dao.genesysgo.net/", []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider>
        <JupiterApiProvider>
          <Component {...pageProps} />
        </JupiterApiProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;
