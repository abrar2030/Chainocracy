import { useEffect, useState, useCallback } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "src/context/AuthContext";
import axios from "src/api/axios";
import { Config } from "src/constants/config";
import Countdown from "./CountDown";

interface Announcement {
  startTimeVoting: Date;
  endTimeVoting: Date;
  dateResults: Date;
  numOfCandidates: number;
  numOfVoters: number;
  dateCreated?: Date;
}

interface CandidateResult {
  id: number;
  party: string;
  name: string;
  acronym: string;
  percentage: number;
  src: string | undefined;
}

function getVotingClosure(date: Date | undefined): string {
  if (!date) {
    return "Voting closure date is not provided";
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  return `Voting closes ${date.toLocaleDateString("en-US", options)}`;
}

const DEFAULT_ANNOUNCEMENT: Announcement = {
  startTimeVoting: new Date("2022-01-19T23:00:00.000Z"),
  endTimeVoting: new Date("2027-03-03T23:00:00.000Z"),
  dateResults: new Date("2024-04-30T22:00:00.000Z"),
  dateCreated: new Date("2024-04-21T03:45:37.815Z"),
  numOfCandidates: 5,
  numOfVoters: 1006,
};

export function LiveProjection() {
  const [announcement, setAnnouncement] =
    useState<Announcement>(DEFAULT_ANNOUNCEMENT);
  const [sec, setSec] = useState<number>(5000);
  const [isReadyCountDown, setIsReadCountDown] = useState(false);
  const [data, setData] = useState<CandidateResult[] | undefined>(undefined);
  const { imageList } = useAuth();

  const loadAnnouncement = useCallback(async () => {
    try {
      const response = await axios.get(Config.ENDPOINTS.ANNOUNCEMENT);
      const res = response.data?.announcement;
      if (res) {
        const announcementData: Announcement = {
          startTimeVoting: new Date(res.startTimeVoting),
          endTimeVoting: new Date(res.endTimeVoting),
          dateResults: new Date(res.dateResults),
          dateCreated: res.dateCreated ? new Date(res.dateCreated) : undefined,
          numOfCandidates: parseInt(res.numOfCandidates, 10),
          numOfVoters: parseInt(res.numOfVoters, 10),
        };

        setAnnouncement(announcementData);
        const diff =
          (announcementData.endTimeVoting.getTime() -
            announcementData.startTimeVoting.getTime()) /
          1000;
        setSec(diff > 0 ? diff : 0);
        setIsReadCountDown(true);
      }
    } catch (error) {
      if (Config.APP.SHOW_LOGS) {
        console.error("Error loading announcement:", error);
      }
    }
  }, []);

  const onPressLoadResultsComputed = useCallback(async () => {
    try {
      const port = "3010";
      const baseUrl = Config.API_BASE_URL.replace(/:\d+$/, "");
      const resultsUrl = `${baseUrl}:${port}/api/blockchain/get-results-computed`;

      const response = await axios.get(resultsUrl);
      const results = response.data.data;
      if (results?.candidatesResult) {
        let newDataCandidates: CandidateResult[] = results.candidatesResult.map(
          (x: any, index: number) => {
            const candidatePhotoName = x.candidate.name
              .toLowerCase()
              .split(" ")
              .join(".");

            return {
              id: index + 1,
              party: x.candidate.party,
              name: x.candidate.name,
              acronym: x.candidate.acronym,
              percentage: x.percentage,
              src: imageList[candidatePhotoName],
            };
          },
        );

        newDataCandidates = newDataCandidates
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 2);
        setData(newDataCandidates);
      }
    } catch (error) {
      if (Config.APP.SHOW_LOGS) {
        console.error("Error loading results:", error);
      }
    }
  }, [imageList]);

  useEffect(() => {
    loadAnnouncement();
    onPressLoadResultsComputed();
  }, [loadAnnouncement, onPressLoadResultsComputed]);

  const hasData = data && data.length >= 2;

  return (
    <View style={styles.container}>
      <Text style={styles.textLive}>Live Projection</Text>
      <View style={styles.containerCandidates}>
        <View style={styles.candidateLeft}>
          <Image
            source={hasData && data[0].src ? { uri: data[0].src } : undefined}
            width={40}
            style={{ borderRadius: 30 }}
          />

          <View style={styles.candidateLeftText}>
            <Text style={styles.textName}>{hasData ? data[0].name : "—"}</Text>
            <Text style={styles.textParty}>
              {hasData ? data[0].acronym : "—"}
            </Text>
          </View>
        </View>
        <View style={styles.candidateRight}>
          <View style={styles.candidateRightText}>
            <Text style={styles.textName}>{hasData ? data[1].name : "—"}</Text>
            <Text style={styles.textParty}>
              {hasData ? data[1].acronym : "—"}
            </Text>
          </View>

          <Image
            source={hasData && data[1].src ? { uri: data[1].src } : undefined}
            width={40}
            style={{ borderRadius: 30, alignContent: "flex-start" }}
          />
        </View>
      </View>

      <View style={styles.progressParties}>
        <View style={styles.progresses}>
          <View style={styles.progresses1}>
            <Progress.Bar
              progress={hasData ? data[0].percentage : 0.001}
              width={100}
              height={7}
              unfilledColor="#ffffff"
              color="#CAA448"
              borderRadius={0}
              style={{ borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}
            />
          </View>

          <View style={styles.progresses2}>
            <Progress.Bar
              progress={hasData ? data[1].percentage : 0.007}
              width={100}
              height={7}
              unfilledColor="#ffffff"
              color="#D62A2A"
              borderRadius={0}
              style={{
                borderTopLeftRadius: 5,
                borderBottomLeftRadius: 5,
                transform: [{ scaleX: -1 }],
              }}
            />
          </View>
        </View>

        <View style={styles.timerContainer}>
          <Icon name="clock-outline" size={45} color="#1b1b1b" />
          {isReadyCountDown ? <Countdown remainingTime={sec} /> : null}
        </View>
        <Text style={styles.textClose}>
          {getVotingClosure(announcement?.endTimeVoting)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    width: "100%",
    maxHeight: 160,
    gap: 5,
  },
  textLive: {
    color: "#0f0f0f",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "transparent",
  },
  containerCandidates: {
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  candidateLeft: {
    flex: 2,
    backgroundColor: "transparent",
    flexDirection: "row",
  },
  candidateRight: {
    flex: 2,
    backgroundColor: "transparent",
    flexDirection: "row",
  },
  candidateLeftText: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 5,
    gap: 3,
  },
  textName: {
    color: "#262626",
    fontSize: 14,
  },
  textParty: {
    color: "#262626",
    fontSize: 14,
  },
  candidateRightText: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 5,
    gap: 3,
    backgroundColor: "transparent",
  },
  progressParties: {},
  timerContainer: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 5,
    gap: 2,
  },
  textTimer: {
    fontSize: 25,
    fontWeight: "500",
    justifyContent: "center",
    width: 50,
    textAlign: "center",
  },
  textClose: {
    paddingTop: 5,
    textAlign: "center",
  },
  progresses: {
    flexDirection: "row",
    backgroundColor: "#121212",
    borderRadius: 5,
  },
  progresses1: {
    flex: 2,
    width: "100%",
    borderColor: "#fff",
    alignItems: "flex-start",
  },
  progresses2: {
    flex: 2,
    width: "100%",
    alignItems: "flex-end",
    alignContent: "flex-end",
  },
});
