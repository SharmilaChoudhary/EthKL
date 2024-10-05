from dotenv import load_dotenv

load_dotenv()

from flask import Flask
from flask_restful import Api
from mongo_engine import db
from flask_cors import CORS
import os
import json
from flask import Flask, jsonify, redirect, request, session
from requests_oauthlib import OAuth1, OAuth1Session
import time
import uuid
import hmac
import tweepy
import hashlib
import urllib.parse
import requests

from resources.company import Company
from models.user import User

# from resources.user import User
from resources.campaign import (
    Campaign,
    AddParticipantToCampaign,
    GetCampaignParticipants,
)
from resources.task import Task
from resources.scheduler import Scheduler

# from resources.insta_post import Posts
# from resources.cloudinary import Cloudinary
# from resources.retrieve_likes import  RetrieveLike
# from resources.hastag_generation import  Hashtags
# from resources.hastag_generation import  Caption


app = Flask(__name__)
api = Api(app)
CORS(app)

app.config["MONGODB_HOST"] = os.getenv("FLASK_MONGODB_URI")
db.init_app(app)

api.add_resource(Company, "/company")
# api.add_resource(User, '/user')
api.add_resource(Campaign, "/campaign")
api.add_resource(AddParticipantToCampaign, "/campaign/add_participant")
# api.add_resource(Posts,'/posts')
# api.add_resource(Cloudinary, "/cloudinary")
# api.add_resource(RetrieveLike, "/retrieve_likes")
# api.add_resource(Hashtags, "/hashtag")
# api.add_resource(Caption, "/caption")
api.add_resource(Task, "/task")
api.add_resource(Scheduler, "/schedule_funds_distribution")
api.add_resource(GetCampaignParticipants, "/campaign/participants")


@app.route("/fetch-oembed", methods=["GET"])
def fetch_oembed():
    # Get the URL from query parameters
    tweet_url = request.args.get("url")

    if not tweet_url:
        return jsonify({"error": "URL parameter is missing"}), 400

    # Construct the oEmbed URL
    oembed_url = f"https://publish.twitter.com/oembed?url={tweet_url}"

    try:
        # Make the GET request
        response = requests.get(oembed_url)

        # Check if the request was successful
        if response.status_code == 200:
            # Return the JSON response
            return jsonify(response.json())
        else:
            # Return an error message if the request was not successful
            return (
                jsonify(
                    {
                        "error": f"Request returned an error: {response.status_code} {response.text}"
                    }
                ),
                response.status_code,
            )
    except Exception as e:
        # Return a general error message if an exception occurs
        return jsonify({"error": str(e)}), 500


@app.route("/testcronjob")
def testcronjob():
    return "Cron job is working"


app.secret_key = os.urandom(24)

# Twitter API credentials
APTOS_CONSUMER_KEY = os.getenv("APTOS_CONSUMER_KEY")
APTOS_CONSUMER_SECRET = os.getenv("APTOS_CONSUMER_SECRET")
REQUEST_TOKEN_URL = "https://api.twitter.com/oauth/request_token"
AUTHENTICATE_URL = "https://api.twitter.com/oauth/authenticate"
ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token"
MEDIA_UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json"
TWEET_CREATE_URL = "https://api.twitter.com/1.1/statuses/update.json"
RETWEET_URL = "https://api.twitter.com/2/tweets/:id/retweets"
QUOTE_TWEET_URL_TEMPLATE = "https://api.twitter.com/2/tweets/{}/quote_tweets"


