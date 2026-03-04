// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
 * YourVoice
 * ----------------------------------------
 * Survivors register using their wallet address.
 * They can create multiple case files.
 * Evidence is stored off-chain (IPFS), while the IPFS hash is stored on-chain.
 * Survivors grant access to responsible organizations.
 * Organizations can update case status.
 * All actions are immutable and auditable.
 */

contract GBVCaseRegistry {

    // -------------------------------------------------
    // ENUMS
    // -------------------------------------------------

    enum CaseStatus {
        Created,
        UnderReview,
        InvestigationOngoing,
        Resolved,
        Closed
    }

    // -------------------------------------------------
    // STRUCTS
    // -------------------------------------------------

    struct User {
        bool isRegistered;
        uint256[] caseIds;
    }

    struct CaseFile {
        uint256 caseId;
        address survivor;
        string ipfsHash;      // Evidence stored off-chain
        CaseStatus status;
        uint256 createdAt;
        bool exists;
    }

    // -------------------------------------------------
    // STATE VARIABLES
    // -------------------------------------------------

    uint256 public caseCounter;

    // Registered users
    mapping(address => User) public users;

    // caseId => CaseFile
    mapping(uint256 => CaseFile) public cases;

    // caseId => organization => access
    mapping(uint256 => mapping(address => bool)) private accessPermissions;

    // Approved organizations
    mapping(address => bool) public approvedOrganizations;

    // Contract deployer (admin)
    address public admin;

    // -------------------------------------------------
    // EVENTS (Used by Frontend for Notifications)
    // -------------------------------------------------

    event UserRegistered(address indexed survivor);

    event CaseCreated(
        uint256 indexed caseId,
        address indexed survivor,
        string ipfsHash,
        uint256 timestamp
    );

    event AccessGranted(
        uint256 indexed caseId,
        address indexed survivor,
        address indexed organization
    );

    event AccessRevoked(
        uint256 indexed caseId,
        address indexed survivor,
        address indexed organization
    );

    event CaseStatusUpdated(
        uint256 indexed caseId,
        CaseStatus oldStatus,
        CaseStatus newStatus,
        address indexed updatedBy
    );

    // -------------------------------------------------
    // MODIFIERS
    // -------------------------------------------------

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "Not registered");
        _;
    }

    modifier caseExists(uint256 _caseId) {
        require(cases[_caseId].exists, "Case does not exist");
        _;
    }

    modifier onlyCaseOwner(uint256 _caseId) {
        require(cases[_caseId].survivor == msg.sender, "Not case owner");
        _;
    }

    modifier onlyAuthorized(uint256 _caseId) {
        require(
            msg.sender == cases[_caseId].survivor ||
            accessPermissions[_caseId][msg.sender],
            "Not authorized"
        );
        _;
    }

    modifier onlyApprovedOrg() {
        require(approvedOrganizations[msg.sender], "Not approved organization");
        _;
    }

    // -------------------------------------------------
    // CONSTRUCTOR
    // -------------------------------------------------

    constructor() {
        admin = msg.sender;
    }

    // -------------------------------------------------
    // USER REGISTRATION
    // -------------------------------------------------

    function registerUser() external {
        require(!users[msg.sender].isRegistered, "Already registered");

        users[msg.sender].isRegistered = true;

        emit UserRegistered(msg.sender);
    }

    // -------------------------------------------------
    // ADMIN: APPROVE ORGANIZATIONS
    // -------------------------------------------------

    function approveOrganization(address _org) external onlyAdmin {
        approvedOrganizations[_org] = true;
    }

    function removeOrganization(address _org) external onlyAdmin {
        approvedOrganizations[_org] = false;
    }

    // -------------------------------------------------
    // CASE CREATION (IPFS HASH STORED ON-CHAIN)
    // -------------------------------------------------

    function createCase(string calldata _ipfsHash)
        external
        onlyRegistered
        returns (uint256 caseId)
    {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");

        caseCounter++;
        caseId = caseCounter;

        cases[caseId] = CaseFile({
            caseId: caseId,
            survivor: msg.sender,
            ipfsHash: _ipfsHash,
            status: CaseStatus.Created,
            createdAt: block.timestamp,
            exists: true
        });

        users[msg.sender].caseIds.push(caseId);

        emit CaseCreated(caseId, msg.sender, _ipfsHash, block.timestamp);
    }

    // -------------------------------------------------
    // ACCESS CONTROL
    // -------------------------------------------------

    function grantAccess(uint256 _caseId, address _organization)
        external
        caseExists(_caseId)
        onlyCaseOwner(_caseId)
    {
        require(approvedOrganizations[_organization], "Organization not approved");

        accessPermissions[_caseId][_organization] = true;

        emit AccessGranted(_caseId, msg.sender, _organization);
    }

    function revokeAccess(uint256 _caseId, address _organization)
        external
        caseExists(_caseId)
        onlyCaseOwner(_caseId)
    {
        accessPermissions[_caseId][_organization] = false;

        emit AccessRevoked(_caseId, msg.sender, _organization);
    }

    function hasAccess(uint256 _caseId, address _user)
        external
        view
        caseExists(_caseId)
        returns (bool)
    {
        if (_user == cases[_caseId].survivor) {
            return true;
        }
        return accessPermissions[_caseId][_user];
    }

    // -------------------------------------------------
    // ORGANIZATION UPDATES CASE STATUS
    // -------------------------------------------------

    function updateCaseStatus(uint256 _caseId, CaseStatus _newStatus)
        external
        caseExists(_caseId)
        onlyApprovedOrg
        onlyAuthorized(_caseId)
    {
        CaseStatus oldStatus = cases[_caseId].status;
        cases[_caseId].status = _newStatus;

        emit CaseStatusUpdated(
            _caseId,
            oldStatus,
            _newStatus,
            msg.sender
        );
    }

    // -------------------------------------------------
    // VIEW FUNCTIONS
    // -------------------------------------------------

    function getCase(uint256 _caseId)
        external
        view
        caseExists(_caseId)
        onlyAuthorized(_caseId)
        returns (
            address survivor,
            string memory ipfsHash,
            CaseStatus status,
            uint256 createdAt
        )
    {
        CaseFile memory c = cases[_caseId];

        return (
            c.survivor,
            c.ipfsHash,
            c.status,
            c.createdAt
        );
    }

    function getMyCases()
        external
        view
        onlyRegistered
        returns (uint256[] memory)
    {
        return users[msg.sender].caseIds;
    }
}
