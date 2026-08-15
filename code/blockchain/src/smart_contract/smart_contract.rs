#![allow(warnings)]

use log::{error, info, warn};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::env;
use std::fmt;
use std::fs;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;

// Custom error types for better error handling
#[derive(Error, Debug)]
pub enum ContractError {
    #[error("Access denied: {0}")]
    AccessDenied(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Operation failed: {0}")]
    OperationFailed(String),

    #[error("State error: {0}")]
    StateError(String),

    #[error("External resource error: {0}")]
    ExternalResourceError(String),

    #[error("Database error: {0}")]
    DatabaseError(String),
}

// Result type alias for contract operations
type ContractResult<T> = Result<T, ContractError>;

// Role-based access control
#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
pub enum Role {
    Admin,
    Voter,
    Observer,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct User {
    pub identifier: String,
    pub roles: Vec<Role>,
    pub reputation_score: u64, // For Sybil resistance
    pub verified: bool,        // For Sybil resistance
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Candidate {
    pub name: String,
    pub num_votes: u64,
    pub code: u64,
    pub description: String,
    pub created_at: u64,
    pub created_by: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Voter {
    pub identifier: String,
    pub choice_code: u64,
    pub has_voted: bool,     // Explicit tracking of voting status
    pub voting_power: f64,   // For quadratic voting
    pub last_vote_time: u64, // For rate limiting
}

#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
pub enum ElectionState {
    Announced,
    Started,
    Happening,
    Ended,
}

// Event system for tracking important state changes
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Event {
    pub event_type: String,
    pub timestamp: u64,
    pub data: String,
    pub emitted_by: String,
}

impl fmt::Display for Candidate {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "({}, {}, {}, {})",
            self.name, self.num_votes, self.code, self.description
        )
    }
}

impl fmt::Display for Voter {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "({}, {}, voted: {})",
            self.identifier, self.choice_code, self.has_voted
        )
    }
}

// Contract state container with thread-safe access
pub struct ElectionContract {
    state: Arc<Mutex<ElectionState>>,
    admin: Arc<Mutex<String>>,
    voters: Arc<Mutex<HashMap<String, Voter>>>,
    candidates: Arc<Mutex<HashMap<u64, Candidate>>>,
    events: Arc<Mutex<Vec<Event>>>,
    voted_addresses: Arc<Mutex<HashSet<String>>>, // For double-voting prevention
    config: Arc<Mutex<ContractConfig>>,
}

// Configuration for the contract
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ContractConfig {
    pub candidate_data_url: String,
    pub voter_data_url: String,
    pub min_reputation_score: u64,
    pub max_votes_per_period: u64,
    pub voting_period_seconds: u64,
    pub emergency_stop: bool,
}

impl Default for ContractConfig {
    fn default() -> Self {
        ContractConfig {
            candidate_data_url: "https://example.com/candidates.json".to_string(),
            voter_data_url: "https://example.com/voters.json".to_string(),
            min_reputation_score: 10,
            max_votes_per_period: 5,
            voting_period_seconds: 86400, // 24 hours
            emergency_stop: false,
        }
    }
}

impl ElectionContract {
    // Constructor with default configuration
    pub fn new(admin_address: String) -> Self {
        ElectionContract {
            state: Arc::new(Mutex::new(ElectionState::Announced)),
            admin: Arc::new(Mutex::new(admin_address)),
            voters: Arc::new(Mutex::new(HashMap::new())),
            candidates: Arc::new(Mutex::new(HashMap::new())),
            events: Arc::new(Mutex::new(Vec::new())),
            voted_addresses: Arc::new(Mutex::new(HashSet::new())),
            config: Arc::new(Mutex::new(ContractConfig::default())),
        }
    }

    // Constructor with custom configuration
    pub fn with_config(admin_address: String, config: ContractConfig) -> Self {
        ElectionContract {
            state: Arc::new(Mutex::new(ElectionState::Announced)),
            admin: Arc::new(Mutex::new(admin_address)),
            voters: Arc::new(Mutex::new(HashMap::new())),
            candidates: Arc::new(Mutex::new(HashMap::new())),
            events: Arc::new(Mutex::new(Vec::new())),
            voted_addresses: Arc::new(Mutex::new(HashSet::new())),
            config: Arc::new(Mutex::new(config)),
        }
    }

    // Helper function to check if caller is admin
    fn is_admin(&self, caller: &str) -> bool {
        let admin = self.admin.lock().unwrap();
        *admin == caller
    }