@app.route("/login")
def login():
    wallet_address = request.args.get("wallet_address")
    if not wallet_address:
        return "Error: Wallet address is required."

    oauth = OAuth1Session(APTOS_CONSUMER_KEY, client_secret=APTOS_CONSUMER_SECRET)
    try:
        fetch_response = oauth.fetch_request_token(REQUEST_TOKEN_URL)
    except ValueError:
        return "There was an error obtaining the request token from Twitter."

    # check mongodb for user by wallet address if not exist create new, if exist update oauth token and secret
    response = User.get_user_by_wallet_address(wallet_address)
    user = response.get("data")
    if user:
        user.update(
            oauth_token=fetch_response.get("oauth_token"),
            oauth_token_secret=fetch_response.get("oauth_token_secret"),
        )
    else:
        user_data = {
            "wallet_address": wallet_address,
            "oauth_token": fetch_response.get("oauth_token"),
            "oauth_token_secret": fetch_response.get("oauth_token_secret"),
        }
        result = User.add_user(user_data)
        if result["error"]:
            return f"Error creating user: {result['message']}"

    authorization_url = oauth.authorization_url(AUTHENTICATE_URL)
    return redirect(authorization_url)


@app.route("/callback")
def callback():
    oauth_token = request.args.get("oauth_token")
    oauth_verifier = request.args.get("oauth_verifier")

    if not oauth_token or not oauth_verifier:
        return "Error: Missing oauth_token or oauth_verifier."

    response = User.update_user_by_oauth(
        oauth_token=oauth_token, args={"oauth_verifier": oauth_verifier}
    )
    if response["error"]:
        return f"Error updating user: {response['message']}"

    user = json.loads(response.get("data"))

    oauth = OAuth1Session(
        APTOS_CONSUMER_KEY,
        client_secret=APTOS_CONSUMER_SECRET,
        resource_owner_key=oauth_token,
        resource_owner_secret=user["oauth_token_secret"],
    )

    try:
        oauth_response = oauth.fetch_access_token(
            ACCESS_TOKEN_URL, verifier=oauth_verifier
        )
        response = User.update_user_by_oauth(
            oauth_token=oauth_token,
            args={
                "oauth_token": oauth_response["oauth_token"],
                "oauth_token_secret": oauth_response["oauth_token_secret"],
            },
        )
        if response["error"]:
            return f"Error updating user: {response['message']}"
        print(oauth_response)
    except ValueError as e:
        return f"Error fetching access token: {str(e)}"

    return redirect("success")


@app.route("/success")
def successLogin():
    return redirect("http://localhost:3000/onboarding/user")


@app.route("/twitter_status")
def twitter_status():
    print("request received")
    wallet_address = request.args.get("wallet_address")
    if not wallet_address:
        return "Error: Wallet address is required."

    response = User.get_user_by_wallet_address(wallet_address)
    if response["error"]:
        return f"Error getting user: {response['message']}"

    user = response.get("data")
    if user and user["oauth_token"] and user["oauth_token_secret"]:
        print("User is authenticated")
        return {"status": True}
    else:
        print("User is not authenticated")
        return {"status": False}


def generate_oauth_signature(method, url, params):
    """Generate OAuth 1.0a signature."""
    # Create signature base string
    sorted_params = sorted(params.items())
    encoded_params = urllib.parse.urlencode(sorted_params, quote_via=urllib.parse.quote)
    base_string = "&".join(
        [
            method.upper(),
            urllib.parse.quote(url, safe=""),
            urllib.parse.quote(encoded_params, safe=""),
        ]
    )

    # Create signing key
    signing_key = "&".join(
        [
            urllib.parse.quote(APTOS_CONSUMER_SECRET, safe=""),
            urllib.parse.quote(session.get("access_token_secret"), safe=""),
        ]
    )

    # Generate the signature
    hashed = hmac.new(
        signing_key.encode("utf-8"), base_string.encode("utf-8"), hashlib.sha1
    )
    signature = hashed.digest().hex()

    print(f"Base String: {base_string}")
    print(f"Signing Key: {signing_key}")
    print(f"Signature: {signature}")

    return urllib.parse.quote(signature, safe="")


def build_auth_header(oauth_params):
    return "OAuth " + ", ".join(
        [f'{key}="{value}"' for key, value in sorted(oauth_params.items())]
    )


# import logging

# @app.route("/tweet")
# def tweet():
#     access_token = os.getenv("APTOS_ACCESS_TOKEN")
#     access_token_secret = os.getenv("APTOS_ACCESS_TOKEN_SECRET")

