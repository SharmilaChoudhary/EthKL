from flask_restful import Resource, reqparse
from models.user import User as UserModel
from flask import request
import json

class User(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('wallet_address', required=True, help='wallet_address is required')
        parser.add_argument('instagram_username', required=True, help='instagram_username is required')
        parser.add_argument('instagram_access_token', required=True, help='instagram_access_token is required')
        parser.add_argument('instagram_business_profile_id', required=True, help='instagram_business_profile_id is required')

        args = parser.parse_args()
        response = UserModel.add_user(args)

        if response['error']:
            return {'error': True, 'message': response['message']}
        return response['data']
    

    def get(self):
        wallet_address = request.args.get('wallet_address')
        
        if wallet_address:
            response = UserModel.get_user_by_wallet_address(wallet_address)
        else:
            response = UserModel.get_all_users()
            
        if response['error']:
            return {'error': True, 'message': response['message']}
        
        return {'error': False, 'data': json.loads(response['data'].to_json())}
    
class Participants(Resource):
    def get(self):
        campaign_id = request.args.get('campaign_id')

        
        
        