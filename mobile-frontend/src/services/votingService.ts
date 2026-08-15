/**
 * Voting Service
 * Handles all voting-related API calls
 */

import axios from "../api/axios";
import { Config } from "../constants/config";

export interface VotingStatusResponse {
  hasVoted: boolean;
  voteTimestamp?: string;
  transactionHash?: string;
  message?: string;
}

export interface VoteSubmissionData {
  candidateCode: number;
  electoralId: string;
  timestamp: string;
}

export interface VoteSubmissionResponse {
  success: boolean;
  transactionHash?: string;
  message?: string;
}

/**
 * Check if a user has already voted
 * @param electoralId - The voter's electoral ID
 * @param port - The province-specific port
 * @returns Promise with voting status
 */
export async function checkHasVoted(
  electoralId: string,
  port: string,
): Promise<VotingStatusResponse> {
  try {
    const baseUrl = Config.API_BASE_URL.replace(/:\d+$/, "");
    const votingStatusUrl = `${baseUrl}:${port}/api/blockchain/voting-status`;

    const response = await axios.get(votingStatusUrl, {
      params: { electoralId },
    });
    const body = response.data.data;

    return {
      hasVoted: body.hasVoted || false,
      voteTimestamp: body.voteTimestamp,
      transactionHash: body.transactionHash,
      message: body.message,
    };
  } catch (error: any) {
    if (Config.APP.SHOW_LOGS) {
      console.error("Error checking voting status:", error);
    }

    // If endpoint doesn't exist (404), assume user hasn't voted
    if (error.response?.status === 404) {
      return { hasVoted: false };
    }

    throw error;
  }
}

/**
 * Submit a vote to the blockchain
 * @param voteData - Vote submission data
 * @param port - The province-specific port
 * @returns Promise with submission result
 */
export async function submitVote(
  voteData: VoteSubmissionData,
  port: string,
): Promise<VoteSubmissionResponse> {
  try {
    const baseUrl = Config.API_BASE_URL.replace(/:\d+$/, "");
    const blockchainUrl = `${baseUrl}:${port}/api/blockchain/transaction`;

    if (Config.APP.SHOW_LOGS) {
      console.log("Submitting vote to:", blockchainUrl);
    }

    const response = await axios.post(blockchainUrl, {
      identifier: voteData.electoralId,
      choiceCode: voteData.candidateCode,
    });
    const body = response.data.data;

    return {
      success: true,
      transactionHash: body?.transactionHash,
      message: response.data.message || "Vote recorded successfully",
    };
  } catch (error: any) {
    if (Config.APP.SHOW_LOGS) {
      console.error("Error submitting vote:", error);
    }

    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to submit vote. Please try again.",
    };
  }
}

/**
 * Verify OTP and place vote
 * @param otpData - OTP verification data
 * @returns Promise with verification result
 */
export async function verifyOTPAndVote(otpData: {
  email: string;
  token: string;
  otpCode: string;
  candidateCode: number;
  electoralId: string;
  port: string;
}): Promise<{
  success: boolean;
  transactionHash?: string;
  message?: string;
}> {
  try {
    // First verify OTP
    const otpResponse = await axios.post(Config.ENDPOINTS.VERIFY_OTP, {
      email: otpData.email,
      token: otpData.token,
      otpCode: otpData.otpCode,
    });

    if (otpResponse.status !== 200) {
      throw new Error("OTP verification failed");
    }

    // Then submit vote
    const voteResult = await submitVote(
      {
        candidateCode: otpData.candidateCode,
        electoralId: otpData.electoralId,
        timestamp: new Date().toISOString(),
      },
      otpData.port,
    );

    return voteResult;
  } catch (error: any) {
    if (Config.APP.SHOW_LOGS) {
      console.error("Error in verifyOTPAndVote:", error);
    }

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to verify OTP and submit vote",
    };
  }
}
