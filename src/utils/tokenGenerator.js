import jsonwebtoken from "jsonwebtoken";

const generateToken = (user) => {
    const {address,contractAddress} = user;
    const token = jsonwebtoken.sign({ address, contractAddress }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRY
    });
    return token;
};

export { generateToken };
