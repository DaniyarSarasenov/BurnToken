const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

const utils = require("ethers/lib/utils");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const { BigNumber } = require("@ethersproject/bignumber");
const { updateVariableStatement } = require("typescript");

describe("NFT SwapBOX Test", () => {
    let whiteListswapContract
    let swapBoxContract;
    let swapBoxAssets;
    let swapOwner;
    let ftContract;
    let nftContract;
    let ft1155Contract;
    let nftSwapBoxHisotry;
    let account1;
    let account2;
    let boxContractOwner;
    let accounts;
    let nFTSwapFeeDiscount;
    const swapFee = [utils.parseEther("0.01"), utils.parseEther("0.02"), utils.parseEther("0.01"), utils.parseEther("0.01")];
    const State = {
        Initiated: 0,
        Waiting_for_offers: 1,
        Offered: 2,
        Destroyed: 3
    };
    const imageURI = 'https://test.uri/';

    beforeEach(async () => {
        [swapOwner, account1, account2,boxContractOwner] = await ethers.getSigners();
        accounts = await ethers.getSigners();
        
        // deploy swap contract
        const NFTSwapwhiteList = await ethers.getContractFactory("NFTSwapBoxWhitelist");
        whiteListswapContract =  await NFTSwapwhiteList.deploy(account1.address, account2.address);
        await whiteListswapContract.deployed();

        const NFTSwapFees = await ethers.getContractFactory("NFTSwapBoxFees");
        swapFees =  await NFTSwapFees.deploy(account1.address, account2.address);
        await swapFees.deployed();

      

        // const NFTAssets = await ethers.getContractFactory("NFTSwapBoxAssets");
        // swapBoxAssets =  await NFTAssets.deploy();
        // await swapBoxAssets.deployed();

        const NFTSwapBoxHistory = await ethers.getContractFactory("NFTSwapBoxHistory");
        nftSwapBoxHisotry =  await NFTSwapBoxHistory.deploy();
        await nftSwapBoxHisotry.deployed();

        const NFTSwapFeeDiscount = await ethers.getContractFactory("NFTSwapFeeDiscount");
        nftSwapFeeDiscount =  await NFTSwapFeeDiscount.deploy(account1.address, account2.address);
        await nftSwapFeeDiscount.deployed();

        const NFTSwapBox = await ethers.getContractFactory("NFTSwapBox");
        swapBoxContract = await NFTSwapBox.deploy(
            whiteListswapContract.address,
            swapFees.address,
            account1.address,
            "Mumbai"
        );
        await swapBoxContract.deployed();
        //set NFTSwap Address
        // await swapBoxContract.setNFTWhiteListAddress(whiteListswapContract.address);
        // await swapBoxContract.setNFTSwapBoxFeesAddress(swapFees.address);
        // await swapBoxContract.setNFTAssetsAddress(swapBoxAssets.address);
        // await swapBoxContract.setWithDrawOwner(account1.address);
        // const bbb = await waffle.provider.getBalance(boxContractOwner.address)
        // console.log(ethers.utils.formatEther(bbb), "sssssssss")
        // await swapBoxContract.setSwapOwner(boxContractOwner.address);

        await swapBoxContract.setNFTSwapBoxHistoryAddress(nftSwapBoxHisotry.address);

        await swapFees.connect(account1).setNFTSwapDiscountAddress(nftSwapFeeDiscount.address);

        // await nftSwapBoxHisotry.setSwapBoxAddress(swapBoxContract.address);


        // deploy NFT contract
        const TestNFT = await ethers.getContractFactory("TestNFT");
        nftContract = await TestNFT.deploy("TestNFT", "TNFT");
        await nftContract.deployed();
        await nftContract.setBaseURI(imageURI);

        // deploy FT contract
        const TestFT = await ethers.getContractFactory("TestFT");
        ftContract = await TestFT.deploy();
        await ftContract.deployed();

        const Test1155 = await ethers.getContractFactory("NFT1155");
        ft1155Contract = await Test1155.deploy();
        await ft1155Contract.deployed();


        await whiteListswapContract.connect(account1).setUsingERC721Whitelist(0);

        await whiteListswapContract.connect(account1).setUsingERC1155Whitelist(0);
        await whiteListswapContract.connect(account1).whiteListERC20Token(ftContract.address);
    })

    // it("Checking Prepaid Fees", async() => {
    //     //NFT TokenID1
    //     await nftContract.connect(account1).mintTo(account1.address); //NFT tokenID1
    //     await nftContract.connect(account1).approve(swapBoxContract.address, 1);

    //     //ERC20(50)
    //     await ftContract.connect(account1).mint(account1.address, 100);
    //     await ftContract.connect(account1).approve(swapBoxContract.address, 50);

    //     //ERC1155
    //     await ft1155Contract.connect(account1).mintTo(account1.address);
    //     await ft1155Contract.connect(account1).setApprovalForAll(swapBoxContract.address, true);

    //     // return


    //     //Set ERC20Fees
    //     await swapFees.connect(account1).setERC20Fee(ftContract.address, 200);

    //     let erc20Fees = await swapFees._checkerc20Fees(
    //         [
    //             [
    //                 ftContract.address,
    //                 50
    //             ]
    //         ],
    //         account1.address
    //     );
    //      console.log(erc20Fees,"erc20Fees")
        
    //     expect(erc20Fees[0].feeAmount).to.be.equal(1);

    //     //Set GasToken
    //     await swapFees.connect(account1).setDefaultGasTokenSwapPercentage(200);

    //     let nftgasFees = await swapFees._checknftgasfee(
    //         [
    //             // [
    //             //     nftContract.address,
    //             //     1,
    //             //     4294967295,
    //             //     4294967295
    //             // ]
    //         ],
    //         [
    //             // [
    //             //     ft1155Contract.address,
    //             //     1,
    //             //     1,
    //             //     10,
    //             //     0
    //             // ]
                
    //         ],
    //         utils.parseEther("1"),
    //         account1.address
    //     )
    //     // console.log(utils.parseEther("1"),"EEEEEEEEEEEE")
    //     expect(nftgasFees).to.be.equal(utils.parseEther("0.02"));
    //         // return
    //     //Set Royatly Fee
    //     // await swapFees.connect(account1).setNFTRoyaltyFee(nftContract.address, utils.parseEther("1"), account2.address);
    //     // await swapFees.connect(account1).setNFTRoyaltyFee(ft1155Contract.address, utils.parseEther("2"), account2.address);
    //     let royaltyFees = await swapFees._checkRoyaltyFee(
    //         [
    //             [
    //                 nftContract.address,
    //                 1,
    //                 4294967295,
    //                 4294967295
    //             ]
    //         ],
    //         [
    //             [
    //                 ft1155Contract.address,
    //                 1,
    //                 1,
    //                 10,
    //                 0
    //             ]
                
    //         ],
    //         account1.address
    //     )

    //     // console.log(royaltyFees,"royaltyFees")

    //     return
    //     let  prePaidFees = await swapFees._checkPrePaidFees(
    //         [
    //             [
    //                 nftContract.address,
    //                 1,
    //                 4294967295,
    //                 4294967295
    //             ]
    //         ],
    //         [
    //             [
    //                 ftContract.address,
    //                 50
    //             ]
    //         ],
    //         [
    //             [
    //                 ft1155Contract.address,
    //                 1,
    //                 1,
    //                 10,
    //                 0
    //             ]
                
    //         ],
    //         utils.parseEther("1"),
    //         account1.address
    //     );

    //     console.log(prePaidFees,"!!!!!!!!!!!!");
    //     // return
    //     expect(prePaidFees.nftSwapFee).to.be.equal(utils.parseEther("0.0011"));

    //     return

    //     prePaidFees = await swapFees._checkPrePaidFees(
    //         [
    //             [
    //                 nftContract.address,
    //                 1,
    //                 1,
    //                 1
    //             ],
    //             [
    //                 nftContract.address,
    //                 1,
    //                 1,
    //                 4294967295
    //             ]
    //         ],
    //         [
    //             [
    //                 ftContract.address,
    //                 50
    //             ]
    //         ],
    //         [
    //             [
    //                 ft1155Contract.address,
    //                 1,
    //                 1,
    //                 10,
    //                 3
    //             ],
    //             [
    //                 ft1155Contract.address,
    //                 1,
    //                 1,
    //                 10,
    //                 0
    //             ]
                
    //         ],
    //         utils.parseEther("1"),
    //         account1.address
    //     );

    //     console.log(prePaidFees,"prePaidFees");

    //     expect(prePaidFees.nftSwapFee).to.be.equal(utils.parseEther("0.0028"));

    //     //Set NFTSwap Fees
    //     await swapFees.connect(account1).setNFTSwapFee(nftContract.address, utils.parseEther("1"));
    //     await swapFees.connect(account1).setNFTSwapFee(ft1155Contract.address, utils.parseEther("2"));


    //     //Set ERC20Fees
    //     await swapFees.connect(account1).setERC20Fee(ftContract.address, 200);

    //     //Set GasTokenFees
    //     await swapFees.connect(account1).setDefaultGasTokenSwapPercentage(200);

    //     //Set RoyaltyFees
    //     await swapFees.connect(account1).setNFTRoyaltyFee(nftContract.address, utils.parseEther("1"), account2.address);
    //     await swapFees.connect(account1).setNFTRoyaltyFee(ft1155Contract.address, utils.parseEther("2"), account2.address);

    //     //Set DiscountFees

    //     await nftSwapFeeDiscount.connect(account1).setNFTDiscount(nftContract.address, 5000);
    //     await nftSwapFeeDiscount.connect(account1).setNFTDiscount(ft1155Contract.address, 1000);

    //     //Set User Discount
    //     await nftSwapFeeDiscount.connect(account1).setUserDiscount(account1.address, 2000);

    //     return

    //     prePaidFees = await swapFees._checkPrePaidFees(
    //         [
    //             [
    //                 nftContract.address,
    //                 1,
    //                 4294967295,
    //                 4294967295
    //             ]
    //         ],
    //         [
    //             [
    //                 ftContract.address,
    //                 50

    //             ]
    //         ],
    //         [
    //             [
    //                 ft1155Contract.address,
    //                 1,
    //                 1,
    //                 10,
    //                 10
    //             ]
                
    //         ],
    //         utils.parseEther("1"),
    //         account1.address
    //     );
    //     console.log(prePaidFees,"prePaidFees")
    //     return
    //     expect(prePaidFees.nftSwapFee).to.be.equal(utils.parseEther("32.5"));

    //     expect(prePaidFees.erc20Fees[0].tokenAddr).to.be.equal(ftContract.address);
    //     expect(prePaidFees.erc20Fees[0].feeAmount).to.be.equal(1);
    //     expect(prePaidFees.gasTokenFee).to.be.equal(utils.parseEther("0.016"));

    //     expect(prePaidFees.royaltyFees[0].reciever).to.be.equal(account2.address);
    //     expect(prePaidFees.royaltyFees[0].feeAmount).to.be.equal(utils.parseEther("0.5"));

    //     expect(prePaidFees.royaltyFees[1].reciever).to.be.equal(account2.address);
    //     expect(prePaidFees.royaltyFees[1].feeAmount).to.be.equal(utils.parseEther("32"));

    // })
    // return
    // return
    it("Creating Box", async() => {
        await nftContract.connect(account1).mintTo(account1.address); //NFT tokenID1
        await nftContract.connect(account1).approve(swapBoxContract.address, 1);

        await ftContract.connect(account1).mint(account1.address, 100); // ERC20 50
        await ftContract.connect(account1).approve(swapBoxContract.address, 50);

        await ft1155Contract.connect(account1).mintTo(account1.address);
        await ft1155Contract.connect(account1).setApprovalForAll(swapBoxContract.address, true);

        // await whiteListswapContract.connect(account1).addPaymentToken(ftContract.address);

        //add PyamentToekn
        await swapFees.connect(account1).addPaymentTokenFee(ftContract.address, 1000);
        await swapFees.connect(account1).addPaymentTokenFee(ftContract.address, 1000);

        const tttt = await swapFees.getPaymentTokenList();
        const result = await swapBoxContract.connect(account1).createBox(
            [
                // [
                //     nftContract.address,
                //     1,
                //     4294967295,
                //     4294967295
                // ]
            ],
            [
                [
                    ftContract.address,
                    50

                ]
            ],
            [
                // [
                //     ft1155Contract.address,
                //     1,
                //     1,
                //     10,
                //     0
                // ]
                
            ],
            // utils.parseEther("1"),
            utils.parseEther("0"),
            [],
            1,
            // {
                // value: utils.parseEther("1.0026") // CreateBox Fee
            // }
            [
                ftContract.address,
                20
            ],
            {
                value: utils.parseEther("0.0003") // CreateBox Fee
            }
        )

        // console.log(account1.address, await swapBoxContract.connect(account1).getBB(),"fffffff")
        // return

        await ftContract.connect(account1).approve(swapBoxContract.address, 50);

        await ftContract.connect(account2).mint(account2.address, 100); // ERC20 50
        await ftContract.connect(account2).approve(swapBoxContract.address, 22);
        // await ftContract.connect(account2).approve(swapBoxContract.address, 20);
        // const fee =  await swapFees._checkPaymentTokenFee(
        //     [
        //         ftContract.address,
        //         20
        //     ],
        //     account2.address
        // )
        // console.log(fee,"feeee")
        // console.log(await ftContract.balanceOf(account2.address),"bbbbb")
        // await swapBoxContract.connect(account2).purchaseBox(1, {
        //     value: utils.parseEther("0")
        // })
        // console.log(await ftContract.balanceOf(account2.address),"aaaaa")

        // return
        
        // console.log(tokenFee, await ftContract.balanceOf(account1.address), "tokenFee");
        // const _rec = await result.wait();
        // const event = _rec.events[4];
        // console.log(event.args[0],"result1111")
        // await swapBoxContract.connect(account1).changeBoxState(1,[], {value: utils.parseEther("0")})
        // return

        // const box = await swapBoxContract.getBoxAssets(1);
        // console.log(box);
        // return
            // return

        //creating box 2
        // return
        await nftContract.connect(account2).mintTo(account2.address); //NFT tokenID2
        await nftContract.connect(account2).approve(swapBoxContract.address, 2);

        await ftContract.connect(account2).mint(account2.address, 100); // ERC20 50
        await ftContract.connect(account2).approve(swapBoxContract.address, 100);

        await ft1155Contract.connect(account2).mintTo(account2.address);
        await ft1155Contract.connect(account2).setApprovalForAll(swapBoxContract.address, true);

        await swapBoxContract.connect(account2).createBox(
            [
                // [
                //     nftContract.address,
                //     1,
                //     4294967295,
                //     4294967295
                // ]
            ],
            [
                [
                    ftContract.address,
                    50

                ]
            ],
            [
                // [
                //     ft1155Contract.address,
                //     1,
                //     1,
                //     10,
                //     0
                // ]
                
            ],
            // utils.parseEther("1"),
            utils.parseEther("0"),
            [],
            2,
            // {
                // value: utils.parseEther("1.0026") // CreateBox Fee
            // }
            [
                ftContract.address,
                20
            ],
            {
                value: utils.parseEther("0.0004") // CreateBox Fee
            }
        )
        // return
        await swapBoxContract.connect(account2).offerBox(1,2,{value : utils.parseEther("0.0003")});
        console.log(await swapBoxContract.getOffers(1),"ooo")
        await swapBoxContract.connect(account1).swapBox(1,2);
            return
        await swapBoxContract.connect(account2).changeBoxState(2,[],["0x0000000000000000000000000000000000000000",0],{value: utils.parseEther("0.0002")})
        // console.log(await swapBoxContract.getofferedList(2),"ooofff")

        // await swapBoxContract.connect(account2).withdrawBox(2);
        console.log(await swapBoxContract.getOffers(1),"aaaaaaa")
        // console.log(await swapBoxContract.getofferedList(2),"aaaaaaafff")
        // const offers = await swapBoxContract.getOffers(1);
        // const offered = await swapBoxContract.getofferedList(2);

        // await swapBoxContract.connect(account2).withDrawOffer(1,2);
        // const afteroffered = await swapBoxContract.getofferedList(2);
        // console.log(offered,afteroffered,"offered")
        return;
        await swapBoxContract.connect(account1).swapBox(1,2);
        return


        //creating box 3

        await nftContract.connect(account2).mintTo(account2.address); //NFT tokenID2
        await nftContract.connect(account2).approve(swapBoxContract.address, 3);

        await ftContract.connect(account2).mint(account2.address, 1000); // ERC20 50
        await ftContract.connect(account2).approve(swapBoxContract.address, 200);

        await ft1155Contract.connect(account2).mintTo(account2.address);
        await ft1155Contract.connect(account2).setApprovalForAll(swapBoxContract.address, true);

        await swapBoxContract.connect(account2).createBox(
            [
                [
                    nftContract.address,
                    3,
                    4294967295,
                    4294967295
                ]
            ],
            [
                [
                    ftContract.address,
                    50

                ]
            ],
            [
                [
                    ft1155Contract.address,
                    3,
                    1,
                    5,
                    0
                ],
                [
                    ft1155Contract.address,
                    3,
                    1,
                    5,
                    0
                ]
                
            ],
            utils.parseEther("1"),
            [],
            2,
            {
                value: utils.parseEther("1.0027") // CreateBox Fee
            }
        )

        //LinkBox
        await swapBoxContract.connect(account2).offerBox(1,2,{value : utils.parseEther("0.0003")})

        // await swapBoxContract.connect(account2).withDrawOffer(1,2)

        // await swapBoxContract.connect(account1).changeBoxState(1,{value : utils.parseEther("0.0004")})
        // await swapBoxContract.connect(account1).destroyBox(1);
        // return

        await swapBoxContract.connect(account1).swapBox(1,2);
        
        //Creating Box2
        // await swapBoxContract.connect(account1).changeBoxState(1,0);
        // await swapBoxContract.connect(account1).destroyBox(1);
        return

        console.log(await swapBoxContract.connect(account1).getBoxByIndex(1),"111111111111111");
        // return

        await swapFees.connect(account1).setDefaultTokenSwapPercentage(200);
        console.log(await swapFees.defaultTokenSwapPercentage(),"!!!!!!!!")

        const checkNFTFee = await swapFees._checkNFTFee(
            [
                [
                    nftContract.address,
                    [1]
                ]
            ],
            [
                [
                    ft1155Contract.address,
                    [1],
                    [10]
                ]
                
            ],
            account1.address
        )
        console.log(checkNFTFee,"checkNFTFee")

        const checkERC20 = await swapFees._checkERC20Fee(
            [
                [ftContract.address],
                [50]
            ],
            account1.address
        )

        console.log(checkERC20,"checkNFTFee")

        const gasTokenFee = await swapFees._checkGasTokenFee(utils.parseEther("1"), account1.address)
        console.log(gasTokenFee,"gasTokenFee")
        await ftContract.connect(account1).approve(swapBoxAssets.address, 1);
        // return
        await swapBoxContract.connect(account1).toWaitingForOffers(1,
            [],false,
            {
            value: utils.parseEther("0.0013")
        });

        // return  

        console.log(await swapBoxAssets.getOfferAddress(1),"AAAAAAAAAAAAAAAAAAAAAA");

        // await swapBoxContract.connect(account1).deListBox(1);

        // console.log(await swapBoxAssets.getOfferAddress(1),"BBBBBBBBBBB");

        // return


        //Create account2 swapbox

        await nftContract.connect(account2).mintTo(account2.address); //NFT tokenID1
        await nftContract.connect(account2).approve(swapBoxAssets.address, 2);

        await ftContract.connect(account2).mint(account2.address, 100); // ERC20 50
        await ftContract.connect(account2).approve(swapBoxAssets.address, 50);

        await ft1155Contract.connect(account2).mintTo(account2.address);
        await ft1155Contract.connect(account2).setApprovalForAll(swapBoxAssets.address, true);

        await swapBoxContract.connect(account2).createBox(
            [
                [
                    nftContract.address,
                    [2]
                ]
            ],
            [
                [ftContract.address],
                [50]
            ],
            [
                [
                    ft1155Contract.address,
                    [2],
                    [10]
                ]
                
            ],
            utils.parseEther("1"),
            {
                value: utils.parseEther("1.0004") // CreateBox Fee
            }
        )
        // return

        await ftContract.connect(account2).approve(swapBoxAssets.address, 1);

        await swapBoxContract.connect(account2).toOffer(2,
            {
                value: utils.parseEther("0.0011")
            }
            );

        // return
        // console.log(await swapBoxContract.getBoxByIndex(1),"HHHHHHHHHHHHH")
        await swapBoxContract.connect(account2).linkBox(1,2,{
            value: utils.parseEther("0.0003")
        });

        await swapBoxContract.connect(account1).swapBox(1,2);
        console.log(await swapBoxContract.getBoxByIndex(1),account2.address, "HHHHHHHHHHHHH")
        // await swapBoxContract.connect(account1)


    })

    return
    // it("Create SwapBox with ERC721 and ERC20", async () => {
    //     await nftContract.connect(account1).mintTo(account1.address);
    //     await nftContract.connect(account1).mintTo(account1.address);
    //     await nftContract.connect(account1).setApprovalForAll(swapBoxAssets.address, true); // NFT tokenid 1
    //     const bbb = await waffle.provider.getBalance(boxContractOwner.address)
    //     // const metadata = await nftContract.tokenURI(1);
    //     // const decodedMetadata = JSON.parse(atob(metadata.substring(metadata.indexOf("base64,") + 7)));
    //     // expect(decodedMetadata.image).to.be.equal(imageURI + '1.png');
    //     await ftContract.connect(account1).mint(account1.address, 50); // ERC20 100
    //     await ftContract.connect(account1).approve(swapBoxAssets.address, 50);

    //     await ft1155Contract.connect(account1).mintTo(account1.address);
    //     await ft1155Contract.connect(account1).mintTo(account1.address);
    //     await ft1155Contract.connect(account1).setApprovalForAll(swapBoxAssets.address, true)
    //     // return
    //     await swapBoxContract.connect(account1).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [1]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         [
    //             [
    //                 ft1155Contract.address,
    //                 [1],
    //                 [10]

    //             ]
                
    //         ],
    //         utils.parseEther("0"),
    //         {
    //             value: utils.parseEther("0.0003") // CreateBox Fee
    //         }
    //     );
    //         // return
    //     const boxes = await swapBoxContract.connect(account1).getBoxByIndex(1);
    //     console.log(boxes,"11111111")
    //     const droyalty = await swapFees._checkERC20Fee(boxes.erc20Tokens,account1.address)
    //     console.log(droyalty,"droyalty")
    //     // let  tokenCount = await ftContract.balanceOf(account1.address);
    //     // console.log(tokenCount,"erc20Fee")
    //     // return
    //     await ftContract.connect(account1).approve(swapBoxAssets.address, 1);
    //     await ftContract.connect(account1).approve(swapBoxAssets.address, 2);


    //     await swapBoxContract.connect(account1).toWaitingForOffers(1,{
    //         value: utils.parseEther("2.0004")
    //     });
    //     return
    //     // await swapBoxContract.connect(account1).deListBox(1)
    //     // await ftContract.connect(account1).approve(swapBoxAssets.address, 51);
    //     // await swapBoxContract.connect(account1).toWaitingForOffers(1,{
    //     //     value: utils.parseEther("0.0004") })
            
    //     // const boxes = await swapBoxContract.connect(account1).getBoxByIndex(1);
    //     // console.log(boxes,"11111111")

    //     // return



    //     await nftContract.connect(account2).mintTo(account2.address);
    //     await nftContract.connect(account2).setApprovalForAll(swapBoxAssets.address, true); // NFT tokenid 1
    //     // const bbb = await waffle.provider.getBalance(boxContractOwner.address)
    //     // const metadata = await nftContract.tokenURI(1);
    //     // const decodedMetadata = JSON.parse(atob(metadata.substring(metadata.indexOf("base64,") + 7)));
    //     // expect(decodedMetadata.image).to.be.equal(imageURI + '1.png');
    //     await ftContract.connect(account2).mint(account2.address, 100); // ERC20 100
    //     await ftContract.connect(account2).approve(swapBoxAssets.address, 10);

    //     await ft1155Contract.connect(account2).mintTo(account2.address);
    //     // await ft1155Contract.connect(account2).mintTo(account2.address);
    //     await ft1155Contract.connect(account2).setApprovalForAll(swapBoxAssets.address, true)
    //     // return
    //     await swapBoxContract.connect(account2).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [2]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [10]
    //         ],
    //         [
    //             [
    //                 ft1155Contract.address,
    //                 [3],
    //                 [5]

    //             ]
                
    //         ],
    //         utils.parseEther("0.1"),
    //         {
    //             value: utils.parseEther("0.1004") // CreateBox Fee
    //         }
    //     );
    //     // return
    //     const box2 = await swapBoxContract.connect(account2).getBoxByIndex(2)
    //     console.log(box2,"111111");
    //     // return
    //     await swapBoxContract.connect(account2).toOffer(2, {value: utils.parseEther("0.0052")})
            
    //     await swapBoxContract.connect(account2).linkBox(1,2, {value: utils.parseEther("0.0003")})
    //     // return
    //     await swapBoxContract.connect(account1).swapBox(1,2)
    //     console.log( await swapBoxContract.connect(account2).getBoxByIndex(2),"2222");
    //     return
    //     // await nftSwapBoxHisotry.connect(account1).totalSwapFees();
    //     const userFeesAccount1 = await nftSwapBoxHisotry.connect(account2).getUserTotalSwapFees(account2.address);
    //     const userFeesAccount2 = await nftSwapBoxHisotry.connect(account2).getUserTotalSwapFees(account1.address);
    //     console.log(userFeesAccount1,userFeesAccount2,"userFeesAccount1")

    //     // console.log(await nftSwapBoxHisotry.getSwapHistoryById(1),"hhhhhhhhhh")
    //     // console.log(userFeesAccount1,"userFeesAccount1")
    //     // tokenCount = await ftContract.balanceOf(account1.address);
    //     // expect(tokenCount).to.be.equal(49)
    //     // console.log(tokenCount,"faaaaerc20Fee")
    //     // // const boxes = await swapBoxContract.connect(account1).getBoxByIndex(1);
    //     // // console.log(boxes,"11111111")
    //     // await swapBoxContract.connect(account1).deListBox(1)
    //     // // expect(tokenCount).to.be.equal(50)
    //     // tokenCount = await ftContract.balanceOf(account1.address);
    //     // console.log(tokenCount,"ddddddddddd")
    //     return
    //     await swapBoxContract.connect(account1).toWaitingForOffers(1, {value: utils.parseEther("3")})
        
    //     return
    //     await swapBoxContract.connect(account1).destroyBox(1,  {
    //         value: utils.parseEther("0.0004") // CreateBox Fee
    //     });
    //     // await nftContract.connect(account2).mintTo(account2.address);
    //     // await nftContract.connect(account2).approve(swapBoxContract.address, 2); // NFT tokenid 1

    //     // const metadata2 = await nftContract.tokenURI(2);
    //     // const decodedMetadata2 = JSON.parse(atob(metadata2.substring(metadata2.indexOf("base64,") + 7)));
    //     // expect(decodedMetadata2.image).to.be.equal(imageURI + '2.png');

    //     // await ftContract.connect(account2).mint(account2.address, 100); // ERC20 100
    //     // await ftContract.connect(account2).approve(swapBoxContract.address, 50);
    //     // await swapBoxContract.connect(account2).createBox(
    //     //     [
    //     //         [
    //     //             nftContract.address,
    //     //             [2]
    //     //         ]
    //     //     ],
    //     //     [
    //     //         [ftContract.address],
    //     //         [50]
    //     //     ],
    //     //     {
    //     //         value: swapFee[0] // CreateBox Fee
    //     //     }
    //     // );

    //     // const swapItems = await swapBoxContract.getBoxesByState(State.Initiated);
    //     // const myItems = await swapBoxContract.getOwnedSwapBoxes(account1.address, State.Initiated);

    //     // expect(swapItems[0].erc721Tokens[0].tokenAddr).to.be.equal(nftContract.address);
    //     // expect(swapItems.length).to.be.equal(2)
    //     // expect(myItems.length).to.be.equal(1)
    // });

    // it("To Waiting_for_Offer SwapBox", async () => {
    //     await nftContract.connect(account1).mintTo(account1.address);
    //     await nftContract.connect(account1).approve(swapBoxContract.address, 1); // NFT tokenid 1
    //     await ftContract.connect(account1).mint(account1.address, 100); // ERC20 100
    //     await ftContract.connect(account1).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account1).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [1]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     await nftContract.connect(account2).mintTo(account2.address);
    //     await nftContract.connect(account2).approve(swapBoxContract.address, 2); // NFT tokenid 1
    //     await ftContract.connect(account2).mint(account2.address, 100); // ERC20 100
    //     await ftContract.connect(account2).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account2).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [2]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     const swapItems = await swapBoxContract.getBoxesByState(State.Initiated);
    //     const myInitiateItems = await swapBoxContract.getOwnedSwapBoxes(account1.address, State.Initiated);

    //     expect(swapItems.length).to.be.equal(2)
    //     expect(myInitiateItems.length).to.be.equal(1)

    //     await swapBoxContract.connect(account1).toWaitingForOffers(myInitiateItems[0].id, {value: swapFee[1]});
    //     const myWaitingItems = await swapBoxContract.getOwnedSwapBoxes(account1.address, State.Waiting_for_offers);
    //     expect(myWaitingItems.length).to.be.equal(1)
    // });

    // it("To Offered SwapBox", async () => {
    //     await nftContract.connect(account1).mintTo(account1.address);
    //     await nftContract.connect(account1).approve(swapBoxContract.address, 1); // NFT tokenid 1
    //     await ftContract.connect(account1).mint(account1.address, 100); // ERC20 100
    //     await ftContract.connect(account1).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account1).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [1]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     await nftContract.connect(account2).mintTo(account2.address);
    //     await nftContract.connect(account2).approve(swapBoxContract.address, 2); // NFT tokenid 1
    //     await ftContract.connect(account2).mint(account2.address, 100); // ERC20 100
    //     await ftContract.connect(account2).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account2).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [2]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     const swapItems = await swapBoxContract.getBoxesByState(State.Initiated);
    //     const myInitiateItems = await swapBoxContract.getOwnedSwapBoxes(account1.address, State.Initiated);

    //     expect(swapItems.length).to.be.equal(2)
    //     expect(myInitiateItems.length).to.be.equal(1)

    //     await swapBoxContract.connect(account1).toOffer(myInitiateItems[0].id, {value: swapFee[2]});
    //     const myWaitingItems = await swapBoxContract.getOwnedSwapBoxes(account1.address, State.Offered);
    //     expect(myWaitingItems.length).to.be.equal(1)
    // });

    // it("To Destroyed SwapBox", async () => {
    //     await nftContract.connect(account1).mintTo(account1.address);
    //     await nftContract.connect(account1).approve(swapBoxContract.address, 1); // NFT tokenid 1
    //     await ftContract.connect(account1).mint(account1.address, 100); // ERC20 100
    //     await ftContract.connect(account1).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account1).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [1]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     await nftContract.connect(account2).mintTo(account2.address);
    //     await nftContract.connect(account2).approve(swapBoxContract.address, 2); // NFT tokenid 1
    //     await ftContract.connect(account2).mint(account2.address, 100); // ERC20 100
    //     await ftContract.connect(account2).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account2).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [2]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     const swapItems = await swapBoxContract.getBoxesByState(State.Initiated);
    //     const myInitiateItems = await swapBoxContract.getOwnedSwapBoxes(account1.address, State.Initiated);

    //     expect(swapItems.length).to.be.equal(2)
    //     expect(myInitiateItems.length).to.be.equal(1)

    //     await swapBoxContract.connect(account1).destroyBox(myInitiateItems[0].id, {value: swapFee[3]});
    //     const myWaitingItems = await swapBoxContract.getOwnedSwapBoxes(account1.address, State.Destroyed);
    //     expect(myWaitingItems.length).to.be.equal(1)

    //     const nftCount = await nftContract.balanceOf(account1.address);
    //     expect(nftCount).to.be.equal(1);
    // });

    // it("Link SwapBox to other", async () => {
    //     await nftContract.connect(account1).mintTo(account1.address);
    //     await nftContract.connect(account1).approve(swapBoxContract.address, 1); // NFT tokenid 1
    //     await ftContract.connect(account1).mint(account1.address, 100); // ERC20 100
    //     await ftContract.connect(account1).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account1).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [1]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     await nftContract.connect(account2).mintTo(account2.address);
    //     await nftContract.connect(account2).approve(swapBoxContract.address, 2); // NFT tokenid 1
    //     await ftContract.connect(account2).mint(account2.address, 100); // ERC20 100
    //     await ftContract.connect(account2).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account2).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [2]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     const swapItems = await swapBoxContract.getBoxesByState(State.Initiated);
    //     const myInitiateItems = await swapBoxContract.getOwnedSwapBoxes(account1.address, State.Initiated);

    //     expect(swapItems.length).to.be.equal(2)
    //     expect(myInitiateItems.length).to.be.equal(1)

    //     await swapBoxContract.connect(account1).toWaitingForOffers(swapItems[0].id, {value: swapFee[1]});
    //     await swapBoxContract.connect(account2).toOffer(swapItems[1].id, {value: swapFee[2]});
    //     await swapBoxContract.connect(account2).linkBox(swapItems[0].id, swapItems[1].id);

    //     const offeredBoxes = await swapBoxContract.getOfferedSwapBoxes(swapItems[0].id);
    //     expect(offeredBoxes.length).to.be.equal(1)

    //     const waitingBoxes = await swapBoxContract.getWaitingSwapBoxes(swapItems[1].id);
    //     expect(waitingBoxes.length).to.be.equal(1)
    // });

    // it("DeLink SwapBox from other", async () => {
    //     await nftContract.connect(account1).mintTo(account1.address);
    //     await nftContract.connect(account1).approve(swapBoxContract.address, 1); // NFT tokenid 1
    //     await ftContract.connect(account1).mint(account1.address, 100); // ERC20 100
    //     await ftContract.connect(account1).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account1).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [1]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     await nftContract.connect(account2).mintTo(account2.address);
    //     await nftContract.connect(account2).approve(swapBoxContract.address, 2); // NFT tokenid 1
    //     await ftContract.connect(account2).mint(account2.address, 100); // ERC20 100
    //     await ftContract.connect(account2).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account2).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [2]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     const swapItems = await swapBoxContract.getBoxesByState(State.Initiated);
    //     const myInitiateItems = await swapBoxContract.getOwnedSwapBoxes(account1.address, State.Initiated);

    //     expect(swapItems.length).to.be.equal(2);
    //     expect(myInitiateItems.length).to.be.equal(1);

    //     await swapBoxContract.connect(account1).toWaitingForOffers(swapItems[0].id, {value: swapFee[1]});
    //     await swapBoxContract.connect(account2).toOffer(swapItems[1].id, {value: swapFee[2]});
    //     await swapBoxContract.connect(account2).linkBox(swapItems[0].id, swapItems[1].id);

    //     const offeredBoxes = await swapBoxContract.getOfferedSwapBoxes(swapItems[0].id);
    //     expect(offeredBoxes.length).to.be.equal(1);

    //     await swapBoxContract.connect(account2).deLink(swapItems[0].id, swapItems[1].id);
    //     const delinkedSwapBoxes = await swapBoxContract.getOfferedSwapBoxes(swapItems[0].id);
    //     expect(delinkedSwapBoxes.length).to.be.equal(0);

    //     const waitingBoxes = await swapBoxContract.getWaitingSwapBoxes(swapItems[1].id);
    //     expect(waitingBoxes.length).to.be.equal(0)
    // });

    // it("DeList SwapBox", async () => {
    //     await nftContract.connect(account1).mintTo(account1.address);
    //     await nftContract.connect(account1).approve(swapBoxContract.address, 1); // NFT tokenid 1
    //     await ftContract.connect(account1).mint(account1.address, 100); // ERC20 100
    //     await ftContract.connect(account1).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account1).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [1]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     await nftContract.connect(account2).mintTo(account2.address);
    //     await nftContract.connect(account2).approve(swapBoxContract.address, 2); // NFT tokenid 1
    //     await ftContract.connect(account2).mint(account2.address, 100); // ERC20 100
    //     await ftContract.connect(account2).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account2).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [2]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     const swapItems = await swapBoxContract.getBoxesByState(State.Initiated);
    //     expect(swapItems.length).to.be.equal(2)

    //     await swapBoxContract.connect(account1).toWaitingForOffers(swapItems[0].id, {value: swapFee[1]});
    //     await swapBoxContract.connect(account2).toOffer(swapItems[1].id, {value: swapFee[2]});
    //     await swapBoxContract.connect(account2).linkBox(swapItems[0].id, swapItems[1].id);

    //     await swapBoxContract.connect(account1).deListBox(swapItems[0].id);

    //     const myInitiateItems = await swapBoxContract.getOwnedSwapBoxes(account1.address, State.Initiated);
    //     expect(myInitiateItems.length).to.be.equal(1)

    //     const offeredBoxes = await swapBoxContract.getOfferedSwapBoxes(swapItems[0].id);
    //     expect(offeredBoxes.length).to.be.equal(0)

    //     const waitingBoxes = await swapBoxContract.getWaitingSwapBoxes(swapItems[1].id);
    //     expect(waitingBoxes.length).to.be.equal(0)
    // });

    // it("DeOffer SwapBox", async () => {
    //     await nftContract.connect(account1).mintTo(account1.address);
    //     await nftContract.connect(account1).approve(swapBoxContract.address, 1); // NFT tokenid 1
    //     await ftContract.connect(account1).mint(account1.address, 100); // ERC20 100
    //     await ftContract.connect(account1).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account1).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [1]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     await nftContract.connect(account2).mintTo(account2.address);
    //     await nftContract.connect(account2).approve(swapBoxContract.address, 2); // NFT tokenid 1
    //     await ftContract.connect(account2).mint(account2.address, 100); // ERC20 100
    //     await ftContract.connect(account2).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account2).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [2]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     const swapItems = await swapBoxContract.getBoxesByState(State.Initiated);
    //     expect(swapItems.length).to.be.equal(2)

    //     await swapBoxContract.connect(account1).toWaitingForOffers(swapItems[0].id, {value: swapFee[1]});
    //     await swapBoxContract.connect(account2).toOffer(swapItems[1].id, {value: swapFee[2]});
    //     await swapBoxContract.connect(account2).linkBox(swapItems[0].id, swapItems[1].id);

    //     await swapBoxContract.connect(account2).deOffer(swapItems[1].id);

    //     const myInitiateItems = await swapBoxContract.getOwnedSwapBoxes(account2.address, State.Initiated);
    //     expect(myInitiateItems.length).to.be.equal(1)

    //     const offeredBoxes = await swapBoxContract.getOfferedSwapBoxes(swapItems[0].id);
    //     expect(offeredBoxes.length).to.be.equal(0)

    //     const waitingBoxes = await swapBoxContract.getWaitingSwapBoxes(swapItems[1].id);
    //     expect(waitingBoxes.length).to.be.equal(0)
    // });


    // it("SwapBox--Test", async () => {
    //     await nftContract.connect(account1).mintTo(account1.address);
    //     await nftContract.connect(account1).approve(swapBoxContract.address, 1); // NFT tokenid 1
    //     await ftContract.connect(account1).mint(account1.address, 100); // ERC20 100
    //     await ftContract.connect(account1).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account1).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [1]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     await nftContract.connect(account2).mintTo(account2.address);
    //     await nftContract.connect(account2).approve(swapBoxContract.address, 2); // NFT tokenid 1
    //     await ftContract.connect(account2).mint(account2.address, 100); // ERC20 100
    //     await ftContract.connect(account2).approve(swapBoxContract.address, 50);
    //     await swapBoxContract.connect(account2).createBox(
    //         [
    //             [
    //                 nftContract.address,
    //                 [2]
    //             ]
    //         ],
    //         [
    //             [ftContract.address],
    //             [50]
    //         ],
    //         {
    //             value: swapFee[0] // CreateBox Fee
    //         }
    //     );

    //     const swapItems = await swapBoxContract.getBoxesByState(State.Initiated);
    //     expect(swapItems.length).to.be.equal(2)

    //     await swapBoxContract.connect(account1).toWaitingForOffers(swapItems[0].id, {value: swapFee[1]});
    //     await swapBoxContract.connect(account2).toOffer(swapItems[1].id, {value: swapFee[2]});
    //     await swapBoxContract.connect(account2/*  */).linkBox(swapItems[0].id, swapItems[1].id);

    //     await swapBoxContract.connect(account1).swapBox(swapItems[0].id, swapItems[1].id);

    //     const myInitiateItems = await swapBoxContract.getOwnedSwapBoxes(account2.address, State.Initiated);
    //     expect(myInitiateItems.length).to.be.equal(1)

    //     const afterWwapItems = await swapBoxContract.getBoxesByState(State.Initiated);
    //     expect(afterWwapItems.length).to.be.equal(2)
    // });
});