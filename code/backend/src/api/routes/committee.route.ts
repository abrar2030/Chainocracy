import type { NextFunction, Request, Response } from "express";
import Committee from "../../committee/committee";
import { PROVINCES_PORT } from "../../committee/data_types";
import emailTemplate from "../../email_center/emailTemplate";
import sendEmail from "../../email_center/sendEmail";

const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const verifyJWT = require("../../middleware/verifyJWT");
const credentials = require("../../middleware/credentials");

router.use(cookieParser());
router.use(credentials);

const committee = new Committee();

const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      console.error(`Route Error: ${err.message}`, err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    });

// ── Basic ─────────────────────────────────────────────────────────────────────

router.get("/", (_req: Request, res: Response) => res.status(401).json({}));

router.get("/registers", (_req: Request, res: Response) =>
  res.json({
    registers: committee.getCitizens(),
    note: "Request accepted ...",
  }),
);

router.get(
  "/generate-identifiers",
  asyncHandler(async (_req: Request, res: Response) => {
    const ans = await committee.generateIdentifiers();
    return res.json({ voters: ans, note: "Request accepted ..." });
  }),
);

// ── Candidates ────────────────────────────────────────────────────────────────

router.post(
  "/add-candidate",
  asyncHandler(async (req: Request, res: Response) => {
    const { name, party, code, acronym, status } = req.body;
    if (!name || !party || !code)
      return res.status(400).json({ note: "Rejected." });

    const ans = await committee.addCandidateCommittee(
      name,
      parseInt(code, 10),
      party,
      acronym,
      status,
    );
    if (ans != null)
      return res
        .status(200)
        .json({ note: "Request accepted, candidate added.", candidates: ans });
    return res.status(500).json({ note: "Rejected. Something went wrong ..." });
  }),
);

router.get(
  "/clear-candidates",
  asyncHandler(async (_req: Request, res: Response) => {
    const candidates = await committee.clearCandidates();
    return res.json({ candidates, note: "Request accepted ..." });
  }),
);

router.get(
  "/candidates",
  asyncHandler(async (_req: Request, res: Response) => {
    const ans = await committee.getCandidates();
    if (ans != null)
      return res.json({ candidates: ans, note: "Request accepted ..." });
    return res.status(500).json({ note: "Rejected. Something went wrong ..." });
  }),
);

// ── Users ─────────────────────────────────────────────────────────────────────

router.post(
  "/add-user",
  asyncHandler(async (req: Request, res: Response) => {
    const { name, username, role, password } = req.body;
    if (!name || !username || !role || !password)
      return res.status(400).json({ note: "Rejected." });

    const ans = await committee.addUser(req.body);
    if (ans != null)
      return res
        .status(201)
        .json({ note: "Request accepted, user added.", users: ans });
    return res.status(409).json({ note: "Rejected. User already exists." });
  }),
);

router.get(
  "/users",
  asyncHandler(async (_req: Request, res: Response) => {
    const ans = await committee.getUsers();
    if (ans != null)
      return res.json({ users: ans, note: "Request accepted ..." });
    return res.status(500).json({ note: "Rejected. Something went wrong ..." });
  }),
);

router.get(
  "/clear-users",
  asyncHandler(async (_req: Request, res: Response) => {
    await committee.eraseUsers();
    const users = await committee.getUsers();
    return res.json({ users, note: "Request accepted ..." });
  }),
);

router.post(
  "/delete-user",
  asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ note: "Rejected." });

    const ans = await committee.eraseUser(username);
    if (ans != null)
      return res.json({
        users: await committee.getUsers(),
        note: "Request accepted ...",
      });
    return res.status(500).json({ note: "Rejected. Something went wrong ..." });
  }),
);

router.post(
  "/update-user",
  asyncHandler(async (req: Request, res: Response) => {
    const { name, username, role } = req.body;
    if (!name || !username || !role)
      return res.status(400).json({ note: "Rejected." });

    const ans = await committee.updateUser(req.body);
    if (ans != null)
      return res.json({
        note: "Request accepted, user updated.",
        users: await committee.getUsers(),
      });
    return res.status(500).json({ note: "Rejected. Something went wrong ..." });
  }),
);

// ── Citizens ──────────────────────────────────────────────────────────────────

