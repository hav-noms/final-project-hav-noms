
pragma solidity ^0.5.0;

import "./State.sol";

/**
 * @title Owner functions to set the Associated Contract of the state that we store. 
 * @notice  This contract is based on the code available from this blog
 * https://blog.colony.io/writing-upgradeable-contracts-in-solidity-6743f0eecc88/
 * Implements support for storing a sha3 key and value pairs. It is the more flexible 
 * and extensible option. This ensures data schema changes can be implemented without 
 * requiring upgrades to the storage contract.
 */
contract EternalStorage is State {

    constructor() public {
    }

    mapping(bytes32 => uint) public UIntStorage;

    function getUIntValue(bytes32 record) external view returns (uint){
        return UIntStorage[record];
    }

    function setUIntValue(bytes32 record, uint value) external
    onlyAssociatedContract
    {
        UIntStorage[record] = value;
    }

    function deleteUIntValue(bytes32 record) external
    onlyAssociatedContract
    {
        delete UIntStorage[record];
    }

    mapping(bytes32 => string) StringStorage;

    function getStringValue(bytes32 record) external view returns (string memory){
        return StringStorage[record];
    }

    function setStringValue(bytes32 record, string calldata value) external
    onlyAssociatedContract
    {
        StringStorage[record] = value;
    }

    function deleteStringValue(bytes32 record) external
    onlyAssociatedContract
    {
        delete StringStorage[record];
    }

    mapping(bytes32 => address) AddressStorage;

    function getAddressValue(bytes32 record) external view returns (address){
        return AddressStorage[record];
    }

    function setAddressValue(bytes32 record, address value) external
    onlyAssociatedContract
    {
        AddressStorage[record] = value;
    }

    function deleteAddressValue(bytes32 record) external
    onlyAssociatedContract
    {
        delete AddressStorage[record];
    }

    mapping(bytes32 => bytes) BytesStorage;

    function getBytesValue(bytes32 record) external view returns (bytes memory){
        return BytesStorage[record];
    }

    function setBytesValue(bytes32 record, bytes calldata value) external
    onlyAssociatedContract
    {
        BytesStorage[record] = value;
    }

    function deleteBytesValue(bytes32 record) external
    onlyAssociatedContract
    {
        delete BytesStorage[record];
    }

    mapping(bytes32 => bytes32) Bytes32Storage;

    function getBytes32Value(bytes32 record) external view returns (bytes32){
        return Bytes32Storage[record];
    }

    function setBytes32Value(bytes32 record, bytes32 value) external
    onlyAssociatedContract
    {
        Bytes32Storage[record] = value;
    }

    function deleteBytes32Value(bytes32 record) external
    onlyAssociatedContract
    {
        delete Bytes32Storage[record];
    }

    mapping(bytes32 => bool) BooleanStorage;

    function getBooleanValue(bytes32 record) external view returns (bool){
        return BooleanStorage[record];
    }

    function setBooleanValue(bytes32 record, bool value) external
    onlyAssociatedContract
    {
        BooleanStorage[record] = value;
    }

    function deleteBooleanValue(bytes32 record) external
    onlyAssociatedContract
    {
        delete BooleanStorage[record];
    }

    mapping(bytes32 => int) IntStorage;

    function getIntValue(bytes32 record) external view returns (int){
        return IntStorage[record];
    }

    function setIntValue(bytes32 record, int value) external
    onlyAssociatedContract
    {
        IntStorage[record] = value;
    }

    function deleteIntValue(bytes32 record) external
    onlyAssociatedContract
    {
        delete IntStorage[record];
    }
}