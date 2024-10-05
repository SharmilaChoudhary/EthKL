from flask_restful import Resource, reqparse
from models.campaign import Campaign as CampaignModel
from models.task import Task as TaskModel
from flask import request
import json
from flask import Flask, request, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
import datetime
from functions.get_twitter_post_insights import get_tweet_info
import requests

scheduler = BackgroundScheduler()
scheduler.start()

class Scheduler(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("campaign_id", type=str, required=True, help="Campaign ID is required")
        parser.add_argument("payout_time", type=str, required=True, help="Payout time is required")
        args = parser.parse_args()

        payout_time = datetime.datetime.strptime(args["payout_time"], '%Y-%m-%d %H:%M:%S')
        job = scheduler.add_job(
            distribute_funds,
            trigger=DateTrigger(run_date=payout_time),
            args=[args["campaign_id"]]
        )

        return jsonify({"message": "Funds distribution scheduled", "job_id": job.id})

def distribute_funds(campaign_id=None):
    eligible_participants = check_likes_count(campaign_id)

    campaign_id = int(campaign_id)

    message = {
        "campaign_id": campaign_id,
        "eligible_participants": eligible_participants["eligible_participants"],
        "number_of_likes": eligible_participants["number_of_likes"]
    }
    print("disbursing funds ...")

    url = "localhost:5001/campaign"
    payload = json.dumps(message)
    headers = {'Content-Type': 'application/json'}
    response = requests.request("POST", url, headers=headers, data=payload)

    print(response.json())

def check_likes_count(minimum_likes, campaign_id):
    response = CampaignModel.get_participants(campaign_id)
    eligible_participants = []

    if response["error"]:
        return {"error": True, "data": response["data"]}
    
    participants = response["data"]

    for participant in participants:
        response = get_tweet_info(participant["twitter_post_id"])
        if response["error"] == "true":
            continue

        likes_count = response["likes_count"]
        if likes_count >= minimum_likes:
            eligible_participants.append(participant["wallet_address"])

    return eligible_participants

if __name__ == "__main__":
    app.run(debug=True)
        