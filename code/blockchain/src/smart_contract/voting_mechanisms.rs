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

    #[error("Timelock error: {0}")]
    TimelockError(String),
}

// Result type alias for contract operations
type ContractResult<T> = Result<T, ContractError>;

// Role-based access control
#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
pub enum Role {
    Admin,
    Voter,
    Delegate,
    Observer,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct User {
    pub identifier: String,
    pub roles: Vec<Role>,
    pub reputation_score: u64,   // For Sybil resistance
    pub verified: bool,          // For Sybil resistance
    pub identity_proof: String,  // For enhanced Sybil resistance
    pub social_graph_score: u64, // For enhanced Sybil resistance
    pub registration_time: u64,  // For enhanced Sybil resistance
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Candidate {
    pub name: String,
    pub num_votes: u64,
    pub code: u64,
    pub description: String,
    pub created_at: u64,
    pub created_by: String,
    pub proposal_hash: String, // Hash of the proposal for verification
    pub proposal_url: String,  // URL to the full proposal
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Voter {
    pub identifier: String,
    pub choice_code: u64,
    pub has_voted: bool,              // Explicit tracking of voting status
    pub voting_power: f64,            // For quadratic voting
    pub last_vote_time: u64,          // For rate limiting
    pub delegated_to: Option<String>, // For vote delegation
    pub delegated_from: Vec<String>,  // List of voters who delegated to this voter
    pub vote_weight: f64,             // Combined weight including delegations
}

#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
pub enum ElectionState {
    Announced,
    Started,
    Happening,
    Ended,
}

// Timelock for critical governance actions
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct TimelockAction {
    pub action_type: String,
    pub description: String,
    pub proposed_by: String,
    pub proposed_at: u64,
    pub execution_time: u64,
    pub executed: bool,
    pub canceled: bool,
    pub data: String,
}

// Event system for tracking important state changes
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Event {
    pub event_type: String,
    pub timestamp: u64,
    pub data: String,
    pub emitted_by: String,
    pub block_number: Option<u64>,        // For blockchain integration
    pub transaction_hash: Option<String>, // For blockchain integration
}

// Vote record for transparent vote counting
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct VoteRecord {
    pub voter_id: String,
    pub candidate_code: u64,
    pub timestamp: u64,
    pub weight: f64,
    pub vote_hash: String, // Hash of the vote for verification
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
    users: Arc<Mutex<HashMap<String, User>>>, // For enhanced Sybil resistance
    timelocks: Arc<Mutex<Vec<TimelockAction>>>, // For timelock governance
    vote_records: Arc<Mutex<Vec<VoteRecord>>>, // For transparent vote counting
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
    pub timelock_delay: u64,          // Delay in seconds for timelock actions
    pub min_social_graph_score: u64,  // Minimum social graph score for Sybil resistance
    pub min_account_age_seconds: u64, // Minimum account age for Sybil resistance
    pub quadratic_voting_enabled: bool, // Toggle for quadratic voting
    pub delegation_enabled: bool,     // Toggle for vote delegation
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
            timelock_delay: 172800, // 48 hours
            min_social_graph_score: 5,
            min_account_age_seconds: 604800, // 1 week
            quadratic_voting_enabled: true,
            delegation_enabled: true,
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
            users: Arc::new(Mutex::new(HashMap::new())),
            timelocks: Arc::new(Mutex::new(Vec::new())),
            vote_records: Arc::new(Mutex::new(Vec::new())),
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
            users: Arc::new(Mutex::new(HashMap::new())),
            timelocks: Arc::new(Mutex::new(Vec::new())),
            vote_records: Arc::new(Mutex::new(Vec::new())),
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
            block_number: None,
            transaction_hash: None,
        };

        let mut events = self.events.lock().unwrap();
        events.push(event);

        // Log the event
        info!("Event: {} - {} by {}", event_type, data, emitted_by);
    }

    // Helper function to create a hash for verification
    fn create_hash(&self, data: &str) -> String {
        use sha2::{Digest, Sha256};
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        format!("{:x}", hasher.finalize())
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

    // Propose a timelock action
    pub fn propose_timelock_action(
        &self,
        caller: &str,
        action_type: &str,
        description: &str,
        data: &str,
    ) -> ContractResult<()> {
        self.check_emergency_stop()?;

        if !self.is_admin(caller) {
            return Err(ContractError::AccessDenied(
                "Only admin can propose timelock actions".to_string(),
            ));
        }

        let config = self.config.lock().unwrap();
        let timelock_delay = config.timelock_delay;

        let current_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let execution_time = current_time + timelock_delay;

        let action = TimelockAction {
            action_type: action_type.to_string(),
            description: description.to_string(),
            proposed_by: caller.to_string(),
            proposed_at: current_time,
            execution_time,
            executed: false,
            canceled: false,
            data: data.to_string(),
        };

        let mut timelocks = self.timelocks.lock().unwrap();
        timelocks.push(action);

        self.emit_event(
            "TimelockProposed",
            &format!(
                "Timelock action '{}' proposed, executable at {}",
                description, execution_time
            ),
            caller,
        );

        Ok(())
    }

    // Execute a timelock action
    pub fn execute_timelock_action(&self, caller: &str, index: usize) -> ContractResult<()> {
        self.check_emergency_stop()?;

        if !self.is_admin(caller) {
            return Err(ContractError::AccessDenied(
                "Only admin can execute timelock actions".to_string(),
            ));
        }

        let mut timelocks = self.timelocks.lock().unwrap();

        if index >= timelocks.len() {
            return Err(ContractError::InvalidInput(format!(
                "Timelock action index {} out of bounds",
                index
            )));
        }

        let action = &mut timelocks[index];

        if action.executed {
            return Err(ContractError::TimelockError(
                "Timelock action already executed".to_string(),
            ));
        }

        if action.canceled {
            return Err(ContractError::TimelockError(
                "Timelock action was canceled".to_string(),
            ));
        }

        let current_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        if current_time < action.execution_time {
            return Err(ContractError::TimelockError(format!(
                "Timelock action not yet executable, wait until {}",
                action.execution_time
            )));
        }

        // Mark as executed
        action.executed = true;

        self.emit_event(
            "TimelockExecuted",
            &format!("Timelock action '{}' executed", action.description),
            caller,
        );

        // Here you would actually execute the action based on action_type and data
        // This is a placeholder for the actual execution logic
        match action.action_type.as_str() {
            "ChangeAdmin" => {
                // Example: Change admin address
                let new_admin = action.data.clone();
                let mut admin = self.admin.lock().unwrap();
                *admin = new_admin;

                self.emit_event(
                    "AdminChanged",
                    &format!("Admin changed to {}", action.data),
                    caller,
                );
            }
            "UpdateConfig" => {
                // Example: Update configuration
                // In a real implementation, you would deserialize the data to a ContractConfig
                self.emit_event("ConfigUpdated", "Contract configuration updated", caller);
            }
            _ => {
                return Err(ContractError::TimelockError(format!(
                    "Unknown action type: {}",
                    action.action_type
                )));
            }
        }

        Ok(())
    }

    // Cancel a timelock action
    pub fn cancel_timelock_action(&self, caller: &str, index: usize) -> ContractResult<()> {
        self.check_emergency_stop()?;

        if !self.is_admin(caller) {
            return Err(ContractError::AccessDenied(
                "Only admin can cancel timelock actions".to_string(),
            ));
        }

        let mut timelocks = self.timelocks.lock().unwrap();

        if index >= timelocks.len() {
            return Err(ContractError::InvalidInput(format!(
                "Timelock action index {} out of bounds",
                index
            )));
        }

        let action = &mut timelocks[index];

        if action.executed {
            return Err(ContractError::TimelockError(
                "Cannot cancel already executed timelock action".to_string(),
            ));
        }

        if action.canceled {
            return Err(ContractError::TimelockError(
                "Timelock action already canceled".to_string(),
            ));
        }

        // Mark as canceled
        action.canceled = true;

        self.emit_event(
            "TimelockCanceled",
            &format!("Timelock action '{}' canceled", action.description),
            caller,
        );

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
        proposal_url: &str,
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

        // Create a hash of the proposal for verification
        let proposal_hash = self.create_hash(&format!(
            "{}:{}:{}:{}",
            name, code, description, proposal_url
        ));

        let candidate = Candidate {
            name: name.to_string(),
            num_votes: 0,
            code,
            description: description.to_string(),
            created_at: timestamp,
            created_by: caller.to_string(),
            proposal_hash,
            proposal_url: proposal_url.to_string(),
        };

        candidates.insert(code, candidate.clone());

        self.emit_event(
            "CandidateAdded",
            &format!("Candidate {} added with code {}", name, code),
            caller,
        );

        Ok(())
    }

    // Register user with enhanced Sybil resistance
    pub fn register_user(
        &self,
        caller: &str,
        user_id: &str,
        identity_proof: &str,
        social_graph_score: u64,
    ) -> ContractResult<()> {
        self.check_emergency_stop()?;

        if !self.is_admin(caller) {
            return Err(ContractError::AccessDenied(
                "Only admin can register users".to_string(),
            ));
        }

        // Input validation
        if user_id.trim().is_empty() {
            return Err(ContractError::InvalidInput(
                "User ID cannot be empty".to_string(),
            ));
        }

        let config = self.config.lock().unwrap();

        // Enhanced Sybil resistance check
        if social_graph_score < config.min_social_graph_score {
            return Err(ContractError::InvalidInput(format!(
                "Social graph score too low, minimum required: {}",
                config.min_social_graph_score
            )));
        }

        let mut users = self.users.lock().unwrap();

        // Check for duplicate user
        if users.contains_key(user_id) {
            return Err(ContractError::InvalidInput(format!(
                "User with ID {} already registered",
                user_id
            )));
        }

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let user = User {
            identifier: user_id.to_string(),
            roles: vec![Role::Voter],
            reputation_score: social_graph_score, // Initialize reputation with social graph score
            verified: true,
            identity_proof: identity_proof.to_string(),
            social_graph_score,
            registration_time: timestamp,
        };

        users.insert(user_id.to_string(), user);

        self.emit_event(
            "UserRegistered",
            &format!(
                "User {} registered with social graph score {}",
                user_id, social_graph_score
            ),
            caller,
        );

        Ok(())
    }

    // Register voter with validation and Sybil resistance
    pub fn register_voter(&self, caller: &str, voter_id: &str) -> ContractResult<()> {
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

        // Check if user exists and is verified
        let users = self.users.lock().unwrap();
        let user = match users.get(voter_id) {
            Some(u) => u,
            None => {
                return Err(ContractError::InvalidInput(format!(
                    "User with ID {} does not exist",
                    voter_id
                )))
            }
        };

        if !user.verified {
            return Err(ContractError::InvalidInput(format!(
                "User {} is not verified",
                voter_id
            )));
        }

        let config = self.config.lock().unwrap();

        // Enhanced Sybil resistance check
        let current_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        if current_time - user.registration_time < config.min_account_age_seconds {
            return Err(ContractError::InvalidInput(format!(
                "Account too new, minimum age required: {} seconds",
                config.min_account_age_seconds
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
        let voting_power = if config.quadratic_voting_enabled {
            (user.reputation_score as f64).sqrt()
        } else {
            1.0 // Default voting power if quadratic voting is disabled
        };

        let voter = Voter {
            identifier: voter_id.to_string(),
            choice_code: 0, // No choice yet
            has_voted: false,
            voting_power,
            last_vote_time: 0, // Has not voted yet
            delegated_to: None,
            delegated_from: Vec::new(),
            vote_weight: voting_power, // Initially same as voting_power
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

    // Delegate vote to another voter
    pub fn delegate_vote(&self, voter_id: &str, delegate_id: &str) -> ContractResult<()> {
        self.check_emergency_stop()?;

        let config = self.config.lock().unwrap();
        if !config.delegation_enabled {
            return Err(ContractError::OperationFailed(
                "Vote delegation is disabled".to_string(),
            ));
        }

        let state = self.state.lock().unwrap();
        if *state != ElectionState::Started && *state != ElectionState::Happening {
            return Err(ContractError::StateError(
                "Delegation is only allowed in Started or Happening state".to_string(),
            ));
        }

        // Check if both voters exist
        let mut voters = self.voters.lock().unwrap();

        if !voters.contains_key(voter_id) {
            return Err(ContractError::InvalidInput(format!(
                "Voter with ID {} does not exist",
                voter_id
            )));
        }

        if !voters.contains_key(delegate_id) {
            return Err(ContractError::InvalidInput(format!(
                "Delegate with ID {} does not exist",
                delegate_id
            )));
        }

        // Check if voter has already voted
        let voter = voters.get(voter_id).unwrap();
        if voter.has_voted {
            return Err(ContractError::InvalidInput(format!(
                "Voter {} has already voted and cannot delegate",
                voter_id
            )));
        }

        // Check for circular delegation
        let mut current_delegate = delegate_id;
        let mut visited = HashSet::new();
        visited.insert(voter_id.to_string());

        while let Some(delegate) = voters.get(current_delegate) {
            if let Some(next_delegate) = &delegate.delegated_to {
                if visited.contains(next_delegate.as_str()) {
                    return Err(ContractError::InvalidInput(
                        "Circular delegation detected".to_string(),
                    ));
                }
                visited.insert(next_delegate.clone());
                current_delegate = next_delegate;
            } else {
                break;
            }
        }

        // Update voter's delegation
        let voter = voters.get_mut(voter_id).unwrap();
        let voting_power = voter.voting_power;
        voter.delegated_to = Some(delegate_id.to_string());

        // Update delegate's delegated_from list and vote_weight
        let delegate = voters.get_mut(delegate_id).unwrap();
        delegate.delegated_from.push(voter_id.to_string());
        delegate.vote_weight += voting_power;

        self.emit_event(
            "VoteDelegated",
            &format!("Voter {} delegated vote to {}", voter_id, delegate_id),
            voter_id,
        );

        Ok(())
    }

    // Place vote with comprehensive validation and quadratic voting
    pub fn place_vote(&self, voter_id: &str, candidate_code: u64) -> ContractResult<()> {
        self.check_emergency_stop()?;

        let state = self.state.lock().unwrap();
        if *state != ElectionState::Started && *state != ElectionState::Happening {
            return Err(ContractError::StateError(
                "Voting is only allowed in Started or Happening state".to_string(),
            ));
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

        // Apply voting weight (quadratic or delegated)
        let vote_weight = voter.vote_weight;
        if vote_weight == 0.0 {
            return Err(ContractError::OperationFailed(
                "Voting power too low to cast a vote".to_string(),
            ));
        }

        // Update candidate vote count with overflow protection
        let vote_weight_rounded = vote_weight.round() as u64;
        match candidate.num_votes.checked_add(vote_weight_rounded) {
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

        // Create a vote record for transparent counting
        let vote_data = format!("{}:{}:{}", voter_id, candidate_code, current_time);
        let vote_hash = self.create_hash(&vote_data);

        let vote_record = VoteRecord {
            voter_id: voter_id.to_string(),
            candidate_code,
            timestamp: current_time,
            weight: vote_weight,
            vote_hash,
        };

        let mut vote_records = self.vote_records.lock().unwrap();
        vote_records.push(vote_record);

        self.emit_event(
            "VoteCast",
            &format!(
                "Voter {} cast vote for candidate {} with weight {:.2}",
                voter_id, candidate_code, vote_weight
            ),
            voter_id,
        );

        Ok(())
    }

    // Verify vote integrity
    pub fn verify_vote(&self, voter_id: &str) -> ContractResult<bool> {
        let vote_records = self.vote_records.lock().unwrap();

        let record = vote_records.iter().find(|r| r.voter_id == voter_id);

        match record {
            Some(r) => {
                // Recreate the hash to verify integrity
                let vote_data = format!("{}:{}:{}", r.voter_id, r.candidate_code, r.timestamp);
                let calculated_hash = self.create_hash(&vote_data);

                Ok(calculated_hash == r.vote_hash)
            }
            None => Ok(false),
        }
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

    // Get all vote records for transparent counting
    pub fn get_vote_records(&self) -> ContractResult<Vec<VoteRecord>> {
        let vote_records = self.vote_records.lock().unwrap();
        Ok(vote_records.clone())
    }

    // Get all pending timelock actions
    pub fn get_pending_timelocks(&self) -> ContractResult<Vec<TimelockAction>> {
        let timelocks = self.timelocks.lock().unwrap();
        let result: Vec<TimelockAction> = timelocks
            .iter()
            .filter(|a| !a.executed && !a.canceled)
            .cloned()
            .collect();
        Ok(result)
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
        // Sybil-resistance requires accounts to be a week old before they
        // can be registered as voters; bypass that wait for this test.
        contract.config.lock().unwrap().min_account_age_seconds = 0;

        assert!(contract.announce_election("admin_address").is_ok());
        assert!(contract
            .register_user("admin_address", "user1", "identity_proof_hash", 20)
            .is_ok());
        assert!(contract.register_voter("admin_address", "user1").is_ok());
        assert!(contract
            .add_candidate(
                "admin_address",
                "Candidate 1",
                1,
                "Description",
                "https://example.com/proposal1"
            )
            .is_ok());
        assert!(contract.start_election("admin_address").is_ok());
        assert!(contract.place_vote("user1", 1).is_ok());
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
        // Sybil-resistance requires accounts to be a week old before they
        // can be registered as voters; bypass that wait for this test.
        contract.config.lock().unwrap().min_account_age_seconds = 0;
        contract.announce_election("admin_address").unwrap();
        contract
            .register_user("admin_address", "user1", "identity_proof_hash", 20)
            .unwrap();
        contract
            .add_candidate(
                "admin_address",
                "Candidate 1",
                1,
                "Description",
                "https://example.com/proposal1",
            )
            .unwrap();
        contract.start_election("admin_address").unwrap();

        let (tx, rx) = mpsc::channel();
        thread::spawn(move || {
            let result = contract.register_voter("admin_address", "user1");
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

    // Register a user with enhanced Sybil resistance
    match contract.register_user("admin_address", "user1", "identity_proof_hash", 20) {
        Ok(_) => println!("User registered successfully"),
        Err(e) => println!("Error registering user: {}", e),
    }

    // Register the user as a voter
    match contract.register_voter("admin_address", "user1") {
        Ok(_) => println!("Voter registered successfully"),
        Err(e) => println!("Error registering voter: {}", e),
    }

    // Add a candidate with proposal URL
    match contract.add_candidate(
        "admin_address",
        "Candidate 1",
        1,
        "Description for Candidate 1",
        "https://example.com/proposal1",
    ) {
        Ok(_) => println!("Candidate added successfully"),
        Err(e) => println!("Error adding candidate: {}", e),
    }

    // Start the election
    match contract.start_election("admin_address") {
        Ok(_) => println!("Election started successfully"),
        Err(e) => println!("Error starting election: {}", e),
    }

    // Place a vote with quadratic voting
    match contract.place_vote("user1", 1) {
        Ok(_) => println!("Vote placed successfully"),
        Err(e) => println!("Error placing vote: {}", e),
    }

    // Propose a timelock action
    match contract.propose_timelock_action(
        "admin_address",
        "ChangeAdmin",
        "Change admin to new address",
        "new_admin_address",
    ) {
        Ok(_) => println!("Timelock action proposed successfully"),
        Err(e) => println!("Error proposing timelock action: {}", e),
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

    // Verify vote integrity
    match contract.verify_vote("user1") {
        Ok(true) => println!("Vote verified successfully"),
        Ok(false) => println!("Vote verification failed"),
        Err(e) => println!("Error verifying vote: {}", e),
    }
}
