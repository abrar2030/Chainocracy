import { describe, expect, it } from "vitest";
import {
  candidateSchema,
  citizenSchema,
  electionAnnouncementSchema,
  formatValidationErrors,
  loginSchema,
  registerUserSchema,
  voteSchema,
} from "@/lib/validations";

describe("loginSchema", () => {
  it("validates correct login data", () => {
    const result = loginSchema.safeParse({
      username: "testuser",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects username shorter than 3 characters", () => {
    const result = loginSchema.safeParse({
      username: "ab",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("at least 3 characters");
    }
  });

  it("rejects password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({
      username: "testuser",
      password: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("at least 6 characters");
    }
  });

  it("rejects empty username", () => {
    const result = loginSchema.safeParse({
      username: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("registerUserSchema", () => {
  const validData = {
    name: "John Doe",
    username: "johndoe",
    password: "password123",
    confirmPassword: "password123",
    role: "ADMIN" as const,
  };

  it("validates correct registration data", () => {
    const result = registerUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("Passwords don't match");
    }
  });

  it("rejects name shorter than 2 characters", () => {
    const result = registerUserSchema.safeParse({ ...validData, name: "J" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      role: "SUPERUSER",
    });
    expect(result.success).toBe(false);
  });

  it("accepts NORMAL role", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      role: "NORMAL",
    });
    expect(result.success).toBe(true);
  });
});

describe("candidateSchema", () => {
  const validCandidate = {
    name: "Alice Johnson",
    code: 1,
    party: "Progressive Party",
    acronym: "PP",
    status: "active" as const,
  };

  it("validates correct candidate data", () => {
    const result = candidateSchema.safeParse(validCandidate);
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = candidateSchema.safeParse({ ...validCandidate, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive code", () => {
    const result = candidateSchema.safeParse({ ...validCandidate, code: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects acronym longer than 10 characters", () => {
    const result = candidateSchema.safeParse({
      ...validCandidate,
      acronym: "TOOLONGACRONYM",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["active", "inactive", "pending"] as const) {
      const result = candidateSchema.safeParse({ ...validCandidate, status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    const result = candidateSchema.safeParse({
      ...validCandidate,
      status: "unknown",
    });
    expect(result.success).toBe(false);
  });
});

describe("citizenSchema", () => {
  const validCitizen = {
    name: "Maria Garcia",
    electoralId: "ELEC12345",
    email: "maria@example.com",
    address: "123 Main Street, Los Angeles",
    province: "California",
  };

  it("validates correct citizen data", () => {
    const result = citizenSchema.safeParse(validCitizen);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = citizenSchema.safeParse({
      ...validCitizen,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("Invalid email");
    }
  });

  it("rejects short electoral ID", () => {
    const result = citizenSchema.safeParse({
      ...validCitizen,
      electoralId: "EL1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short address", () => {
    const result = citizenSchema.safeParse({ ...validCitizen, address: "123" });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields when absent", () => {
    const result = citizenSchema.safeParse(validCitizen);
    expect(result.success).toBe(true);
  });
});

describe("electionAnnouncementSchema", () => {
  const startDate = new Date("2027-01-01");
  const endDate = new Date("2027-01-31");

  it("validates correct announcement data", () => {
    const result = electionAnnouncementSchema.safeParse({
      title: "Presidential Election 2027",
      description: "The annual presidential election for 2027",
      startDate,
      endDate,
    });
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 5 characters", () => {
    const result = electionAnnouncementSchema.safeParse({
      title: "Ele",
      description: "Valid description here",
      startDate,
      endDate,
    });
    expect(result.success).toBe(false);
  });

  it("rejects end date before start date", () => {
    const result = electionAnnouncementSchema.safeParse({
      title: "Valid Title",
      description: "Valid description here",
      startDate: new Date("2027-12-01"),
      endDate: new Date("2027-01-01"),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain(
        "End date must be after",
      );
    }
  });
});

describe("voteSchema", () => {
  it("validates correct vote data", () => {
    const result = voteSchema.safeParse({
      identifier: "VOTER12345",
      choiceCode: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive choiceCode", () => {
    const result = voteSchema.safeParse({
      identifier: "VOTER12345",
      choiceCode: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects short identifier", () => {
    const result = voteSchema.safeParse({ identifier: "ID1", choiceCode: 1 });
    expect(result.success).toBe(false);
  });

  it("accepts optional secret", () => {
    const result = voteSchema.safeParse({
      identifier: "VOTER12345",
      choiceCode: 2,
      secret: "my-secret",
    });
    expect(result.success).toBe(true);
  });
});

describe("formatValidationErrors", () => {
  it("formats zod errors into a flat object", () => {
    const result = loginSchema.safeParse({ username: "ab", password: "123" });
    if (!result.success) {
      const formatted = formatValidationErrors(result.error);
      expect(typeof formatted).toBe("object");
      expect(Object.keys(formatted).length).toBeGreaterThan(0);
    }
  });

  it("returns path-keyed messages", () => {
    const result = loginSchema.safeParse({ username: "", password: "" });
    if (!result.success) {
      const formatted = formatValidationErrors(result.error);
      expect(formatted["username"]).toBeDefined();
    }
  });
});
