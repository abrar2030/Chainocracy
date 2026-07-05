import assert from "node:assert";
import sha256 from "crypto-js/sha256";
import CryptoBlockchain from "../crypto/cryptoBlockchain";
import {
  clearChains,
  deployCandidates,
  deployVotersGenerated,
  readChain,
  readVoterCitizenRelation,
  updateVoter,
  writeChain,
} from "../leveldb";
import SmartContract from "../smart_contract/smart_contract";
import type { Block, BlockHeader, Transaction, Voter } from "./data_types";

let _CryptoBlockIdentifier: CryptoBlockchain | null = null;
let _CryptoBlockVote: CryptoBlockchain | null = null;

const getCryptoBlockIdentifier = () => {
  if (!_CryptoBlockIdentifier) {
    _CryptoBlockIdentifier = new CryptoBlockchain(
      process.env.SECRET_KEY_IDENTIFIER,
      process.env.SECRET_IV_IDENTIFIER,
    );
  }
  return _CryptoBlockIdentifier;
};

const getCryptoBlockVote = () => {
  if (!_CryptoBlockVote) {
    _CryptoBlockVote = new CryptoBlockchain(
      process.env.SECRET_KEY_VOTES,
      process.env.SECRET_IV_VOTES,
    );
  }
  return _CryptoBlockVote;
};

class BlockChain {
  chain: Block[];
  transactionPool: Transaction[];
  smartContract!: SmartContract;
  nodeAddress!: string;

  constructor() {
    this.chain = [this.getGenesisBlock()];
    this.transactionPool = [];
    try {
      this.smartContract = new SmartContract();
    } catch (e: unknown) {
      console.error("Error initializing smart contract:", e);
    }
  }

  public async setNodeAddress(nodeAddress: string): Promise<void> {
    this.nodeAddress = nodeAddress;
    await this.loadChain();
  }

  public async loadChain() {
    try {
      const chain = await readChain();
      if (Array.isArray(chain) && chain.length > 0) this.chain = chain;
    } catch (e: unknown) {
      console.error("Error loading chain:", e);
    }
  }

  public async clearChainsFromStorage() {
    try {
      await clearChains();
      this.chain = [this.getGenesisBlock()];
      this.transactionPool = [];
      try {
        this.smartContract = new SmartContract();
      } catch (e: unknown) {
        console.error("Error initializing smart contract:", e);
      }
    } catch (error: unknown) {
      console.error("Error clearing chains:", error);
    }
    return [];
  }

  public saveChain(): void {
    // Handle both synchronous throws and async rejections from writeChain
    try {
      writeChain(this.chain).catch((e: unknown) =>
        console.error("Error saving chain:", e),
      );
    } catch (e: unknown) {
      console.error("Error saving chain:", e);
    }
  }

  public getGenesisBlock(): Block {
    return this.createGenesisBlock();
  }
  public getChain(): Block[] {
    return this.chain;
  }
  public getLengthChain(): number {
    return this.chain.length;
  }

  public replaceChain(chain: Block[]): boolean {
    if (chain.length > this.chain.length && this.isValidChain(chain)) {
      this.chain = chain;
      this.saveChain();
      return true;
    }
    return false;
  }

  public addBlock(block: Block): boolean {
    try {
      if (this.isValidBlock(block)) {
        this.chain.push(block);
        Promise.all(
          block.transactions.map((x) => updateVoter(x.data.identifier, x.data)),
        ).catch((e: unknown) =>
          console.error("Error updating voters after block add:", e),
        );
        this.transactionPool = [];
        this.smartContract.update();
        this.saveChain();
        return true;
      }
    } catch (e: unknown) {
      console.error("Error adding block:", e);
    }
    return false;
  }

  private getLastBlock(): Block | null {
    const lastIndex = this.chain.length - 1;
    if (lastIndex < 0) return null;
    return this.chain[lastIndex];
  }

  private isBlockLast(block: Block): boolean {
    const lastBlock = this.getLastBlock();
    if (!lastBlock) return false;
    return (
      lastBlock.blockHeader.blockHash === block.blockHeader.previousBlockHash &&
      lastBlock.blockIndex + 1 === block.blockIndex
    );
  }

  public isValidBlock(block: Block): boolean {
    if (!block) return false;
    if (!this.isBlockLast(block)) return false;
    if (!this.isSHA256(block.blockHeader.blockHash)) return false;
    if (!this.isValidTimestampDifference(block.blockHeader.timestamp))
      return false;
    if (!this.isValidTransactionPool(block.transactions)) return false;
    return true;
  }

  public addPendingTransaction(
    identifier: string,
    electoralId: string,
    electoralIdIV: string,
    choiceCode: string,
    choiceCodeIV: string,
    secret: string,
  ): Transaction | null {
    if (!this.smartContract || !this.smartContract.isValidElectionTime())
      return null;

    const transaction = this.createTransaction(
      identifier,
      electoralId,
      electoralIdIV,
      choiceCode,
      choiceCodeIV,
      secret,
    );
    if (this.isValidTransaction(transaction)) {
      this.transactionPool.push(transaction);
      return transaction;
    }
    return null;
  }