#     if not access_token or not access_token_secret:
#         return "Missing OAuth tokens in environment variables", 500

#     logging.info("APTOS_ACCESS_TOKEN: %s", access_token)
#     logging.info("APTOS_ACCESS_TOKEN_SECRET: %s", access_token_secret)
#     logging.info("APTOS_CONSUMER_KEY: %s", APTOS_CONSUMER_KEY)
#     logging.info("APTOS_CONSUMER_SECRET: %s", APTOS_CONSUMER_SECRET)

#     oauth = OAuth1Session(
#         client_key=APTOS_CONSUMER_KEY,
#         client_secret=APTOS_CONSUMER_SECRET,
#         resource_owner_key=access_token,
#         resource_owner_secret=access_token_secret,
#     )

#     payload = {"text": "Hello Jhenil Here"}
#     response = oauth.post("https://api.twitter.com/2/tweets", json=payload)

#     logging.info("Request URL: %s", response.request.url)
#     logging.info("Request Headers: %s", response.request.headers)
#     logging.info("Request Body: %s", response.request.body)

#     if response.status_code != 201:
#         logging.error("Request returned an error: %s %s", response.status_code, response.text)
#         raise Exception(
#             "Request returned an error: {} {}".format(response.status_code, response.text)
#         )

#     json_response = response.json()
#     logging.info("Response JSON: %s", json.dumps(json_response, indent=4, sort_keys=True))

#     return "Tweet posted successfully", 201


# BEARER_TOKEN = os.getenv("APTOS_BEARER_TOKEN")
# CONSUMER_KEY = os.getenv("APTOS_CONSUMER_KEY")
# CONSUMER_SECRET = os.getenv("APTOS_CONSUMER_SECRET")
# ACCESS_TOKEN = os.getenv("APTOS_ACCESS_TOKEN")
# ACCESS_TOKEN_SECRET = os.getenv("APTOS_ACCESS_TOKEN_SECRET")

# if not all([BEARER_TOKEN, CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET]):
#     raise ValueError("One or more authentication credentials are missing")

# # Create a Tweepy client for OAuth 1.0a user context actions
# client = tweepy.Client(
#     bearer_token=BEARER_TOKEN,
#     consumer_key=CONSUMER_KEY,
#     consumer_secret=CONSUMER_SECRET,
#     access_token=ACCESS_TOKEN,
#     access_token_secret=ACCESS_TOKEN_SECRET,
# )


@app.route("/tweet", methods=["POST"])
def tweet():
    data = request.json
    tweet_text = data.get("tweet_text", "")
    wallet_address = data.get("wallet_address", "")

    try:
        # Retrieve user info based on wallet address
        response = User.get_user_by_wallet_address(wallet_address)
        user = response.get("data")

        if user:
            print(user["oauth_token"])
            print(user["oauth_token_secret"])

            payload = {"text": tweet_text}
            oauth = OAuth1Session(
                APTOS_CONSUMER_KEY,
                client_secret=APTOS_CONSUMER_SECRET,
                resource_owner_key=user["oauth_token"],
                resource_owner_secret=user["oauth_token_secret"],
            )

            # Making the request
            twitter_response = oauth.post(
                "https://api.twitter.com/2/tweets",
                json=payload,
            )

            if twitter_response.status_code != 201:
                error_message = f"Request returned an error: {twitter_response.status_code} {twitter_response.text}"
                return {
                    "error": True,
                    "msg": error_message,
                }, twitter_response.status_code

            # Saving the response as JSON
            json_response = twitter_response.json()
            print(json.dumps(json_response, indent=4, sort_keys=True))

            # Return the tweet ID or a success message
            tweet_id = json_response.get("data", {}).get("id")
            if tweet_id:
                return {
                    "error": False,
                    "msg": "Tweet posted successfully!",
                    "tweet_id": tweet_id,
                }, 200  # HTTP status code 200 for success
            else:
                return {
                    "error": True,
                    "msg": "Tweet posting failed, no tweet ID in response",
                }, 500  # HTTP status code 500 for server error

        else:
            return {
                "error": True,
                "msg": "User not found",
            }, 404  # HTTP status code 404 for user not found

    except requests.exceptions.RequestException as e:
        error_message = f"An error occurred: {str(e)}"
        if hasattr(e, "response") and e.response is not None:
            error_message += f"\nStatus code: {e.response.status_code}"
            error_message += f"\nResponse text: {e.response.text}"
        return {
            "error": True,
            "msg": error_message,
        }, 500  # HTTP status code 500 for server error

    except Exception as e:
        return {
            "error": True,
            "msg": f"An unexpected error occurred: {str(e)}",
        }, 500  # HTTP status code 500 for server error


