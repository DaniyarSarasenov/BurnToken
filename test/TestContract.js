// const { expect } = require("chai");
// const { ethers, waffle } = require("hardhat");

// const utils = require("ethers/lib/utils");
// const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
// const { BigNumber } = require("@ethersproject/bignumber");
// const { updateVariableStatement } = require("typescript");

// describe("NFT SwapBOX Test", () => { 

//     let testContract;
//     let nftContract;
//     let ftContract;
//     let ft1155Contract;
//     let nftSwapFeeDiscount;
//     let swapFees;
//     beforeEach(async () => {
//         [swapOwner, account1, account2,boxContractOwner] = await ethers.getSigners();
//         accounts = await ethers.getSigners();

//         const GasTest = await ethers.getContractFactory("TestSwapBox");
//         testContract = await GasTest.deploy();
        
//         await testContract.deployed();

//         const TestNFT = await ethers.getContractFactory("TestNFT");
//         nftContract = await TestNFT.deploy("TestNFT", "TNFT");
//         await nftContract.deployed();

//         const TestFT = await ethers.getContractFactory("TestFT");
//         ftContract = await TestFT.deploy();
//         await ftContract.deployed();

//         const Test1155 = await ethers.getContractFactory("NFT1155");
//         ft1155Contract = await Test1155.deploy();
//         await ft1155Contract.deployed();

//         const NFTSwapFeeDiscount = await ethers.getContractFactory("NFTSwapFeeDiscount");
//         nftSwapFeeDiscount =  await NFTSwapFeeDiscount.deploy(account1.address, account2.address);
//         await nftSwapFeeDiscount.deployed();

//         const NFTSwapFees = await ethers.getContractFactory("NFTSwapBoxFees");
//         swapFees =  await NFTSwapFees.deploy(account1.address, account2.address);
//         await swapFees.deployed();

//         await swapFees.connect(account1).setNFTSwapDiscountAddress(nftSwapFeeDiscount.address);

//     })

//     it("Test Gas Fees", async() => {
//         // await testContract.Test1();
//         // await testContract.Test2();
//         // await testContract.Test3();
//         // await testContract.Test4();
//         // await testContract.Test5();
//         // await testContract.Test6();
//         // await testContract.Test7();

//         // console.log(await swapFees._checkingBoxAssetsCounter(
//         //     [
//         //         [
//         //             nftContract.address,
//         //             1,
//         //             4294967295,
//         //             4294967295
//         //         ]
//         //     ],
//         //     [
//         //         [
//         //             ftContract.address,
//         //             50

//         //         ]
//         //     ],
//         //     [
//         //         [
//         //             ft1155Contract.address,
//         //             1,
//         //             1,
//         //             10,
//         //             0
//         //         ]
                
//         //     ],
//         //     utils.parseEther("1")
//         // ) * utils.parseEther("0.0001"),"CCCCCCCCCc")

//         // console.log( await swapFees._checkPrePaidFees(
//         //     [
//         //         [
//         //             nftContract.address,
//         //             1,
//         //             4294967295,
//         //             4294967295
//         //         ]
//         //     ],
//         //     [
//         //         [
//         //             ftContract.address,
//         //             50

//         //         ]
//         //     ],
//         //     [
//         //         [
//         //             ft1155Contract.address,
//         //             1,
//         //             1,
//         //             10,
//         //             0
//         //         ]
                
//         //     ],
//         //     utils.parseEther("1"),
//         //     account1.address
//         // ),"!!!!!!!!");

//         // return
//         await testContract.creatBox(
//             [
//                 [
//                     nftContract.address,
//                     1,
//                     1,
//                     1
//                 ]
//             ],
//             [
//                 [
//                     ftContract.address,
//                     50
//                 ]
//             ],
//             [
//                 [
//                     ft1155Contract.address,
//                     1,
//                     10,
//                     1,
//                     10
//                 ]
                
//             ],
//             utils.parseEther("1")
//         );

//         // await testContract.deleteBox(
//         //     [
//         //         [
//         //             nftContract.address,
//         //             1,
//         //             4294967295,
//         //             4294967295
//         //         ]
//         //     ],
//         //     [
//         //         [
//         //             ftContract.address,
//         //             50
//         //         ]
//         //     ],
//         //     [
//         //         [
//         //             ft1155Contract.address,
//         //             1,
//         //             1,
//         //             10,
//         //             0
//         //         ]
                
//         //     ],
//         //     utils.parseEther("1")
//         // );

//         // console.log (await testContract.getNFT(1),"!!!!!!!!!");
//     })

// });