  public hashBlock(
    previousBlockHash: string,
    merkleRoot: string,
    nonce: number,
  ): string {
    return this.hashData(`${previousBlockHash + merkleRoot}${nonce}`);
  }

  public createBlock(
    _hash: string,
    previousBlockHash: string,
    nonce: number,
  ): Block {
    const merkleRoot = this.createMarkle(this.transactionPool) || "-";
    const blockHeader: BlockHeader = {
      version: "1",
      blockHash: "",
      previousBlockHash: this.getLastBlock()?.blockHeader.blockHash || "-",
      merkleRoot,
      timestamp: Date.now(),
      difficultyTarget: -1,
      nonce,
    };
    blockHeader.blockHash = this.hashBlock(
      previousBlockHash,
      merkleRoot,
      nonce,
    );

    return {
      blockIndex: this.chain.length,
      blockSize: 285,
      blockHeader,
      transactionCounter: this.transactionPool.length,
      transactions: [...this.transactionPool],
    };
  }

  private createGenesisBlock(): Block {
    const blockHeader: BlockHeader = {
      version: "1",
      blockHash: "-",
      previousBlockHash: "-",
      merkleRoot: "-",
      timestamp: new Date("2022-09-03").getTime(),
      difficultyTarget: 1234,
      nonce: 1234,
    };

    const genesisBlock: Block = {
      blockIndex: 0,
      blockSize: 285,
      blockHeader,
      transactionCounter: 2,
      transactions: [
        this.createTransaction("00000", "00000", "-", "-", "-", "-"),
        this.createTransaction("20000", "00000", "-", "-", "-", "-"),
      ],
    };

    blockHeader.blockHash = this.hashBlock("-", blockHeader.merkleRoot, 1234);

    for (let i = 0; i < genesisBlock.transactionCounter; i++) {
      genesisBlock.transactions[i].data.voteTime = blockHeader.timestamp;
    }

    genesisBlock.blockHeader.merkleRoot =
      this.createMarkle(genesisBlock.transactions) || "-";

    return genesisBlock;
  }

  public async getSmartContractVoters() {
    try {
      return await this.smartContract.getVoters();
    } catch (e: unknown) {
      console.error("Error getting smart contract voters:", e);
      return null;
    }
  }

  public async getSmartContractCandidates() {
    try {
      return await this.smartContract.getCandidates();
    } catch (e: unknown) {
      console.error("Error getting smart contract candidates:", e);
      return null;
    }
  }

  public async deployVoters() {
    try {
      const ans = await deployVotersGenerated();
      try {
        this.smartContract = new SmartContract();
      } catch (e: unknown) {
        console.error("Error initializing smart contract:", e);
      }
      return ans;
    } catch (e: unknown) {
      console.error("Error deploying voters:", e);
      return null;
    }
  }

  public async deployCandidatesBlockchain() {
    try {
      return await deployCandidates();
    } catch (e: unknown) {
      console.error("Error deploying candidates:", e);
      return null;
    }
  }

  public encryptDataIdentifier(data: string) {
    return getCryptoBlockIdentifier().encryptData(data);
  }
  public encryptDataVoter(data: string) {
    return getCryptoBlockVote().encryptData(data);
  }
  public decryptDataIdentifier(data: any) {
    return getCryptoBlockIdentifier().decryptData(data);
  }
  public decryptDataVoter(data: any) {
    return getCryptoBlockVote().decryptData(data);
  }

  private createTransaction(
    identifier: string,
    electoralId: string,
    electoralIdIV: string,
    choiceCode: string,
    choiceCodeIV: string,
    secret: string,
  ): Transaction {
    const vote: Voter = {
      identifier,
      electoralId,
      electoralIV: electoralIdIV,
      choiceCode,
      state: true,
      secret,
      voteTime: Date.now(),
      IV: choiceCodeIV,
    };
    const transactionHash = this.hashData(
      `${vote.identifier}${vote.choiceCode}${vote.state}`,
    );
    return { data: vote, transactionHash };
  }

  public hashData(data: string): string {
    return sha256(data).toString();
  }

  private areObjectsEqual(obj1: Block, obj2: Block): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  public isValidChain(chain: Block[]): boolean {
    if (!chain || chain.length === 0) return false;
    if (!this.areObjectsEqual(chain[0], this.getGenesisBlock())) return false;

    for (let i = 1; i < chain.length; i++) {
      const prev = chain[i - 1];
      const cur = chain[i];
      if (prev.blockIndex + 1 !== cur.blockIndex) return false;
      if (prev.blockHeader.blockHash !== cur.blockHeader.previousBlockHash)
        return false;
      const blockHash = this.hashBlock(
        prev.blockHeader.blockHash,
        cur.blockHeader.merkleRoot,
        cur.blockHeader.nonce,
      );
      if (blockHash !== cur.blockHeader.blockHash) return false;
    }
    return true;
  }

