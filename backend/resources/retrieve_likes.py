from dotenv import load_dotenv
load_dotenv()

import requests
from flask_restful import Resource
from flask import jsonify, request
import os

class RetrieveLike(Resource):
    def get(self):
        post_id = request.args.get('post_id')
        access_token = os.getenv('INSTAGRAM_ACCESS_TOKEN')
        # fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,comments_count,like_count'
        
        media_url =  f"https://graph.facebook.com/v20.0/{post_id}?fields=like_count,comments_count,permalink&access_token={access_token}"
        
        try:
            response = requests.get(media_url)
            return {"data": response.json()}
        except requests.HTTPError as e:
            return jsonify({
                'error': 'Failed to retrieve data from Instagram API',
                'details': str(e)
            }), 500
        except requests.RequestException as e:
            return jsonify({'error': str(e)}), 500
