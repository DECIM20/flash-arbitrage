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



const provider = new ethers.providers.WebSocketProvider('wss://polygon-mainnet.g.alchemy.com/v2/zF-EZv66IP0tcXh9wNv4s6VmxSmW9RMN');

const QUOTER_ADDRESS_UNISWAPV3 = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
const SUSHISWAP_ROUTERV2_ADDRESS = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506" ;  // on polygon

const outputArray = [];

//const date = new Date();



const ADDRESS_FROM_MATIC_POLY_MAIN = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";    //wmatic
const ADDRESS_TO_USDC_POLY_MAIN    = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" ;   //usdc
const getPrices = async (amountInFrontend) => {
   
    let SNo = 0;

    provider.on('block', async (blockNumber) => {
 
  
  
      //////////////////////////////////////////////////////UNISWAP-V3///////////////////////////////////////////////////////////////
  
      const quoterContractUniV3Instance = new ethers.Contract( QUOTER_ADDRESS_UNISWAPV3,QuoterABI,provider);
    
     
          const contractToken = new ethers.Contract(ADDRESS_FROM_MATIC_POLY_MAIN, ERC20ABI.abi, provider);
  
  
          const decimals = await contractToken.decimals();
  
  
      const contractToken2 = new ethers.Contract(ADDRESS_TO_USDC_POLY_MAIN, ERC20ABI.abi, provider);
  
  
          const amountInUSDC = ethers.utils.parseUnits(amountInFrontend, 6);
          const amountInWMATIC = ethers.utils.parseUnits(amountInFrontend,18);


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
         let amount1 = ethers.utils.formatUnits(amountOutFrontendUNIV3_USDC_TO_WMATIC.toString(),18);





          
        // console.log('UNI-V3-BUY-USDC', amount);
        // console.log('UNI-V3-SELL-USDC',amount1 );
        //console.log('UNI-V3 -SELL :10,000 - WMATIC-TO-USDC - POLYGON-MAINNET', amountOutFrontendUNIV3_WMATIC_TO_USDC);
         
         //console.table([amount , amount1]);


         const univ3price = [
            ['UNI-V3 -BUY :10,000 - WMATIC-FROM-USDC - POLYGON-MAINNET', amount],
            ['UNI-V3 -SELL :10,000 - WMATIC-TO-USDC - POLYGON-MAINNET', amount1]
          ];
          //console.table(univ3price);




         let univ3amount = amount;

        //  return amount; 
    // ------------------------------------------------------SUSHISWAPV2 PRICE FETCH -------------------------------------------------------//
        
        // Connect to SUSHI Router
const contractRouterSUSHI = new ethers.Contract(SUSHISWAP_ROUTERV2_ADDRESS, IUniswapV2Router02.abi, provider);

const amountInsushi = ethers.utils.parseUnits(amountInFrontend, 18);  
const amountInsushi2 = ethers.utils.parseUnits(amountInFrontend, 6);  
// Get amounts out // Fetching DAI Amount 

// BUY USDC
const amountsOutSUSHI = await contractRouterSUSHI.getAmountsOut(amountInsushi, [
    ADDRESS_FROM_MATIC_POLY_MAIN,
    ADDRESS_TO_USDC_POLY_MAIN,
]);

const amountsOutSUSHI2 = await contractRouterSUSHI.getAmountsOut(amountInsushi2, [
    ADDRESS_TO_USDC_POLY_MAIN,
    ADDRESS_FROM_MATIC_POLY_MAIN,
 
]);



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
        console.log('BUY-USDC_AGAINST_MATIC-ON-UNIV3 :', amount);
        console.log('SELL-USDC_AGAINST_MATIC-ON-SUSHI (PRICE_IN_MATIC) :', amountOutFrontendSUSHI_USDC_IN_WMATIC2);
        console.log('SELL-USDC_AGAINST_MATIC-ON-SUSHI (PRICE_IN_USDC) :', amountOutFrontendSUSHI_USDC_IN_WMATIC2 * perunitMATICbuyprice);
        //console.log('Price Difference:', ( ((amountOutFrontendSUSHI_USDC_IN_WMATIC2 * perunitMATICbuyprice) + 5.02) - amount ));


        console.log('----------SCAN PRICE IN REVERSE DIRECTION------------------------');
        console.log('BUY-USDC_AGAINST_MATIC-ON-SUSHI: ', amountOutFrontendSUSHI_WMATIC_IN_USDC);
        console.log('SELL-USDC_AGAINST_MATIC-ON_UNIV3 (PRICE_IN_MATIC) :',amount1 );
        console.log('SELL-USDC_AGAINST_MATIC-ON_UNIV3 (PRICE_IN_USDC) :',amount1* perunitMATICbuyprice );
        //console.log('Price Difference:', ( ((amount1* perunitMATICbuyprice) + 5.02) - amountOutFrontendSUSHI_WMATIC_IN_USDC ));

        console.log('====================================================================');



// const sushiV2price = [
//     ['SUSHI - BUY : 10000-WMATIC-FROM-USDC-MATIC-MAINNET', amountOutFrontendSUSHI_WMATIC_IN_USDC],
//     ['SUSHI - SELL: 10000-WMATIC-TO-USDC-MATIC-MAINNET', amountOutFrontendSUSHI_USDC_IN_WMATIC]
//   ];
  //console.table(sushiV2price);


const obj = {
    BLOCKNUMBER: blockNumber,
    timestamp: Date.now(),
    pair: 'WMATIC-USDC',
    PERUNITMATICBUYPRICE:perunitMATICbuyprice,
    UNIV3BUYUSDC: amount,
    SUSHISELLUSDCINMATIC: amountOutFrontendSUSHI_USDC_IN_WMATIC2,
    SUSHISELLUSDCINUSDC: amountOutFrontendSUSHI_USDC_IN_WMATIC2 * perunitMATICbuyprice ,
    SUSHIBUYUSDC: amountOutFrontendSUSHI_WMATIC_IN_USDC,
    UNIV3SELLUSDCINMATIC: amount1,
    UNIV3SELLUSDCINUSDC: amount1* perunitMATICbuyprice,
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

  const amountInFrontend = "100";
  getPrices(amountInFrontend);

