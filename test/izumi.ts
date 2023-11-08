import { ethers, network } from "hardhat";
import { Izumi } from "../src/izumi";
import { expect } from "chai";

describe("Izumi", function () {
  it("should swap properly", async () => {
    const provider = new ethers.JsonRpcProvider("https://rpc.scroll.io")
    const [signer] = await ethers.getSigners()
    const initialBalance = await provider.getBalance(signer.address)

    const weth = "0x5300000000000000000000000000000000000004";
    const usdc = "0x176211869cA2b568f2A7D4EE941E073a821EE1ff";

    console.log(await provider.getBalance(await ethers.getImpersonatedSigner(weth)))
    console.log(await provider.getBalance(signer.address))
    const fundTx = await (await ethers.getImpersonatedSigner(weth)).sendTransaction({ to: signer.address, value: ethers.parseEther("100") })
    await fundTx.wait()
    console.log(await provider.getBalance(await ethers.getImpersonatedSigner(weth)))
    console.log(await provider.getBalance(signer.address))


    const izumi = new Izumi()
    const tx = await izumi.izumiSwap(weth, usdc, "10", signer.address, "https://rpc.scroll.io");

    const receipt = await signer.sendTransaction(tx);
    await receipt.wait();

    console.log(initialBalance, "\n", await provider.getBalance(signer.address))
  })
});
