from dotenv import load_dotenv
load_dotenv()

import os
from requests_oauthlib import OAuth1
import requests
import json
from models.user import User as UserModel

def get_tweet_details(tweet_id, auth):
    url = f"https://api.twitter.com/2/tweets/{tweet_id}?tweet.fields=public_metrics"
    headers = {"User-Agent": "v2TweetLookupPython"}
    
    response = requests.get(url, auth=auth, headers=headers)
    response.raise_for_status()
    
    return response.json()

def get_liking_users(tweet_id=None):
    response = UserModel.get_first_user()
    if response["error"]:
        return {"error": True, "data": response["data"]}
    
    user = response["data"]

    print("User: ", user["oauth_token"])
    print("kdjlkfjsld", user["oauth_token_secret"])

    auth = OAuth1(
        os.environ.get("APTOS_CONSUMER_KEY"),
        os.environ.get("APTOS_CONSUMER_SECRET"),
        user["oauth_token"],
        user["oauth_token_secret"]
    )

    print("Auth: ", auth)
    
    likes_url = f"https://api.twitter.com/2/tweets/{tweet_id}/liking_users"
    likes_headers = {"User-Agent": "v2LikingUsersPython"}
    
    try:
        # Get tweet details first
        tweet_details = get_tweet_details(tweet_id, auth)
        
        # Check if 'data' key exists in tweet details
        if 'data' not in tweet_details:
            return {"error": "true", "message": "Invalid post ID"}
        
        # Then get liking users
        likes_response = requests.get(likes_url, auth=auth, headers=likes_headers)
        likes_response.raise_for_status()
        
        likes_json = likes_response.json()
        
        # Extract metrics from tweet details
        metrics = tweet_details['data'].get('public_metrics', {})
        
        return {
            "error": "false",
            "tweet_id": tweet_id,
            "likes_count": metrics.get('like_count', 0),
            "comment_count": metrics.get('reply_count', 0),
            "retweet_count": metrics.get('retweet_count', 0),
            "quote_count": metrics.get('quote_count', 0),
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


def get_tweet_info(tweet_id=None):
    result = get_liking_users(tweet_id)
    return result