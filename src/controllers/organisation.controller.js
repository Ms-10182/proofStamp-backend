import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Organisation } from "../models/organisation.model.js";

//public apis
const getOrgList = asynchandler(async (req, res) => {
  const { input } = req.query;

  const results = await Organisation.find({
    organisationName: { $regex: input, $options: "i" },
  });

  res
    .status(200)
    .json(
      new ApiResponse("Organisations retrieved successfully", 200, results)
    );
});

const getOrgByRegNo = asynchandler(async (req, res) => {
  const { regNo } = req.params;

  const organisation = await Organisation.findOne({ orgRegId: regNo });

  if (!organisation) {
    throw new ApiError("Organisation not found", 404);
  }

  res.status(200).json(
    new ApiResponse(
      "Organisation retrieved successfully",
      200,
      organisation
    )
  );
});


const getMyOrganisation = asynchandler(async (req, res) => {
  const adminAddress = req.user.address;
  const organisation = await Organisation.findOne({ adminAddress });

  if (!organisation) {
    throw new ApiError(404, "Organisation not found for this admin.");
  }

  res.status(200).json(new ApiResponse(200, organisation, "Organisation details retrieved successfully"));
});

const getOrganisationById = asynchandler(async (req, res) => {
  const { id } = req.params;
  const organisation = await Organisation.findById(id);

  if (!organisation) {
    throw new ApiError(404, "Organisation not found");
  }

  res.status(200).json(new ApiResponse(200, organisation, "Organisation retrieved successfully"));
});

const createOrg = asynchandler(async (req, res) => {

  const { adminAddress, organisationName, orgRegId, contractAddress } = req.body;

  if (!adminAddress || !organisationName || !orgRegId || !contractAddress) {
    throw new ApiError("All fields are required", 400);
  }

  const organisation = await Organisation.create({
    adminAddress,
    organisationName,
    orgRegId,
    contractAddress,
  });

  res.status(200).json(new ApiResponse(
    "Organisation created successfully",
    201,
    organisation
  ));
});

export { createOrg, getOrgList, getOrgByRegNo, getMyOrganisation, getOrganisationById };