@app.route("/quote-tweet", methods=["POST"])
def quotetweet():
    data = request.json
    quote_tweet_id = data.get("quote_tweet_id", "1828775378380324889")
    quote_text = data.get("quote_text", "")
    wallet_address = data.get("wallet_address", "")
    response = User.get_user_by_wallet_address(wallet_address)
    user = response.get("data")
    if user:
        try:
            client = tweepy.Client(
                bearer_token=os.getenv("APTOS_BEARER_TOKEN"),
                consumer_key=APTOS_CONSUMER_KEY,
                consumer_secret=APTOS_CONSUMER_SECRET,
                access_token=user["oauth_token"],
                access_token_secret=user["oauth_token_secret"],
            )

            # Create a tweet using API v2
            quote_tweet_response = client.create_tweet(
                text=quote_text, quote_tweet_id=quote_tweet_id
            )

            return {
                "error": False,
                "msg": "Tweet posted successfully!",
                "tweet_id": quote_tweet_response.data["id"],
            }, 200  # HTTP status code 200 for success

        except tweepy.TweepyException as e:
            return {
                "error": True,
                "msg": f"Failed to post tweet. Error: {str(e)}",
            }, 403  # HTTP status code 403 for a forbidden error

    else:
        return {
            "error": True,
            "msg": "User not found",
        }, 404  # HTTP status code 404 for user not found


def get_tweet_details(tweet_id, auth):
    url = f"https://api.twitter.com/2/tweets/{tweet_id}?tweet.fields=public_metrics"
    headers = {"User-Agent": "v2TweetLookupPython"}

    response = requests.get(url, auth=auth, headers=headers)
    response.raise_for_status()

    return response.json()


def get_liking_users(tweet_id):
    auth=OAuth1(
            APTOS_CONSUMER_KEY,
            client_secret=APTOS_CONSUMER_SECRET,
            resource_owner_key=os.environ.get("APTOS_ACCESS_TOKEN"),
            resource_owner_secret=os.environ.get("APTOS_ACCESS_TOKEN_SECRET"),
        )

    likes_url = f"https://api.twitter.com/2/tweets/{tweet_id}/liking_users"
    likes_headers = {"User-Agent": "v2LikingUsersPython"}

    try:
        # Get tweet details first
        tweet_details = get_tweet_details(tweet_id, auth)

        # Check if 'data' key exists in tweet details
        if "data" not in tweet_details:
            return {"error": "true", "message": "Invalid post ID"}

        # Then get liking users
        likes_response = requests.get(likes_url, auth=auth, headers=likes_headers)
        likes_response.raise_for_status()

        likes_json = likes_response.json()

        # Extract metrics from tweet details
        metrics = tweet_details["data"].get("public_metrics", {})

        return {
            "error": "false",
            "tweet_id": tweet_id,
            "likes_count": metrics.get("like_count", 0),
            "comment_count": metrics.get("reply_count", 0),
            "retweet_count": metrics.get("retweet_count", 0),
            "quote_count": metrics.get("quote_count", 0),
        }

    except requests.exceptions.HTTPError as http_err:
        if http_err.response.status_code == 404:
            return {"error": "true", "message": "Invalid post ID"}
        print(f"HTTP error occurred: {http_err}")
        return {"error": "HTTP error", "details": str(http_err)}
    except requests.exceptions.RequestException as req_err:
        print(f"Request error occurred: {req_err}")
        return {"error": "Request error", "details": str(req_err)}
    except ValueError as json_err:
        print(f"JSON decoding error: {json_err}")
        return {"error": "JSON decoding error", "details": str(json_err)}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": "Unexpected error", "details": str(e)}


