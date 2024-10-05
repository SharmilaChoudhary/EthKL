from dotenv import load_dotenv
load_dotenv()

from flask_restful import Resource
from flask import json, request, jsonify
import time
import requests
import os

from models.user import User as UserModel
from backend.models.campaign2 import Campaign as CampaignModel

class Posts(Resource):
    def post(self):
        data = request.json

        media_type = data.get('media_type', '').upper()
        media_url = data.get('media_url', '')
        caption = data.get('caption', '')
        campaign_id = data.get('campaign_id', '')
        wallet_address = data.get('wallet_address', '')
        access_token = os.getenv('INSTAGRAM_ACCESS_TOKEN')
        insta_user_id = os.getenv('INSTAGRAM_USER_ID')

        if not media_type or not media_url or not access_token or not insta_user_id:
            return jsonify({'error': 'Missing required parameters'}), 400

        results = self.upload_media(media_url, media_type, access_token, insta_user_id, caption)

        if results:
            print("Upload Media Results:", results)
            time.sleep(10)
            ig_container_id = results.get('id')
            if ig_container_id:
                s = self.status_code(ig_container_id, access_token)
                if s == 'FINISHED':
                    publish_response = self.publish_media(results, access_token, insta_user_id)

                    response = UserModel.get_user_by_wallet_address(wallet_address)
                    if response["error"]:
                        return {"error": True, "data": response["data"]}, 400
                    
                    args = {
                        'campaign_id': campaign_id,
                        'wallet_address': wallet_address,
                        'instagram_username': response["data"]["instagram_username"]
                    }

                    response = CampaignModel.add_participant(args)
                    if response['error']:
                        return jsonify({'error': 'Error adding participant'}), 500
                    
                    response = UserModel.add_participated_campaign(
                        campaign_id=campaign_id,
                        wallet_address=wallet_address
                    )
                    if response['error']:
                        return jsonify({'error': 'Error adding participated campaign'}), 500

                    return jsonify({
                        'status': 'success',
                        'message': 'Media uploaded and published successfully',
                        'publish_response': publish_response
                    })
                else:
                    time.sleep(60)
                    publish_response = self.publish_media(results, access_token, insta_user_id)
                    return jsonify({
                        'status': 'success',
                        'message': 'Media uploaded successfully. Still waiting for publishing',
                        'publish_response': publish_response
                    })
            else:
                return jsonify({'error': 'Error retrieving media ID. Please check your request'}), 500
        else:
            return jsonify({'error': 'Error uploading media. Please check your request'}), 500

    @staticmethod
    def upload_media(media_url, media_type, access_token, insta_user_id, caption):
        post_url = f"https://graph.facebook.com/v19.0/{insta_user_id}/media"
        payload = {'media_type': media_type, 'caption': caption}

        if media_type == 'IMAGE':
            payload['image_url'] = media_url
        elif media_type == 'REELS':
            payload['video_url'] = media_url
        else:
            print("Invalid media type. Supported types are 'IMAGE' and 'REELS'.")
            return None

        r = requests.post(post_url, params={'access_token': access_token}, data=payload)

        try:
            result = r.json()
            print("Upload Media Response:", result)  # Debug print
            return result
        except json.decoder.JSONDecodeError:
            print("Error decoding JSON. Response might not be in JSON format.")
            print("HTTP Status Code:", r.status_code)
            print("Response Text:", r.text)
            return None

    @staticmethod
    def status_code(ig_container_id, access_token):
        graph_url = f"https://graph.facebook.com/v19.0/{ig_container_id}/"
        params = {'access_token': access_token, 'fields': 'status_code'}
        response = requests.get(graph_url, params=params)

        try:
            response_json = response.json()
            return response_json['status_code']
        except json.decoder.JSONDecodeError:
            print("Error decoding JSON. Response might not be in JSON format.")
            print("HTTP Status Code:", response.status_code)
            print("Response Text:", response.text)
            return None

    @staticmethod
    def publish_media(results, access_token, insta_user_id):
        if results and 'id' in results:
            creation_id = results['id']
            second_url = f"https://graph.facebook.com/v19.0/{insta_user_id}/media_publish"
            second_payload = {'creation_id': creation_id, 'access_token': access_token}
            r = requests.post(second_url, data=second_payload)
            print("Publish Media Response:", r.text)  # Debug print
            
            # Extract ID from the response text
            try:
                response_json = r.json()
                return response_json.get('id', 'ID not found')
            except json.decoder.JSONDecodeError:
                print("Error decoding JSON. Response might not be in JSON format.")
                print("HTTP Status Code:", r.status_code)
                print("Response Text:", r.text)
                return 'Error decoding response'
        else:
            print("Media posting not possible")
            return "Media posting not possible"