    // Helper function to emit events
    fn emit_event(&self, event_type: &str, data: &str, emitted_by: &str) {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let event = Event {
            event_type: event_type.to_string(),
            timestamp,
            data: data.to_string(),
            emitted_by: emitted_by.to_string(),
        };

        let mut events = self.events.lock().unwrap();
        events.push(event);

        // Log the event
        info!("Event: {} - {} by {}", event_type, data, emitted_by);
    }

    // Emergency stop function (circuit breaker pattern)
    pub fn emergency_stop(&self, caller: &str) -> ContractResult<()> {
        if !self.is_admin(caller) {
            return Err(ContractError::AccessDenied(
                "Only admin can trigger emergency stop".to_string(),
            ));
        }

        let mut config = self.config.lock().unwrap();
        config.emergency_stop = true;

        self.emit_event("EmergencyStop", "Contract operations suspended", caller);

        Ok(())
    }

    // Resume operations after emergency stop
    pub fn resume_operations(&self, caller: &str) -> ContractResult<()> {
        if !self.is_admin(caller) {
            return Err(ContractError::AccessDenied(
                "Only admin can resume operations".to_string(),
            ));
        }

        let mut config = self.config.lock().unwrap();
        config.emergency_stop = false;

        self.emit_event("ResumeOperations", "Contract operations resumed", caller);

        Ok(())
    }

    // Check if emergency stop is active
    fn check_emergency_stop(&self) -> ContractResult<()> {
        let config = self.config.lock().unwrap();
        if config.emergency_stop {
            return Err(ContractError::StateError(
                "Contract is in emergency stop mode".to_string(),
            ));
        }
        Ok(())
    }

    // Announce election with access control
    pub fn announce_election(&self, caller: &str) -> ContractResult<()> {
        self.check_emergency_stop()?;

        if !self.is_admin(caller) {
            return Err(ContractError::AccessDenied(
                "Only admin can announce elections".to_string(),
            ));
        }

        let mut state = self.state.lock().unwrap();
        *state = ElectionState::Announced;

        self.emit_event("ElectionAnnounced", "Election has been announced", caller);

        Ok(())
    }

    // Start election with access control
    pub fn start_election(&self, caller: &str) -> ContractResult<()> {
        self.check_emergency_stop()?;

        if !self.is_admin(caller) {
            return Err(ContractError::AccessDenied(
                "Only admin can start elections".to_string(),
            ));
        }

        let mut state = self.state.lock().unwrap();

        if *state != ElectionState::Announced {
            return Err(ContractError::StateError(
                "Election must be in Announced state to start".to_string(),
            ));
        }

        *state = ElectionState::Started;

        self.emit_event("ElectionStarted", "Election has been started", caller);

        Ok(())
    }

    // End election with access control
    pub fn end_election(&self, caller: &str) -> ContractResult<()> {
        self.check_emergency_stop()?;

        if !self.is_admin(caller) {
            return Err(ContractError::AccessDenied(
                "Only admin can end elections".to_string(),
            ));
        }

        let mut state = self.state.lock().unwrap();

        if *state != ElectionState::Started && *state != ElectionState::Happening {
            return Err(ContractError::StateError(
                "Election must be in Started or Happening state to end".to_string(),
            ));
        }

        *state = ElectionState::Ended;

        self.emit_event("ElectionEnded", "Election has been ended", caller);

        Ok(())
    }

    // Add candidate with validation and access control
    pub fn add_candidate(
        &self,
        caller: &str,
        name: &str,
        code: u64,
        description: &str,
    ) -> ContractResult<()> {
        self.check_emergency_stop()?;

        if !self.is_admin(caller) {
            return Err(ContractError::AccessDenied(
                "Only admin can add candidates".to_string(),
            ));
        }

        let state = self.state.lock().unwrap();
        if *state != ElectionState::Announced {
            return Err(ContractError::StateError(
                "Candidates can only be added in Announced state".to_string(),
            ));
        }

        // Input validation
        if name.trim().is_empty() {
            return Err(ContractError::InvalidInput(
                "Candidate name cannot be empty".to_string(),
            ));
        }

        let mut candidates = self.candidates.lock().unwrap();

        // Check for duplicate candidate code
        if candidates.contains_key(&code) {
            return Err(ContractError::InvalidInput(format!(
                "Candidate with code {} already exists",
                code
            )));
        }

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let candidate = Candidate {
            name: name.to_string(),
            num_votes: 0,
            code,
            description: description.to_string(),
            created_at: timestamp,
            created_by: caller.to_string(),
        };

        candidates.insert(code, candidate.clone());

        self.emit_event(
            "CandidateAdded",
            &format!("Candidate {} added with code {}", name, code),
            caller,
        );

        Ok(())
    }

