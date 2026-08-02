export interface Citizen {
  electoralId: string;
  name: string;
  email: string;
  address: string;
  province: string;
  password?: string;
  status: string;
  verification: string;
  refreshToken: string;
  otp: Otp;
}

export enum Role {
  ADMIN,
  NORMAL,
}

export interface User {
  name: string;
  username: string;
  password: string;
  refreshToken: string;
  role: Role;
  timestamp: number;
}

export interface Announcement {
  startTimeVoting: Date;
  endTimeVoting: Date;
  dateResults: Date;
  numOfCandidates: number;
  numOfVoters: number;
  dateCreated?: number;
}

export interface Otp {
  ascii: string;
  hex: string;
  base32: string;
  otpauth_url: string;
}

export const PROVINCES_PORT: Record<string, string> = {
  Alabama: "3000",
  Alaska: "3001",
  Arizona: "3002",
  Arkansas: "3003",
  California: "3004",
  Colorado: "3005",
  Connecticut: "3006",
  Delaware: "3007",
  Florida: "3008",
  Georgia: "3009",
  Hawaii: "3010",
  Idaho: "3011",
  Illinois: "3012",
  Indiana: "3013",
  Iowa: "3014",
  Kansas: "3015",
  Kentucky: "3016",
  Louisiana: "3017",
  Maine: "3018",
  Maryland: "3019",
  Massachusetts: "3020",
  Michigan: "3021",
  Minnesota: "3022",
  Mississippi: "3023",
  Missouri: "3024",
  Montana: "3025",
  Nebraska: "3026",
  Nevada: "3027",
  "New Hampshire": "3028",
  "New Jersey": "3029",
  "New Mexico": "3030",
  "New York": "3031",
  "North Carolina": "3032",
  "North Dakota": "3033",
  Ohio: "3034",
  Oklahoma: "3035",
  Oregon: "3036",
  Pennsylvania: "3037",
  "Rhode Island": "3038",
  "South Carolina": "3039",
  "South Dakota": "3040",
  Tennessee: "3041",
  Texas: "3042",
  Utah: "3043",
  Vermont: "3044",
  Virginia: "3045",
  Washington: "3046",
  "West Virginia": "3047",
  Wisconsin: "3048",
  Wyoming: "3049",
};
