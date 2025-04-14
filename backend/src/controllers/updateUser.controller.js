const { Webhook } = require("svix");
const User = require("../models/User");
const APIError = require("../Response/APIError");
const APIResponse = require("../Response/APISuccess");
const dotenv = require('dotenv')
dotenv.config();

const dummyData = {
    "data": {
      "backup_code_enabled": false,
      "banned": false,
      "create_organization_enabled": true,
      "created_at": 1744276393608,
      "delete_self_enabled": true,
      "email_addresses": [
        {
          "created_at": 1744276372355,
          "email_address": "arjav1528@gmail.com",
          "id": "idn_2vX0zQSkP1QJLcwpcWMxR30cnez",
          "linked_to": [],
          "matches_sso_connection": false,
          "object": "email_address",
          "reserved": false,
          "updated_at": 1744276393612,
          "verification": {
            "attempts": 1,
            "expire_at": 1744276972975,
            "status": "verified",
            "strategy": "email_code"
          }
        }
      ],
      "enterprise_accounts": [],
      "external_accounts": [],
      "external_id": null,
      "first_name": null,
      "has_image": false,
      "id": "user_2vX11zP5ojq7cTRY58xT6oJqmRG",
      "image_url": "https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18ydlUzZkJoeDQ3eWVkZHFLaGQ1dGFUYlVZSUQiLCJyaWQiOiJ1c2VyXzJ2WDExelA1b2pxN2NUUlk1OHhUNm9KcW1SRyJ9",
      "last_active_at": 1744276393607,
      "last_name": null,
      "last_sign_in_at": null,
      "legal_accepted_at": null,
      "locked": false,
      "lockout_expires_in_seconds": null,
      "mfa_disabled_at": null,
      "mfa_enabled_at": null,
      "object": "user",
      "passkeys": [],
      "password_enabled": true,
      "phone_numbers": [],
      "primary_email_address_id": "idn_2vX0zQSkP1QJLcwpcWMxR30cnez",
      "primary_phone_number_id": null,
      "primary_web3_wallet_id": null,
      "private_metadata": {},
      "profile_image_url": "https://www.gravatar.com/avatar?d=mp",
      "public_metadata": {},
      "saml_accounts": [],
      "totp_enabled": false,
      "two_factor_enabled": false,
      "unsafe_metadata": {},
      "updated_at": 1744276393626,
      "username": null,
      "verification_attempts_remaining": 100,
      "web3_wallets": []
    },
    "event_attributes": {
      "http_request": {
        "client_ip": "103.225.100.51",
        "user_agent": "okhttp/4.12.0"
      }
    },
    "instance_id": "ins_2vU3fBhx47yeddqKhd5taTbUYID",
    "object": "event",
    "timestamp": 1744276393644,
    "type": "user.created"
  }


  const updateUserController = async (req,res) => {
    const UPDATE_USER_WEBHOOK = process.env.UPDATE_USER_WEBHOOK;
    if(!UPDATE_USER_WEBHOOK){
        throw new Error('Webhook secret is missing in environment configuration');
    }

    const headerPayload = req.headers;
    const svix_id = headerPayload["svix-id"];
    const svix_signature = headerPayload["svix-signature"];
    const svix_timestamp = headerPayload["svix-timestamp"];

    if(!svix_id || !svix_signature || !svix_timestamp){
        return res.status(400).json(new APIError(
            400,
            "Missing required webhook headers",
            ["One or more required Svix headers are missing"],
            "Please ensure all required webhook headers (svix-id, svix-signature, svix-timestamp) are included"
        ));
    }

    const payload = req.body;

    const body = JSON.stringify(payload);
    
    const wh = new Webhook(UPDATE_USER_WEBHOOK);

    let evt;

    try{
      evt = wh.verify(body, {
          "svix-id": svix_id,
          "svix-signature": svix_signature,
          "svix-timestamp": svix_timestamp
      }, {
          tolerance: 3600 // Add time tolerance to fix previous error
      })    
      if(!evt) {
          return res.status(400).json(new APIError(
              400, 
              "Invalid webhook payload", 
              ["The webhook signature verification failed"], 
              "The request could not be verified as coming from the expected webhook source"
          ));
      }

      const clerkId = evt.data.id;
      const unsafeMetadata = evt.data.unsafe_metadata || {}; // Add fallback to empty object
      const gender = unsafeMetadata.gender;
      const preferGenres = unsafeMetadata.preferGenres;
      const age = unsafeMetadata.age;
      const savedQuotes = unsafeMetadata.savedQuotes;

      if(!clerkId){
        return res.status(400).json(new APIError(
            400,
            "Missing user identifier",
            ["clerkId is required"],
            "A valid user identifier is required to process this request"
        ));
      }

      const existingUser = await User.findOne({ clerkId: clerkId });
      if(!existingUser){
        return res.status(404).json(new APIError(
            404,
            "User not found",
            [`No user exists with clerkId: ${clerkId}`],
            "The specified user could not be found in our database"
        ));
      }

      console.log(existingUser);
      console.log("User ID: ", existingUser._id);
      console.log("User ID: ", existingUser.clerkId);
      console.log("User ID: ", existingUser.email);

      
      const user = existingUser;

      if(!user){
        return res.status(401).json(new APIError(
            401,
            "Authentication failed",
            ["User authentication required"],
            "You need to be authenticated to perform this operation"
        ));
      }

      if(gender !== null || gender !== undefined){

        user.gender = gender

        console.log(`Gender is defined: ${gender}`);
      }

      if(preferGenres !== null || preferGenres !== undefined){
        user.preferGenres = preferGenres

        console.log(`Prefer Genres is defined: ${preferGenres}`);
      }
      if(age !== null || age !== undefined){
        user.age = age

        console.log(`Age is defined: ${age}`);
      }
      if(savedQuotes !== null || savedQuotes !== undefined){
        user.savedQuotes = savedQuotes

        console.log(`Saved Quotes is defined: ${savedQuotes}`);
      }
      user.updatedAt = new Date();
      await user.save();
      console.log("User updated successfully");
      console.log(user);
      console.log("User ID: ", user._id);

      console.log("Success")


      return res.status(201).json(new APIResponse(201,user,"User Updated successfully"))

    } catch(err){
        console.log("Error : ", err);
        return res.status(500).json(new APIError(
            500,
            "Server error",
            [err.message || "Unknown error occurred"],
            "An unexpected error occurred while processing your request. Please try again later."
        ));
    }
}

module.exports = updateUserController;