    // Register voter with validation and Sybil resistance
    pub fn register_voter(
        &self,
        caller: &str,
        voter_id: &str,
        reputation_score: u64,
    ) -> ContractResult<()> {
        self.check_emergency_stop()?;

        if !self.is_admin(caller) {
            return Err(ContractError::AccessDenied(
                "Only admin can register voters".to_string(),
            ));
        }

        // Read the state and release the lock immediately: it is re-acquired
        // below to transition Started -> Happening, and holding this guard
        // across that later `self.state.lock()` would deadlock (std::sync::
        // Mutex is not reentrant).
        let was_started = {
            let state = self.state.lock().unwrap();
            if *state != ElectionState::Announced && *state != ElectionState::Started {
                return Err(ContractError::StateError(
                    "Voters can only be registered in Announced or Started state".to_string(),
                ));
            }
            *state == ElectionState::Started
        };

        // Input validation
        if voter_id.trim().is_empty() {
            return Err(ContractError::InvalidInput(
                "Voter ID cannot be empty".to_string(),
            ));
        }

        let config = self.config.lock().unwrap();

        // Sybil resistance check
        if reputation_score < config.min_reputation_score {
            return Err(ContractError::InvalidInput(format!(
                "Reputation score too low, minimum required: {}",
                config.min_reputation_score
            )));
        }

        let mut voters = self.voters.lock().unwrap();

        // Check for duplicate voter
        if voters.contains_key(voter_id) {
            return Err(ContractError::InvalidInput(format!(
                "Voter with ID {} already registered",
                voter_id
            )));
        }

        // Calculate voting power based on reputation (quadratic voting)
        let voting_power = (reputation_score as f64).sqrt();

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let voter = Voter {
            identifier: voter_id.to_string(),
            choice_code: 0, // No choice yet
            has_voted: false,
            voting_power,
            last_vote_time: 0, // Has not voted yet
        };

        voters.insert(voter_id.to_string(), voter);

        self.emit_event(
            "VoterRegistered",
            &format!(
                "Voter {} registered with voting power {:.2}",
                voter_id, voting_power
            ),
            caller,
        );

        if was_started {
            let mut state = self.state.lock().unwrap();
            *state = ElectionState::Happening;

            self.emit_event(
                "ElectionStateChanged",
                "Election state changed to Happening",
                caller,
            );
        }

        Ok(())
    }

    // Place vote with comprehensive validation and quadratic voting
    pub fn place_vote(&self, voter_id: &str, candidate_code: u64) -> ContractResult<()> {
        self.check_emergency_stop()?;

        {
            let state = self.state.lock().unwrap();
            if *state != ElectionState::Started && *state != ElectionState::Happening {
                return Err(ContractError::StateError(
                    "Voting is only allowed in Started or Happening state".to_string(),
                ));
            }
        }

        // Check if voter exists and hasn't voted
        let mut voters = self.voters.lock().unwrap();
        let voter = match voters.get_mut(voter_id) {
            Some(v) => v,
            None => {
                return Err(ContractError::InvalidInput(format!(
                    "Voter with ID {} does not exist",
                    voter_id
                )))
            }
        };

        if voter.has_voted {
            return Err(ContractError::InvalidInput(format!(
                "Voter {} has already voted",
                voter_id
            )));
        }

        // Rate limiting check
        let current_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let config = self.config.lock().unwrap();

        if current_time - voter.last_vote_time < config.voting_period_seconds {
            return Err(ContractError::OperationFailed(format!(
                "Rate limit exceeded, please try again later"
            )));
        }

        // Check if candidate exists
        let mut candidates = self.candidates.lock().unwrap();
        let candidate = match candidates.get_mut(&candidate_code) {
            Some(c) => c,
            None => {
                return Err(ContractError::InvalidInput(format!(
                    "Candidate with code {} does not exist",
                    candidate_code
                )))
            }
        };

        // Apply quadratic voting - votes are weighted by the square root of reputation
        let vote_weight = voter.voting_power.round() as u64;
        if vote_weight == 0 {
            return Err(ContractError::OperationFailed(
                "Voting power too low to cast a vote".to_string(),
            ));
        }

        // Update candidate vote count with overflow protection
        match candidate.num_votes.checked_add(vote_weight) {
            Some(new_count) => candidate.num_votes = new_count,
            None => {
                return Err(ContractError::OperationFailed(
                    "Vote count overflow".to_string(),
                ))
            }
        }

        // Mark voter as having voted
        voter.has_voted = true;
        voter.choice_code = candidate_code;
        voter.last_vote_time = current_time;

        // Record the vote in the voted_addresses set for double-voting prevention
        let mut voted_addresses = self.voted_addresses.lock().unwrap();
        voted_addresses.insert(voter_id.to_string());

        self.emit_event(
            "VoteCast",
            &format!(
                "Voter {} cast vote for candidate {} with weight {}",
                voter_id, candidate_code, vote_weight
            ),
            voter_id,
        );

        Ok(())
    }

