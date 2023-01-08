import { Button, Divider, Input, Tooltip } from "antd";
import { CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

import React, { useState } from "react";
import { utils } from "ethers";

import { Blockie, EtherInput } from "../components";

function ValidationSuffix({ isValid }) {
  if (isValid) {
    return <CheckCircleOutlined />;
  }
  return <CloseCircleOutlined />;
}

export default function ExampleUI({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [amount, setAmount] = useState(0);
  const [nameHash, setNameHash] = useState();
  const [isConfigured, setIsConfigured] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState("0x0");

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Aztec ENS Transfer</h2>
        <Divider />
        <div className={`${address === undefined ? "" : "hide-section"}`}>
          <p>Please connect your wallet</p>
        </div>
        <div className={`${address === undefined ? "hide-section" : ""}`}>
          Recipient:{" "}
          <Tooltip
            trigger={["focus"]}
            title="The recipient must have previously configured their ENS with Aztec support"
            placement="topLeft"
            overlayClassName="numeric-input"
          >
            <Input
              prefix={<Blockie address={resolvedAddress} scale={3} />}
              onChange={evt => {
                const domain = evt.target.value;
                if (address !== undefined && domain.slice(-4) === ".eth" && domain.length >= 7) {
                  localProvider.resolveName(domain).then(res => setResolvedAddress(res || "0x0"));
                  const nameHash = utils.namehash(domain);
                  setNameHash(nameHash);
                  writeContracts.CustomResolver.isSendPrivate(nameHash).then(res => {
                    setIsConfigured(res);
                  });
                } else {
                  setIsConfigured(false);
                }
              }}
              suffix={<ValidationSuffix isValid={isConfigured} />}
            />
            <br />
            Amount:{" "}
            <EtherInput
              value={amount}
              onChange={value => {
                setAmount(value);
              }}
            />
          </Tooltip>
          {/* use utils.formatEther to display a BigNumber: */}
          <h2>Your Balance: {yourLocalBalance ? utils.formatEther(yourLocalBalance) : "..."}</h2>
          <div style={{ margin: 8 }}>
            <Button
              disabled={!isConfigured || amount === "" || parseFloat(amount) <= 0}
              onClick={() => {
                writeContracts.CustomResolver.estimateGas.sendPrivate(nameHash).then(gasLimit => {
                  tx(
                    writeContracts.CustomResolver.sendPrivate(nameHash, {
                      value: utils.parseEther(amount),
                      gasLimit: gasLimit.add(gasLimit.div(2)),
                    }),
                  );
                });
              }}
            >
              Send ETH via Aztec
            </Button>
          </div>
        </div>
        <Divider />
        <p>⚠️ ❌ BETA and NOT PRODUCTION READY ❌ ⚠️</p>
        <p>Not affiliated with Chainsafe, Aztec, or ENS</p>
        <p>
          See the{" "}
          <a href="https://blog.chainsafe.io/bringing-privacy-to-ens-chainsafes-proposed-integration-using-aztec-network-4c75716e3ea1">
            Chainsafe Article
          </a>{" "}
          for more information on the integration
        </p>
      </div>
    </div>
  );
}
