import type { NextPage } from "next";
import Head from "next/head";
import Home from "../components/Home";

const Index: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>TrialAPI</title>
      </Head>
      <Home />
    </div>
  );
};

export default Index;
