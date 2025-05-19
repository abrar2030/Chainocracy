import { setMaxListeners } from 'events';
import BlockChain from '../../blockchain/blockchain';
import { Block } from '../../blockchain/data_types';

const axios = require('axios');
const LOCALHOST = 'http://localhost:';
const OFFSET = '/api/blockchain'; // Adjust the offset based on the way to structured the blockchain, for now It starts from api/blockchain
const NODE_ADDRESS = "?"; //Let's assume we already know comming from the higher level.

const dotenv = require("dotenv");
dotenv.config();

const express = require("express")
const router = express.Router()

const verifyJWTWeb = require('../../middleware/verifyJWTWeb');

// Error response helper function
const errorResponse = (res, status, message, details = null) => {
  const response = { 
    success: false, 
    message, 
    timestamp: new Date().toISOString()
  };
  
  if (details) {
    response.details = details;
  }
  
  return res.status(status).json(response);
};

// Success response helper function
const successResponse = (res, status, data, message = 'Operation successful') => {
  return res.status(status).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Async handler to catch errors in async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(`API Error: ${err.message}`, err);
    return errorResponse(res, 500, 'Internal server error', 
      process.env.NODE_ENV === 'development' ? err.message : null);
  });
};

module.exports = function (blockchain: BlockChain, allNodes) {

   // Input validation middleware
   const validateTransaction = (req, res, next) => {
     const { identifier, choiceCode } = req.body;
     
     if (!identifier) {
       return errorResponse(res, 400, 'Missing required field: identifier');
     }
     
     if (!choiceCode) {
       return errorResponse(res, 400, 'Missing required field: choiceCode');
     }
     
     if (isNaN(parseInt(choiceCode))) {
       return errorResponse(res, 400, 'Invalid choice code: must be a number');
     }
     
     next();
   };

   router.get('/', asyncHandler(async (req, res) => {
      return successResponse(res, 200, blockchain);
   }));

   router.get('/pending-transactions', asyncHandler(async (req, res) => {
      const pendingTransactions = blockchain.getPendingTransactions();
      return successResponse(res, 200, pendingTransactions);
   }));

   router.get('/transactions', asyncHandler(async (req, res) => {
      const transactions = blockchain.getTransactions();
      return successResponse(res, 200, transactions);
   }));

   router.get('/blocks', asyncHandler(async (req, res) => {
      const blocks = blockchain.getBlocks();
      return successResponse(res, 200, blocks);
   }));

   router.get('/block-detail/:id', asyncHandler(async (req, res) => {
      const blockHash = req.params.id;
      
      if (!blockHash) {
        return errorResponse(res, 400, 'Block hash is required');
      }
      
      const blockDetails = blockchain.getBlockDetails(blockHash);
      
      if (!blockDetails) {
        return errorResponse(res, 404, 'Block not found');
      }
      
      return successResponse(res, 200, blockDetails);
   }));

   router.get('/chain', asyncHandler(async (req, res) => {
      return successResponse(res, 200, blockchain);
   }));

   router.get('/get-results', verifyJWTWeb, asyncHandler(async (req, res) => {
      const results = await blockchain.smartContract.getResults();
      
      if (!results) {
        return errorResponse(res, 404, 'No results available');
      }
      
      return successResponse(res, 200, results);
   }));

   router.get('/get-results-computed', asyncHandler(async (req, res) => {
      const results = await blockchain.smartContract.getResultsComputed();
      
      if (!results) {
        return errorResponse(res, 404, 'No computed results available');
      }
      
      return successResponse(res, 200, results);
   }));

   setMaxListeners(15);

   const checkVote = (identifier: string, choiceCode: number): boolean => {
      if (!identifier || !choiceCode) return false;
      return true;
   }
   
   router.post('/transaction', validateTransaction, asyncHandler(async (req, res) => {
      const data = req.body;
      
      try {
         if (checkVote(data.identifier, parseInt(data.choiceCode))) {
            const electoralId: string = data.identifier;
            console.log("identifier: ", electoralId);
            
            const identifier = await blockchain.getCitizenRelatedIdentifier(electoralId);
            if (!identifier) {
               return errorResponse(res, 401, 'Invalid electoral identifier');
            }

            const choiceCode: number = parseInt(data.choiceCode);
            
            const choiceEncrypted = blockchain.encryptDataVoter(choiceCode.toString());
            const electoralIdEncrypted = blockchain.encryptDataIdentifier(electoralId.toString());
            const secret: string = data.secret || ''; // Add default value

            const ans = blockchain.addPendingTransaction(
               identifier, 
               electoralIdEncrypted.CIPHER_TEXT, 
               electoralIdEncrypted.IV, 
               choiceEncrypted.CIPHER_TEXT, 
               choiceEncrypted.IV, 
               secret
            );
            
            if (ans) {
               return successResponse(res, 201, ans, 'Transaction added successfully');
            } else {
               return errorResponse(res, 400, 'Transaction validation failed');
            }
         } else {
            return errorResponse(res, 400, 'Invalid vote data');
         }
      } catch (error) {
         console.error('Transaction error:', error);
         return errorResponse(res, 500, 'Failed to process transaction', 
            process.env.NODE_ENV === 'development' ? error.message : null);
      }
   }));

   router.post('/transaction/broadcast', validateTransaction, asyncHandler(async (req, res) => {
      const data = req.body;
      
      // Validate required fields
      if (!data.identifier || !data.electoralId || !data.electoralIdIV || 
          !data.choiceCode || !data.IV) {
         return errorResponse(res, 400, 'Missing required transaction fields');
      }
      
      const ans = blockchain.addPendingTransaction(
         data.identifier, 
         data.electoralId, 
         data.electoralIdIV, 
         data.choiceCode, 
         data.IV, 
         data.secret || ''
      );
      
      if (!ans) {
         return errorResponse(res, 400, 'Failed to add transaction');
      }

      try {
         await broadcastData('/receive-new-block', data, res);
         return successResponse(res, 200, ans, 'Transaction broadcasted successfully');
      } catch (error) {
         console.error('Broadcast error:', error);
         return errorResponse(res, 500, 'Transaction added but broadcast failed', 
            process.env.NODE_ENV === 'development' ? error.message : null);
      }
   }));

   router.get('/voters', asyncHandler(async (req, res) => {
      const voters = await blockchain.getSmartContractVoters();
      return successResponse(res, 200, { voters }, 'Voters retrieved successfully');
   }));

   router.get('/clear-voters', asyncHandler(async (req, res) => {
      await blockchain.smartContract.eraseVoters();
      const voters = await blockchain.smartContract.getVoters();
      return successResponse(res, 200, { voters }, 'Voters cleared successfully');
   }));

   router.get('/clear-results', asyncHandler(async (req, res) => {
      await blockchain.smartContract.eraseResults();
      return successResponse(res, 200, null, 'Results cleared successfully');
   }));

   router.get('/clear-chains', asyncHandler(async (req, res) => {
      const result = await blockchain.clearChainsFromStorage();
      return successResponse(res, 200, { result }, 'Chains cleared successfully');
   }));

   router.get('/candidates', asyncHandler(async (req, res) => {
      const candidates = await blockchain.getSmartContractCandidates();
      return successResponse(res, 200, { candidates }, 'Candidates retrieved successfully');
   }));

   router.get('/deploy-voters', asyncHandler(async (req, res) => {
      const ans = await blockchain.deployVoters();
      
      if (ans !== null) {
         const votersDeployed = await blockchain.getSmartContractVoters();
         return successResponse(res, 200, { voters: votersDeployed }, 'Voters deployed successfully');
      } else {
         return errorResponse(res, 400, 'Failed to deploy voters');
      }
   }));

   router.get('/deploy-candidates', asyncHandler(async (req, res) => {
      const ans = await blockchain.deployCandidatesBlockchain();
      
      if (ans !== null) {
         const candidatesDeployed = await blockchain.getSmartContractCandidates();
         return successResponse(res, 200, { candidates: candidatesDeployed }, 'Candidates deployed successfully');
      } else {
         return errorResponse(res, 400, 'Failed to deploy candidates');
      }
   }));

   router.post('/receive-new-block', asyncHandler(async (req, res) => {
      const block = req.body;
      
      // Validate block data
      if (!block || !block.hash) {
         return errorResponse(res, 400, 'Invalid block data');
      }
      
      const ans: boolean = blockchain.addBlock(block);

      try {
         await runConsensus(res);
         
         if (ans) {
            return successResponse(res, 200, { block }, 'Block accepted and added to chain');
         } else {
            return errorResponse(res, 400, 'Block rejected', { block });
         }
      } catch (error) {
         console.error('Consensus error:', error);
         return errorResponse(res, 500, 'Error during consensus process', 
            process.env.NODE_ENV === 'development' ? error.message : null);
      }
   }));

   const broadcastData = async (endpoint, data, res) => {
      try {
         const requests = allNodes
            .filter(url => url !== NODE_ADDRESS)
            .map(url => {
               const URI = LOCALHOST + url + OFFSET + endpoint;
               return axios.post(URI, data);
            });

         const responses = await Promise.all(requests);
         
         const allResp = [];
         responses.forEach(x => {
            allResp.push(x.data);
         });
         
         return allResp;
      } catch (error) {
         console.error('Broadcast error:', error);
         // Don't throw, just log the error and continue
      }
   };

   router.get('/mine', asyncHandler(async (req, res) => {
      const block: Block = blockchain.mineBlock();
      
      if (!block) {
         return errorResponse(res, 500, 'Mining failed');
      }
      
      try {
         await broadcastData('/receive-new-block', block, res);
         return successResponse(res, 200, { block }, 'New block mined successfully');
      } catch (error) {
         console.error('Mining broadcast error:', error);
         return errorResponse(res, 500, 'Block mined but broadcast failed', 
            process.env.NODE_ENV === 'development' ? error.message : null);
      }
   }));

   router.post('/synchronize-chain', asyncHandler(async (req, res) => {
      const data = req.body;
      
      if (!data.chain) {
         return errorResponse(res, 400, 'Missing chain data');
      }

      const chain: Block[] = data.chain;
      const ans = blockchain.replaceChain(chain);

      if (ans) {
         return successResponse(res, 200, null, 'Chain synchronized successfully');
      } else {
         return errorResponse(res, 400, 'Failed to synchronize chain');
      }
   }));

   const runConsensus = async (res) => {
      try {
         // Here we apply the longest chain rule.
         const requests = allNodes
            .filter(url => url !== NODE_ADDRESS)
            .map(url => {
               const URI = LOCALHOST + url + OFFSET;
               return axios.get(URI);
            });

         const responses = await Promise.all(requests);
         
         let blockchains: BlockChain[] = [blockchain];
         responses.forEach(element => {
            blockchains.push(element.data);
         });

         const longestBlockchain = blockchains.reduce((prev: BlockChain, cur: BlockChain) => {
            const condition = cur.getLengthChain >= prev.getLengthChain;
            return condition ? cur : prev;
         }, new BlockChain());

         await broadcastData('/synchronize-chain', longestBlockchain, res);
         return longestBlockchain;
      } catch (error) {
         console.error('Consensus error:', error);
         // Don't throw, just log the error and continue
      }
   };

   return router;
}
