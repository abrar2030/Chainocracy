import { CandidateItem } from "@components/CandidateItem";
import { NumberItem } from "@components/NumberItem";
import { PinItem } from "@components/PinItem";
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import { CaretLeft } from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "src/api/axios";
import { useAuth } from "src/context/AuthContext";
import { Config } from "../../constants/config";

const TRANSACTION_URL = "/blockchain/transaction";
const VERIFY_OTP_URL = Config.ENDPOINTS.VERIFY_OTP;
const TOKEN_KEY = Config.STORAGE_KEYS.JWT_TOKEN;

const writeFile = async (token: string) => {
  try {
    const fileUri = `${FileSystem.documentDirectory}certificate.cert`;
    await FileSystem.writeAsStringAsync(fileUri, token);
    if (Config.APP.SHOW_LOGS) {
      console.log("Certificate written to:", fileUri);
    }
  } catch (error) {
    if (Config.APP.SHOW_LOGS) {
      console.error("Error writing certificate file:", error);
    }
  }
};

interface TwoFactorProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
  route: {
    params?: {
      id: string;
      name: string;
      party: string;
      acronym: string;
      photo: string;
      src: string;
      isFactor: boolean;
    };
  };
}

export function TwoFactor({ navigation, route }: TwoFactorProps) {
  const { id, name, party, acronym, photo, src } = route.params || {};

  const numColumns = 6;
  const [candidates] = useState([
    {
      name: name || "Unknown",
      party: party || "Independent",
      photo: photo || "",
      acronym: acronym || "",
      src: src || "",
      key: id || "0",
    },
  ]);

  const [numCodes, setNumCodes] = useState([11, 12, 13, 14, 15, 16]);

  const [numbers] = useState([
    { number: "1", key: "1" },
    { number: "2", key: "2" },
    { number: "3", key: "3" },
    { number: "4", key: "4" },
    { number: "5", key: "5" },
    { number: "6", key: "6" },
    { number: "7", key: "7" },
    { number: "8", key: "8" },
    { number: "9", key: "9" },
    { number: " ", key: "10" },
    { number: "0", key: "11" },
    { number: "del", key: "12" },
  ]);

  const [xTexts, setXtexts] = useState<string[]>(["X"]);
  const [selected, setSelected] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { authState, onLogOut } = useAuth();

  useEffect(() => {
    if (!authState?.authenticated || !authState?.electoralId) {
      Alert.alert("Authentication Required", "Please log in to continue.", [
        { text: "OK", onPress: () => onLogOut?.() },
      ]);
      navigation.navigate("Login");
    }
  }, [authState?.authenticated, authState?.electoralId]);

  const onPressBack = () => {
    navigation.navigate("Candidates");
  };

  const openThankYou = async (transactionHash: string) => {
    const token = authState?.token || "";
    await writeFile(token);
    navigation.navigate("Thank Vote", { data: transactionHash });
  };

  const placeVote = async (): Promise<string> => {
    try {
      const port = authState?.port || "3010";
      const baseUrl = Config.API_BASE_URL.replace(/:\d+$/, "");
      const blockchainUrl = `${baseUrl}:${port}/api${TRANSACTION_URL}`;

      if (Config.APP.SHOW_LOGS) {
        console.log("Placing vote at:", blockchainUrl);
      }

      const body = {
        identifier: authState?.electoralId,
        choiceCode: parseInt(id ?? "0", 10) + 1,
        secret: authState?.token,
      };

      const response = await axios.post(blockchainUrl, body);
      const statusCode = response.status;

      if (statusCode === 200 || statusCode === 201) {
        return response.data.data?.transactionHash || "";
      }

      throw new Error("Failed to record vote on blockchain");
    } catch (error: any) {
      if (Config.APP.SHOW_LOGS) {
        console.error("Error placing vote:", error);
      }
      throw error;
    }
  };

  const resetValues = () => {
    setOtpCode("");
    setXtexts(["X"]);
    setSelected(0);
  };

  const verifyToken = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (!axios.defaults.headers.common.Authorization) {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          axios.defaults.headers.common.Authorization = `Bearer ${token}`;
          axios.defaults.headers.common.Cookie = `jwt=${token}`;
        }
      }

      const body = {
        email: authState?.email,
        token: authState?.token,
        otpCode: otpCode,
      };

      if (Config.APP.SHOW_LOGS) {
        console.log("Verifying OTP at:", VERIFY_OTP_URL);
      }

      const response = await axios.post(VERIFY_OTP_URL, body);

      if (response.status === 200) {
        const transactionHash = await placeVote();

        if (transactionHash && transactionHash.length > 0) {
          if (Config.APP.SHOW_LOGS) {
            console.log(
              "Vote recorded with transaction hash:",
              transactionHash,
            );
          }
          openThankYou(transactionHash);
        } else {
          throw new Error("Failed to get transaction hash");
        }
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (error: any) {
      if (Config.APP.SHOW_LOGS) {
        console.error("Error in verifyToken:", error);
      }

      Alert.alert(
        "Verification Failed",
        error.response?.data?.message ||
          error.message ||
          "Failed to verify OTP and record vote. Please try again.",
        [{ text: "OK", onPress: onPressBack }],
      );
    } finally {
      setIsProcessing(false);
      resetValues();
    }
  }, [isProcessing, otpCode, authState]);

  useEffect(() => {
    if (otpCode.length === 6 && !isProcessing) {
      setIsRefreshing(true);
      verifyToken();
    }
  }, [otpCode]);

  return (
    <View style={styles.container}>
      <View style={styles.containerHeader}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onPressBack} disabled={isProcessing}>
            <CaretLeft size={32} color={isProcessing ? "#999" : "#000"} />
          </TouchableOpacity>
        </View>

        <View style={styles.topTitle}>
          <Text style={styles.textFactor}>Two-Factor Authentication</Text>
        </View>
      </View>

      <View style={styles.containerVerification}>
        <Text style={styles.textVerification}>TOTP Verification Code</Text>
        <Text style={styles.textInstructions}>
          Please enter the 6-digit code from your authenticator app.
        </Text>
        <Text style={styles.textWarning}>The code expires in 30 seconds.</Text>

        <View style={styles.containerCode}>
          <FlatList
            data={numCodes}
            renderItem={({ item }) => <NumberItem number={item} />}
            keyExtractor={(item) => item.toString()}
            extraData={numCodes}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
            numColumns={numColumns}
            refreshing={isRefreshing}
          />
        </View>
      </View>

      <View style={styles.containerDigits}>
        <View style={styles.containerPIN}>
          <FlatList
            data={numbers}
            renderItem={({ item }) => (
              <PinItem
                number={item.number}
                key={item.key}
                token={otpCode}
                setToken={setOtpCode}
                numCodes={numCodes}
                setNumCodes={setNumCodes}
                setIsRefresh={setIsRefreshing}
              />
            )}
            keyExtractor={(item): string => item.key}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
            numColumns={3}
          />
        </View>

        <View style={styles.containerCandidate}>
          <FlatList
            data={candidates}
            renderItem={({ item }) => {
              return (
                <View style={styles.candidateContainer}>
                  <Text style={styles.textVoting}>Voting for</Text>
                  <CandidateItem
                    id={Number(item.key)}
                    name={item.name}
                    party={item.party}
                    photo={item.photo}
                    src={item.src}
                    acronym={item.acronym}
                    selected={selected}
                    setSelected={setSelected}
                    xTexts={xTexts}
                    setXtexts={setXtexts}
                    isFactor={true}
                    navigation={navigation}
                  />
                </View>
              );
            }}
            keyExtractor={(item): string => item.key}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
            style={styles.containerFlatCandidate}
          />
        </View>
      </View>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingBox}>
            <Text style={styles.processingText}>Processing your vote…</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default TwoFactor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  containerHeader: {
    flexDirection: "row",
    marginLeft: 20,
    marginTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 30) : 45,
    backgroundColor: "transparent",
    width: "100%",
    maxHeight: 100,
    alignItems: "center",
    alignContent: "center",
  },
  topBar: {
    height: "100%",
    gap: 2,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
    zIndex: 2,
  },
  topTitle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    backgroundColor: "transparent",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  textFactor: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "500",
  },
  containerVerification: {
    flex: 1,
    backgroundColor: "transparent",
    width: "100%",
    padding: 15,
  },
  textVerification: {
    fontWeight: "600",
    fontSize: 16,
    paddingBottom: 5,
    color: "#000",
  },
  textInstructions: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  textWarning: {
    fontSize: 13,
    color: "#FF9800",
    marginTop: 3,
    fontStyle: "italic",
  },
  containerCode: {
    backgroundColor: "transparent",
    marginTop: 20,
  },
  containerDigits: {
    flex: 3,
    backgroundColor: "#F6F6F6",
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 2,
  },
  containerCandidate: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
    paddingTop: 0,
  },
  candidateContainer: {
    alignItems: "center",
  },
  containerPIN: {
    height: "100%",
    paddingBottom: 100,
  },
  textVoting: {
    textAlign: "center",
    textAlignVertical: "bottom",
    bottom: 5,
    fontSize: 14,
    color: "#666",
  },
  containerFlatCandidate: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  processingBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  processingText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});
