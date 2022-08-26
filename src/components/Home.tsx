import { FC } from "react";

import Wallet from "./Wallet";
import Converter from "./Converter";

const Home: FC = ({}) => {
  return (
    <div className="home">
      <div>
        <Wallet />
        <h1 className="mb-50">Convert</h1>
        <Converter />
      </div>
    </div>
  );
};

export default Home;
