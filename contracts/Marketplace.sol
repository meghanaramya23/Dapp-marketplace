// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Marketplace {
    struct Item {
        uint256 id;
        string name;
        uint256 price; // in wei
        address payable seller;
        bool sold;
    }
    
    address public owner;
    uint256 public itemCount;
    mapping(uint256 => Item) public items;
    
    event ItemListed(uint256 id, string name, uint256 price, address seller);
    event ItemSold(uint256 id, address buyer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function listItem(string memory _name, uint256 _price) public {
        require(_price > 0, "Price must be > 0");
        
        itemCount++;
        items[itemCount] = Item(itemCount, _name, _price, payable(msg.sender), false);
        emit ItemListed(itemCount, _name, _price, msg.sender);
    }
    
    function buyItem(uint256 _id) public payable {
        Item storage item = items[_id];
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        require(!item.sold, "Item already sold");
        require(msg.value == item.price, "Must send exact price");
        require(msg.sender != item.seller, "Seller cannot buy own item");
        
        item.sold = true;
        item.seller.transfer(msg.value);
        emit ItemSold(_id, msg.sender);
    }
    
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    function getItems() public view returns (Item[] memory) {
        Item[] memory availableItems = new Item[](itemCount);
        uint256 count = 0;
        for (uint256 i = 1; i <= itemCount; i++) {
            if (!items[i].sold) {
                availableItems[count] = items[i];
                count++;
            }
        }
        Item[] memory trimmed = new Item[](count);
        for (uint256 j = 0; j < count; j++) {
            trimmed[j] = availableItems[j];
        }
        return trimmed;
    }
}

