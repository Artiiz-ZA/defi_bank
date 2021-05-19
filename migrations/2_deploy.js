const Token = artifacts.require("Token");
const bankOfArtiiz = artifacts.require("bankOfArtiiz");

module.exports = async function (deployer) {
  //deploy Token
  await deployer.deploy(Token);

  //assign token into variable to get it's address
  const token = await Token.deployed();

  //pass token address for bankOfArtiiz contract(for future minting)
  await deployer.deploy(bankOfArtiiz, token.address);

  //assign bankOfArtiiz contract into variable to get it's address
  const activeBank = await bankOfArtiiz.deployed();

  //change token's owner/minter from deployer to bankOfArtiiz
  await token.changeMinterAddress(activeBank.address);
};