    // Get winning candidate with proper error handling
    pub fn winning_candidate(&self) -> ContractResult<Option<Candidate>> {
        let state = self.state.lock().unwrap();
        if *state != ElectionState::Ended {
            return Err(ContractError::StateError(
                "Winner can only be determined after election has ended".to_string(),
            ));
        }

        let candidates = self.candidates.lock().unwrap();
        if candidates.is_empty() {
            return Ok(None);
        }

        let mut winner: Option<Candidate> = None;
        let mut max_votes = 0;

        for (_, candidate) in candidates.iter() {
            if candidate.num_votes > max_votes {
                max_votes = candidate.num_votes;
                winner = Some(candidate.clone());
            }
        }

        Ok(winner)
    }

    // Get all candidates
    pub fn get_all_candidates(&self) -> ContractResult<Vec<Candidate>> {
        let candidates = self.candidates.lock().unwrap();
        let result: Vec<Candidate> = candidates.values().cloned().collect();
        Ok(result)
    }

    // Get all voters
    pub fn get_all_voters(&self) -> ContractResult<Vec<Voter>> {
        let voters = self.voters.lock().unwrap();
        let result: Vec<Voter> = voters.values().cloned().collect();
        Ok(result)
    }

    // Get current election state
    pub fn get_election_state(&self) -> ContractResult<ElectionState> {
        let state = self.state.lock().unwrap();
        Ok(state.clone())
    }

    // Get all events
    pub fn get_events(&self) -> ContractResult<Vec<Event>> {
        let events = self.events.lock().unwrap();
        Ok(events.clone())
    }

    // Load candidate data from external source with proper error handling
    pub async fn load_candidate_data(&self, caller: &str) -> ContractResult<()> {
        if !self.is_admin(caller) {
            error!("Access denied: Only admin can load candidate data");
            return Err(ContractError::AccessDenied(
                "Only admin can load candidate data".to_string(),
            ));
        }

        let config = self.config.lock().unwrap();
        let file_url = config.candidate_data_url.clone();

        info!("Loading candidate data from {}", file_url);

        let response = reqwest::get(&file_url)
            .await
            .map_err(|e| ContractError::ExternalResourceError(e.to_string()))?;

        if !response.status().is_success() {
            let status = response.status();
            error!("Failed to fetch candidate data: {}", status);
            return Err(ContractError::ExternalResourceError(format!(
                "Failed to fetch candidate data: {}",
                status
            )));
        }

        let candidates: Vec<Candidate> = match response.json().await {
            Ok(data) => data,
            Err(e) => {
                error!("Failed to parse candidate data: {}", e);
                return Err(ContractError::ExternalResourceError(format!(
                    "Failed to parse candidate data: {}",
                    e
                )));
            }
        };

        let mut candidates_map = self.candidates.lock().unwrap();

        for candidate in &candidates {
            candidates_map.insert(candidate.code, candidate.clone());
        }

        self.emit_event(
            "CandidatesLoaded",
            &format!(
                "Loaded {} candidates from external source",
                candidates.len()
            ),
            caller,
        );

        Ok(())
    }

