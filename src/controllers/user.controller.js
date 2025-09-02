import { asynchandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Nonce } from "../models/nonce.model.js";
import { SiweMessage, generateNonce } from "siwe";
import { generateToken } from "../utils/tokenGenerator.js";
import { Organisation } from "../models/organisation.model.js";

const getNonce = asynchandler(async (req, res) => {
  const nonce = generateNonce();
  console.log(nonce);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration
  await Nonce.create({ nonce, expiresAt });
  res
    .status(200)
    .json(new ApiResponse(200, { nonce }, "nonce sent successfully"));
});

// only registered org admins not new admins
const verify = asynchandler(async (req, res) => {
  const { message, signature } = req.body;

  if ([message, signature].some((item) => item === "")) {
    throw new ApiError(400, "Message and signature are required");
  }

  const siweMessage = new SiweMessage(message);
  const result = await siweMessage.verify({ signature });

  console.log(result);

  const incomingNonce = result.data.nonce;
  const storedNonce = await Nonce.findOne({ nonce: incomingNonce });

  if (!storedNonce) {
    throw new ApiError(400, "Invalid nonce");
  }

  if (storedNonce.expiresAt < Date.now()) {
    throw new ApiError(400, "Nonce has expired");
  }

  if (storedNonce.nonce !== incomingNonce) {
    throw new ApiError(400, "Invalid nonce");
  }

  console.log("Looking for address:", result.data.address);
  
  const authorizedUser = await Organisation.findOne({ 
    adminAddress: result.data.address.toLowerCase() // Convert to lowercase
  });

  console.log("Found authorized user:", authorizedUser);

  if (!authorizedUser) {
    throw new ApiError(
      403,
      "Forbidden: This address is not registered as an organization admin."
    );
  }

  const token = generateToken({
    address: authorizedUser.walletAddress,
    contractAddress: authorizedUser.contractAddress,
  });

  await storedNonce.deleteOne(); // Remove the nonce after successful verification

  const options = {
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  };

  console.log(token);
  res
    .status(200)
    .cookie("token", token, options)
    .json(new ApiResponse(200, token, "User verified successfully"));
});

const justGetToken = asynchandler(async (req, res) => {
    const {address, contractAddress} = req.body;
  const token = generateToken({
    address,
    contractAddress,
  });

  const options = {
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  };

  console.log(token);
  res
    .status(200)
    .cookie("token", token, options)
    .json(new ApiResponse(200, token, "User verified successfully"));
});

const logout = asynchandler(async (req, res) => {
    res.clearCookie("token", {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
});

export { getNonce, verify, justGetToken, logout };