  public proofOfIdentity() {}
  public proofOfImportance() {}

  public mineBlock(): Block | null {
    const DIFFICULTY_TARGET = 4;
    const lastHashBlock = this.getLastBlock()?.blockHeader.blockHash || "-";

    if (!this.isValidTransactionPool(this.transactionPool)) return null;

    const merkleRoot = this.createMarkle(this.transactionPool) || "-";
    const nonce = this.proofOfWork(
      lastHashBlock,
      merkleRoot,
      DIFFICULTY_TARGET,
    );
    return this.createBlock(
      this.hashBlock(lastHashBlock, merkleRoot, nonce),
      lastHashBlock,
      nonce,
    );
  }

  public isSHA256(str: string): boolean {
    return /^[0-9a-fA-F]{64}$/.test(str);
  }

  public isValidVote(vote: Voter): boolean {
    const length = vote.identifier.length;
    if (length <= 5 || length >= 50) return false;
    if (vote.choiceCode.length === 0) return false;
    if (vote.secret.length === 0) return false;
    return true;
  }

  public isValidTransactionPool(transactions: Transaction[]): boolean {
    if (!transactions || transactions.length === 0) return false;
    return transactions.map((x) => this.isValidTransaction(x)).every(Boolean);
  }

  public isValidTransaction(transaction: Transaction): boolean {
    if (!transaction) return false;
    if (this.isPresentedInChain(transaction)) return false;
    if (
      !this.isSHA256(transaction.transactionHash) ||
      !this.isValidVote(transaction.data)
    )
      return false;
    return true;
  }

  private isPresentedInChain(transaction: Transaction): boolean {
    return (
      this.getTransactions().findIndex(
        (x) =>
          x.transactionHash === transaction.transactionHash ||
          x.identifier === transaction.data.identifier,
      ) >= 0
    );
  }

  private isValidTimestampDifference(timestamp: number): boolean {
    return timestamp <= Date.now() + 2 * 60 * 60 * 1000;
  }

  public proofOfWork(
    previousBlockHash: string,
    merkleRoot: string,
    difficultyTarget: number,
  ): number {
    let nonce = 0;
    const prefix = "0".repeat(difficultyTarget);
    while (true) {
      const hash = this.hashBlock(previousBlockHash, merkleRoot, nonce);
      if (hash.substring(0, difficultyTarget) === prefix) break;
      nonce++;
    }
    return nonce;
  }

  private createMarkle(transactions: Transaction[]): string | null {
    let hashList = transactions.map((x) => x.transactionHash);
    if (hashList.length === 0) return null;
    if (hashList.length === 1) return hashList[0];

    while (hashList.length > 1) {
      if (hashList.length % 2 !== 0)
        hashList.push(hashList[hashList.length - 1]);
      assert(hashList.length % 2 === 0);

      const newHashList: string[] = [];
      for (let i = 0; i < hashList.length; i += 2) {
        newHashList.push(this.hashData(`${hashList[i]}${hashList[i + 1]}`));
      }
      hashList = newHashList;
    }
    return hashList[0];
  }

  public getPendingTransactions() {
    return this.transactionPool.map((x, i) => ({
      id: i + 1,
      transactionHash: x.transactionHash,
      identifier: x.data.identifier,
      choiceCode: x.data.choiceCode,
      voteTime: x.data.voteTime,
    }));
  }

  public getTransactions() {
    return this.chain
      .flatMap((b) => b.transactions)
      .map((x, i) => ({
        id: i + 1,
        transactionHash: x.transactionHash,
        identifier: x.data.identifier,
        choiceCode: x.data.choiceCode,
        voteTime: x.data.voteTime,
      }));
  }

  public getBlocks() {
    return this.chain.map((x, i) => ({
      id: i + 1,
      hashBlock: x.blockHeader.blockHash,
      nonce: x.blockHeader.nonce,
      numOfTransactions: x.transactionCounter,
      dateAndTime: x.blockHeader.timestamp,
      size: x.blockSize,
    }));
  }

  public getBlockDetails(blockHash: string): Block | undefined {
    return this.chain.find((x) => x.blockHeader.blockHash === blockHash);
  }

  public async getCitizenRelatedIdentifier(
    electoralId: string,
  ): Promise<string | null> {
    try {
      return await readVoterCitizenRelation(electoralId);
    } catch (e: unknown) {
      console.error("Error getting citizen identifier:", e);
      return null;
    }
  }

  toString(): string {
    return `Blockchain: ${this.chain}\nPendingTransaction: ${this.transactionPool}`;
  }
}

export default BlockChain;
