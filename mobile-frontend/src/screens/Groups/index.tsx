import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, RadioButton } from "react-native-paper";
import axios from "src/api/axios";
import { Config } from "../../constants/config";
import { useAuth } from "../../context/AuthContext";
import { Container, Title } from "./styles";

interface Candidate {
  code: number;
  name: string;
  party: string;
  acronym?: string;
  status?: string;
}

export function Groups() {
  const navigation = useNavigation<any>();
  const { authState } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const fetchCandidates = useCallback(async () => {
    try {
      const response = await axios.get(Config.ENDPOINTS.CANDIDATES);
      if (response.data?.candidates) {
        setCandidates(response.data.candidates);
      }
    } catch (error: any) {
      if (Config.APP.SHOW_LOGS) {
        console.error("Error fetching candidates:", error);
      }
      Alert.alert(
        "Error",
        "Failed to load candidates. Please try again later.",
      );
    }
  }, []);

  const fetchAnnouncement = useCallback(async () => {
    try {
      const response = await axios.get(Config.ENDPOINTS.ANNOUNCEMENT);
      if (response.data?.announcement) {
        setAnnouncement(response.data.announcement);
      }
    } catch (error: any) {
      if (Config.APP.SHOW_LOGS) {
        console.error("Error fetching announcement:", error);
      }
    }
  }, []);

  const checkVotingStatus = useCallback(async () => {
    try {
      const port = authState?.port || "3010";
      const baseUrl = Config.API_BASE_URL.replace(/:\d+$/, "");
      const votingStatusUrl = `${baseUrl}:${port}/api/blockchain/voting-status`;

      const response = await axios.get(votingStatusUrl, {
        params: { electoralId: authState?.electoralId },
      });

      if (
        response.data?.data &&
        typeof response.data.data.hasVoted === "boolean"
      ) {
        setHasVoted(response.data.data.hasVoted);
      } else {
        setHasVoted(false);
      }
    } catch (error: any) {
      if (Config.APP.SHOW_LOGS) {
        console.error("Error checking voting status:", error);
      }
      setHasVoted(false);
    }
  }, [authState?.port, authState?.electoralId]);

  const initializeVotingScreen = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCandidates(),
        fetchAnnouncement(),
        checkVotingStatus(),
      ]);
    } catch (error) {
      if (Config.APP.SHOW_LOGS) {
        console.error("Error initializing voting screen:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchCandidates, fetchAnnouncement, checkVotingStatus]);

  useEffect(() => {
    initializeVotingScreen();
  }, [initializeVotingScreen]);

  const submitVote = async () => {
    setSubmitting(true);
    try {
      const port = authState?.port || "3010";
      const baseUrl = Config.API_BASE_URL.replace(/:\d+$/, "");
      const blockchainUrl = `${baseUrl}:${port}/api/blockchain/transaction`;

      const voteData = {
        identifier: authState?.electoralId,
        choiceCode: selectedCandidate,
      };

      const response = await axios.post(blockchainUrl, voteData);

      if (response.status === 200 || response.status === 201) {
        setHasVoted(true);
        Alert.alert(
          "Success",
          "Your vote has been recorded successfully on the blockchain!",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("Thank Vote", {
                  candidateCode: selectedCandidate,
                  transactionHash: response.data?.data?.transactionHash,
                });
              },
            },
          ],
        );
      }
    } catch (error: any) {
      if (Config.APP.SHOW_LOGS) {
        console.error("Error submitting vote:", error);
      }

      let errorMessage =
        "Failed to submit vote. Please try again or contact support.";

      if (error.response?.status === 409) {
        errorMessage =
          "You have already voted in this election. Each voter can only vote once.";
        setHasVoted(true);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteSubmit = () => {
    if (!selectedCandidate) {
      Alert.alert(
        "No Selection",
        "Please select a candidate before submitting your vote.",
      );
      return;
    }

    const candidate = candidates.find((c) => c.code === selectedCandidate);
    const candidateName = candidate
      ? `${candidate.name} (${candidate.party})`
      : `Candidate ${selectedCandidate}`;

    Alert.alert(
      "Confirm Vote",
      `Are you sure you want to vote for ${candidateName}?\n\nThis action cannot be undone and will be permanently recorded on the blockchain.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: submitVote },
      ],
    );
  };

  const isVotingOpen = () => {
    if (!announcement) return false;
    try {
      const now = new Date();
      const startTime = new Date(announcement.startTimeVoting);
      const endTime = new Date(announcement.endTimeVoting);
      return now >= startTime && now <= endTime;
    } catch (error) {
      if (Config.APP.SHOW_LOGS) {
        console.error("Error checking voting time window:", error);
      }
      return false;
    }
  };

  if (loading) {
    return (
      <Container style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading candidates...</Text>
      </Container>
    );
  }

  if (hasVoted) {
    return (
      <Container style={styles.centered}>
        <View style={styles.statusIcon}>
          <Text style={styles.statusIconText}>✓</Text>
        </View>
        <Title style={styles.statusTitle}>Thank You!</Title>
        <Text style={styles.statusMessage}>
          You have already cast your vote in this election.
        </Text>
        <Text style={styles.statusSubMessage}>
          Your vote has been securely recorded on the blockchain and cannot be
          changed.
        </Text>
        <Text style={styles.statusSubMessage}>
          Results will be available after the voting period ends.
        </Text>
      </Container>
    );
  }

  if (!isVotingOpen()) {
    return (
      <Container style={styles.centered}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Title style={styles.statusTitle}>Voting Not Available</Title>
        <Text style={styles.statusMessage}>
          The voting period is not currently active.
        </Text>
        {announcement && (
          <Text style={styles.statusSubMessage}>
            Voting will be open from{" "}
            {new Date(announcement.startTimeVoting).toLocaleString()} to{" "}
            {new Date(announcement.endTimeVoting).toLocaleString()}
          </Text>
        )}
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Title style={styles.pageTitle}>Cast Your Vote</Title>

        {announcement && (
          <Card style={styles.announcementCard}>
            <Card.Content>
              <Text style={styles.announcementTitle}>
                {announcement.title || "Election Information"}
              </Text>
              <Text style={styles.announcementClose}>
                Voting closes:{" "}
                {new Date(announcement.endTimeVoting).toLocaleString()}
              </Text>
              {announcement.description && (
                <Text style={styles.announcementDesc}>
                  {announcement.description}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        <Text style={styles.selectLabel}>Select a candidate:</Text>

        {candidates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No candidates available at this time.
            </Text>
          </View>
        ) : (
          <RadioButton.Group
            onValueChange={(value) => setSelectedCandidate(Number(value))}
            value={selectedCandidate?.toString() || ""}
          >
            {candidates.map((candidate) => (
              <TouchableOpacity
                key={candidate.code}
                onPress={() => setSelectedCandidate(candidate.code)}
                style={styles.candidateItem}
              >
                <Card
                  style={[
                    styles.candidateCard,
                    selectedCandidate === candidate.code &&
                      styles.candidateCardSelected,
                  ]}
                >
                  <Card.Content style={styles.candidateCardContent}>
                    <RadioButton value={candidate.code.toString()} />
                    <View style={styles.candidateInfo}>
                      <Text style={styles.candidateName}>{candidate.name}</Text>
                      <Text style={styles.candidateParty}>
                        {candidate.party}
                        {candidate.acronym ? ` (${candidate.acronym})` : ""}
                      </Text>
                      <Text style={styles.candidateCode}>
                        Code: {candidate.code}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </RadioButton.Group>
        )}

        <View style={styles.submitContainer}>
          <Button
            mode="contained"
            onPress={handleVoteSubmit}
            disabled={!selectedCandidate || submitting}
            loading={submitting}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
          >
            {submitting ? "Submitting Vote…" : "Submit Vote"}
          </Button>
        </View>

        <Text style={styles.disclaimer}>
          Your vote is secure and anonymous. It will be recorded on the
          blockchain and cannot be changed once submitted.
        </Text>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  centered: { justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 10, color: "#666" },
  statusIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIconText: { fontSize: 36, color: "#fff", fontWeight: "bold" },
  lockIcon: { fontSize: 48, marginBottom: 16 },
  statusTitle: { fontSize: 24, textAlign: "center", marginBottom: 12 },
  statusMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  statusSubMessage: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  scrollView: { flex: 1 },
  pageTitle: { padding: 20, fontSize: 24 },
  announcementCard: { margin: 20, marginTop: 0 },
  announcementTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  announcementClose: { fontSize: 14, color: "#666" },
  announcementDesc: { fontSize: 13, color: "#666", marginTop: 5 },
  selectLabel: { paddingHorizontal: 20, fontSize: 16, marginBottom: 10 },
  emptyContainer: { padding: 20 },
  emptyText: { textAlign: "center", color: "#666" },
  candidateItem: { marginHorizontal: 20, marginBottom: 10 },
  candidateCard: { borderWidth: 1, borderColor: "transparent" },
  candidateCardSelected: { borderColor: "#2196F3", borderWidth: 2 },
  candidateCardContent: { flexDirection: "row", alignItems: "center" },
  candidateInfo: { flex: 1, marginLeft: 10 },
  candidateName: { fontSize: 18, fontWeight: "bold" },
  candidateParty: { fontSize: 14, color: "#666" },
  candidateCode: { fontSize: 12, color: "#999" },
  submitContainer: { padding: 20 },
  submitButton: { borderRadius: 8 },
  submitButtonContent: { paddingVertical: 6 },
  disclaimer: {
    padding: 20,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    paddingBottom: 40,
  },
});
