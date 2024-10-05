from flask_restful import Resource, reqparse
from models.campaign import Campaign as CampaignModel
from models.task import Task as TaskModel
from flask import request
import json

class Task(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("campaign_id", type=str, required=True, help="Campaign ID is required")
        parser.add_argument("platform", type=str, required=True, help="Platform is required")
        parser.add_argument("media_type", type=str)
        parser.add_argument("media_url", type=str)
        parser.add_argument("caption", type=str)
        parser.add_argument("tweet", type=bool)
        parser.add_argument("tweet_text", type=str)
        parser.add_argument("tweet_media_url", type=str)
        parser.add_argument("retweet", type=bool)
        parser.add_argument("retweet_url", type=str)
        parser.add_argument("quote_tweet", type=bool)
        parser.add_argument("quote_tweet_url", type=str)
        args = parser.parse_args()

        args["task_id"] = str(TaskModel.objects().count() + 1).zfill(4)

        response = TaskModel.add_task(args)

        if response["error"]:
            return {"error": True, "data": response["data"]}, 400
        
        response = CampaignModel.add_task_id(args)
        if response["error"]:
            return {"error": True, "data": response["data"]}, 400
        
        return {"error": False, "data": args["task_id"]}, 201



       