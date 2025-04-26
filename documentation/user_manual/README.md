# User Manual

This manual provides instructions for using the Chainocracy blockchain-based voting system, covering both the web application (for election committee members) and the mobile application (for voters).

## Table of Contents

1. [Committee Web Application](#committee-web-application)
   - [Logging In](#logging-in)
   - [Dashboard Overview](#dashboard-overview)
   - [Managing Elections](#managing-elections)
   - [Managing Candidates](#managing-candidates)
   - [Voter Verification](#voter-verification)
   - [Monitoring Elections](#monitoring-elections)
   - [Viewing Results](#viewing-results)
   - [Blockchain Explorer](#blockchain-explorer)

2. [Voter Mobile Application](#voter-mobile-application)
   - [Installation](#installation)
   - [Registration and Login](#registration-and-login)
   - [Viewing Active Elections](#viewing-active-elections)
   - [Candidate Information](#candidate-information)
   - [Casting Votes](#casting-votes)
   - [Vote Verification](#vote-verification)
   - [Viewing Results](#viewing-election-results)

## Committee Web Application

### Logging In

1. Open your web browser and navigate to the Chainocracy web application URL.
2. On the login screen, enter your committee member credentials:
   - Email address
   - Password
3. Click the "Login" button.
4. If two-factor authentication is enabled, you'll be prompted to enter the verification code from your authenticator app.

### Dashboard Overview

The dashboard provides an overview of the election system status:

- **Active Elections**: Shows currently running elections with real-time statistics
- **Upcoming Elections**: Displays scheduled elections that haven't started yet
- **Completed Elections**: Lists past elections with result summaries
- **System Status**: Indicates the health of the blockchain network and connected nodes
- **Recent Activity**: Shows recent actions taken by committee members

### Managing Elections

#### Creating a New Election

1. From the dashboard, click the "Elections" tab in the navigation menu.
2. Click the "Create New Election" button.
3. Fill in the election details:
   - Election title
   - Description
   - Start date and time
   - End date and time
   - Eligible voter criteria
4. Configure additional settings:
   - Result visibility (immediate or delayed)
   - Voter anonymity level
   - Verification requirements
5. Click "Save" to create the election.

#### Editing an Election

1. From the Elections list, find the election you want to edit.
2. Click the "Edit" button (pencil icon) next to the election.
3. Modify the election details as needed.
4. Click "Save" to update the election.

> Note: Some settings cannot be changed once an election has started.

#### Deleting an Election

1. From the Elections list, find the election you want to delete.
2. Click the "Delete" button (trash icon) next to the election.
3. Confirm the deletion in the popup dialog.

> Note: Elections can only be deleted if they haven't started yet.

### Managing Candidates

#### Adding Candidates

1. From the Elections list, select an election.
2. Click the "Candidates" tab.
3. Click the "Add Candidate" button.
4. Fill in the candidate details:
   - Name
   - Position/Party
   - Biography
   - Upload a photo (optional)
5. Click "Save" to add the candidate.

#### Editing Candidates

1. From the Candidates list, find the candidate you want to edit.
2. Click the "Edit" button next to the candidate.
3. Modify the candidate details as needed.
4. Click "Save" to update the candidate information.

#### Removing Candidates

1. From the Candidates list, find the candidate you want to remove.
2. Click the "Remove" button next to the candidate.
3. Confirm the removal in the popup dialog.

> Note: Candidates can only be removed before an election has started.

### Voter Verification

#### Managing Voter Lists

1. From the Elections list, select an election.
2. Click the "Voters" tab.
3. To add voters individually:
   - Click "Add Voter"
   - Enter the voter's details
   - Click "Save"
4. To import voters in bulk:
   - Click "Import Voters"
   - Upload a CSV file with voter information
   - Map the columns to the required fields
   - Click "Import"

#### Verifying Voter Identities

1. From the Voters list, you can see all registered voters and their verification status.
2. Click on a voter to view their details.
3. Review the submitted verification documents.
4. Click "Approve" or "Reject" based on your verification.
5. If rejecting, provide a reason that will be sent to the voter.

### Monitoring Elections

#### Real-time Statistics

The election monitoring page provides real-time statistics:

- Total eligible voters
- Number of votes cast
- Current turnout percentage
- Voting rate (votes per hour)
- Geographic distribution of voters

#### Activity Logs

The activity log shows all significant events related to the election:

- Voter registrations
- Authentication attempts
- Votes cast (anonymous)
- System events

### Viewing Results

#### Results Dashboard

Once an election has ended (or if real-time results are enabled):

1. From the Elections list, select an election.
2. Click the "Results" tab.
3. View the comprehensive results dashboard:
   - Winner(s) highlighted
   - Vote counts and percentages
   - Graphical representations
   - Turnout statistics

#### Exporting Results

1. From the Results dashboard, click "Export Results".
2. Select the export format (PDF, CSV, Excel).
3. Choose what data to include in the export.
4. Click "Generate Export" to download the file.

### Blockchain Explorer

The Blockchain Explorer allows you to verify the integrity of the election:

1. From the main navigation, click "Blockchain Explorer".
2. Browse the blockchain blocks chronologically.
3. Click on a block to view its details:
   - Block hash
   - Previous block hash
   - Timestamp
   - Transactions (votes)
   - Proof of work
4. Search for specific transactions using the search function.

## Voter Mobile Application

### Installation

1. Download the Chainocracy Voter App from:
   - Apple App Store (iOS)
   - Google Play Store (Android)
2. Install the application on your device.
3. Open the application.

### Registration and Login

#### Creating a New Account

1. On the welcome screen, tap "Register".
2. Enter your personal information:
   - Full name
   - Email address
   - Phone number
   - Create a password
3. Verify your email address by entering the code sent to your email.
4. Complete the identity verification process:
   - Take a photo of your ID document
   - Take a selfie for facial verification
5. Submit your registration for approval.

#### Logging In

1. On the welcome screen, tap "Login".
2. Enter your credentials:
   - Email address
   - Password
3. Tap "Login".
4. If two-factor authentication is enabled, enter the verification code.

### Viewing Active Elections

1. After logging in, you'll see the home screen with available elections.
2. Elections are categorized as:
   - Active (currently open for voting)
   - Upcoming (scheduled but not yet started)
   - Past (completed elections)
3. Tap on an election to view its details.

### Candidate Information

1. From the election details screen, tap "View Candidates".
2. Browse the list of candidates.
3. Tap on a candidate to view their detailed profile:
   - Biography
   - Position statements
   - Photo
   - Additional information

### Casting Votes

1. From the election details screen, tap "Cast Vote".
2. Review the voting instructions.
3. Browse through the candidates.
4. Select your chosen candidate(s) by tapping the checkbox or radio button.
5. Review your selection.
6. Tap "Submit Vote" to cast your vote.
7. Confirm your selection in the popup dialog.
8. Enter your password to authenticate the vote.

### Vote Verification

After casting your vote:

1. You'll receive a confirmation screen with a unique vote ID.
2. Tap "Verify Vote" to check that your vote was recorded correctly.
3. The app will display the blockchain transaction details.
4. You can also scan the QR code at a verification station if available.

### Viewing Election Results

1. From the home screen, select a completed election.
2. Tap "View Results".
3. Browse the comprehensive results:
   - Winner(s) highlighted
   - Vote counts and percentages
   - Turnout statistics
   - Graphical representations

## Additional Help

If you encounter any issues while using the Chainocracy system:

- **Committee Members**: Contact the system administrator or refer to the technical documentation.
- **Voters**: Use the "Help" section in the mobile app or contact the election support team through the provided contact information.