@app.route("/get_tweet_info")
def get_tweet_info():
    tweet_id = "1786444853103964240"  # The tweet ID you're interested in
    result = get_liking_users(tweet_id)
    return jsonify(result)


MEDIA_UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json"
TWEET_CREATE_URL = "https://api.twitter.com/2/tweets"


@app.route("/tweet_with_media", methods=["POST"])
def tweet_with_media():
    data = request.json
    media_url = data.get("media_url", "")
    tweet_text = data.get("tweet_text", "")
    wallet_address = data.get("wallet_address", "")
    response = User.get_user_by_wallet_address(wallet_address)
    user = response.get("data")
    if user:
        print(user["oauth_token"])
        print(user["oauth_token_secret"])
        oauth = OAuth1Session(
            APTOS_CONSUMER_KEY,
            client_secret=APTOS_CONSUMER_SECRET,
            resource_owner_key=user["oauth_token"],
            resource_owner_secret=user["oauth_token_secret"],
        )

        try:
            # Download the image
            image_response = requests.get(media_url)
            image_response.raise_for_status()
            image_content = image_response.content

            # Upload media
            files = {"media": image_content}
            media_response = oauth.post(
                MEDIA_UPLOAD_URL,
                files=files,
            )
            media_response.raise_for_status()
            media_id = media_response.json()["media_id_string"]

            # Post a tweet with the media
            tweet_payload = {"text": tweet_text, "media": {"media_ids": [media_id]}}
            tweet_response = oauth.post(TWEET_CREATE_URL, json=tweet_payload)
            tweet_response.raise_for_status()

            # Extract tweet ID from response
            tweet_data = tweet_response.json()["data"]
            tweet_id = tweet_data["id"]

            return {
                "error": False,
                "msg": "Tweet posted successfully!",
                "tweet_id": tweet_id,
            }, 200  # HTTP status code 200 for success

        except requests.exceptions.RequestException as e:
            error_message = f"An error occurred: {str(e)}"
            if hasattr(e, "response") and e.response is not None:
                error_message += f"\nStatus code: {e.response.status_code}"
                error_message += f"\nResponse text: {e.response.text}"
            return {
                "error": True,
                "msg": f"Failed to post tweet. Error: {str(e)}",
            }, 403  # HTTP status code 403 for a forbidden error

    else:
        return {
            "error": True,
            "msg": "User not found",
        }, 404  # HTTP status code 404 for user not found


@app.route("/retweet")
def retweet():
    tweet_id_to_retweet = (
        "1828775378380324889"  # Replace with the tweet ID you want to retweet
    )

    oauth_params = {
        "oauth_APTOS_CONSUMER_KEY": APTOS_CONSUMER_KEY,
        "oauth_nonce": str(uuid.uuid4().hex),
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": str(int(time.time())),
        "oauth_token": session.get("access_token"),
        "oauth_version": "1.0",
    }

    retweet_url = f"https://api.twitter.com/2/tweets/{tweet_id_to_retweet}/retweets"
    oauth_params["oauth_signature"] = generate_oauth_signature(
        "POST", retweet_url, oauth_params
    )
    auth_header = build_auth_header(oauth_params)

    response = requests.post(retweet_url, headers={"Authorization": auth_header})

    print(f"Retweet response status code: {response.status_code}")
    print(f"Retweet response text: {response.text}")

    if response.status_code == 200:
        return f'Successfully retweeted! Tweet ID: {response.json()["data"]["id"]}'
    else:
        return f"Failed to retweet. Status code: {response.status_code}. Response: {response.text}"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
