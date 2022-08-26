import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { INPUT_MINT_ADDRESS, OUTPUT_MINT_ADDRESS } from "../constants";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useJupiterApiContext } from "../contexts/JupiterApiProvider";

interface IJupiterFormProps {}
interface IState {
  amount: number;
  inputMint: PublicKey;
  outputMint: PublicKey;
  slippage: number;
}

const Converter: FunctionComponent<IJupiterFormProps> = (props) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { tokenMap, routeMap, loaded, api } = useJupiterApiContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValue, setFormValue] = useState<IState>({
    amount: 1 * 10 ** 6,
    inputMint: new PublicKey(INPUT_MINT_ADDRESS),
    outputMint: new PublicKey(OUTPUT_MINT_ADDRESS),
    slippage: 0.1, // 0.01%
  });
  const [routes, setRoutes] = useState<
    Awaited<ReturnType<typeof api.v1QuoteGet>>["data"]
  >([]);

  const [inputTokenInfo, outputTokenInfo] = useMemo(() => {
    return [
      tokenMap.get(formValue.inputMint?.toBase58() || ""),
      tokenMap.get(formValue.outputMint?.toBase58() || ""),
    ];
  }, [
    tokenMap,
    formValue.inputMint?.toBase58(),
    formValue.outputMint?.toBase58(),
  ]);

  const fetchRoute = useCallback(() => {
    setIsLoading(true);
    api
      .v1QuoteGet({
        amount: formValue.amount,
        inputMint: formValue.inputMint.toBase58(),
        outputMint: formValue.outputMint.toBase58(),
        slippage: formValue.slippage,
      })
      .then(({ data }) => {
        if (data) {
          setRoutes(data);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [api, formValue]);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  const validOutputMints = useMemo(
    () => routeMap.get(formValue.inputMint?.toBase58() || "") || [],
    [routeMap, formValue.inputMint?.toBase58()]
  );

  useEffect(() => {
    if (formValue.inputMint) {
      const possibleOutputs = routeMap.get(formValue.inputMint.toBase58());

      if (
        possibleOutputs &&
        !possibleOutputs?.includes(formValue.outputMint?.toBase58() || "")
      ) {
        setFormValue((val) => ({
          ...val,
          outputMint: new PublicKey(possibleOutputs[0]),
        }));
      }
    }
  }, [formValue.inputMint?.toBase58(), formValue.outputMint?.toBase58()]);

  return (
    <div className="converter">
      <div className="mb-25">
        <p>From:</p>
        <select
          id="inputMint"
          name="inputMint"
          onChange={(event) => {
            const pbKey = new PublicKey(event.currentTarget.value);
            if (pbKey) {
              setFormValue((val) => ({
                ...val,
                inputMint: pbKey,
              }));
            }
          }}
          value={formValue.inputMint?.toBase58()}
        >
          {Array.from(routeMap.keys()).map((tokenMint) => {
            return (
              <option key={tokenMint} value={tokenMint}>
                {tokenMap.get(tokenMint)?.name || "Unknown"}
              </option>
            );
          })}
        </select>
      </div>
      <div className="mb-25">
        <p>To:</p>
        <select
          id="outputMint"
          name="outputMint"
          value={formValue.outputMint?.toBase58()}
          onChange={(event) => {
            const pbKey = new PublicKey(event.currentTarget.value);
            if (pbKey) {
              setFormValue((val) => ({
                ...val,
                outputMint: pbKey,
              }));
            }
          }}
        >
          {validOutputMints.map((tokenMint) => {
            return (
              <option key={tokenMint} value={tokenMint}>
                {tokenMap.get(tokenMint)?.name || "Unknown"}
              </option>
            );
          })}
        </select>
      </div>
      <div className="mb-50">
        <label htmlFor="amount mb-10">Input ({inputTokenInfo?.symbol}):</label>
        <input
          className="token-input"
          id="amount"
          name="amount"
          onInput={(event: any) => {
            let newValue = Number(event.target?.value || 0);
            newValue = Number.isNaN(newValue) ? 0 : newValue;
            setFormValue((val) => ({
              ...val,
              amount: Math.max(newValue, 0),
            }));
          }}
          pattern="[0-9]*"
          type="text"
          value={formValue.amount}
        />
      </div>
      {routes?.[0] &&
        (() => {
          const route = routes[0];
          if (route) {
            return (
              <div>
                <p className="mt-50 mb-50">
                  You will receive:{" "}
                  {(route.outAmount || 0) /
                    10 ** (outputTokenInfo?.decimals || 1)}{" "}
                  {outputTokenInfo?.symbol}
                </p>
              </div>
            );
          }
        })()}
      <div className="mb-50">
        <div className="mb-25">
          <h4>Transaction Settings</h4>
        </div>
        <div className="slippage mb-25">
          Slippage tolerance: {formValue.slippage / 10}%
        </div>
        <div className="mb-25">Allowance: exact amount</div>
      </div>
      <button
        className="button-primary"
        disabled={isSubmitting}
        onClick={async () => {
          try {
            if (
              !isLoading &&
              routes?.[0] &&
              wallet.publicKey &&
              wallet.signAllTransactions
            ) {
              setIsSubmitting(true);

              const { swapTransaction, setupTransaction, cleanupTransaction } =
                await api.v1SwapPost({
                  body: {
                    route: routes[0],
                    userPublicKey: wallet.publicKey.toBase58(),
                  },
                });
              const transactions = (
                [setupTransaction, swapTransaction, cleanupTransaction].filter(
                  Boolean
                ) as string[]
              ).map((tx) => {
                return Transaction.from(Buffer.from(tx, "base64"));
              });
              await wallet.signAllTransactions(transactions);
              for (let transaction of transactions) {
                const txId = await connection.sendRawTransaction(
                  transaction.serialize()
                );
                await connection.confirmTransaction(txId);
                console.log(`https://solscan.io/tx/${txId}`);
              }
            }
          } catch (event) {
            console.error(event);
          }
          setIsSubmitting(false);
        }}
      >
        {isSubmitting ? "Converting..." : "Convert"}
      </button>
    </div>
  );
};

export default Converter;
