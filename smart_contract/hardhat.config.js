require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: '0.8.0',
  networks: {
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/g7QgJJh-mkfzhoAIEQwxtFR4xNXNkHoH',
      accounts: [
        '3a29b958fb34327177c388028252d4b3545936fb39ee37030f273fb1401b4edc',
      ],
    },
  },
}