    // Load voter data from external source with proper error handling
    pub async fn load_voter_data(&self, caller: &str) -> ContractResult<()> {
        if !self.is_admin(caller) {
            error!("Access denied: Only admin can load voter data");
            return Err(ContractError::AccessDenied(
                "Only admin can load voter data".to_string(),
            ));
        }

        let config = self.config.lock().unwrap();
        let file_url = config.voter_data_url.clone();

        info!("Loading voter data from {}", file_url);

        let response = reqwest::get(&file_url)
            .await
            .map_err(|e| ContractError::ExternalResourceError(e.to_string()))?;

        if !response.status().is_success() {
            let status = response.status();
            error!("Failed to fetch voter data: {}", status);
            return Err(ContractError::ExternalResourceError(format!(
                "Failed to fetch voter data: {}",
                status
            )));
        }

        let voters: Vec<Voter> = match response.json().await {
            Ok(data) => data,
            Err(e) => {
                error!("Failed to parse voter data: {}", e);
                return Err(ContractError::ExternalResourceError(format!(
                    "Failed to parse voter data: {}",
                    e
                )));
            }
        };

        let mut voters_map = self.voters.lock().unwrap();

        for voter in &voters {
            voters_map.insert(voter.identifier.clone(), voter.clone());
        }

        self.emit_event(
            "VotersLoaded",
            &format!("Loaded {} voters from external source", voters.len()),
            caller,
        );

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::mpsc;
    use std::thread;
    use std::time::Duration;

    #[test]
    fn test_full_election_lifecycle() {
        let contract = ElectionContract::new("admin_address".to_string());

        assert!(contract.announce_election("admin_address").is_ok());
        assert!(contract
            .add_candidate("admin_address", "Candidate 1", 1, "Description")
            .is_ok());
        assert!(contract
            .register_voter("admin_address", "voter1", 100)
            .is_ok());
        assert!(contract.start_election("admin_address").is_ok());
        assert!(contract.place_vote("voter1", 1).is_ok());
        assert!(contract.end_election("admin_address").is_ok());

        let winner = contract.winning_candidate().unwrap();
        assert!(winner.is_some());
        assert_eq!(winner.unwrap().code, 1);
    }

    // Regression test for a self-deadlock: register_voter used to lock
    // `self.state`, then re-lock the same (non-reentrant) std::sync::Mutex
    // later in the same call whenever the election was already Started,
    // hanging the calling thread forever. Run on a worker thread and join
    // with a timeout so a regression fails the test instead of hanging the
    // whole suite.
    #[test]
    fn test_register_voter_after_election_started_does_not_deadlock() {
        let contract = ElectionContract::new("admin_address".to_string());
        contract.announce_election("admin_address").unwrap();
        contract
            .add_candidate("admin_address", "Candidate 1", 1, "Description")
            .unwrap();
        contract.start_election("admin_address").unwrap();

        let (tx, rx) = mpsc::channel();
        thread::spawn(move || {
            let result = contract.register_voter("admin_address", "voter1", 100);
            let _ = tx.send(result.is_ok());
        });

        match rx.recv_timeout(Duration::from_secs(5)) {
            Ok(ok) => assert!(ok, "register_voter should succeed when state is Started"),
            Err(_) => panic!("register_voter deadlocked when election state was already Started"),
        }
    }

    #[tokio::test]
    async fn test_load_candidate_data_denies_non_admin() {
        let contract = ElectionContract::new("admin_address".to_string());
        let result = contract.load_candidate_data("not_admin").await;
        assert!(matches!(result, Err(ContractError::AccessDenied(_))));
    }

    #[tokio::test]
    async fn test_load_voter_data_denies_non_admin() {
        let contract = ElectionContract::new("admin_address".to_string());
        let result = contract.load_voter_data("not_admin").await;
        assert!(matches!(result, Err(ContractError::AccessDenied(_))));
    }
}

// Example usage
#[tokio::main]
async fn main() {
    // Initialize the contract with an admin address
    let contract = ElectionContract::new("admin_address".to_string());

    // Announce the election
    match contract.announce_election("admin_address") {
        Ok(_) => println!("Election announced successfully"),
        Err(e) => println!("Error announcing election: {}", e),
    }

    // Add a candidate
    match contract.add_candidate(
        "admin_address",
        "Candidate 1",
        1,
        "Description for Candidate 1",
    ) {
        Ok(_) => println!("Candidate added successfully"),
        Err(e) => println!("Error adding candidate: {}", e),
    }

    // Register a voter with Sybil resistance
    match contract.register_voter("admin_address", "voter1", 100) {
        Ok(_) => println!("Voter registered successfully"),
        Err(e) => println!("Error registering voter: {}", e),
    }

    // Start the election
    match contract.start_election("admin_address") {
        Ok(_) => println!("Election started successfully"),
        Err(e) => println!("Error starting election: {}", e),
    }

    // Place a vote with quadratic voting
    match contract.place_vote("voter1", 1) {
        Ok(_) => println!("Vote placed successfully"),
        Err(e) => println!("Error placing vote: {}", e),
    }

    // End the election
    match contract.end_election("admin_address") {
        Ok(_) => println!("Election ended successfully"),
        Err(e) => println!("Error ending election: {}", e),
    }

    // Get the winning candidate
    match contract.winning_candidate() {
        Ok(Some(winner)) => println!("Winner: {}", winner),
        Ok(None) => println!("No winner determined"),
        Err(e) => println!("Error getting winner: {}", e),
    }
}
