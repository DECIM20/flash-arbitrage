
const express = require("express")
const fs = require("fs")
const app = express()
require("dotenv").config()

const port = process.env.PORT || 4000

const axios = require("axios")

const ethers = require("ethers");

//const { erc20ABI, factoryABI, pairABI, routerABI } = require("../utils/AbiList");

const ERC20ABI = require('@openzeppelin/contracts/build/contracts/ERC20.json');          
const { abi: QuoterABI,} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const IUniswapV2Router02 = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json');
const IUniswapV2Factory = require("@uniswap/v2-core/build/IUniswapV2Factory.json");

const IFlashLoanContractAbi = require("./artifacts/contracts/finalFlash.sol/PairFlash.json");
const FlashLoanContractAddress = "0x80dD4eB9DBAdb9AeFd3Cbe5d722c6312E18DDC33";



const provider = new ethers.providers.WebSocketProvider('wss://polygon-mainnet.g.alchemy.com/v2/zF-EZv66IP0tcXh9wNv4s6VmxSmW9RMN');

const QUOTER_ADDRESS_UNISWAPV3 = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
const SUSHISWAP_ROUTERV2_ADDRESS = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506" ;  // on polygon

const outputArray = [];

//const date = new Date();



const ADDRESS_FROM_MATIC_POLY_MAIN = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";    //wmatic
const ADDRESS_TO_USDC_POLY_MAIN    = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" ;   //usdc

 const getPrices = async (amountInFrontend) => {
   
    const signer = provider.getSigner();
    //console.log('signer',signer);
    
    const wallet = new ethers.Wallet("a996d14e65b0f4ebcd2d5aa619f80c9020cc24cfabc69a9c6eec348baea2a208");
    //console.log('wallet',wallet);

    const loanInitiator = wallet.connect(provider);

    //console.log('loanInitiatorADDRESSSSSSSS',loanInitiator.address);



    const FlashLoanContractInstance = new ethers.Contract(FlashLoanContractAddress, IFlashLoanContractAbi.abi, provider);

    //console.log('FlashLoanContractInstance',FlashLoanContractInstance);
    console.log("hi");

    provider.on('block', async (blockNumber) => {

        
       
  
  
      //////////////////////////////////////////////////////UNISWAP-V3///////////////////////////////////////////////////////////////
  
      const quoterContractUniV3Instance = new ethers.Contract( QUOTER_ADDRESS_UNISWAPV3,QuoterABI,provider);
    
     
          const contractToken = new ethers.Contract(ADDRESS_FROM_MATIC_POLY_MAIN, ERC20ABI.abi, provider);
  
  
          const decimals = await contractToken.decimals();
  
  
      const contractToken2 = new ethers.Contract(ADDRESS_TO_USDC_POLY_MAIN, ERC20ABI.abi, provider);
  
  
          const amountInUSDC = ethers.utils.parseUnits(amountInFrontend, 6);
          const amountInWMATIC = ethers.utils.parseUnits(amountInFrontend,18);
          //const amountInUSDCForInternalSwap = ethers.utils.parseUnits(amount, 6);


         //Buy USDC 
  
     const amountOutFrontendUNIV3_WMATIC_TO_USDC = await quoterContractUniV3Instance.callStatic.quoteExactInputSingle(                  
                   ADDRESS_FROM_MATIC_POLY_MAIN,
                   ADDRESS_TO_USDC_POLY_MAIN,
                   3000,
                   amountInWMATIC.toString(),
                   0
                  );
 
                     
      
        // Sell  USDC

        //const amountOutFrontendUNIV3_WMATIC_TO_USDC = (1/amountOutFrontendUNIV3_USDC_TO_WMATIC) ;
               

                  const amountOutFrontendUNIV3_USDC_TO_WMATIC = await quoterContractUniV3Instance.callStatic.quoteExactInputSingle(                  
                    ADDRESS_TO_USDC_POLY_MAIN,
                    ADDRESS_FROM_MATIC_POLY_MAIN,
                    3000,
                    amountInUSDC.toString(),
                    0
                   );
                
      


   // Output the amount
   let amount = ethers.utils.formatUnits(amountOutFrontendUNIV3_WMATIC_TO_USDC.toString(), 6);


    // ------------------------------------------------------SUSHISWAPV2 PRICE FETCH -------------------------------------------------------//
        
        // Connect to SUSHI Router
const contractRouterSUSHI = new ethers.Contract(SUSHISWAP_ROUTERV2_ADDRESS, IUniswapV2Router02.abi, provider);

const amountInsushi = ethers.utils.parseUnits(amountInFrontend, 18);  
const amountInsushi2Test = amount; 
const amountInsushi2TestRoundOff = Math.round(amount);  

const amountInsushi2 = ethers.utils.parseUnits(amountInsushi2TestRoundOff.toString(), 6);  


console.log('amountInsushi2Test' , amountInsushi2Test);
console.log('amountInsushi2TestRoundOff' , amountInsushi2TestRoundOff);


//const amountInsushi2 = ethers.utils.parseUnits(amountInFrontend, 6);  
// Get amounts out // Fetching DAI Amount 

// BUY USDC
const amountsOutSUSHI = await contractRouterSUSHI.getAmountsOut(amountInsushi, [
    ADDRESS_FROM_MATIC_POLY_MAIN,
    ADDRESS_TO_USDC_POLY_MAIN,
]);

   //SELL USDC

const amountsOutSUSHI2 = await contractRouterSUSHI.getAmountsOut(amountInsushi2, [
    ADDRESS_TO_USDC_POLY_MAIN,
    ADDRESS_FROM_MATIC_POLY_MAIN,
 
]);


//let amount1 = ethers.utils.formatUnits(amountsOutSUSHI2.toString(),18);





  //console.log('amountsOut' , amountsOutSUSHI.toString());

// Convert amount out - human readable
const amountOutFrontendSUSHI_WMATIC_IN_USDC = ethers.utils.formatUnits(amountsOutSUSHI[1].toString(),6);
//const amountOutFrontendSUSHI_USDC_IN_WMATIC = ethers.utils.formatUnits(amountsOutSUSHI[0].toString(),18);
const amountOutFrontendSUSHI_USDC_IN_WMATIC2 = ethers.utils.formatUnits(amountsOutSUSHI2[1].toString(),18);


// Log output

 //console.log('SUSHIV2-SELL-USDC', amountOutFrontendSUSHI_USDC_IN_WMATIC);

    const normalizeWMATICbuyprice =  ((parseFloat(amount) + parseFloat(amountOutFrontendSUSHI_WMATIC_IN_USDC))/2);

    const perunitMATICbuyprice =   normalizeWMATICbuyprice/amountInFrontend;

    //console.log('amountInWMATIC' , amountInWMATIC.toString());

    //console.log('normalizeWMATICbuyprice' , normalizeWMATICbuyprice);
    console.log('PER_UNIT_AVG_MATIC_BUY_PRICE_IN_USDC' , perunitMATICbuyprice);


        console.log('====================================================================');
        console.log('BUY-USDC_AGAINST_MATIC-ON-UNIV3 :', amount);                  // use this amount to feed into amount-in for sushiswap
        console.log('SELL-USDC_AGAINST_MATIC-ON-SUSHI (PRICE_IN_MATIC) :', amountOutFrontendSUSHI_USDC_IN_WMATIC2);
        console.log('SELL-USDC_AGAINST_MATIC-ON-SUSHI (PRICE_IN_USDC) :', amountOutFrontendSUSHI_USDC_IN_WMATIC2 * perunitMATICbuyprice);
        //console.log('Price Difference:', ( ((amountOutFrontendSUSHI_USDC_IN_WMATIC2 * perunitMATICbuyprice) + 5.02) - amount ));


        console.log('----------SCAN PRICE IN REVERSE DIRECTION------------------------');
        console.log('BUY-USDC_AGAINST_MATIC-ON-SUSHI: ', amountOutFrontendSUSHI_WMATIC_IN_USDC);
        console.log('SELL-USDC_AGAINST_MATIC-ON_UNIV3 (PRICE_IN_MATIC) :',amountOutFrontendSUSHI_USDC_IN_WMATIC2 );
        //console.log('SELL-USDC_AGAINST_MATIC-ON_UNIV3 (PRICE_IN_USDC) :',amount1* perunitMATICbuyprice );
        //console.log('Price Difference:', ( ((amount1* perunitMATICbuyprice) + 5.02) - amountOutFrontendSUSHI_WMATIC_IN_USDC ));

        console.log('====================================================================');
 
        let grossProfit =  amountOutFrontendSUSHI_USDC_IN_WMATIC2 - amountInFrontend ;
        //console.log('grossProfit',grossProfit);
        
        let netProfit = grossProfit - ((0.0005*amountInFrontend) + 0.05 );
        console.log('netProfit',netProfit);

        let arbitrageLog ;


        if (netProfit > 0) {
        
            console.log("----ARBITRAGE OPPERETUNITY FOUND------------");

            arbitrageInformationLog = "ARBITRAGE OPPERETUNITY FOUND";

            //console.log('arbitrageInformationLog' , arbitrageInformationLog);
        
          // Execute Flash Loan

            const flash_params = {
                token0: ADDRESS_FROM_MATIC_POLY_MAIN,
                token1: ADDRESS_TO_USDC_POLY_MAIN,
                fee1: 500, // flash from the 0.05% fee pool 
                amount0: ethers.utils.parseEther('amountInFrontend'), // flash borrow this much WMATIC  
                amount1: 0, // flash borrow 0 USDC
              };

              tx = await flash_contract.connect(loanInitiator).initFlash(flash_params);
              await tx.wait();
              console.log('tx' , tx);
            
              

        

        } else {
 
            console.log("----NO ARBITRAGE OPPERETUNITY FOUND------------");
            arbitrageInformationLog = "NO ARBITRAGE OPPERETUNITY FOUND";
           // console.log('arbitrageInformationLog' , arbitrageInformationLog);

        }



const obj = {
    BLOCKNUMBER: blockNumber,
    timestamp: Date.now(),
    pair: 'WMATIC-USDC',
    PERUNITMATICBUYPRICE:perunitMATICbuyprice,
    UNIV3BUYUSDC: amount,
    SUSHISELLUSDCINMATIC: amountOutFrontendSUSHI_USDC_IN_WMATIC2,
    SUSHISELLUSDCINUSDC: amountOutFrontendSUSHI_USDC_IN_WMATIC2 * perunitMATICbuyprice ,
    SUSHIBUYUSDC: amountOutFrontendSUSHI_WMATIC_IN_USDC,
    arbitrageInformationLog : arbitrageInformationLog
   // UNIV3SELLUSDCINMATIC: amount1,
    //UNIV3SELLUSDCINUSDC: amount1* perunitMATICbuyprice,
  };
  
  outputArray.push(obj);
   //https://www.convertsimple.com/convert-javascript-array-to-csv/

   console.log("Wrote to file");

    // const ONE_UNIT_MATIC_BUY_PRICE_IN_USDC_ON_UNIV3 =  ;
    // const ONE_UNIT_MATIC_BUY_PRICE_IN_USDC_ON_SUSHI =  ;



  });       

  };
  
  app.get("/", (req, res) => res.json(outputArray));
  
  app.listen(port, () => console.log("Listening On Port", port));

  const amountInFrontend = "1000";
  getPrices(amountInFrontend);