router.post(
  "/register-voter",
  asyncHandler(async (req: Request, res: Response) => {
    const { electoralId, name, email, address, province, password } = req.body;
    if (!electoralId || !name || !email || !address || !province || !password)
      return res.status(400).json({ note: "Rejected." });

    try {
      if (await committee.addCitzen(req.body)) {
        return res.status(201).json({
          note: "Request accepted, citizen registered.",
          message: "You may receive an email with further instructions.",
          registers: committee.getCitizens(),
        });
      }
      return res
        .status(409)
        .json({ note: "Rejected. Citizen already exists or invalid data." });
    } catch (e: unknown) {
      console.error(e);
      return res
        .status(500)
        .json({ note: "Rejected. Something went wrong ..." });
    }
  }),
);

router.get(
  "/clear-registers",
  asyncHandler(async (_req: Request, res: Response) => {
    await committee.eraseCitzens();
    return res.json({
      registers: committee.getCitizens(),
      note: "Request accepted ...",
    });
  }),
);

router.post(
  "/delete-register",
  asyncHandler(async (req: Request, res: Response) => {
    const { electoralId } = req.body;
    if (!electoralId) return res.status(400).json({ note: "Rejected." });

    const ans = await committee.eraseRegister(electoralId);
    if (ans != null)
      return res.status(200).json({
        registers: committee.getCitizens(),
        note: "Request accepted ...",
      });
    return res.status(500).json({ note: "Rejected. Something went wrong ..." });
  }),
);

router.post(
  "/update-citizen",
  asyncHandler(async (req: Request, res: Response) => {
    const { electoralId, name, email, address, province, status } = req.body;
    if (!electoralId || !name || !email || !address || !province || !status)
      return res.status(400).json({ note: "Rejected." });

    const ans = await committee.updateCitizen(req.body);
    if (ans != null)
      return res.json({
        note: "Request accepted, citizen updated.",
        registers: committee.getCitizens(),
      });
    return res.status(500).json({ note: "Rejected. Something went wrong ..." });
  }),
);

// ── Announcement ──────────────────────────────────────────────────────────────

router.get(
  "/announcement",
  asyncHandler(async (_req: Request, res: Response) => {
    const ans = await committee.getAnnouncement();
    if (ans != null)
      return res.json({ announcement: ans, note: "Request accepted ..." });
    return res.status(404).json({ note: "No announcement found." });
  }),
);

router.post(
  "/deploy-announcement",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      startTimeVoting,
      endTimeVoting,
      dateResults,
      numOfCandidates,
      numOfVoters,
    } = req.body;
    if (
      !startTimeVoting ||
      !endTimeVoting ||
      !dateResults ||
      !numOfCandidates ||
      !numOfVoters
    )
      return res.status(400).json({ note: "Rejected." });

    const ans = await committee.deployAnnouncement(req.body);
    if (ans != null)
      return res
        .status(201)
        .json({ note: "Request accepted, announcement deployed." });
    return res.status(400).json({ note: "Rejected. Something went wrong ..." });
  }),
);

// ── Voter identifiers ─────────────────────────────────────────────────────────

router.get(
  "/voter-identifiers",
  asyncHandler(async (_req: Request, res: Response) => {
    const ans = await committee.getVotersGenerated();
    return res.json({ registers: ans, note: "Request accepted ..." });
  }),
);

// ── Email / OTP ───────────────────────────────────────────────────────────────

router.post(
  "/send-email",
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ note: "Rejected. Email is required." });

    const citizen = committee.getCitizens().find((x) => x.email === email);
    if (!citizen)
      return res.status(404).json({ note: "Rejected. Citizen not found." });

    const otp = citizen.otp;
    const textContent = `Your OTP details: ${JSON.stringify(otp)}`;
    let htmlContent = "";

    try {
      const qrCodeData = await committee.generateQRCode(otp.otpauth_url);
      if (qrCodeData)
        htmlContent = emailTemplate(otp, citizen.name, qrCodeData);
    } catch (_) {}

    try {
      await sendEmail(email, textContent, htmlContent);
      return res.status(200).json({ note: "Success" });
    } catch (_) {
      return res.status(500).json({ note: "Rejected. Failed to send email." });
    }
  }),
);

