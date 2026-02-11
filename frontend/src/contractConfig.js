export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  "function listItem(string _name, uint256 _price) public",
  "function buyItem(uint256 _id) public payable",
  "function withdraw() public",
  "function getItems() public view returns (tuple(uint256 id,string name,uint256 price,address seller,bool sold)[])",
  "function itemCount() public view returns (uint256)"
];
