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
        throw new Error('Please add webhook secret in env file')
    }

    const headerPayload = req.headers;
    const svix_id = headerPayload["svix-id"];
    const svix_signature = headerPayload["svix-signature"];
    const svix_timestamp = headerPayload["svix-timestamp"];

    if(!svix_id || !svix_signature || ! svix_timestamp){
        return res.status(400).json(new APIError(400,"SVIX-Headers required",[],null));
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
          return res.status(400).json(new APIError(400, "Invalid request", [], "Invalid request"));
      }
      console.log(evt);

      const clerkId = dummyData.data.id;

      // const email = req.body.email;
      // const gender = req.body.gender;
      // const preferGenres = req.body.preferGenres;
      // const age = req.body.age;
      // const savedQuotes = req.body.savedQuotes;

      const gender = evt.data.unsafe_metadata.gender;
      const preferGenres = evt.data.unsafe_metadata.preferGenres;
      const age = evt.data.unsafe_metadata.age;
      const savedQuotes = evt.data.unsafe_metadata.savedQuotes;

      const user = User.findOne({
        clerkId : clerkId
      })

      if(!user){
        return res.status.json(new APIError(401,"Unauthorized"));
      }

      if(gender){
        user.gender = gender;
        await user.save();
      }

      if(savedQuotes){
        user.savedQuotes = savedQuotes;
        await user.save();
      }

      if(user.age){
        user.age = age;
        await user.save();
      }
      if(user.preferGenres){
        user.preferGenres = preferGenres;
        await user.save();
      }


      return res.status(201).json(new APIResponse(201,user,"User Updated successfully"))


      
    }catch(err){
        console.log("Error : ", err);
        return res.status(500).json(new APIError(500,"Internal Server Error",err,[]));
    }
}

module.exports = updateUserController;