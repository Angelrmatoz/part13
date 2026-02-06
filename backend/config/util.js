require('dotenv').config()

module.exports = {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_NAME: process.env.DATABASE_NAME,
    PORT: process.env.PORT || 3001,
    JWT_SECRET: process.env.JWT_SECRET || 'dad631a9083166e4457afb22c16d6922a2309c6056246548dbeea14cc85bfac931b223d760a9f16329f02e465922c41a8c8b6433b4503e9fa537a2872bf4670e'
}