router.post(
  "/verify-otp",
  verifyJWT,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, token, otpCode } = req.body;
    if (!email || !token || !otpCode)
      return res
        .status(400)
        .json({ note: "Rejected. Required fields missing." });

    const citizen = committee.getCitizens().find((x) => x.email === email);
    if (!citizen)
      return res.status(404).json({ note: "Rejected. Citizen not found." });

    // Deliberate 1 s delay to slow brute-force attempts
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));

    const verified = committee.verifyOtp(citizen.otp.base32, otpCode);
    return verified
      ? res.status(200).json({ note: "Verified" })
      : res.status(401).json({ note: "Failed." });
  }),
);

// ── Auth ──────────────────────────────────────────────────────────────────────

router.post(
  "/auth-mobile",
  asyncHandler(async (req: Request, res: Response) => {
    const { electoralId, password } = req.body;
    if (!electoralId || !password)
      return res
        .status(400)
        .json({ message: "Electoral ID and password are required." });

    const ans = await committee.authMobile(electoralId, password);
    if (!ans)
      return res.status(401).json({ note: "Rejected. Invalid credentials." });

    const accessToken = jwt.sign(
      { electoralId: ans.electoralId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" },
    );
    const refreshToken = jwt.sign(
      { electoralId: ans.electoralId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "5d" },
    );

    await committee.updateTokenCitzen(electoralId, refreshToken);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const province = ans.province as keyof typeof PROVINCES_PORT;
    return res.status(201).json({
      accessToken,
      email: ans.email,
      port: PROVINCES_PORT[province] || null,
    });
  }),
);

router.post(
  "/auth-web",
  asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password are required." });

    const ans = await committee.authWeb(username, password);
    if (!ans)
      return res.status(401).json({ note: "Rejected. Invalid credentials." });

    const accessToken = jwt.sign(
      { username: ans.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "60m" },
    );
    const refreshToken = jwt.sign(
      { username: ans.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "5d" },
    );

    await committee.updateTokenUser(username, refreshToken);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      accessToken,
      refreshToken,
      username,
      name: ans.name,
      role: ans.role,
    });
  }),
);

// ── Token refresh ─────────────────────────────────────────────────────────────

router.get("/refresh-token", verifyJWT, (req: Request, res: Response) => {
  try {
    // (split("=")[1] drops everything after the second '=')
    // Use req.cookies (populated by cookie-parser) instead
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) return res.sendStatus(401);

    const foundUser = committee
      .getCitizens()
      .find((x) => x.refreshToken === refreshToken);
    if (!foundUser) return res.sendStatus(403);

    return jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err: any, decoded: any) => {
        if (err || foundUser.electoralId !== decoded.electoralId)
          return res.sendStatus(403);
        const accessToken = jwt.sign(
          { electoralId: decoded.electoralId },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "60m" },
        );
        return res.status(200).json({ accessToken });
      },
    );
  } catch (_) {
    return res.sendStatus(500);
  }
});

router.get(
  "/refresh-token-web",
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    const foundUser = committee
      .getUsers()
      .find((x) => x.refreshToken === token);
    if (!foundUser) return res.sendStatus(403);

    return jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err: any, decoded: any) => {
        if (err || foundUser.username !== decoded.username)
          return res.sendStatus(403);

        const newAccessToken = jwt.sign(
          { username: decoded.username },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "600s" },
        );
        const newRefreshToken = jwt.sign(
          { username: decoded.username },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" },
        );

        await committee.updateTokenUser(foundUser.username, newRefreshToken);

        res.cookie("jwt", newAccessToken, {
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000,
        });

        return res
          .status(200)
          .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      },
    );
  }),
);

// ── Logout ────────────────────────────────────────────────────────────────────

router.get("/log-out", (req: Request, res: Response) => {
  const refreshToken = req.cookies?.jwt;
  if (!refreshToken) return res.sendStatus(204);

  const foundUser = committee
    .getCitizens()
    .find((x) => x.refreshToken === refreshToken);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  if (foundUser) committee.updateTokenCitzen(foundUser.electoralId, "");
  return res.sendStatus(204);
});

router.get("/log-out-web", (req: Request, res: Response) => {
  const refreshToken = req.cookies?.jwt;
  if (!refreshToken) return res.sendStatus(204);

  const foundUser = committee
    .getUsers()
    .find((x) => x.refreshToken === refreshToken);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  if (foundUser) committee.updateTokenUser(foundUser.username, "");
  return res.sendStatus(204);
});

module.exports = router;
